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

Rationale: The DBS challenge requires "deterministic execution subject to explicit user
authorisation". Separating interpretation from execution is the only way to make that
property provable rather than hoped-for.

### II. Explicit Authorisation Before Every Mutation
No transaction executes without the user viewing an explain-back confirmation card that
lists every resolved field (amount, currency, payee, source account, reference) and then
providing a distinct authorisation action (PIN or biometric) tied to a hash of that exact
intent. Changing any field invalidates prior authorisation. Step-up tiers (e.g. new payee,
amount above threshold) MUST be enforced in code. Silence, timeouts, or ambiguous replies
MUST never be interpreted as consent.

### III. Deterministic Policy Engine, Tested First
Limits, cooling-off periods, payee rules, anomaly checks, and scam-pattern interception
live in a pure, side-effect-free policy module with exhaustive unit tests. Policy rules
MUST be expressed as data or plain code, never as prompt text. Tests for the policy engine
and intent schema MUST be written and failing before implementation (Red-Green-Refactor).
UI and LLM glue code MAY be exempt from strict TDD given hackathon time constraints, but
MUST have at least a smoke test.

### IV. Complete, Immutable Audit Trail
Every conversation turn, extracted intent, policy decision (with the rule that fired),
authorisation event, and execution result MUST be appended to an append-only audit log
with timestamps and a hash of the LLM input/output. The audit log MUST be viewable in-app
("Why did the agent do this?"). Nothing is logged that contains full PINs, biometric
material, or raw credentials.

### V. Human-Centric and Responsible by Default
Fail closed: ambiguity → ask a clarifying question; policy failure → explain plainly and
offer a safe alternative; never silently proceed or silently drop. Language MUST be plain
and localisable (English first; Chinese, Malay, Tamil as stretch). Voice input is a first-
class path but MUST always render to text the user can read before confirming. Scam
interception (urgency cues, impersonation of authorities, unusual new payees) MUST warn
before the authorisation step and MAY require a deliberate override. Mock data only; no
real bank credentials or PII are ever used.

### VI. Ruthless Simplicity (Hackathon Scope)
Submission deadline is 2026-10-16. Every feature MUST be justified against the demo
narrative: "speak → see exactly what will happen → authorise → audit". YAGNI applies to
everything else. Prefer a thin mock bank API over any real integration. Prefer one
polished happy path plus two polished refusal paths over breadth.

## Technology & Security Constraints

- Mobile client: React Native with Expo (TypeScript). Must run via Expo Go on a real
  device for the demo.
- Backend: TypeScript (Node) service exposing the mock bank API, policy engine, intent
  pipeline, and audit log. Shared types between client and server.
- LLM access goes through a single `LLMProvider` adapter interface with interchangeable
  implementations for Tencent Hunyuan, OpenAI, and Anthropic, selectable at runtime via
  configuration. Prompts request structured JSON output validated against the
  `TransactionIntent` schema; invalid output is rejected and retried or escalated to a
  clarifying question, never partially executed.
- Secrets live in environment variables (`.env`, gitignored). Never committed, never
  logged, never shipped in the mobile bundle.
- Tencent Cloud tooling (CodeBuddy, WorkBuddy, Miora) usage MUST be documented for the
  submission's "use of AI" criterion.

## Development Workflow & Quality Gates

- Spec-Driven Development via Spec Kit: constitution → specify → plan → tasks → implement.
  No implementation begins before `spec.md`, `plan.md`, and `tasks.md` exist for the
  feature.
- Each feature lives on its own branch created by Spec Kit scripts and merges to `main`
  via a commit that references the task IDs completed.
- Quality gates before marking a task done: typecheck passes, policy-engine and schema
  tests pass, no secrets in diff, and the constitution check in `plan.md` is satisfied.
- Demo gate (final day): a 3-minute scripted walkthrough covering one successful
  transaction, one clarification, one policy refusal/scam warning, and the audit screen.

## Governance

This constitution supersedes all other project practices. Amendments require a short
written rationale in the commit message and a version bump following semantic versioning
(MAJOR for principle removal or redefinition, MINOR for new principles or materially
expanded guidance, PATCH for clarifications). Every `plan.md` MUST include a Constitution
Check that explicitly confirms Principles I–IV; any deviation MUST be listed in the plan's
Complexity Tracking table with justification. Reviews MUST verify compliance before merge.

**Version**: 1.0.0 | **Ratified**: 2026-10-12 | **Last Amended**: 2026-10-12
