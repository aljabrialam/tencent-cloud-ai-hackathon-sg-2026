# demo/ — recorded evidence per surface

Real captures of running code, not mockups. One consolidated cut:
`digivoice-demo.mp4` (~81 s, 1280×720) — title card → each surface.

| Clip | Surface | How it was captured |
|---|---|---|
| `mobile-sim.mp4` | Expo app | `xcrun simctl io recordVideo` — iPhone 16 Pro sim (iOS 18.6), Safari on `http://localhost:8087?auto=1&bare=1`. `?auto=1` walks the demo path on a timer; `?bare=1` hides the demo chrome; `?scn=N` picks a scenario (0=happy, 1=multi-intent, 2=ambiguous, 3=validator-freeze, 4=scam). |
| `glasses-hud.mp4` | Meta Ray-Ban Display | Playwright `recordVideo` at the 600×600 MRBD window against `apps/glasses-hud` `vite preview`, clicking through Capture → Review → Stopped groups. |
| `watch-flow.mp4` | Smartwatch | ffmpeg slideshow of `apps/watch/Renders/watch-*.png` — those PNGs are rendered by the real compiled SwiftUI views (no watchOS sim runtime installed). |
| `web-app.mp4` | digibank web + future surfaces | Playwright `recordVideo` at 1280×800 against `apps/web` `vite preview`: draft → clarify → frozen → audit, then speaker phone-ping, earbud read-aloud + fraud interrupt, car moving/standstill. |

## Re-capture

```sh
# serve all three
cd apps/mobile     && npx expo start --web --port 8087
cd apps/web        && npm run build && npm run preview -- --port 4174
cd apps/glasses-hud && npm run build && npm run preview -- --port 4175

# phone — boot sim, open URL, record
xcrun simctl boot "iPhone 16 Pro"
xcrun simctl openurl booted "http://localhost:8087?auto=1&bare=1"
xcrun simctl io booted recordVideo demo/mobile-sim.mov   # Ctrl-C to stop

# glasses + web — Playwright recordVideo (see git history for scripts)
# watch — ffmpeg -loop 1 per apps/watch/Renders PNG, concat

# stitch — scale/pad each to 1280×720, title-card PNGs, ffmpeg concat
```

## Not captured (yet)

- **Native iOS build** — `expo run:ios` fails in `xcodebuild` at
  "Could not resolve package dependencies" (RN 0.86 prebuilt SPM fetch;
  environment issue, not app code). Safari-on-sim is used instead — same
  running bundle. Fix: `xcodebuild -resolvePackageDependencies` inside
  `apps/mobile/ios` once the toolchain can reach github.
- **watchOS simulator** — no watchOS runtime installed (`xcrun simctl list
  runtimes` shows only iOS 18.6). Compiled-binary + rendered-PNG evidence
  stands in; a runtime install would let the same views run live.
