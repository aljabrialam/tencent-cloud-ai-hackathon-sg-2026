# Agent notes — SayPay (DBS DCTA)

## Governing documents
- Constitution: `.specify/memory/constitution.md` — read before any implementation. Principle I
  (LLM drafts, code executes; the model has no tools) is non-negotiable.
- Active feature: `specs/001-conversational-transaction-agent/` (`.specify/feature.json`).
- UX blueprint: `docs/ux-screens.md`; policy table: `docs/policy-rules.md`.

## Workflow
- Spec Kit: `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`. Commands in `.devin/commands/`.
- Branch per feature (`001-...`); commit with task ids; push to `origin`.
- Deadline: 2026-10-16 23:59 SGT. Cut P3 stories first.

## Tooling decisions
- Mobile: Expo / React Native + TypeScript, run via Expo Go on a physical device.
  Load `expo-overview` skill first, then `expo-project-structure`, `expo-native-ui`,
  `expo-design-system` as routed. Tokens live in `docs/ux-screens.md`.
- Service: Node + TypeScript, `zod`, `vitest`. Money is integer cents. Policy engine is pure
  and test-first.
- LLM: `LLMProvider` adapter — ADP (drafting; AppKey + SSE, JSON-only prompt), Hunyuan
  (validation; OpenAI-compatible), OpenAI, Anthropic. Keys in `apps/service/.env` (gitignored);
  never in the mobile bundle. Do NOT use ADP tool-calling or TRTC real-time AI conversation
  (they bypass the deterministic zone — constitution Principle I).
- Voice: TRTC standalone ASR (Node SDK, `TRTC_ASR_SDK_APP_ID` + `TRTC_ASR_SECRET_KEY`,
  16 kHz mono PCM/WAV) and TTS API (cloud `SecretId/SecretKey`). Docs index:
  https://trtc.io/llms/conversational-ai.txt — append `.md` to trtc.io doc URLs for raw markdown.
  The `@tencent-rtc/trtc-agent-skills` package targets web Conversational-AI scenarios and
  writes `.claude/` hooks; not installed — read the two docs above directly instead.
- Figma: remote MCP `figma` configured (user scope). User's seat is View — cannot
  `create_new_file`; ask the user for a file URL, then `use_figma` to build screens.
  Always load `skill://figma/figma-use/SKILL.md` and `figma-generate-design` first.
- Demo video (Day 4): `openscreen-demo` skill installed globally. Needs the OpenScreen desktop
  app (https://getopenscreen.com/download/) and its MCP registered:
  `devin mcp add -s user openscreen -- /Applications/Openscreen.app/Contents/MacOS/Openscreen mcp`
  then grant Screen Recording permission to Devin. Storyboard = `docs/demo-script.md` beats.
  Record the Expo app via iOS Simulator window (clean, no notifications), or screen-mirror the
  phone. Cap (cap.so) skipped — remote MCP is read-only and overlaps OpenScreen.
- Maestro: add one YAML flow for the demo path once screens 1–9 exist (Day 3). Not before.
- Skipped on purpose for the hackathon: GitHub MCP (use `gh`), EAS Build/Submit (Expo Go
  suffices), Sentry.

## Submission must-haves
- ≥3 CodeBuddy/WorkBuddy chat screenshots in `design/tool-proof/` — no proof, no scoring.
- 16:9 cover image `design/cover.png` (Miora).
- Checklist: `docs/submission-checklist.md`.
