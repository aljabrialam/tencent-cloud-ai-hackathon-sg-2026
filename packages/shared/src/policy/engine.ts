// Pure policy engine: (draft steps, ctx) → PolicyResult. Highest tier wins.
// Every rule is a named, testable decision (FR-010, docs/policy-rules.md).
import { T } from './thresholds.js';
import type {
  ResolvedStep, PolicyDecision, PolicyResult, Tier,
  Customer, Account, Payee, Asset, HistoryEntry,
} from '../types.js';

export interface PolicyCtx {
  customer: Customer;
  accounts: Account[];
  payees: Map<string, Payee>;
  billers: Map<string, { id: string; name: string }>;
  assets: Map<string, Asset>;
  history: HistoryEntry[];          // recent executed transfers
  recentTransferTs: number[];       // timestamps for POL-VEL-01
  dailyOutCents: number;            // today's executed outgoing
  now: number;
}

const RANK: Record<Tier, number> = { pin: 0, biometric: 1, biometric_oob: 2 };

export function evaluate(steps: ResolvedStep[], ctx: PolicyCtx): PolicyResult {
  const decisions: PolicyDecision[] = [];
  let tier: Tier = 'pin';
  let hold: PolicyResult['hold'];
  let requiresAmountConfirm = false;
  const bump = (t: Tier) => { if (RANK[t] > RANK[tier]) tier = t; };

  const d = (ruleId: string, outcome: PolicyDecision['outcome'], t: Tier | null, reason: string) => {
    decisions.push({ ruleId, outcome, tier: t, reason });
  };

  // POL-KYC-01 — hard block precedes everything
  if (ctx.customer.kycStatus !== 'verified' || ctx.accounts.some(a => a.restricted)) {
    d('POL-KYC-01', 'block', null, 'Complete verification to transact');
    return { tier, decisions, hold };
  }

  // POL-VEL-01 / POL-VEL-02 — holds stop the card entirely
  const windowStart = ctx.now - T.VEL_WINDOW_MS;
  const recent = ctx.recentTransferTs.filter(ts => ts >= windowStart);
  const transferCount = steps.filter(s => s.intent.kind === 'transfer').length;
  if (recent.length + transferCount > T.VEL_COUNT) {
    const resetAt = Math.min(...recent) + T.VEL_WINDOW_MS;
    d('POL-VEL-01', 'hold', null, `Limit reached — ${T.VEL_COUNT} transfers in 10 min`);
    return { tier, decisions, hold: { reason: 'Limit reached', resetAt } };
  }
  const out = steps.reduce((n, s) => n + s.amountCents, 0);
  if (ctx.dailyOutCents + out > T.VEL_DAILY_CENTS) {
    d('POL-VEL-02', 'hold', null, 'Daily outgoing limit would be exceeded');
    return { tier, decisions, hold: { reason: 'Daily limit reached' } };
  }

  const median = medianCents(ctx.history.map(h => h.amountCents));
  const spentSoFar: Record<string, number> = {};

  for (const [i, s] of steps.entries()) {
    const src = ctx.accounts.find(a => a.id === s.sourceAccountId);
    const label = `step ${i + 1}`;

    if (!Number.isInteger(s.amountCents) || s.amountCents <= 0) {
      d('POL-AMT-01', 'block', null, `${label}: amount must be a positive value`);
      continue;
    }
    if (src) {
      const remaining = src.balanceCents - (spentSoFar[src.id] ?? 0);
      if (s.amountCents > remaining) {
        d('POL-FUNDS-01', 'block', null, `${label}: exceeds available balance by S$${((s.amountCents - remaining) / 100).toFixed(2)}`);
        continue;
      }
      spentSoFar[src.id] = (spentSoFar[src.id] ?? 0) + s.amountCents;
    }

    if (s.intent.kind === 'buy_equity') {
      const asset = ctx.assets.get(s.assetId ?? '');
      if (asset) {
        if (s.amountCents < asset.lotMinCents) {
          d('POL-LOT-01', 'block', null, `${label}: below one lot at indicative price (min S$${(asset.lotMinCents / 100).toFixed(2)})`);
          continue;
        }
        if (!asset.marketOpen) d('POL-MARKET-01', 'annotate', null, `${label}: market closed — queued for next open`);
      }
      bump('biometric');
      d('POL-TIER-03', 'step_up', 'biometric', `${label}: equity purchase requires biometric`);
      continue;
    }

    // transfer / bill_payment tiers
    const payee = s.payeeId ? ctx.payees.get(s.payeeId) : undefined;
    const known = payee && payee.lastPaidAt !== null &&
      ctx.now - payee.lastPaidAt < T.KNOWN_PAYEE_DAYS * 86400_000;

    if (payee && !known) {
      if (s.amountCents > T.NEWPAYEE_OOB_CENTS) {
        bump('biometric_oob');
        d('POL-NEWPAYEE-02', 'step_up', 'biometric_oob', `${label}: new payee above S$1,000 requires out-of-band code`);
      } else {
        bump('biometric');
        d('POL-NEWPAYEE-01', 'step_up', 'biometric', `${label}: first payment to this payee — biometric + cooling-off notice`);
      }
    } else if (s.amountCents > T.BIO_MAX_CENTS) {
      bump('biometric_oob');
      d('POL-TIER-04', 'step_up', 'biometric_oob', `${label}: above S$5,000 requires biometric + out-of-band code`);
    } else if (s.amountCents > T.PIN_MAX_CENTS || !known) {
      bump('biometric');
      d('POL-TIER-02', 'step_up', 'biometric', `${label}: above S$500 or payee not recently paid`);
    } else {
      d('POL-TIER-01', 'allow', 'pin', `${label}: within PIN tier`);
    }

    if (median > 0 && s.amountCents >= T.ANOMALY_MULT * median) {
      requiresAmountConfirm = true;
      d('POL-ANOM-01', 'clarify', null, `${label}: unusually large vs your history — confirm the amount`);
    }
  }

  return { tier, decisions, hold, requiresAmountConfirm };
}

function medianCents(v: number[]): number {
  if (!v.length) return 0;
  const s = [...v].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : Math.floor((s[m - 1] + s[m]) / 2);
}
