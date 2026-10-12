# digiVoice mobile — runnable demo app

Real Expo / React Native app (SDK 57, TypeScript). Mock data only — no service, no
credentials, no network. The app is a single-screen state machine that walks the
documented demo paths from `docs/ux-screens.md`.

## Run

```sh
npm install
npx expo start        # scan with Expo Go on your phone
npx expo start --web  # or open in a browser (add ?bare=1 to hide demo chrome)
```

## What's inside

| File | What it does |
|---|---|
| `App.tsx` | Orchestrator — scenario picker + `Next` through the demo path. |
| `src/mock.ts` | Accounts, payees, the draft object, audit chain, `DEMO_PATHS`. |
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
