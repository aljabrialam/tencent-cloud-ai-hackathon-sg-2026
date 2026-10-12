<!--
SYNC IMPACT REPORT
==================
Version change: 1.1.0 → 1.2.0
Bump rationale: MINOR — two principles added (X Multi-Agent Separation of
Duties, XI Disruptive Reach), Technology Constraints extended with the agent
topology. No existing principle removed or redefined.

Modified principles:
  - Technology & Security Constraints → extended: named agent roles added
Added principles:
  - X Multi-Agent Separation of Duties
  - XI Disruptive Reach
Removed principles: none
Follow-up TODOs: reflect the agent topology in docs/architecture.md
-->

# digiVoice (DBS DCTA) Constitution

Project: Direct Conversational Transaction Agent (DCTA) for the DBS Banking Track,
Tencent Cloud AI CAN DO IT Hackathon Singapore 2026. Working name: **digiVoice**.

## Core Principles

### I. LLM Interprets, Code Executes (NON-NEGOTIABLE)
The language model MUST only ever produce a typed, schema-validated `TransactionIntent`.
It MUST NOT have access to any tool, function, or API that moves money, changes payees,
or mutates account state. All execution is performed by deterministic, unit-tested code
that consumes a validated intent. Any design where model output is executed without
passing through the policy engine and an explicit authorisation gate is a constitution
violation and MUST be rejected in review.

**Rationale**: The DBS challenge requires "deterministic execution subject to explicit user
authorisation". Models are probabilistic; authority is binary. Separating interpretation
from execution is the only way to make the property provable rather than hoped-for.

### II. Explicit Authorisation Before Every Mutation
No transaction executes without the user viewing an explain-back confirmation card that
lists every resolved field (amount, currency, payee, source account, reference) and then
providing a distinct authorisation action (PIN or biometric) tied to a hash of that exact
intent. Changing any field invalidates prior authorisation. Step-up tiers (new payee,
amount above threshold) MUST be enforced in code. Silence, timeouts, or ambiguous replies
MUST never be interpreted as consent.

### III. Deterministic Policy Engine, Tested First
Limits, cooling-off periods, payee rules, anomaly checks, and scam-pattern interception
live in a pure, side-effect-free policy module with exhaustive unit tests. Policy rules
MUST be expressed as data or plain code, never as prompt text. Tests for the policy engine
and intent schema MUST be written and failing before implementation (Red-Green-Refactor).
UI and LLM glue code MAY be exempt from strict TDD given hackathon time constraints, but
MUST have at least a smoke test.

### IV. Verification After Action
A state-changing call MUST NOT be treated as confirmation of the resulting state. Every
executed step MUST be followed by an independent read-back of the mock ledger before the
receipt is rendered. The receipt MUST display the ledger-confirmed outcome (balance,
transaction id, status), never the values that were submitted. An ambiguous outcome MUST
be reconciled before being reported; a retry MUST reuse the same signed draft
(idempotency), never submit a re-derived one.

**Rationale**: "Pay succeeded" is a claim; "the ledger shows it" is evidence. Phantom
transactions are the banking equivalent of phantom bookings.

### V. Immutable Audit Trail — and Evidence, Not Prose, in the UI
Every conversation turn, extracted intent, policy decision (with the rule that fired),
authorisation event, and execution result MUST be appended to an append-only, hash-chained
audit log and be viewable in-app ("Why did the agent do this?"). Every claim the UI makes
to the user — verified, tier required, frozen — MUST carry the evidence behind it: the
validator's compared fields, the rule id, the signature fingerprint. Model-generated text
MUST NOT be presented as fact. Nothing is logged that contains PINs, biometric material,
or raw credentials.

### VI. Fail Closed, Human-Centric by Default
Ambiguity → a targeted question, never a guess. Policy failure → a plain explanation and
a safe alternative. Validator unavailable → frozen. Injection or scam cues → tiered warning
with cooling-off before any card. Language MUST be plain and localisable (English first;
Chinese, Malay, Tamil as stretch). Voice input is first-class but MUST always render to
text the user can read before confirming.

### VII. Honest Simulation
Every mock, stub, and simulated event MUST be labelled as simulated — in the UI, the
README, the submission, and the demo narration. "Mock bank", "simulated biometrics", and
demo-injected scenarios are stated, not implied. No real bank APIs, real customer data, or
real credentials are ever used or implied to be used.

**Rationale**: Judges evaluate trust. A demo that blurs the line between simulated and
real data fails Responsible AI the moment it is noticed.

### VIII. State Outside the Agent
Conversation and draft state MUST live in durable service storage, not in the model's
context window, agent memory, or a running process. Every LLM call is stateless and
receives the full relevant state explicitly. The system MUST survive a service restart
mid-flow with the draft intact.

**Rationale**: Processes restart; context windows are finite. A banking session that
depends on ephemeral state is not auditable and not recoverable.

### IX. Demo Primacy and Ruthless Simplicity
Submission deadline is 2026-10-16. The deliverable is a working 3-minute demonstration,
not breadth. Every task is judged by one question: does it reach the screen and the demo
narrative ("speak → see exactly what will happen → authorise → audit")? By end of Day 2
there MUST exist one runnable path from input to executed mock transaction (vertical
slice). YAGNI applies to everything else; P3 features are cut first.

### X. Multi-Agent Separation of Duties
The system is a society of narrow agents, not one model asked to be careful. Roles MUST
be distinct, schema-bounded, and non-overlapping:

| Agent | Engine | Authority | Boundary |
|---|---|---|---|
| **Drafting Agent** | Tencent ADP (Hunyuan-class) | Parse speech/text → typed `TransactionIntent` JSON | No tools, no state, no execution |
| **Validation Agent** | Hunyuan — a *different* engine | Compare draft vs transcript; verdict + field diffs only | Read-only, cannot edit the draft |
| **Policy Engine** | None — deterministic code | Authorisation tier, limits, scam verdict | Pure function, unit-tested first |
| **Clarifier** | Drafting engine, targeted re-prompt | One question at a time | Cannot resolve ambiguity itself |
| **Executor/Auditor** | None — deterministic code | Signed-draft execution, ledger read-back, hash chain | Rejects anything unsigned |

No agent MAY both propose and approve an action. Agent-to-agent communication passes
typed artifacts (drafts, verdicts), never conversational trust. A single-model collapse
of these roles is a constitution violation under Principle I.

**Rationale**: "Dual-engine" is only credible if the validator is a genuinely different
model that could not share the drafter's failure mode. Separation of duties is how banks
prevent single-point fraud internally — we apply the same control inside the AI tier.

### XI. Disruptive Reach — Every Choice Serves the Disruption
This project is not "a chatbot bolted onto banking". The thesis is that conversational,
zero-trust agency restructures who banking serves and how trust is produced:

- **Interaction disruption** — declared intent replaces menu navigation. Multi-intent
  utterances that today need three flows become one signed act. Every screen MUST show
  why this is better than the existing app flow, not just different.
- **Market disruption** — the excluded become first-class users: elderly, low-literacy,
  motor/visual/cognitive disability, non-English speakers, and scam-targeted customers.
  An inclusive path is a design requirement, not a feature tier.
- **Trust disruption** — safety is the product, not the friction. Scam interception,
  dual-engine validation, and the signed-draft audit are demoed as *value*, not as error
  handling.
- **Surface disruption** — the phone stops being the only surface. Wearables (Ray-Ban
  Display via Web Apps/DAT) extend the same zero-trust pipeline hands-free while
  authorisation stays anchored to the phone.

Any design proposal that reduces digiVoice to "chat UI on the existing flow" MUST be
rejected in review: it abandons the thesis and scores nothing on innovation.

## Technology & Security Constraints

- Mobile client: React Native with Expo (TypeScript). Must run via Expo Go on a real
  device for the demo.
- Backend: TypeScript (Node) service exposing the mock bank API, policy engine, intent
  pipeline, and audit log. Shared types between client and server. Money is integer
  cents; floating point MUST NOT be used for money.
- LLM access goes through a single `LLMProvider` adapter interface with interchangeable
  implementations for Tencent ADP (drafting), Hunyuan (validation), OpenAI, and
  Anthropic, selectable via configuration. Per Principle X, the Drafting Agent and
  Validation Agent MUST resolve to different provider implementations — never two
  wrappers around the same model. Prompts request structured JSON output validated
  against the `TransactionIntent` schema; invalid output is rejected and retried or
  escalated to a clarifying question, never partially executed.
- Secrets live in environment variables (`.env`, gitignored). Never committed, never
  logged, never shipped in the mobile bundle.
- Tencent Cloud tooling (ADP, TRTC, CodeBuddy, WorkBuddy, Miora) usage MUST be
  documented for the submission's "use of AI" criterion; ≥3 CodeBuddy/WorkBuddy
  screenshots are a hard submission requirement.

## Development Workflow & Quality Gates

- Spec-Driven Development via Spec Kit: constitution → specify → plan → tasks → implement.
  No implementation begins before `spec.md`, `plan.md`, and `tasks.md` exist for the
  feature.
- Each feature lives on its own branch created by Spec Kit scripts and merges to `main`
  via a commit that references the task IDs completed.
- Quality gates before marking a task done: typecheck passes, policy-engine and schema
  tests pass, no secrets in diff, and the constitution check in `plan.md` is satisfied.
- Demo gate (final day): a 3-minute scripted walkthrough covering one successful
  transaction, one multi-intent, one clarification, one validator freeze, one scam
  interstitial, and the audit screen — rehearsed twice, backup recording made.

## Governance

This constitution supersedes all other project practices. Amendments require a short
written rationale in the commit message and a version bump following semantic versioning
(MAJOR for principle removal or redefinition, MINOR for new principles or materially
expanded guidance, PATCH for clarifications). Every `plan.md` MUST include a Constitution
Check that explicitly confirms Principles I–V; any deviation MUST be listed in the plan's
Complexity Tracking table with justification. Reviews MUST verify compliance before merge.

**Version**: 1.2.0 | **Ratified**: 2026-10-12 | **Last Amended**: 2026-10-12
