# demo/ — recorded evidence per surface

Real captures of running code, not mockups. `digivoice-demo.mp4` (1:50.6,
1920×1080) stitches all four surfaces with title cards; `narration.md`
is the voice-over cue sheet matched to that timeline.

| Clip | Surface | How it was captured |
|---|---|---|
| `phone-film.mp4` | Expo app | Playwright `recordVideo` of `apps/mobile/film.html` — an iPhone bezel over **real native screenshots** (`apps/mobile/Renders/phone-*.png`) captured via `xcrun simctl io booted screenshot` while the dev build self-walks all five scenarios. 10 states, captioned. |
| `glasses-film.mp4` | Meta Ray-Ban Display | Playwright `recordVideo` of `apps/glasses-hud/film.html` — a lens bezel over **real HUD renders** (`apps/glasses-hud/Renders/hud-*.png`) shot at the 600×600 MRBD window via `?state=<id>` deep links (`shoot-states.mjs`). 8 states, captioned. |
| `watch-film.mp4` | Smartwatch | Playwright `recordVideo` of `apps/watch/film.html` — bezel over real compiled SwiftUI renders (`apps/watch/Renders/watch-*.png`); no watchOS sim runtime installed, so this is the honest capture path. |
| `web-app.mp4` | digibank web + future surfaces | Playwright `recordVideo` at 1920×1080 against `apps/web` `vite preview` (:4174): transcript + draft → clarify → frozen → audit, then speaker phone-ping, earbud read-aloud + fraud interrupt, car moving/standstill. |
| `mobile-all.mp4` | Expo app (raw) | `simctl recordVideo` of the native dev build cycling all five scenarios — kept as raw-run evidence alongside the film. |

## Re-capture

```sh
# serve the web surfaces
cd apps/web          && npm run build && npm run preview -- --port 4174
cd apps/glasses-hud  && npm run build && npm run preview -- --port 4175

# phone frames — Metro on :8081, dev build installed; app auto-cycles
cd apps/mobile && npx expo start --port 8081 &
xcrun simctl launch booted com.anonymous.digivoice
# screenshot every ~3 s into a folder, pick per-stage frames → apps/mobile/Renders/

# glasses frames — one Playwright pass, all eight states
cd apps/glasses-hud && node shoot-states.mjs                 # writes Renders/hud-*.png

# films + web — Playwright recordVideo
cd apps/glasses-hud && node rec-films.mjs                    # phone-film + glasses-film
# watch-film + web-app: same recordVideo pattern against film.html / :4174

# stitch — 1920×1080 canvas, title-card PNGs, ffmpeg concat
```

Mobile URL params (web preview only): `?auto=1` self-walks the path,
`?bare=1` hides the demo chrome, `?scn=N` picks a scenario
(0=happy, 1=multi-intent, 2=ambiguous, 3=validator-freeze, 4=scam).
On native the app auto-plays bare — no chrome in footage.

Glasses URL param: `?state=<id>` opens a HUD state directly
(ambient, listening, clarify, card, waiting, sent, frozen, scam).

## Notes / honest gaps

- **Native iOS build** works — took aligning to Expo SDK 54 / RN 0.81 after
  SDK 57's prebuilt SPM packages failed to resolve in this Xcode 16.4 /
  Swift 6.1 environment.
- **watchOS simulator** — no watchOS runtime installed (`xcrun simctl list
  runtimes` shows only iOS 18.6). The film uses real compiled-render PNGs
  inside a bezel; a runtime install would let the same views run live.
- Speaker, earbuds and in-car are future-feasibility sims inside
  `apps/web` — don't present them in the cut as shipped native apps.
