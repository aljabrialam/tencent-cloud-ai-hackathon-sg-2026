# Meta wearable integration — digiVoice on Ray-Ban Display

Status: **working prototype path confirmed** (not just a concept). Hardware not owned by the
team — all testing via Meta's official simulators. Dev portal:
https://wearables.developer.meta.com/

## Why it matters for DCTA

Hands-free voice input + glanceable confirmation is the most natural surface for a
conversational transaction agent — and it maps directly onto the inclusivity story (elderly
users, motor impairments: no screen needed until authorisation).

## The trust model does not change

Same constitution, same rules — the glasses inherit every guardrail instead of bypassing them:

| Surface | Role | Authority |
|---|---|---|
| Glasses (DAT or Web App) | Voice capture, transcript echo, glanceable draft card, status glances | **None** — input/display only |
| Phone | Confirmation card, policy verdicts, biometric/PIN signature of hash(draft) | Sole authorisation point |
| Service | Draft, validate, policy, execute, ledger read-back | Unchanged |

Over-limit or scam verdict → HUD shows amber/red "Paused — see your phone". Nothing about the
glasses can approve money movement. This mirrors Glance's glasses rule: approval stays on the
phone.

## Two real integration paths

### Path A — Device Access Toolkit (DAT), iOS/Android SDK
- Repos: `facebook/meta-wearables-dat-ios`, `facebook/meta-wearables-dat-android`
- Access to glasses as a device: camera stream, photo capture, touchpad gestures, device state
- **Mock Device Kit** simulates the entire SDK stack (registration, permissions, power/don/
  unfold state, camera feed from phone camera or video file, touchpad taps) — our app code is
  identical against mock and real devices
- Fits our Expo app as a native module; supports Ray-Ban Meta Gen 1/2, Optics, and Ray-Ban
  Display

### Path B — Web Apps for Meta Ray-Ban Display (chosen for the demo)
- The Display glasses' HUD loads an **HTTPS-hosted web app** — we already have the artifact:
  `design/digivoice-app-mockup.html` (or a dedicated `apps/glasses-hud/` static page)
- Testable without hardware via the **Meta Ray-Ban Display Simulator** ("View on Glasses QR"
  generates the install QR)
- Host on GitHub Pages → live demo URL doubles as the submission's "optional demo link"
- Requirements if we ever pair real glasses: MRBD hardware, glasses firmware v125+, Meta AI
  app v272+, Developer Mode on, project registered in the Wearables Developer Center
- Repo/plugin: `facebook/meta-wearables-webapp`

## Demo plan

1. HUD Web App (`apps/glasses-hud/`) renders the same confirmation card: amount, payee,
   verified badge, "Approve on your phone →", draft fingerprint.
2. Phone app pushes the current draft state to the HUD page (mock: query param / Broadcast
   Channel for the hackathon; real: service-pushed state).
3. In the demo video, show the MRBD Simulator view next to the phone: speak → card appears on
   both → scam verdict → amber glance on HUD, interstitial on phone.
4. Pinch/touchpad gestures are display-only affordances ("send to phone"); the signature is
   always the phone's biometric + OOB per `docs/policy-rules.md`.

## Constraints to respect

- HTTPS only for Web Apps; every install is wearer-confirmed (QR or `navigator.install()`)
- Display and input constraints per Meta's Build guide — HUD shows a summary card, not the
  full app
- Label everything "simulator / mock device" per Constitution Principle VII (Honest
  Simulation). We own no hardware; claims stop at "tested on Meta's official simulators"
- DAT camera/mic permissions exist for accessibility input ideas (e.g. read a bill through
  the camera) — P4, not in the demo path
