# Policy Rules

Deterministic rules applied to every `TransactionDraft`. Each rule is a pure function with unit
tests; rule ids appear in the confirmation card ("Requires PIN · why?") and in the audit trail.
Thresholds are demo defaults and live in `packages/shared/policy/thresholds.ts`.

## Authorisation tiers

| Tier | Meaning |
|---|---|
| `pin` | 6-digit app PIN |
| `biometric` | Face ID / Touch ID (mock in Expo Go) |
| `biometric_oob` | Biometric **plus** out-of-band one-time code (simulated SMS) |

The highest tier required by any rule wins.

## Rules

| Rule id | Condition | Outcome |
|---|---|---|
| `POL-KYC-01` | Customer KYC status ≠ `verified` or account restricted | **block** — "Complete verification to transact" |
| `POL-FUNDS-01` | Any step amount > available balance of its source (after prior steps) | **block** — shows shortfall |
| `POL-AMT-01` | Amount ≤ 0 or not a valid money value | **block** |
| `POL-TIER-01` | Transfer/bill ≤ S$500 to payee used in last 90 days | tier `pin` |
| `POL-TIER-02` | Transfer/bill > S$500 and ≤ S$5,000 to known payee | tier `biometric` |
| `POL-TIER-03` | Any `buy_equity` step | tier `biometric` |
| `POL-TIER-04` | Transfer > S$5,000 | tier `biometric_oob` |
| `POL-NEWPAYEE-01` | Payee never paid before, amount ≤ S$1,000 | tier `biometric` + 12 h cooling-off notice (demo: 30 s) |
| `POL-NEWPAYEE-02` | Payee never paid before, amount > S$1,000 | tier `biometric_oob` |
| `POL-VEL-01` | ≥ 5 executed transfers in the last 10 minutes | **hold** — "Limit reached, resets at hh:mm" |
| `POL-VEL-02` | Daily outgoing total would exceed S$20,000 | **hold** — shows remaining daily limit |
| `POL-ANOM-01` | Amount ≥ 10× median of last 20 transfers | force clarification "confirm amount" before card |
| `POL-MARKET-01` | Equity order while market closed | annotate step "queued for next open" |
| `POL-LOT-01` | Equity amount < one lot at indicative price | **block** step — shows minimum |
| `POL-EXPIRE-01` | Card shown > 60 s without authorisation | draft `expired` |

## Shield patterns (pre-draft)

| Pattern id | Signal | Tier |
|---|---|---|
| `SHD-INJ-01` | "ignore (all|previous) instructions", "system prompt", "you are now", role-play markers | injection — strip from model input, show slim banner, audit |
| `SHD-SCAM-AUTH` | police, MAS, CPF, IRAS, "officer", "investigation" | scam cue |
| `SHD-SCAM-URG` | "now", "immediately", "urgent", "before they freeze" | scam cue |
| `SHD-SCAM-SAFE` | "safe account", "holding account", "verify your money" | scam cue |
| `SHD-SCAM-SECRECY` | "don't tell", "keep this confidential" | scam cue |
| `SHD-SCAM-NEWPAYEE-LARGE` | raw account number in speech **and** amount > S$1,000 | scam cue |

Two or more scam cues → **scam interstitial** (30 s cooling-off, hotline). One cue → amber note on
the card. Injection patterns always trigger the slim banner regardless.

## Dual-engine validation

Not a policy rule but applied at the same stage. Fields compared: beneficiary, amount, asset,
source account. Any discrepancy, malformed output or timeout → `frozen`. See
[`architecture.md`](architecture.md#validation-agent).

## Test matrix (minimum)

| Case | Expected |
|---|---|
| S$50 to Mum (known) | `pin` |
| S$1,500 to Mum | `biometric` |
| S$300 DBS shares | `biometric` |
| S$6,000 to Mum | `biometric_oob` |
| S$800 to new payee | `biometric` + cooling-off |
| S$2,000 to new payee | `biometric_oob` |
| 6th transfer in 10 min | `hold` POL-VEL-01 |
| KYC pending | `block` POL-KYC-01 |
| "ignore previous instructions…" | SHD-INJ-01 banner, behaviour unchanged |
| "police… safe account… now… 123-45678-9… ten thousand" | interstitial |
| Draft 2000 vs transcript "two hundred" | frozen |
