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

## The experience, stage by stage

What Mei Ling actually sees, hears, and does — glasses on face, Neural Band on wrist, phone
in her pocket until the moment it matters.

| Stage | Glasses (mic + HUD + speakers) | Neural Band | Phone |
|---|---|---|---|
| Idle | HUD clear or a single ambient line `digiVoice · en` — no persistent money info on the lens | Sleep | In pocket |
| Wake | Temple touchpad tap → "Listening" chime; mic captures "Transfer five hundred to Mum, then buy DBS shares with half of what's left" | — | Screen may stay off — the request never needs it |
| Listening | Live waveform in HUD's lower strip; transcript rolls by word. Speaker echoes only on demand (tap = "say it back") | Micro-pulse on each captured entity (amount, payee) so she *feels* the parse happening — useful for Deaf/hard-of-hearing users | — |
| Clarify | HUD shows the one question: "Two Johns — say *Tan* or *Lim*?" She answers aloud | Double-pinch = "neither"; single-pinch = "first option"; twist = "second" — she can disambiguate without speech in a noisy hawker centre | — |
| Card ready | Glanceable card rises: `S$500.00 → Mum ····4521 ✓ verified` + `S$1,250.00 DBS ≈28 shares` + `Approve on your phone →` + fingerprint `a3f9·08c2` | **Single-pinch = "send to phone"** (haptic confirm). Double-pinch = dismiss/cancel. Swipe = scroll multi-step cards | Wake notification: "digiVoice draft ready — approve" |
| Authorise | HUD holds the card + `Waiting for phone…`; speaker can read the whole card aloud on demand | Pinch-and-hold = repeat read-aloud | **The only authority**: Face ID + OOB signs `sha256(draft)` |
| Executed | Green tick + `Sent — S$500.00 to Mum · TXN-88214` for ~4 s, then HUD clears to ambient | Triple-pulse confirmation | Receipt + "Why did the agent do this?" |
| Frozen | Amber card: `I may have misunderstood — "two hundred" vs S$2,000. Nothing sent. Speak to correct` | Pinch = "say it again" | Frozen screen with comparison card |
| Scam | Amber steady (never flashing — flashing is a vestibular hazard): `⚠ Paused — this looks like a scam. See your phone or tap for the hotline` | No gestures accepted; deliberate dead-man switch so a scam can't be waved through | Full interstitial, cooling-off, hotline |

### HUD design rules

- **One card, never an app.** The lens shows: amount · payee · badge · one action hint ·
  fingerprint. Under 3 lines of body text — glanceable at walking speed.
- **Never a "Pay" or "Approve" affordance on the lens.** The strongest verb the HUD can show
  is `Approve on your phone →` or `Paused`. If the UI can confuse a glance into an
  authorisation, the UI is wrong.
- **States are word + colour + icon**, never colour alone: `✓ verified` green,
  `⚠ paused` amber, `⛔ frozen` red, `… waiting` grey.
- **Auto-dismiss.** Cards time out to ambient after ~8 s of no interaction; sensitive fields
  (balances) never linger on the lens.
- **Speaker read-aloud mirrors the phone's** — same plain-language phrasing
  (`docs/ux-screens.md`), so a low-vision user's glasses experience is the app, not a subset.

### Neural Band gesture map

| Gesture | Meaning | Why it's safe |
|---|---|---|
| Single pinch | Forward draft to phone / select first option / confirm-read-aloud | Selects; never authorises |
| Double pinch | Dismiss card / cancel flow | Only removes |
| Twist / swipe | Scroll a multi-step card on the HUD | Navigation |
| Pinch-and-hold | Repeat the speaker read-aloud | Accessibility |
| *(no gesture)* | Authorise | **Deliberately unmapped** — signing requires the phone's biometric |

The band's real value is silent, one-handed control for the exact users DBS's inclusivity
brief cares about — arthritis (no phone grip), tremor (no precision tapping), low vision
(no screen hunt), MRT-commuter (one hand on a rail). But EMG is not identity: the band
can't prove *who* pinched, so it can only ever propose, never approve.

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
