# glasses-hud — Meta Web Apps test gate evidence

Official gate: `check-webapp.mjs` from `facebook/meta-wearables-webapp`
(skill `ai-glasses-webapp-test`). Command:

```sh
node <toolkit>/skills/ai-glasses-webapp-test/scripts/check-webapp.mjs apps/glasses-hud
```

## Result — PASSED

| Check | Result |
|---|---|
| UI Toolkit structure validator | 0 findings |
| `tsc --noEmit` | pass |
| `vite build` | pass (bundle 160 KB gzip, budget <300 KB) |
| Browser QA (headless Chromium, 600×600 device window + desktop) | pass |
| Initial requests | 5 (limit <15) |
| Load | ~50 ms |
| JS heap | ~10 MB (limit <128 MB) |
| Frame sampling | ~62 fps (target ≥30 Hz) |
| Focus targets | all in-viewport, named, directional nav + Escape verified |
| Overflow / console / page errors | none |
| Alt text | pass |

Screenshots written by the gate: `.wearables-test/normal.png`,
`.wearables-test/additive-composite.png` (composited over a live scene —
copied to `design/screens/hud-toolkit-*.png`).

Scope note: the gate validates structure, rendering, input model and budgets on
a host browser. It does not emulate the on-device link or the Neural Band; on-glasses
behaviour is covered by the design spec (`docs/meta-wearable-concept.md`) and the
Meta Ray-Ban Display simulator / companion app developer mode.
