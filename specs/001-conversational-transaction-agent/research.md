# Research: digiVoice — Direct Conversational Transaction Agent

Format: **Decision / Rationale / Alternatives considered**, plus live-verified facts where the
docs were ambiguous. Anything still open is marked **Open** with a resolution owner
(service slice or demo slice).

## R1. Implementation base

- **Decision**: Build fresh inside the hackathon repo (`apps/mobile`, `apps/service`,
  `packages/shared`). UI scaffolds come from `design/mokkoi/` (RN + DBS tokens); visual spec
  from `design/digivoice-app-mockup.html` / `docs/ux-screens.md`.
- **Rationale**: No existing bundle fits — the pipeline (shield→draft→resolve→validate→
  policy→card→sign→gateway) is the thesis, and borrowing a generic skeleton would hide its
  trust boundaries. `apps/glasses-hud/` already exists and passes Meta's gate; reuse as-is.
- **Alternatives considered**: Reuse `reap_x_65labs_hackathon/mobile` skeleton (FastAPI+Expo
  patterns transferable — notably its JSON-state store and curl `happy_path.sh`, both adopted
  here — but its domain is checkout, not drafts); build on the mockup HTML as the app
  (rejected earlier: React Native is required for the DBS track's app feel and for
  SecureStore/biometrics).

## R2. Money representation

- **Decision**: Integer cents end-to-end; API fields `*Cents` (`amountCents`,
  `balanceAfterCents`, `priceCents`). SGD only in scope. App formats `S$` + cents/100.
- **Rationale**: Floats in a banking demo are disqualifying; identical convention worked in
  the REAP project (its constitution bug was floats — fixed by the same rule).
- **Alternatives considered**: `Decimal` strings over JSON (heavier client, no benefit at
  demo scale); floats with rounding (violates constitution V's intent).

## R3. Symbolic formulas ("half of what's left")

- **Decision**: Grammar in `packages/shared/src/formula.ts`:
  `Formula = {op:"remaining",account} | {op:"half"|"all",of} | {op:"percent",pct,of}`.
  Evaluation happens in the resolver **after** each prior step's effect on the source
  balance — `remaining(savings)` means balance-after-prior-steps, and evaluation is strict
  top-down so step *n* sees the result of steps 1..n-1.
- **Rationale**: FR-003 — code computes, never the model. The model emits `half` + `of`; the
  resolver computes S$1,250.00 and can be unit-tested exhaustively. The card shows the
  formula ("half of remaining S$2,500.00") so the computation is legible.
- **Alternatives considered**: letting the model emit numbers for derived amounts (violates
  FR-003 and is unfalsifiable); a freer expression language like `savings*0.5` (more
  injection surface, harder to bound, no demo need).

## R4. LLM provider mechanics (ADP + Hunyuan + fallbacks)

- **Decision**: One `LLMProvider` interface `complete(system, user) → Promise<string>`.
  Drafter = ADP published agent via AppKey over SSE (`wss.lke.tencentcloud.com/adp/v2/chat`,
  `ConversationId` per draft session, `VisitorId` per customer). Validator = Hunyuan
  OpenAI-compatible endpoint — a *different engine* so "dual-engine" is literal. OpenAI and
  Anthropic adapters satisfy FR-018 (config-switchable providers).
- **Rationale**: ADP's Experience URL lets judges watch the draft being generated — strong
  "use of AI tools" evidence. ADP tool-calling is explicitly off the table (Principle I);
  the agent is prompt-bound to return JSON only, and the zod schema is the actual gate.
- **Alternatives considered**: Hunyuan for both roles (cheaper, but not dual-*engine*);
  ADP workflows (nodes can call tools — bypasses our trust boundary).
- **Open**: ADP SSE event shape and whether the published agent reliably returns bare JSON —
  verify in the service slice with a real AppKey; fallback is Hunyuan-as-drafter with
  Anthropic as validator (still dual-engine). Keys: `ADP_APP_KEY` in `apps/service/.env`.

## R5. Prompt contracts

- **Decision**: Two fixed prompt templates in `contracts/llm-prompts.md`. Drafter input =
  transcript + payee/account/asset *catalogues* (names and refs only, no balances) + few-shot
  schema examples; output = `TransactionIntent[]` JSON. Validator input = raw transcript +
  resolved draft summary; output = `{ok, discrepancies[]}`. User text is embedded inside
  fixed delimiters and always as data.
- **Rationale**: LLMs never see balances — keeps secrets out of the model context and makes
  `remaining()` the only honest way to depend on them. Read-only validator cannot emit a
  draft (different output schema), enforcing Principle X in the type system, not the prompt.
- **Alternatives considered**: giving the validator the draft JSON wholesale (still fine, but
  a *rendered summary* forces it to re-check semantics rather than pattern-match fields).

## R6. Shield (injection + scam)

- **Decision**: `shield.ts` runs **pre-draft** on the raw transcript/typed text: regex
  catalogue `SHD-INJ-01` (ignore-instructions, "you are now", role-play, delimiter escapes)
  → strip + slim banner + audit; scam cues `SHD-SCAM-*` (authority, urgency, "safe account",
  secrecy, new-payee+large) → ≥2 cues = interstitial with 30 s cooling-off (demo) + hotline;
  1 cue = amber note. Post-schema, free-text fields (`reference`) are rendered quoted/inert.
- **Rationale**: Defence-in-depth — even a perfect injection only produces a draft, which
  still needs a human signature. The shield is pure code over a testable corpus (SC-003).
- **Alternatives considered**: LLM-based injection classification (probabilistic security
  control — defeats the point); post-draft-only scanning (too late for transcript cues).

## R7. Signing + gateway (mock but real crypto)

- **Decision**: Device keypair = ed25519 generated on first run, private key in
  `expo-secure-store`, public key registered via `POST /api/device/keys`. Biometric =
  `expo-local-authentication` gate *in front of* key use (simulated binding — labelled
  honestly). Canonical form: `JSON.stringify` of the draft with sorted keys; client signs
  `sha256(canonical)`. Gateway recomputes the hash from **its own stored draft** (never
  trusts the submitted hash), verifies signature + device + tier + nonce + idempotency,
  then executes steps in order with halt-on-first-failure.
- **Rationale**: The brief allows mock biometrics/gateway, but the crypto itself is real —
  ed25519 + sha256 is genuine non-repudiation over the demo. Gateway-side hash recomputation
  is the property that makes "edit invalidates authorisation" true rather than claimed.
- **Alternatives considered**: server-side "approval flag" (no cryptographic binding — fails
  the brief's zero-trust ask); real Secure Enclave attestation (needs a dev build; Expo Go
  suffices for demo per constitution VII honest-labelling).
- **Open**: `expo-local-authentication` availability in Expo Go on the demo device — verify
  early; fallback PIN + OOB code is already a spec'd tier, so degrade, never skip.

## R8. Clarify loop

- **Decision**: Resolver emits `Ambiguity[]` (field, candidates with distinguishing detail —
  e.g. both Johns with account tails). The **Clarifier** is a bounded re-prompt: one question
  per turn, chips in the UI, voice or tap to answer; answer merges into the draft and
  re-resolves. Three failed clarifications → offer manual form / start over (spec edge).
- **Rationale**: FR-004 — one targeted question at a time; never a card with unresolved
  fields. Chips keep it tappable for low-literacy and noisy-environment users.
- **Alternatives considered**: letting the model pick the most likely payee and flag it
  (guessing — disqualifying per the brief); free-text questions (parser needs to understand
  arbitrary answers — bounded options are deterministic).

## R9. Validation Agent semantics

- **Decision**: Verdict `{ok:boolean, discrepancies:[{field, transcriptSays, draftShows}]}`
  on four fields only — beneficiary, amount, asset class, source account (the brief's exact
  list). Any discrepancy, malformed JSON, or timeout (5 s) → `frozen`, Authorise disabled.
  Corrupt-draft is a first-class **test hook** (`demo_hooks.sh`), not hidden state.
- **Rationale**: FR-008/SC-005 — 100% of corrupted drafts must freeze. Restricting to four
  semantic fields keeps the validator auditable and the verdict explainable on screen.
- **Alternatives considered**: embedding-similarity check (cheap but unexplainable); having
  the validator *fix* the draft (then it isn't read-only).

## R10. ASR / TTS

- **Decision**: TRTC standalone ASR (Node SDK, `TRTC_ASR_SDK_APP_ID` + `TRTC_ASR_SECRET_KEY`,
  16 kHz mono WAV) behind `AsrProvider`; TTS = TRTC `TextToSpeech` cloud API
  (`SecretId/SecretKey` — **different keys from ASR's**, not interchangeable). Fallbacks:
  typed input for ASR, `expo-speech` for TTS. Mandarin path ("转一百块给女儿") uses the
  `zh` engine for US8.
- **Rationale**: Uses Tencent products credibly without the TRTC *real-time AI conversation*
  pipeline, which is ASR→LLM→TTS end-to-end and would bypass the deterministic zone.
- **Open**: ASR latency on event Wi-Fi — if sentence recognition is slow, the demo script
  falls back to typing the same sentences (the card is identical).

## R11. Demo connectivity

- **Decision**: `localhost` service + Expo Go on the same network first; `cloudflared tunnel`
  as backup (`PUBLIC_URL`/`EXPO_PUBLIC_API_URL` pattern adopted from the REAP project).
- **Rationale**: Worked on stage for the previous hackathon; zero new infra.

## R12. Demo data seed

- **Decision**: `scripts/seed.ts` writes `STATE_FILE` — Mei Ling (KYC verified), Savings
  S$3,000.00 / Multiplier / investment account, payees (Mum ····4521, John Tan ····4521,
  John Lim ····8892, 女儿/Daughter), billers, D05.SI @ S$44.12, 20 past transfers (median
  ~S$80) so `POL-ANOM-01` and velocity rules have real context.
- **Rationale**: Reproducible demo; the two Johns are needed for US3 and the seeded median
  is needed for the anomaly rule to fire deterministically.

## Resolved risks carried from design docs

| Risk | Resolution |
|---|---|
| Model returns malformed JSON | Retry once with the parse error echoed; then ask user to rephrase (never partial-draft) |
| Market closed for equity step | `POL-MARKET-01` annotates the step "queued for next open" — draft stays honest |
| Draft mutated after signature | Hash no longer matches ⇒ gateway 403; edit ⇒ new draft version |
| Network drop post-sign | Idempotency key = `sha256(draft)` — re-submit returns the same result, never a duplicate |
| Secrets on the phone | None — all provider keys live in `apps/service/.env`; the phone holds only its own signing key |
