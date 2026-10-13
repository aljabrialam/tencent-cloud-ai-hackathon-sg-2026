# digiVoice service — the deterministic pipeline

Node + TypeScript on the built-in HTTP layer. Implements the full contract in
`specs/001-conversational-transaction-agent/contracts/service-api.md` against
the pure core in `packages/shared` — the LLM drafts, code executes
(constitution Principle I: the model has no tools and no path to the ledger).

## Run

```sh
npm install
npm run dev          # http://localhost:8787 — seeds on first boot
npm run typecheck
```

State is a JSON file (`STATE_FILE`, default `/tmp/digivoice-state.json`) — a
restart mid-flow loses nothing. `PORT` overrides the listen port.

## Deployed (Vercel)

Production deployment: **https://tencent-cloud-ai-hackathon-sg-2026.vercel.app**

- Swagger UI: [`/api/docs`](https://tencent-cloud-ai-hackathon-sg-2026.vercel.app/api/docs)
- OpenAPI JSON: [`/api/openapi.json`](https://tencent-cloud-ai-hackathon-sg-2026.vercel.app/api/openapi.json)
- Health: [`/health`](https://tencent-cloud-ai-hackathon-sg-2026.vercel.app/health)

Deploys from the **repo root** (the function imports `packages/shared`):
root `api/index.ts` is the serverless entry, `vercel.json` rewrites every path
to it and the original path arrives via the `x-matched-path` header. `src/app.ts`
exports the same `handle(req,res)` used by the local listener in `src/index.ts` —
one router, two runtimes. CORS is open (`*`) so any browser can call it.

```sh
vercel --prod   # from repo root
../../scripts/happy_path.sh https://tencent-cloud-ai-hackathon-sg-2026.vercel.app
```

Caveat: on serverless the JSON-file state is per-instance (`/tmp`) — warm
invocations share it, cold starts don't. Same mock-bank honesty; production
would point `STATE_FILE` at managed storage.

## Providers (env — never in the mobile bundle)

| Var | Effect |
|---|---|
| `ADP_APP_KEY` | Tencent ADP becomes the **drafter** |
| `HUNYUAN_SECRET_KEY` (+ `HUNYUAN_MODEL`) | Hunyuan becomes the **validator** |
| `DRAFTER_OPENAI_KEY` / `VALIDATOR_OPENAI_KEY` (+ `*_MODEL`) | OpenAI-compatible fallbacks |
| `TRTC_ASR_SDK_APP_ID` | Tencent TRTC ASR — fails closed (502) until SDK signing is wired |
| *(none set)* | `mock-drafter` + `mock-validator` + `mock-asr` — deterministic, offline |

Drafter and validator are **different engines by construction** — the dual-engine
audit requirement. Either one timing out or disagreeing freezes the draft.

## API surface

`GET /health` · `POST /api/device/keys` · `POST /api/transcribe` ·
`POST /api/drafts` · `POST /api/drafts/{id}/clarify` ·
`POST /api/drafts/{id}/authorise` · `POST /api/execute` ·
`GET /api/drafts/{id}` · `POST /api/drafts/{id}/cancel` ·
`POST /api/tts` · `GET /api/audit/{conversationId}` · `GET /api/home` ·
`GET /api/docs` (Swagger UI) · `GET /api/openapi.json`

Dev-only hooks (require `X-Demo: 1` header): `POST /api/demo/corrupt-draft`,
`POST /api/demo/validator-timeout`, `POST /api/demo/reset-velocity`,
`POST /api/demo/seed`.

Error contract: `400` schema-invalid · `403` unsigned/tampered/wrong-tier/unknown
device/KYC · `404` unknown resource · `409` frozen or cancelled · `410` expired ·
`422` invalid clarification · `423` policy hold · `502` upstream LLM/ASR/TTS.

## Prove it

```sh
../../scripts/happy_path.sh   # happy path, multi-intent formula, clarify,
                              # unsigned 403, tampered 403, scam shield,
                              # injection warning, chainOk: true
../../scripts/demo_hooks.sh   # exercises the X-Demo hooks
```
