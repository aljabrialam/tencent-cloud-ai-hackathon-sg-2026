<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.1.0
Bump rationale: MINOR — three principles added (IV Verification After Action,
VIII State Outside the Agent, VII Honest Simulation), Principle V extended
with evidence-in-UI, Principle IX merged with Demo Primacy. No existing
principle removed or redefined.

Modified principles:
  - V Audit Trail → extended: UI must show evidence, not model prose
  - VI Simplicity → merged into IX Demo Primacy & Ruthless Simplicity
Added principles:
  - IV Verification After Action (adapted from Antabay II)
  - VII Honest Simulation (adapted from Antabay V)
  - VIII State Outside the Agent (adapted from Antabay VI)
  - Evidence-over-assertion folded into V (adapted from Rewind X)
  - Demo primacy folded into IX (adapted from Rewind I)
Removed principles: none
Follow-up TODOs: none
-->

# SayPay (DBS DCTA) Constitution

Project: Direct Conversational Transaction Agent (DCTA) for the DBS Banking Track,
Tencent Cloud AI CAN DO IT Hackathon Singapore 2026. Working name: **SayPay**.

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

## Technology & Security Constraints

- Mobile client: React Native with Expo (TypeScript). Must run via Expo Go on a real
  device for the demo.
- Backend: TypeScript (Node) service exposing the mock bank API, policy engine, intent
  pipeline, and audit log. Shared types between client and server. Money is integer
  cents; floating point MUST NOT be used for money.
- LLM access goes through a single `LLMProvider` adapter interface with interchangeable
  implementations for Tencent ADP (drafting), Hunyuan (validation), OpenAI, and
  Anthropic, selectable via configuration. Prompts request structured JSON output
  validated against the `TransactionIntent` schema; invalid output is rejected and
  retried or escalated to a clarifying question, never partially executed.
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

**Version**: 1.1.0 | **Ratified**: 2026-10-12 | **Last Amended**: 2026-10-12
