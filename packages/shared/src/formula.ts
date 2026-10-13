// Symbolic amount evaluation — the model emits formulas, code computes.
// remaining(account) is evaluated against balance AFTER prior steps (R3).
import type { Formula, Money } from './types.js';

export interface FormulaCtx {
  balances: Record<string, number>;  // accountId → cents at draft time
  spent: Record<string, number>;     // accountId → cents committed by prior steps
}

export function isMoney(v: unknown): v is Money {
  return !!v && typeof v === 'object' && 'cents' in (v as object) && !('op' in (v as object));
}

export function evalAmount(v: Money | Formula, ctx: FormulaCtx): number {
  if (isMoney(v)) return v.cents;
  return evalFormula(v, ctx);
}

function evalFormula(f: Formula, ctx: FormulaCtx): number {
  switch (f.op) {
    case 'remaining': {
      const bal = ctx.balances[f.account] ?? 0;
      const used = ctx.spent[f.account] ?? 0;
      return Math.max(0, bal - used);
    }
    case 'half':
      return Math.floor(evalFormula(f.of, ctx) / 2);
    case 'all':
      return evalFormula(f.of, ctx);
    case 'percent':
      return Math.floor((evalFormula(f.of, ctx) * f.pct) / 100);
  }
}

/** "half of remaining S$2,500.00" — the explainable text on the confirm card. */
export function formulaText(f: Formula, ctx: FormulaCtx): string {
  switch (f.op) {
    case 'remaining':
      return `remaining ${fmt(ctx.balances[f.account] !== undefined
        ? Math.max(0, ctx.balances[f.account] - (ctx.spent[f.account] ?? 0))
        : 0)}`;
    case 'half':
      return `half of ${formulaText(f.of, ctx)}`;
    case 'all':
      return `all of ${formulaText(f.of, ctx)}`;
    case 'percent':
      return `${f.pct}% of ${formulaText(f.of, ctx)}`;
  }
}

export const fmt = (cents: number) => `S$${(cents / 100).toLocaleString('en-SG', { minimumFractionDigits: 2 })}`;

export const spent = (ctx: FormulaCtx, account: string, cents: number) => {
  ctx.spent[account] = (ctx.spent[account] ?? 0) + cents;
};
