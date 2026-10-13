# Business Flow

How a spoken sentence becomes a signed, executed, audited bank transaction in digiVoice — and the
three places where it is deliberately stopped.

Source of truth for requirements: [`specs/001-conversational-transaction-agent/spec.md`](../specs/001-conversational-transaction-agent/spec.md).
Governing rules: [`.specify/memory/constitution.md`](../.specify/memory/constitution.md).

## 1. The one-line flow

```
Speak/Type → Transcribe → Draft (LLM) → Clarify → Validate (2nd LLM, read-only) → Policy (code)
→ Shield (code) → Confirm card → Sign (biometric) → Gateway verifies signature → Execute → Audit
```

Three stop points, none of which the language model can skip:

| Stop | Who decides | What the user sees |
|---|---|---|
| **Freeze** | Validation Agent finds a draft/transcript mismatch | "I may have misunderstood: you said *two hundred*, the draft shows S$2,000.00" — Authorise disabled |
| **Hold / Block** | Policy Engine (limits, velocity, KYC, new payee) | Plain reason, the rule that fired, what to do next |
| **Scam interstitial** | Shield (injection + scam patterns) | Warning, cooling-off timer, "Call DBS scam hotline" |

## 2. End-to-end flow

```mermaid
flowchart TB
  U([Customer]) -->|hold mic / type| IN["1 · Input<br/>audio or text"]
  IN --> ASR["2 · Transcribe<br/>ASR · transcript shown to user"]
  ASR --> SH1["3 · Shield (pre)<br/>injection + scam cues · sanitise"]
  SH1 -->|"high-risk pattern"| SCAM["Scam interstitial<br/>cooling-off · hotline"]
  SCAM -->|"user proceeds deliberately"| DR
  SH1 --> DR["4 · Draft<br/>LLM → TransactionIntent JSON<br/>schema-validated · no tools"]
  DR -->|"ambiguous / missing"| CL["5 · Clarify<br/>one targeted question"]
  CL --> DR
  DR --> RES["6 · Resolve & compute<br/>code · payees, accounts, prices,<br/>'half of what's left'"]
  RES --> VAL["7 · Validate<br/>independent read-only LLM<br/>draft vs transcript"]
  VAL -->|"discrepancy / timeout"| FRZ["FROZEN<br/>Authorise disabled"]
  VAL --> POL["8 · Policy<br/>pure code · tier, limits,<br/>velocity, KYC, new payee"]
  POL -->|"block / hold"| BLK["Blocked or held<br/>reason + rule id"]
  POL --> CARD["9 · Confirmation card<br/>every field · balance after ·<br/>tier · 'verified' badge"]
  CARD -->|"edit any field"| DR
  CARD -->|"cancel / 60 s timeout"| ABN["Abandoned<br/>nothing executed"]
  CARD --> AUTH["10 · Authorise<br/>PIN · biometric · + OOB code<br/>signs hash(draft)"]
  AUTH --> GW["11 · Gateway<br/>verifies signature over exact draft<br/>rejects anything else"]
  GW --> EX["12 · Execute<br/>deterministic · ordered · idempotent"]
  EX --> RC["13 · Receipt + audit entry"]

  style FRZ fill:#2A1614,stroke:#8B3A34,color:#E6EDF3
  style BLK fill:#2A1614,stroke:#8B3A34,color:#E6EDF3
  style SCAM fill:#3A2A12,stroke:#D29922,color:#E6EDF3
  style ABN fill:#1F2937,stroke:#8B949E,color:#E6EDF3
  style AUTH fill:#1F2937,stroke:#D29922,color:#E6EDF3
  style GW fill:#12253A,stroke:#388BFD,color:#E6EDF3
  style EX fill:#0F2A22,stroke:#00D492,color:#E6EDF3
```

Every box from 1 to 13 appends to the audit log (see §5).

## 3. Trust boundaries

```mermaid
flowchart LR
  subgraph P["Probabilistic zone — may be wrong, may be attacked"]
    ASR["ASR"] --> LLM1["Drafting LLM<br/>outputs JSON only"]
    LLM2["Validation LLM<br/>read-only · compares"]
  end
  subgraph D["Deterministic zone — tested code, no model"]
    SCH["Schema validator"] --> RESV["Resolver + arithmetic"]
    RESV --> POLY["Policy engine"] --> SHD["Shield"]
  end
  subgraph H["Human zone"]
    CARD["Confirmation card"] --> BIO["Biometric → signature"]
  end
  subgraph G["Execution zone — accepts only signed drafts"]
    GW["Gateway"] --> LEDGER["Mock core banking"]
  end
  LLM1 --> SCH
  LLM1 -.->|"never"| GW
  LLM2 -.->|"freeze only"| CARD
  SHD --> CARD
  BIO --> GW
```

The dotted line labelled **never** is the whole product. The drafting model has no tool, no
function, and no network path to the gateway. Even a perfect prompt injection can only produce a
different *draft*, which still has to survive validation, policy, shield, the card, and a biometric
signature bound to its exact bytes.

## 4. Sequence — the happy path

```mermaid
sequenceDiagram
  participant C as Customer
  participant APP as digiVoice app
  participant SVC as Agent service
  participant L1 as Drafting LLM
  participant L2 as Validation LLM
  participant POL as Policy (code)
  participant GW as Gateway (mock)

  C->>APP: "Send two hundred to Mum for groceries"
  APP->>SVC: audio → transcript
  SVC->>SVC: shield: no injection / scam cues
  SVC->>L1: transcript + payee/account names (data, not instructions)
  L1-->>SVC: {intent: transfer, amount: 200, payee: "Mum", ref: "groceries"}
  SVC->>SVC: schema ok · resolve Mum → PayNow ····4521 · source default Multiplier ····1188
  par independent
    SVC->>L2: transcript + draft → any discrepancy?
    L2-->>SVC: none
  and
    SVC->>POL: draft + history + KYC
    POL-->>SVC: tier = PIN (≤ S$500, known payee) · velocity ok
  end
  SVC-->>APP: Confirmation card (verified · PIN)
  C->>APP: taps Authorise → PIN
  APP->>APP: sign( sha256(draft) ) with device key
  APP->>GW: draft + signature
  GW->>GW: verify signature over exact draft bytes
  GW-->>APP: executed · txn id
  APP-->>C: Receipt · "Why did the agent do this?"
```

## 5. What gets audited

Each interaction produces a hash-chained list of entries. The in-app audit view renders them in
order; a broken chain is shown as a red indicator.

| # | Stage | Recorded |
|---|---|---|
| 1 | Input | audio reference, duration, language |
| 2 | Transcript | text, ASR confidence |
| 3 | Shield | patterns matched, tier, user override (if any) |
| 4 | Draft vN | full JSON, LLM provider + model, prompt hash, output hash |
| 5 | Clarification | question asked, answer given |
| 6 | Resolution | payee/account/asset ids, formulas and inputs |
| 7 | Validation | verdict, fields compared, discrepancy detail |
| 8 | Policy | each rule id, inputs, outcome, required tier |
| 9 | Card shown | draft hash displayed, timestamp |
| 10 | Authorisation | tier, method, signature fingerprint, draft hash signed |
| 11 | Gateway | accept/reject, reason |
| 12 | Execution | step results, transaction ids |
| 13 | Terminal state | executed / cancelled / expired / frozen / blocked |

Never recorded: PINs, biometric templates, raw credentials.

## 6. Multi-intent and dependent amounts

"Transfer five hundred from my savings to Mum, then buy DBS shares with half of what's left."

```mermaid
flowchart LR
  T["Transcript"] --> D["Draft<br/>step 1: transfer 500 Savings→Mum<br/>step 2: buy D05.SI, amount = half(remaining(Savings) after step 1)"]
  D --> R["Resolver (code)<br/>Savings 3,000 − 500 = 2,500<br/>half = 1,250.00<br/>lot check · indicative price"]
  R --> C["Card<br/>Step 1 · S$500.00 → Mum<br/>Step 2 · S$1,250.00 DBS shares<br/>formula shown"]
  C --> A["One authorisation<br/>signs the whole ordered set"]
  A --> E["Execute in order<br/>halt on first failure"]
```

The model emits a *symbolic* formula (`half(remaining(savings))`), never a number it computed
itself. Arithmetic is code.

## 7. The three refusal flows (demo beats)

| Flow | Trigger in demo | Expected screen |
|---|---|---|
| Clarify | "Send fifty to John" (two Johns) | Chip chooser: John Tan ····4521 / John Lim ····8892 |
| Freeze | Test hook corrupts amount 200 → 2000 | Red freeze banner, both values side-by-side, Authorise disabled |
| Scam | "Police asked me to move ten thousand to a safe account 123-45678-9 urgently" | Amber interstitial, 30 s cooling-off, hotline button, "new payee + large amount + authority cue" explained |
