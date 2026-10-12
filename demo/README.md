# demo/ — recorded evidence per surface

Real captures of running code, not mockups. `digivoice-demo.mp4` (2:55,
1920×1080) stitches all four surfaces with title cards; `narration.md`
is the voice-over cue sheet matched to that timeline.

| Clip | Surface | How it was captured |
|---|---|---|
| `mobile-all.mp4` | Expo app | **Native dev build** on iPhone 16 Pro sim (iOS 18.6): `xcrun simctl io booted recordVideo`. On-device auto-play cycles **all five scenarios** in order (happy → multi-intent → ambiguous → validator freeze → scam shield), 84 s, 1206×2622. |
| `glasses-hud.mp4` | Meta Ray-Ban Display | Playwright `recordVideo` at exactly 600×600 against `apps/glasses-hud` `vite preview` (:4175), driven by `apps/glasses-hud/rec-glasses.mjs` — clicks through Capture → Review → Stopped groups, Escape for the toolkit's `useBackNavigation`. Upscaled lanczos to 1200×1200 (the MRBD toolkit renders at its fixed 600×600 device size). |
| `watch-film.mp4` | Smartwatch | Playwright `recordVideo` at 1920×1080 of `apps/watch/film.html` — the bezel renders are the real compiled SwiftUI views (`apps/watch/Renders/watch-*.png`); no watchOS sim runtime is installed, so this is the honest capture path. |
| `web-app.mp4` | digibank web + future surfaces | Playwright `recordVideo` at 1920×1080 against `apps/web` `vite preview` (:4174): transcript + draft → clarify → frozen → audit, then speaker phone-ping, earbud read-aloud + fraud interrupt, car moving/standstill. |

## Re-capture

```sh
# serve the web surfaces
cd apps/web        && npm run build && npm run preview -- --port 4174
cd apps/glasses-hud && npm run build && npm run preview -- --port 4175

# phone — native dev build on the booted sim (Metro must be up on :8081 first)
cd apps/mobile && npx expo start --port 8081 &
xcrun simctl launch booted com.anonymous.digivoice
xcrun simctl io booted recordVideo demo/mobile-native.mov   # Ctrl-C to stop

# glasses — drives the whole state tree itself
cd apps/glasses-hud && node rec-glasses.mjs                 # writes /tmp/vid-glasses/*.webm

# watch + web — Playwright recordVideo (scripts in git history / regenerate as needed)

# stitch — scale/pad each onto a 1920×1080 canvas, title-card PNGs, ffmpeg concat
```

Mobile URL params (web preview only): `?auto=1` self-walks the path,
`?bare=1` hides the demo chrome, `?scn=N` picks a scenario
(0=happy, 1=multi-intent, 2=ambiguous, 3=validator-freeze, 4=scam).
On native there are no URL params — the app auto-plays and the scenario
chips stay visible, which reads well in footage anyway.

## Notes / honest gaps

- **Native iOS build** works — took aligning to Expo SDK 54 / RN 0.81 after
  SDK 57's prebuilt SPM packages failed to resolve in this Xcode 16.4 /
  Swift 6.1 environment. Rebuild: `npx expo prebuild --clean && npx
  pod-install && xcodebuild -workspace ios/digiVoice.xcworkspace -scheme
  digiVoice -configuration Debug -destination 'id=<sim-udid>' build`.
- **watchOS simulator** — no watchOS runtime installed (`xcrun simctl list
  runtimes` shows only iOS 18.6). The film uses real compiled-render PNGs
  inside a bezel; a runtime install would let the same views run live.
- Speaker, earbuds and in-car are future-feasibility sims inside
  `apps/web` — don't present them in the cut as shipped native apps.
