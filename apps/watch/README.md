# digiVoice — watch surface

Real SwiftUI watch face. Five states, one hard rule: **the wrist can show,
never sign** — no Authorise/Pay affordance exists in any state.

| State | File | Purpose |
|---|---|---|
| ambient | `Sources/WatchViews.swift` | complication dot only — no balances on the wrist |
| listening | 〃 | waveform + rolling transcript |
| draft | 〃 | glanceable card, "Approve on your phone →" |
| sent | 〃 | tick + ledger ref, auto-clears |
| paused | 〃 | amber shield verdict — gestures dead |

## Build & render evidence

```bash
./build.sh   # watchOS arm64 compile + renders all states to Renders/
```

See `TEST-EVIDENCE.md` for the captured results.

## Shipping path (post-hackathon)

`Sources/DigiVoiceWatchApp.swift` is a real `@main` watchOS app. Wrap it in a
WatchKit target paired to the Expo host app; drafts arrive via
WatchConnectivity `updateApplicationContext`. Signing stays on the phone —
that is the product rule, not a limitation.
