# digiVoice mobile — runnable app (mock + live modes)

Real Expo / React Native app (SDK 54, TypeScript). Two modes:

- **Mock (default)** — no service, no credentials, no network. A single-screen
  state machine walking the documented demo paths from `docs/ux-screens.md`.
  This is the demo/recording mode.
- **Live** — the same screens driven by the real service (`apps/service`):
  shield → LLM draft → resolver → validator → policy → device signature →
  gateway → hash-chained audit.

## Native build — EAS (real .apk / .ipa)

Android APK for judges/testers on real phones — **latest build:**
[`digivoice.apk` (56 MB)](https://expo.dev/artifacts/eas/tY9XcTxAv5INtXoZWzWrdF71162SzbZ10aUSb1rCOy4.apk)

```sh
npx eas-cli build --platform android --profile preview   # → shareable install link
npx eas-cli build:list                                    # get the artifact URL
```

EAS project: [`@aljabrialam/digivoice`](https://expo.dev/accounts/aljabrialam/projects/digivoice).
The `preview` profile bakes `EXPO_PUBLIC_API_URL` to the deployed service, so
the installed app runs `LIVE` out of the box. iOS needs a paid Apple Developer
account (ad-hoc/TestFlight) — skipped for judging.

Real-device cloud testing (TestMu AI, BrowserStack, …): upload the APK artifact
to run it on a physical cloud device — useful for real-device evidence, but it
is a testing platform, not hosting; judges get the EAS install link instead.

## Deployed — no install needed

**https://digivoice-mobile.vercel.app** — the same app, exported for web and served
from Vercel. Mock by default; [`?live=1`](https://digivoice-mobile.vercel.app/?live=1)
runs it against the deployed service (`tencent-cloud-ai-hackathon-sg-2026.vercel.app`,
auto-selected when not on localhost — `?api=` still overrides).

```sh
# redeploy the web build
npx expo export --platform web            # writes dist/ (wipes dist/.vercel)
cd dist && vercel link --yes --project digivoice-mobile && vercel --prod
```

## Run — mock mode

```sh
npm install
npx expo start        # scan with Expo Go on your phone
npx expo start --web  # or open in a browser (add ?bare=1 to hide demo chrome)
```

## Run — live mode

```sh
cd ../service && npm install && npm run dev     # real service on :8787
cd ../mobile && npx expo start --web            # then open http://localhost:8081?live=1
```

| Toggle | Where |
|---|---|
| `?live=1` | web URL |
| `EXPO_PUBLIC_LIVE=1` | native / Expo Go |
| `EXPO_PUBLIC_API_URL` or `?api=<url>` | override service URL (default `http://localhost:8787` on localhost, the Vercel API otherwise) |

A chip in the demo chrome reports the connection: `LIVE`,
`MOCK · service down`, or `connecting…`. In live mode each stage fires the real
call — listening → `POST /api/drafts`, authorise → `POST /api/drafts/{id}/authorise`
+ `POST /api/execute` (Ed25519 signature generated in-app), audit →
`GET /api/audit/{id}`. If the service is unreachable the app falls back to mock
data and the badge says so — it never silently fakes a live result.

## What's inside

| File | What it does |
|---|---|
| `App.tsx` | Orchestrator — scenario picker, `Next` through the demo path, live wiring. |
| `src/mock.ts` | Mock mode: accounts, payees, draft object, audit chain, `DEMO_PATHS`. |
| `src/api.ts` | Service client — thin fetch wrapper over the API contract. |
| `src/live.ts` | `useLive` hook — maps each trigger stage to the real service call. |
| `src/signing.ts` | Ed25519 draft signing in-app (Metro can't import `packages/`). |
| `src/theme.ts` | Design tokens — the AA-verified palette from `docs/ux-accessibility-audit.md`. |
| `src/screens/` | Home, Listening (animated waveform), Clarify, Confirm (+multi-intent), Frozen, Scam, Authorise, Receipt, Audit. |

## Demo paths

Five switchable scenarios — `Happy path`, `Multi-intent`, `Ambiguous payee`,
`Validator freeze`, `Scam shield` — each a sequence of stages matching the
mockup screens. The chrome bar at top is demo control only (`?bare=1` hides it
for screenshots).

## The rule this app demonstrates

Every non-phone surface (glasses, watch, web, speaker, earbuds, car) renders the
same draft object. Only this app carries the `Hold to authorise · Face ID`
button — the mock "signing" binds `sha256(draft)` so any edit invalidates it.

Screenshots in `screenshots/` were captured from the running app (Playwright
against `expo start --web`), not from the design mockup.
