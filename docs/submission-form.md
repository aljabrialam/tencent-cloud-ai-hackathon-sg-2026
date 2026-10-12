# Hackathon submission — copy-paste fields

Case study (state at the start of the presentation):
**Banking Track — DBS Direct Conversational Transaction Agent, Scenario 1: Voice-Enabled Payment and Transaction**

## Project Title

```
digiVoice
```

## Short Blurb (< 10 words)

```
Speak a payment. Code decides. You sign.
```

## Project Description

```
digiVoice is a voice-first banking agent built around one rule: the AI can propose, but it can never move your money.

PROJECT OVERVIEW
digiVoice accepts natural-language and voice banking requests on DBS — transfers, bill payments, equity purchases, and multi-intent requests like "send Mum five hundred and buy DBS shares with half of what's left." The LLM emits only a typed transaction draft; deterministic code resolves formulas, applies policy, and waits for a human signature. The same pipeline runs across a React Native app, Meta Ray-Ban Display glasses, an Apple Watch, digibank web, and future surfaces (speaker, earbuds, in-car). Every surface can propose; only the phone can sign.

Target users: busy professionals who want conversational speed; seniors and low-vision users who need voice + read-aloud instead of dense forms; scam-vulnerable customers who need a system that visibly refuses, not silently executes.

REAL-WORLD SCENARIO INSIGHTS
Singapore lost over S$1.1 billion to scams in 2024, much of it through voice and messaging channels that manufacture urgency ("this is MAS — move your money to a safe account"). Meanwhile banks are shipping conversational assistants that execute whatever the model hears — a hallucination, an ambiguous name, or a prompt injection becomes a real transfer. The trust gap is the product gap: customers won't talk to a bank they can't audit, and regulators won't accept "the model decided."

Our insight: the failure mode isn't bad intent recognition — it's giving the model the power to act. So we removed it.

COMPREHENSIVE SOLUTION DESIGN
Business architecture — a four-stage pipeline: (1) Transcribe: TRTC ASR converts speech to text. (2) Draft: the LLM (ADP agent / Hunyuan via provider adapter) parses the utterance into a strict typed draft — payee, amount, formula, intent. It has no tools and no write path. (3) Validate + policy: an independent second model cross-checks the draft against the transcript; a deterministic policy engine applies tiers (PIN → Face ID → SMS step-up), symbolic formula evaluation ("half of what's left" is computed by code, never by the model), and scam-shield refusal. Disagreement = frozen draft, no retry, no override. (4) Sign + execute: the draft hash is signed on-device (Face ID/PIN); a deterministic gateway executes and appends every step to a hash-chained audit trail.

Technical: TypeScript end-to-end — zod-typed drafts, integer cents, pure-testable policy engine, LLMProvider adapter (ADP / Hunyuan / OpenAI / Anthropic swappable), mock banking core that maps 1:1 to real DBS systems. Prompts drive the AI in exactly two places: NL→JSON draft extraction (JSON-only, schema-bounded) and independent validation (draft vs transcript, agree/disagree verdict). Five demo paths are built in: happy path, multi-intent, ambiguous payee (asks, never guesses), validator freeze (said S$200, drafted S$2,000 — stopped), and scam shield (refused before any draft exists).

Wearables are first-class, not afterthoughts: a real Wearables UI Toolkit app for Meta Ray-Ban Display (capture, clarify-by-pinch, draft card — "Approve on your phone"), compiled SwiftUI for Apple Watch (all five states, arm64 watchOS binary — a watch face never carries a Pay button), digibank web, and feasibility sims for speaker / earbuds / in-car (audio-only while driving, voice never authorises).

BUSINESS VALUE
- Scam interception before money moves: three refusal flows (scam script, validator mismatch, ambiguity) that a "fast assistant" cannot offer; directly addresses the S$1.1B problem.
- Trust = adoption: every step is hash-chained and exportable — the same evidence regulators and dispute teams need.
- One pipeline, N surfaces: a new wearable is a UI change, not a new backend — the signing contract is enforced in code, cutting per-channel cost.
- Accessibility as market: voice + read-aloud + 44pt targets serves seniors and impaired users competitors bolt on later.
- Evidence, not slideware: native iOS build on device, real Meta toolkit app, compiled watchOS binary, Playwright-driven web — all captured in the demo.
```

## Project Link

```
https://github.com/aljabrialam/tencent-cloud-ai-hackathon-sg-2026
```

## Demo Video Link

→ YouTube link TBD (user uploads `demo/digivoice-demo-narrated.mp4`)

## Still needed from you

| Item | Action |
|---|---|
| Demo video | Spec wants **5–8 min** (overview + features + build reflection). Current cut is ~3:00 — see note below. |
| WorkBuddy/CodeBuddy/Miora history | ≥3 screenshots of chat logs → save to `design/tool-proof/` and upload (mandatory, no scoring without it) |
| Cover image | `design/cover.png` 380×216 ✓ — built as editable layers in Figma (`Cover — 16:9` frame in the [digiVoice file](https://www.figma.com/design/ucRZT8Lm4sExcuxWT0crPZ)); `design/cover-figma-1920.png` is the full-res export |
| Social post (bonus) | Post on YouTube/X/Xiaohongshu with #WorkBuddy #CodeBuddy #Miora #TencentCloudHackathon, submit link |
