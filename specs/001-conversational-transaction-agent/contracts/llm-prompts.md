# Contract: LLM prompt interfaces

Both prompts are fixed templates in the service. User content is embedded **as data inside
delimiters** — the shield has already stripped `SHD-INJ-*` phrasing, and delimiters are
escaped in the transcript before interpolation. Output is parsed by `zod`; anything else is
malformed → retry once → ask user to rephrase.

## Drafter — `LLMProvider.complete(draftSystem, draftUser) → TransactionIntent[]`

**System** (fixed): you convert a banking request into JSON steps for a parser. Rules:
emit ONLY a JSON array of steps — no prose, no markdown. Kinds: `transfer`, `bill_payment`,
`buy_equity`; anything else → `{"kind":"unsupported","text":…}`. Amounts: integer cents when
literal; for derived amounts emit a `Formula` (`remaining`, `half`, `all`, `percent`) —
**never compute**. References: echo the user's words for `payeeRef`/`assetRef`; `reference` is
passed through verbatim. Missing mandatory field → omit the field, never invent it.

**User** (template):

```text
Catalogues (names only — you do not see balances):
payees: [Mum → payee_mum ····4521, John Tan → ····4521, John Lim → ····8892, …]
accounts: [Multiplier ····1188, Savings, Investment]
billers: [Singtel, SP Group, …]   assets: [DBS (D05.SI), Apple (AAPL)]

Transcript:
"""
{shielded transcript}
"""

Steps:
```

**Output schema** (zod): `IntentStep[]` — see `data-model.md`. Unknown keys rejected.

## Validator — `LLMProvider.complete(validateSystem, validateUser) → Verdict`

Different provider instance from the drafter (dual-engine). Read-only: its output schema
cannot express a draft, so it cannot propose one even if manipulated.

**System** (fixed): compare a customer transcript against a proposed transaction summary.
Check four fields only: beneficiary, amount, asset class, source account. Output ONLY
`{"ok":bool,"discrepancies":[{"field","transcriptSays","draftShows"}]}`.

**User** (template): `Transcript: """{raw transcript}"""` + `Proposed:` + a rendered
step summary (human-style lines, not raw JSON — forces semantic re-reading).

**Verdict handling** (code, not the model): `ok:false` or `discrepancies[]` → `frozen`;
malformed output or >5 s timeout → `unavailable` → `frozen`. The validator never edits.

## What the model never sees

Balances, limits, transaction history, rule thresholds, signatures, other drafts. That is
why `remaining()` exists — dependence on balances must go through the resolver, where it is
deterministic and testable.
