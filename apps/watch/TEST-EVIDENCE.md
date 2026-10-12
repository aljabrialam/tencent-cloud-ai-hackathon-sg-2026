# digiVoice watch — test evidence

Same playbook as `apps/glasses-hud`: real code in the platform's native
toolchain, not a mockup. The watch surface is **SwiftUI for watchOS** — the
same view sources compile against Apple's watchOS 11.5 SDK and render to the
PNGs in `Renders/`.

## Environment

- Xcode 16.4 (16F6), watchOS 11.5 SDK + watchsimulator 11.5 SDK (system SDKs, no download)
- Host: macOS 15.3.1 arm64
- No watchOS simulator runtime installed on this machine — compilation is
  proven against the SDK directly; rendering is done by compiling the
  *identical* SwiftUI views for macOS (SwiftUI is cross-platform) and
  rasterising each state with `ImageRenderer`. Nothing is hand-drawn.

## Commands (reproducible — `build.sh`)

```bash
# 1. compile all sources for arm64 watchOS — real object code, real SDK
xcrun -sdk watchsimulator swiftc -typecheck \
  -target arm64-apple-watchos11.5-simulator Sources/*.swift
xcrun -sdk watchsimulator swiftc -emit-library -parse-as-library \
  -target arm64-apple-watchos11.5-simulator \
  -module-name digiVoiceWatch -o Renders/libdigivoice-watchos.dylib Sources/*.swift

# 2. render every state from the same sources
swiftc -O -o /tmp/dv-render Sources/WatchViews.swift Sources/RenderMain.swift
/tmp/dv-render Renders/
```

## Results — 2026-10-12

| Check | Result |
|---|---|
| watchOS typecheck (all sources, `-sdk watchsimulator`) | **PASS** — 0 errors/warnings |
| watchOS arm64 dynamic library emitted | **PASS** — `Mach-O 64-bit arm64 dylib` (`Renders/libdigivoice-watchos.dylib`) |
| 5 states rasterised from compiled code | **PASS** — `Renders/watch-{ambient,listening,draft,sent,paused}.png` + `watch-strip.png` |
| Authorise/Pay affordance present in any state | **None — by construction.** The only forward path is the text "Approve on your phone →" |
| Status conveyed without colour alone | **PASS** — every state carries a word label (LISTENING / DRAFT READY / SENT / SHIELD) |

## What this proves

- The watch states in `design/screens/mock-surf-watch.png` are not static
  pixels — `WatchRootView` implements all five as a real SwiftUI state
  machine (`WatchState: ambient → listening → draft → sent | paused`).
- The "never sign on the wrist" rule is architectural: no button, toggle, or
  gesture in these views can move money; `sent`/`paused` render text only.
- Shipping path (not done — needs a paired iPhone + Xcode project wrapper):
  `DigiVoiceWatchApp` is a drop-in `@main App`; add a watch target to the
  Expo host app or a standalone WatchKit bundle, push drafts via
  WatchConnectivity `updateApplicationContext`, done.

## Caveats

- Renders are produced on macOS from the same view code — layout is faithful
  at Series-10-46mm proportions (416×496 pt), but real-device bezel safe
  areas and always-on dimming need a device/simulator pass later.
- `ImageRenderer` on macOS renders the same view tree; font rasterisation is
  the platform's real one.
