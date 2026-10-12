# Implementation Plan: digiVoice — Direct Conversational Transaction Agent

**Branch**: `main` (docs) / `001-conversational-transaction-agent` (feature work) | **Date**: 2026-10-13 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-conversational-transaction-agent/spec.md`

## Summary

Voice or typed banking request → transcript → shielded LLM draft (typed JSON, symbolic
formulas) → deterministic resolver → independent read-only validator → pure policy engine →
native confirmation card → device-key signature over `sha256(draft)` → signature-only
gateway → ordered, idempotent execution → hash-chained audit. Mobile shell in Expo/React
Native; agent service + mock bank in Node/TypeScript; Tencent Cloud ADP (drafting), Hunyuan
(validation), TRTC (ASR/TTS). The model has no tools and no path to the gateway — that
absence is the product.

## Technical Context

**Language/Version**: TypeScript everywhere — Node 20+ (service), React 19 / React Native 0.8x
via Expo SDK 5x (mobile).

**Primary Dependencies**: `zod` (schema gate on all LLM output and API payloads), `vitest`
(policy engine and resolver, test-first), `expo-local-authentication` (biometrics),
`expo-av`/`expo-audio` (16 kHz mono WAV capture), `expo-secure-store` (device key),
`expo-speech` (TTS fallback). Service: plain Node `http`/Express-class router — kept
dependency-light so the demo runs anywhere.

**Storage**: In-memory demo store persisted to a JSON file (`STATE_FILE`, default
`/tmp/digivoice-state.json`) — accounts, payees, history, drafts, audit log. No database
(scope lock; see constitution Principle IX). Audit chain is an append-only array flushed to
the same file.

**Testing**: `vitest` for the pure core — policy rules, resolver/formulas, shield patterns,
schema, hash-chain, gateway signature verification (each test named with its FR/AC id);
`npx tsc --noEmit` for both apps; `scripts/happy_path.sh` (curl) as the [e2e] check against
the running service; `scripts/demo_hooks.sh` for corrupt-draft, validator-timeout, and
velocity-reset test hooks.

**Target Platform**: iOS/Android via **Expo Go** on a physical phone (no dev build needed —
all chosen modules are bundled). Service on `localhost` for demo, or `cloudflared` tunnel if
the phone and laptop are on different networks. Glasses surface: `apps/glasses-hud/` —
Meta Ray-Ban Display Web App (`@wearables-ui-toolkit/mrbd`, already passing Meta's test gate).

**Project Type**: Mobile app + API service + shared pure package (`packages/shared`).

**Performance Goals**: Speak→card under 5 s on a phone (SC-001 is 30 s end-to-end); LLM calls
are the latency floor — everything else is synchronous code and must not add perceptible
delay. No NFR requires throughput; one demo user.

**Constraints**: The drafting LLM MUST NOT receive tool definitions (Principle I). All money
is integer cents — no floats anywhere. All secrets in `apps/service/.env`, never in the
mobile bundle. No ADP tool-calling, no TRTC real-time AI conversation (both bypass the
deterministic zone). Mock biometrics, mock bank, mock gateway as permitted by the brief —
labelled honestly in UI (Principle VII). Draft TTL 60 s. Demo deadline 2026-10-16 23:59 SGT.

**Scale/Scope**: One demo customer (Mei Ling, KYC verified), seeded SGD accounts
(Multiplier ····1188, Savings, investment), saved payees (Mum ····4521, two Johns, daughter),
biller set, assets (D05.SI @ ~S$44.12, AAPL). 9 app screens + 8 HUD states. 3 intents
(`transfer`, `bill_payment`, `buy_equity`). Everything else is deliberately out.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Plan |
|---|---|
| I. LLM interprets, code executes | **PASS by construction** — `LLMProvider.complete(prompt) → string` is the only LLM surface; no tool schema exists to violate. Schema is the wall: `zod` rejects anything that isn't a typed draft. |
| II. Explicit authorisation | PASS — gateway accepts only `sign(sha256(canonical(draft)))`; edit ⇒ new hash ⇒ new signature; card expiry 60 s (`POL-EXPIRE-01`). |
| III. Deterministic policy, tested first | PASS — `packages/shared/policy/` is pure `(draft, ctx) → PolicyDecision[]`; vitest matrix covers every rule row in `docs/policy-rules.md` before screens exist. |
| IV. Verification after action | PASS — receipt renders ledger read-back (`GET /api/draft/{id}` → `execution.ledgerState`), never submitted values. |
| V. Immutable audit + evidence UI | PASS — append-only hash chain (`seq, ts, stage, payload, prevHash, hash`); Audit screen renders the chain; "Verified" badge only when the verdict artifact exists. |
| VI. Fail closed | PASS — validator unavailable/timeout/malformed ⇒ `frozen`; ambiguity ⇒ clarify; policy ⇒ named reason + next step. |
| VII. Honest simulation | PASS — "Mock bank · demo balances" banner; simulated biometrics labelled; seed data only. |
| VIII. State outside the agent | PASS — drafts/conversation in the JSON store; every LLM call stateless; restart mid-flow resumes the draft (FR-020). |
| IX. Demo primacy | PASS — the plan optimises for the 3-minute script (`docs/demo-script.md`); P3 stories (audit UI polish, multilingual) are last and cut first. |
| X. Multi-agent separation | PASS — five bounded agents via typed artifacts: Drafting (ADP) / Validation (different engine, read-only) / Policy (code) / Clarifier (re-prompt) / Executor-Auditor (code). |
| XI. Disruptive reach | PASS — same signed-draft pipeline serves phone, `apps/glasses-hud`, and ambient surfaces; phone is sole signer. |

**Gate result**: no violations — all principles pass as designed. Complexity Tracking omitted
(nothing to justify).

## Project Structure

### Documentation (this feature)

```text
specs/001-conversational-transaction-agent/
├── spec.md               # requirements (18 FRs, 8 USs, 8 SCs)
├── plan.md               # this file
├── research.md           # Phase 0 — decisions, rationale, alternatives, live-verified facts
├── data-model.md         # Phase 1 — entities, state machines, validation rules
├── contracts/
│   ├── service-api.md    # Phase 1 — app ↔ service HTTP contract
│   └── llm-prompts.md    # Phase 1 — drafter + validator prompt contracts (JSON in/out)
├── quickstart.md         # Phase 1 — end-to-end validation scenarios
├── checklists/requirements.md  # spec quality (passed)
└── tasks.md              # /speckit.tasks — NOT created here
```

### Source Code (repository root)

```text
packages/shared/            # pure, zero-IO — the deterministic zone
├── src/types.ts            # Intent, Money, Formula, TransactionDraft, PolicyDecision…
├── src/schema.ts           # zod schemas for LLM output + API payloads
├── src/formula.ts          # symbolic amount evaluation (remaining/half/percent/all)
├── src/policy/rules.ts     # one pure function per POL-* rule
├── src/policy/engine.ts    # evaluate(draft, ctx) → {tier, decisions, hold?}
├── src/shield.ts           # SHD-* pattern scan + sanitiser
├── src/audit.ts            # hash-chain append + verify
└── src/signing.ts          # canonicalise + sha256 + mock ed25519 sign/verify

apps/service/               # Node + TypeScript — agent service AND mock bank
├── src/index.ts            # HTTP API (see contracts/service-api.md)
├── src/store.ts            # JSON-file state (accounts, payees, drafts, audit)
├── src/llm/provider.ts     # LLMProvider interface; ADP | Hunyuan | OpenAI | Anthropic
├── src/llm/draft.ts        # shield → drafter → schema gate → clarify?
├── src/llm/validate.ts     # second-engine read-only verdict
├── src/asr.ts              # TRTC ASR adapter (WAV → transcript) + mock
├── src/tts.ts              # TRTC TTS adapter + expo-speech fallback flag
├── src/bank/gateway.ts     # signature verify → tier → idempotency → execute steps
├── src/bank/ledger.ts      # mock core: balances, ordered steps, halt-on-fail, read-back
└── .env                    # ADP_APP_KEY, TRTC_*, TENCENT_*, provider keys — gitignored

apps/mobile/                # Expo / React Native (Expo Go)
├── app/                    # expo-router screens mirroring the 9 mockup screens
├── src/components/         # ConfirmationCard, Waveform, AuditTimeline…
├── src/api.ts              # typed client of service-api.md
├── src/sign.ts             # key gen/load (SecureStore) + sign(sha256)
└── src/theme.ts            # DBS tokens (from docs/ux-screens.md)

apps/glasses-hud/           # Meta Ray-Ban Display Web App — DONE, gate-passing
scripts/                    # happy_path.sh · demo_hooks.sh · seed.ts
design/ docs/ specs/        # already in repo
```

**Structure Decision**: Option 3 (mobile + API) with an added pure `packages/shared` —
the constitution requires the deterministic zone to have zero IO so it is tested in
isolation and shared verbatim between service and app. `apps/glasses-hud/` already exists
and is out of this plan's scope except as a display client.
