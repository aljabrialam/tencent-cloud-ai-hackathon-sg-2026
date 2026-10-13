// Deterministic resolution: model refs (names as the user said them) → ids,
// Money/Formula → concrete cents, ambiguity → targeted questions. The model
// never sees balances or ids (FR-002/003/004).
import { evalAmount, formulaText, isMoney, spent, type FormulaCtx } from '../../../packages/shared/src/formula.js';
import type {
  Ambiguity, DraftInputStep, IntentStep, ResolvedStep, UnsupportedStep,
} from '../../../packages/shared/src/types.js';
import { get } from './store.js';

export interface ResolveOut {
  steps: ResolvedStep[];
  unsupported: UnsupportedStep[];
  ambiguities: Ambiguity[];
  answersNeeded: boolean;
}

const norm = (s: string) => s.toLowerCase().trim();

export function resolve(input: DraftInputStep[], priorAnswers: Record<string, string> = {}): ResolveOut {
  const st = get();
  const fctx: FormulaCtx = {
    balances: Object.fromEntries(st.accounts.map(a => [a.id, a.balanceCents])),
    spent: {},
  };
  const steps: ResolvedStep[] = [];
  const unsupported: UnsupportedStep[] = [];
  const ambiguities: Ambiguity[] = [];

  const matchAll = <T extends { id: string; name: string; aliases?: string[] }>(list: T[], ref?: string): T[] => {
    if (!ref) return [];
    const r = norm(ref);
    return list.filter(x => norm(x.name) === r || norm(x.name).includes(r) || r.includes(norm(x.name)) || (x.aliases ?? []).some(a => norm(a) === r || r.includes(norm(a))));
  };

  for (const raw of input) {
    if (raw.kind === 'unsupported') { unsupported.push(raw); continue; }
    const s = raw as IntentStep;
    const step: ResolvedStep = {
      intent: s,
      amountCents: 0,
      sourceAccountId: 'acc_savings',
      formulaText: null,
      warnings: [],
    };

    // refs → candidates (ambiguity resolution, FR-004)
    if (s.kind === 'transfer') {
      const chosen = priorAnswers.payee ? st.payees.find(p => p.id === priorAnswers.payee) : undefined;
      const cands = chosen ? [chosen] : matchAll(st.payees, s.payeeRef);
      if (cands.length > 1) {
        ambiguities.push({
          field: 'payee',
          question: `I see ${cands.length} payees matching "${s.payeeRef}". Did you mean:`,
          candidates: cands.map(p => ({ id: p.id, label: p.name, detail: p.mask })),
        });
      } else if (cands.length === 1) {
        step.payeeId = cands[0].id;
      } else if (s.payeeRef) {
        // unknown name → could be a new payee; offer the never-paid seeded one + free-entry chip
        const np = st.payees.find(p => p.lastPaidAt === null);
        if (np && matchAll([np], s.payeeRef).length) step.payeeId = np.id;
      }
    }
    if (s.kind === 'bill_payment') {
      const c = matchAll(st.billers.map(b => ({ ...b, aliases: b.aliases })), s.billerRef);
      if (c.length === 1) step.billerId = c[0].id;
      else if (c.length > 1) ambiguities.push({ field: 'biller', question: `Which biller?`, candidates: c.map(b => ({ id: b.id, label: b.name, detail: (b as { mask?: string }).mask ?? '' })) });
      else if (s.billerRef) step.billerId = st.billers[0]?.id;
    }
    if (s.kind === 'buy_equity') {
      const a = st.assets.find(x => norm(x.name).includes(norm(s.assetRef ?? '')) || norm(s.assetRef ?? '').includes(norm(x.name)) || norm(x.symbol) === norm(s.assetRef ?? ''))
        ?? (/dbs/i.test(s.assetRef ?? '') ? st.assets.find(x => x.symbol === 'D05.SI') : /apple|aapl/i.test(s.assetRef ?? '') ? st.assets.find(x => x.symbol === 'AAPL') : undefined);
      if (a) step.assetId = a.symbol;
      else ambiguities.push({ field: 'asset', question: 'Which asset did you mean?', candidates: st.assets.map(x => ({ id: x.symbol, label: x.name, detail: x.symbol })) });
    }

    if (s.sourceRef) {
      const a = matchAll(st.accounts.map(x => ({ ...x, name: x.label, aliases: [] as string[] })), s.sourceRef);
      if (a.length === 1) step.sourceAccountId = a[0].id;
    }

    // amount
    if (s.amount === undefined) {
      ambiguities.push({
        field: 'amount',
        question: 'How much?',
        candidates: [],
      });
    } else if (isMoney(s.amount)) {
      step.amountCents = s.amount.cents;
    } else {
      const f = s.amount;
      // remap generic 'remaining' account placeholder to the step's source
      const remapped = remapAccount(f, step.sourceAccountId);
      step.amountCents = evalAmount(remapped, fctx);
      step.formulaText = formulaText(remapped, fctx);
    }
    spent(fctx, step.sourceAccountId, step.amountCents);
    steps.push(step);
  }

  // market annotation
  for (const st2 of steps) {
    if (st2.intent.kind === 'buy_equity' && st2.assetId) {
      const a = get().assets.find(x => x.symbol === st2.assetId);
      if (a && !a.marketOpen) st2.warnings.push('POL-MARKET-01');
    }
  }

  return { steps, unsupported, ambiguities, answersNeeded: ambiguities.length > 0 };
}

function remapAccount(f: { op: string; account?: string; of?: unknown; pct?: number }, acc: string): any {
  if (f.op === 'remaining') return { op: 'remaining', account: acc };
  if (f.op === 'percent') return { op: 'percent', pct: f.pct, of: remapAccount(f.of as never, acc) };
  return { op: f.op, of: remapAccount(f.of as never, acc) };
}
