// Execution gateway — signature-only entry (FR-007/014). The conversational
// pipeline has no path here; only the app calls it, with a signature over the
// exact stored draft hash. Any edit ⇒ different hash ⇒ rejected.
import { mockVerify } from '../../../../packages/shared/src/signing.js';
import type { TransactionDraft } from '../../../../packages/shared/src/types.js';
import { get, save } from '../store.js';
import { append } from '../../../../packages/shared/src/audit.js';
import { execute } from './ledger.js';
import type { ExecutionResult } from '../../../../packages/shared/src/types.js';

export type GateResult =
  | { ok: true; execution: ExecutionResult }
  | { ok: false; status: number; reason: string };

export function gate(draftId: string, idempotencyKey?: string): GateResult {
  const st = get();
  const draft = st.drafts.find(d => d.id === draftId);
  if (!draft) return { ok: false, status: 404, reason: 'unknown draft' };

  if (draft.execution) return { ok: true, execution: draft.execution }; // FR-014 idempotent

  if (draft.status === 'executed') return { ok: true, execution: draft.execution! };
  if (draft.status === 'frozen' || draft.status === 'cancelled') {
    append(st.audit, 'gateway', { draftId, rejected: draft.status });
    save();
    return { ok: false, status: 409, reason: `draft is ${draft.status}` };
  }
  if (draft.status === 'expired' || Date.now() > draft.expiresAt) {
    draft.status = 'expired';
    append(st.audit, 'expire', { draftId });
    save();
    return { ok: false, status: 410, reason: 'draft expired — request a new card' };
  }
  if (draft.policy?.hold) {
    append(st.audit, 'gateway', { draftId, hold: draft.policy.hold });
    save();
    return { ok: false, status: 423, reason: draft.policy.hold.reason };
  }
  if (!draft.signature) {
    append(st.audit, 'gateway', { draftId, rejected: 'unsigned' });
    save();
    return { ok: false, status: 403, reason: 'unsigned draft' };
  }
  const key = st.deviceKeys.find(k => k.deviceId === draft.signature!.deviceId);
  if (!key) {
    append(st.audit, 'gateway', { draftId, rejected: 'unknown device' });
    save();
    return { ok: false, status: 403, reason: 'unregistered device' };
  }
  // the exact check: signature must cover the CURRENT stored hash
  if (draft.hash !== undefined && !mockVerify(key.publicKey, draft.hash, draft.signature.value)) {
    append(st.audit, 'gateway', { draftId, rejected: 'signature mismatch — tampered?' });
    save();
    return { ok: false, status: 403, reason: 'signature does not match draft' };
  }

  draft.status = 'executing';
  append(st.audit, 'gateway', { draftId, accepted: true, fingerprint: draft.hash.slice(0, 8), idem: idempotencyKey ?? null });
  const execution = execute(draft);
  draft.execution = execution;
  draft.status = execution.results.every(r => r.status === 'executed' || r.status === 'skipped')
    ? 'executed' : 'failed';
  save();
  return { ok: true, execution };
}
