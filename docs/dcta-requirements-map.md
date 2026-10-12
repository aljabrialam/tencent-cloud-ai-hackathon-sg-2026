# DCTA requirements map — challenge brief → digiVoice solution

Every problem and requirement in the DBS *Direct Conversational Transaction Agent* brief, mapped
to the mechanism that solves it, the doc that specifies it, and the artifact that proves it.
Feature spec: [`specs/001-conversational-transaction-agent/spec.md`](../specs/001-conversational-transaction-agent/spec.md).

## Problem statement → mechanism

| Brief requirement | digiVoice mechanism | Specified in | Visible artifact |
|---|---|---|---|
| **Rigid legacy menu friction** — three actions = three multi-screen flows | One utterance compiles to a multi-step draft: *"transfer $200 to Mum and put half of what's left into DBS shares"* → two `Step`s on one card, one authorisation | `spec.md` US2 · `business-flow.md` | Multi-intent card screen; mock `design/screens/mock-multi.png` |
| **Rogue agent** — autonomous agent with execution API access | The LLM has **no tools and no network path**. It emits typed JSON on the wire; deterministic code compiles, and only a client-signed digest reaches the gateway | `constitution.md` Principle I · `architecture.md` §deterministic zone | Confirm card — every field rendered from the compiled draft, not model text |
| **Prompt injection** — "ignore all instructions…", malicious payee names / references | `SHD-INJ-01` strips injection phrases **before** model input; payee names and references are treated as inert data (quoted verbatim, never parsed as commands); even a perfect injection can only produce a *draft* — still gated by signature | `policy-rules.md` shield table · `use-cases.md` UC-05 | Scam/interstitial screen; slim "ignored instruction-like text" banner |
| **Acoustic / semantic ambiguity** — "fifty to John" | Resolver detects ambiguity → **Clarify screen** with disambiguating options (payee ending ·4521 vs ·8892); `POL-ANOM-01` forces re-confirm on 10×-median amounts. The system **never guesses** | `spec.md` US1 · `ux-screens.md` clarify | Clarify screen; `mock-clarify.png` |
| **No non-repudiation in conversations** | Client signs `sha256(canonical draft)` with biometrics; gateway executes **only** on valid signature; hash-chained audit log links transcript → draft → validation → signature → result | `constitution.md` Principle II · `architecture.md` | Audit Trail screen (`mock-audit.png`); `POL-EXPIRE-01` |

## "What the solution should solve" → coverage

| Requirement | Coverage |
|---|---|
| Zero-UI multi-intent parsing (payments, transfers, equities) | `Intent` union incl. `transfer`, `pay_bill`, `buy_equity` with `Money \| Formula` — `architecture.md` §schema; resolver turns "half of what's left" into code arithmetic, never model math |
| Dynamic ambiguity resolution | Clarify interaction, targeted options, `POL-ANOM-01` confirm-amount — `ux-screens.md`, `policy-rules.md` |
| Dual-engine discrepancy auditing | **Independent read-only Validation Agent** (different model family) audits draft vs raw transcript; mismatch → `frozen` state, alert, no retry path — `business-flow.md` stage 7; Frozen screen |
| Deterministic HITL biometric authorisation | Deterministic overlay shows compiled fields; FaceID/TouchID signs the draft digest client-side; `POL-TIER-*` selects pin / biometric / biometric+OOB — `policy-rules.md` |
| Zero-trust API gateway policies | Gateway rejects anything without the client biometric signature over `sha256(draft)`; agent has zero write permissions — `architecture.md` §gateway |
| Adversarial prompt & injection shielding | Pre-draft `SHD-*` shield + input sanitisation + inert quoted references + system-instruction isolation — `policy-rules.md`, UC-05 |
| Dynamic risk & velocity throttling | `POL-VEL-01` (5/10 min hold), `POL-VEL-02` (S$20k/day), `POL-TIER-04` OOB for >S$5,000, `POL-NEWPAYEE-*` cooling-off — `policy-rules.md` |

## "The solution should be" → coverage

| Quality | How |
|---|---|
| Frictionless & natural | Hold-to-talk; colloquial amounts ("a grand"), synonyms, formulas; one card replaces dozens of buttons |
| Unconditionally safe | Draft-only model, signature-gated execution — enforced by construction, not by prompt instructions |
| Semantically robust | Multi-intent + formulas + entity resolution; accents handled via TRTC ASR with transcript shown for verification |
| Fully deterministic execution | Execution calls legacy deterministic APIs; all money in integer cents; policy engine is pure & test-first |
| Traceable & auditable | Audit stores **audio reference, transcript, JSON drafts, validation logs, signature, result** — hash-chained; Audit screen + `business-flow.md` audit table |

## Scenario selection

**Scenario 1 — Voice-Enabled Payment and Transaction** (with KYC + risk controls):
`POL-KYC-01` blocks unverified customers; risk control = shield + policy tiers + velocity + OOB.
(`spec.md` header.)

## Judging dimensions → evidence

| Dimension | Evidence |
|---|---|
| Impact & relevance | Aging/low-vision banking; wearable surfaces for hands-busy users — README problem framing |
| Human-centered design | Clarify-over-guess, plain-language reasons, auto-expiring card — `ux-screens.md` |
| AI interaction | LLM drafts + independent LLM audits; symbolic formulas; multi-intent — `architecture.md` |
| Technical execution | `apps/glasses-hud` passes Meta's official gate; pure policy engine; typed schema — `TEST-EVIDENCE.md` |
| Feasibility | Mocks + platform hooks per surface (CarPlay templates, watchOS tiles, Alexa skills, BT audio); real DBS APIs noted as mockable — README feasibility notes |
| Demo & storytelling | `docs/demo-script.md` — scripted incl. scam interstitial & freeze moment |
| Innovation | "Agent that cannot betray you"; wearables propose / phone signs — README differentiation table |
| UX & accessibility | `ux-screens.md` accessibility matrix; Deaf/blind/motor paths; Neural Band haptics |
| Responsible AI & ethics | Zero-trust constitution, visible freeze/scam states, audit trail, privacy redirects |
| Overall quality | Consistent design system across phone + 5 surfaces; Figma source of truth |
