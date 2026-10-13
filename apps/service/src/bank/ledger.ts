// Mock bank core — the ONLY writer to balances. Ordered steps, halt-on-first-
// failure (FR-013), ledger read-back for the receipt (Principle IV).
import type { ExecutionResult, TransactionDraft } from '../../../../packages/shared/src/types.js';
import { get, save } from '../store.js';
import { append } from '../../../../packages/shared/src/audit.js';

export function execute(draft: TransactionDraft): ExecutionResult {
  const st = get();
  const results: ExecutionResult['results'] = [];
  let failed = false;

  for (const [i, s] of draft.steps.entries()) {
    if (failed) {
      results.push({ stepIndex: i, status: 'skipped', ledgerRef: null, error: 'halted — prior step failed' });
      continue;
    }
    const src = st.accounts.find(a => a.id === s.sourceAccountId);
    if (!src || src.balanceCents < s.amountCents) {
      results.push({ stepIndex: i, status: 'failed', ledgerRef: null, error: 'insufficient funds at execution' });
      failed = true;
      continue;
    }
    src.balanceCents -= s.amountCents;
    const ledgerRef = `led_${Date.now().toString(36)}_${i}`;
    if (s.intent.kind === 'transfer') {
      st.recentTransferTs.push(Date.now());
      st.history.push({ ts: Date.now(), amountCents: s.amountCents, payeeId: s.payeeId ?? '', kind: 'transfer' });
      const p = st.payees.find(x => x.id === s.payeeId);
      if (p) { p.lastPaidAt = Date.now(); p.payCount++; }
    } else {
      st.history.push({ ts: Date.now(), amountCents: s.amountCents, payeeId: s.billerId ?? s.assetId ?? '', kind: s.intent.kind });
    }
    results.push({ stepIndex: i, status: 'executed', ledgerRef, error: null });
  }

  const readBack = { balanceCents: st.accounts.find(a => a.id === draft.steps[0]?.sourceAccountId)?.balanceCents ?? 0 };
  append(st.audit, 'execute', { draftId: draft.id, results, ledgerReadBack: readBack });
  save();
  return { results, ledgerReadBack: readBack };
}
