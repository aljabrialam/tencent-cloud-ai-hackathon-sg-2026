// Draft pipeline: shield → drafter → schema gate → resolve → policy → signable
// draft. Validator runs after resolution (separate call site in index.ts).
import { draftInputSchema } from '../../../../packages/shared/src/schema.js';
import { draftHash } from '../../../../packages/shared/src/signing.js';
import { evaluate } from '../../../../packages/shared/src/policy/engine.js';
import { T } from '../../../../packages/shared/src/policy/thresholds.js';
import { fmt } from '../../../../packages/shared/src/formula.js';
import type { DraftInputStep, TransactionDraft } from '../../../../packages/shared/src/types.js';
import { drafter } from './provider.js';
import { resolve } from '../resolver.js';
import { get, save } from '../store.js';
import { append } from '../../../../packages/shared/src/audit.js';

const DRAFT_SYSTEM = `You convert a banking request into JSON steps for a parser. Emit ONLY a JSON array — no prose, no markdown.
Kinds: {"kind":"transfer"}, {"kind":"bill_payment"}, {"kind":"buy_equity"}; anything else → {"kind":"unsupported","text":...}.
Amounts: {"cents":<integer>,"ccy":"SGD"} when literal. For derived amounts emit a Formula — {"op":"remaining","account":"<account id>"}, {"op":"half"|"all","of":<Formula>}, {"op":"percent","pct":<n>,"of":<Formula>} — NEVER compute.
References: echo the user's words for payeeRef/billerRef/assetRef/sourceRef; "reference" passes through verbatim. Missing fields → omit, never invent.`;

let n = 0;
const id = (p: string) => `${p}_${Date.now().toString(36)}${(n++).toString(36)}`;

export async function makeDraft(transcriptId: string, cleanText: string, rawText: string, warnings: string[]): Promise<TransactionDraft> {
  const st = get();
  const conversationId = `conv_${transcriptId.slice(4)}`;

  // drafter — schema-gated (the wall)
  append(st.audit, 'draft', { transcriptId, provider: drafter().name });
  const user = `Catalogues (names only — you do not see balances):\npayees: [${st.payees.map(p => `${p.name} ${p.mask}`).join(', ')}]\naccounts: [${st.accounts.map(a => a.label).join(', ')}]\nbillers: [${st.billers.map(b => b.name).join(', ')}]   assets: [${st.assets.map(a => `${a.name} (${a.symbol})`).join(', ')}]\n\nTranscript:\n"""\n${cleanText.replace(/"""/g, '\\"\\"\\"')}\n"""\n\nSteps:`;
  let input: DraftInputStep[];
  try {
    const out = await drafter().complete(DRAFT_SYSTEM, user);
    const json = JSON.parse(out.replace(/^```(?:json)?|```$/g, '').trim());
    input = draftInputSchema.parse(json) as DraftInputStep[];
  } catch (e) {
    input = [{ kind: 'unsupported', text: cleanText.slice(0, 200) }];
    append(st.audit, 'draft', { transcriptId, error: String(e).slice(0, 120), note: 'drafter malformed → unsupported' });
  }

  const { steps, unsupported, ambiguities, answersNeeded } = resolve(input);
  append(st.audit, 'resolve', { transcriptId, steps: steps.length, ambiguities: ambiguities.map(a => a.field) });

  const draft: TransactionDraft = {
    id: id('drf'), version: 1,
    conversationId, transcriptId,
    steps, unsupported,
    status: answersNeeded ? 'awaiting_clarification' : 'validating',
    validation: null, policy: null, ambiguities, warnings,
    hash: draftHash(steps),
    createdAt: Date.now(), expiresAt: Date.now() + T.EXPIRE_MS,
    signature: null,
  };

  if (!answersNeeded) {
    const median = 0; // policy ctx
    void median;
    draft.policy = evaluate(steps, {
      customer: st.customer, accounts: st.accounts,
      payees: new Map(st.payees.map(p => [p.id, p])),
      billers: new Map(st.billers.map(b => [b.id, b])),
      assets: new Map(st.assets.map(a => [a.symbol, a])),
      history: st.history, recentTransferTs: st.recentTransferTs,
      dailyOutCents: st.history
        .filter(h => h.ts > Date.now() - 86_400_000)
        .reduce((s, h) => s + h.amountCents, 0),
      now: Date.now(),
    });
    append(st.audit, 'policy', { draftId: draft.id, tier: draft.policy.tier, rules: draft.policy.decisions.map(d => d.ruleId) });
  }

  st.drafts.push(draft);
  save();
  return draft;
}

/** Rendered step summary for the validator (human-style lines — forces semantic re-read). */
export function stepSummary(draft: TransactionDraft, rawTranscript: string): string {
  void rawTranscript;
  const st = get();
  const name = (id?: string) => st.payees.find(p => p.id === id)?.name
    ?? st.billers.find(b => b.id === id)?.name
    ?? st.assets.find(a => a.symbol === id)?.name
    ?? 'unknown';
  return draft.steps.map((s, i) =>
    `${i + 1}. ${s.intent.kind} ${fmt(s.amountCents)} → ${name(s.payeeId ?? s.billerId ?? s.assetId)} (from ${st.accounts.find(a => a.id === s.sourceAccountId)?.label})`
  ).join('\n');
}
