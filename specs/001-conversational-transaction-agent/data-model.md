# Data Model: digiVoice — Direct Conversational Transaction Agent

All money is integer cents in `SGD`. Field names are the JSON names used on the wire and in
the store. Types marked *(pure)* live in `packages/shared` and have zero IO.

## Customer (seeded)
| Field | Type | Notes |
|---|---|---|
| id | string | `cust_meiling` |
| name | string | "Mei Ling" |
| kycStatus | `"verified" \| "pending" \| "restricted"` | `POL-KYC-01` blocks non-verified |
| language | `"en" \| "zh" \| "ms" \| "ta"` | card + transcript language |
| accessibility | `{tapToTalk: bool, readAloud: bool, textScale: number}` | FR-021 |

## Account (seeded, mock bank)
| Field | Type | Notes |
|---|---|---|
| id | string | `acc_savings`, `acc_multiplier`, `acc_invest` |
| label / mask | string | "Savings ····1188" |
| balanceCents | int | mutated only by `bank/ledger.ts` |
| restricted | bool | |

## Payee (seeded)
| Field | Type | Notes |
|---|---|---|
| id | string | `payee_mum`, `payee_john_tan`, `payee_john_lim`, `payee_daughter` |
| name / aliases | string / string[] | matching surface for the resolver |
| method | `"paynow_mobile" \| "bank_account" \| "biller"` | |
| mask | string | "····4521" — the distinguishing detail shown in Clarify |
| lastPaidAt / payCount | ts / int | known-vs-new feeds `POL-TIER-*`, `POL-NEWPAYEE-*`, scam cues |

## Asset (seeded)
| Field | Type | Notes |
|---|---|---|
| symbol / name | string | `D05.SI` "DBS Group", `AAPL` |
| priceCents | int | indicative; **displayed as indicative** (honest simulation) |
| lotMinCents | int | `POL-LOT-01` floor |
| marketOpen | bool | `POL-MARKET-01` → "queued for next open" annotation |

## Turn (conversation)
| Field | Type | Notes |
|---|---|---|
| id, conversationId | string | |
| role | `"user" \| "agent"` | |
| audioRef | string \| null | storage key of the WAV; never the bytes in audit payload |
| text | string | transcript or typed input (post-shield) |
| answerTo | string \| null | links a clarification answer to the question turn |
| ts | epoch ms | |

## IntentStep *(pure — the model's entire world)*
| Field | Type | Notes |
|---|---|---|
| kind | `"transfer" \| "bill_payment" \| "buy_equity"` | unsupported kinds → `unsupported`, never dropped (FR-002) |
| amount | `Money \| Formula` | `Money = {cents:int, ccy:"SGD"}` |
| payeeRef / billerRef / assetRef | string | name/ref text — resolved to ids by code |
| sourceRef | string \| undefined | |
| reference | string \| undefined | free text — quoted and inert downstream |

## Formula *(pure)*
`{op:"remaining", account:string} | {op:"half"|"all", of:Formula} | {op:"percent", pct:number, of:Formula}`
— evaluated by `formula.ts` against balance-after-prior-steps (R3).

## ResolvedStep *(pure)*
| Field | Type |
|---|---|
| intent | IntentStep |
| amountCents | int — concrete |
| payeeId / billerId / assetId / sourceAccountId | string — resolved ids |
| formulaText | string \| null — e.g. "half of remaining S$2,500.00" |
| warnings | string[] — e.g. `POL-MARKET-01` queued-order note |

## TransactionDraft (the signed artifact)
| Field | Type | Notes |
|---|---|---|
| id / version | string / int | edit ⇒ version+1 ⇒ new hash |
| conversationId / transcriptId | string | |
| steps | ResolvedStep[] | ordered |
| status | enum | transitions below |
| validation | `{verdict:"ok"|"discrepancy"|"unavailable", discrepancies:[{field,transcriptSays,draftShows}]}` | validator output artifact |
| policy | `{tier:"pin"|"biometric"|"biometric_oob", decisions:PolicyDecision[], hold?:{reason,resetAt}}` | |
| hash | string | `sha256(canonical(steps))` — displayed on card as fingerprint |
| createdAt / expiresAt | ts | `POL-EXPIRE-01` — 60 s from card render |
| signature | `{alg:"ed25519", deviceId, value}` \| null | set by `POST /api/drafts/{id}/authorise` |

**State machine**: `drafting → awaiting_clarification → drafting` (loop ≤3) `→ validating →
{ready | frozen}` `→ authorised → executing → {executed | failed}`; side exits: `expired`
(from `ready`), `cancelled` (any pre-execution state). `frozen`, `expired`, `cancelled`,
`failed`, `executed` are terminal. `frozen` and `expired` require a **new** draft.

## PolicyDecision *(pure)*
| Field | Type |
|---|---|
| ruleId | string — `POL-TIER-03` etc. |
| outcome | `"allow" \| "step_up" \| "hold" \| "block" \| "annotate"` |
| tier | `"pin" \| "biometric" \| "biometric_oob"` \| null |
| reason | string — plain language, shown on card |

## Ambiguity *(pure, resolver output)*
| Field | Type |
|---|---|
| field | `"payee" \| "amount" \| "source" \| "asset"` |
| question | string — single targeted question |
| candidates | `{label, detail}[]` — chip text |

## Authorisation (audit artifact)
`tier, method, signedHash, signature, deviceId, ts` — fingerprint = first/last 4 hex of `hash`.

## StepResult / ExecutionResult
| Field | Type | Notes |
|---|---|---|
| stepIndex | int | |
| status | `"executed" \| "failed" \| "skipped"` | halt-on-first-failure (FR-013) |
| ledgerRef | string \| null | mock ledger entry id |
| error | string \| null | plain language |

`ExecutionResult` = `{results: StepResult[], ledgerReadBack: {balanceCents}}` — the read-back
the receipt renders (Principle IV).

## AuditEntry
| Field | Type | Notes |
|---|---|---|
| seq | int | |
| ts | epoch ms | |
| stage | `"input" \| "shield" \| "draft" \| "clarify" \| "resolve" \| "validate" \| "policy" \| "card" \| "authorise" \| "gateway" \| "execute" \| "expire" \| "cancel"` | |
| payload | object | stage artifact — **no secrets, PINs, or biometric material** (FR-012) |
| prevHash / hash | string | `hash = sha256(prevHash + canonical(payload))` — tamper-evident |

## DeviceKey
| Field | Type | Notes |
|---|---|---|
| deviceId | string | registered via `POST /api/device/keys` |
| publicKey | string (ed25519) | private key never leaves the phone (SecureStore) |

## Seed matrix (scripts/seed.ts)
1 customer (verified KYC) · 3 accounts (Savings S$3,000.00 — drives the locked demo) · 5 payees
(Mum ····4521; John Tan ····4521 & John Lim ····8892 for ambiguity; 女儿/Daughter for zh;
one never-paid for `POL-NEWPAYEE-*`) · 3 billers · 2 assets · 20 history rows, median ≈ S$80
(`POL-ANOM-01` needs a median).
