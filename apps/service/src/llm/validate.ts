// Dual-engine validation (FR-008): a DIFFERENT provider instance audits the
// resolved draft against the raw transcript. ok:false / discrepancies / malformed
// / >5s timeout → frozen. The validator never edits — its schema can't express
// a draft, so it cannot propose one even if manipulated.
import { verdictSchema } from '../../../../packages/shared/src/schema.js';
import type { TransactionDraft, ValidationResult } from '../../../../packages/shared/src/types.js';
import { validator } from './provider.js';
import { stepSummary } from './draft.js';
import { get, save } from '../store.js';
import { append } from '../../../../packages/shared/src/audit.js';

const SYSTEM = `Compare a customer transcript against a proposed transaction summary.
Check four fields only: beneficiary, amount, asset class, source account.
Output ONLY JSON: {"ok":boolean,"discrepancies":[{"field":"...","transcriptSays":"...","draftShows":"..."}]}.`;

export async function validate(draft: TransactionDraft, rawTranscript: string): Promise<TransactionDraft> {
  const st = get();
  draft.status = 'validating';
  let result: ValidationResult;
  try {
    const timeoutMs = st.demoFlags.validatorTimeout ? 1 : 5_000;
    if (st.demoFlags.validatorTimeout) st.demoFlags.validatorTimeout = false;
    const user = `Transcript: """${rawTranscript}"""\nProposed:\n${stepSummary(draft, rawTranscript)}`;
    const out = String(await withTimeout(validator().complete(SYSTEM, user), timeoutMs));
    const v = verdictSchema.parse(JSON.parse(out.replace(/^```(?:json)?|```$/g, '').trim()));
    result = {
      verdict: v.ok && v.discrepancies.length === 0 ? 'ok' : 'discrepancy',
      discrepancies: v.discrepancies as ValidationResult['discrepancies'],
    };
  } catch (e) {
    result = { verdict: 'unavailable', discrepancies: [{ field: 'validator', transcriptSays: '-', draftShows: String(e).slice(0, 80) }] };
  }

  draft.validation = result;
  const frozen = result.verdict !== 'ok' || draft.policy?.hold !== undefined;
  draft.status = frozen ? 'frozen' : 'ready';
  append(st.audit, 'validate', {
    draftId: draft.id, provider: validator().name, verdict: result.verdict,
    discrepancies: result.discrepancies, frozen,
  });
  save();
  return draft;
}

const withTimeout = <T>(p: Promise<T>, ms: number): Promise<T> =>
  Promise.race([p, new Promise<never>((_, rej) => setTimeout(() => rej(new Error(`validator timeout >${ms}ms`)), ms))]);
