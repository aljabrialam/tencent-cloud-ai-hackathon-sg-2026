# Prompt — narrate & stitch `digivoice-demo.mp4`

You are a video post-production assistant. Add a spoken voice-over to the attached screen recording and return the finished video. Everything you need is below.

## Input

- `digivoice-demo.mp4` — a silent screen recording, total **1:53.7** (no audio track). 1920×1080, 30 fps. Inspect it for exact resolution, frame rate and duration.
- The numbered narration lines in **Narration** below. Each has a start cue in `m:ss.s` measured from the very start of the video.

## Task

1. Generate spoken audio for every numbered line. Voice: one calm, confident narrator; documentary / explainer tone, not an advert; unhurried.
2. Each line must **begin at its start cue**. Never start earlier. If a line would overrun the next cue, you may start the next line up to **1.0 s late** or trim leading/trailing silence — do not speed the speech past a natural pace.
3. Leave the video track untouched — same resolution, frame rate, length and pixels. Add an audio track only.
4. Silence between lines is fine. Any music bed is optional, must sit below −26 LUFS and duck to −30 dB under speech.
5. Master the voice to **−16 LUFS** integrated (stereo), true peak **≤ −1.5 dBTP**.
6. Export H.264 MP4 + AAC 192 kbps, `+faststart`. Name it `digivoice-demo-narrated.mp4`.

## Pronunciation

- `digiVoice` → "diji-voice" (one word, stress on "voice")
- `S$200` / `S$200.00` → "two hundred Singapore dollars"
- `sha256` → "S-H-A two five six"; `sha256(draft)` → "the draft hash"
- `Face ID` → as written; `PayNow` → "pay-now"; `POSB` → "P-O-S-B"
- `MRBD` → "Meta Ray-Ban Display"; `SwiftUI` → "swift-U-I"; `SQLite` → "S-Q-Lite"
- `VAL-MISMATCH` → "val-mismatch"; `TXN-88214` → "T-X-N eight eight two one four"
- `600×600` → "six hundred by six hundred"; `POL-TIER-*` → "policy tier rules"

## Do not

- Do not paraphrase, shorten, reorder or merge the lines — read each verbatim.
- Do not add narration to moments that have no line; let the visuals breathe.
- Do not alter, cover or comment on the on-screen text.
- Do not imply the smart speaker, earbuds or in-car surfaces are shipped native apps — they are simulated future surfaces inside the web app.

## Narration

17 lines. Format: `[start cue] line`.

1. **[0:00.0]** One banking agent across every surface — but only one surface can sign.
2. **[0:03.5]** This is the phone: a native React Native build running live on an iPhone simulator.
3. **[0:08.5]** The user speaks plainly — send two hundred to Mum for groceries. No forms, no fields.
4. **[0:13.0]** The model only drafts. Deterministic code resolves the payee, the amount and the policy tier.
5. **[0:18.0]** Face ID signs the draft hash — the signature binds exactly what is on screen. Edit anything and it dies.
6. **[0:23.0]** Receipt, then a hash-chained audit trail. Every step this agent took is traceable.
7. **[0:27.0]** The same pipeline on Meta Ray-Ban Display — a real Wearables UI Toolkit app on the six hundred by six hundred lens.
8. **[0:35.0]** The lens stays dark until you speak. Capture states listen, transcribe and clarify.
9. **[0:46.0]** Two payees named John — the glasses ask which one, aloud or by pinch. They never guess.
10. **[0:55.0]** The draft card glances: amount, payee, verified. The only forward path is approve on your phone.
11. **[1:03.0]** Waiting means the phone is signing. Sent means it is done. No approve affordance exists on this surface.
12. **[1:11.0]** The smartwatch shows the same five states — compiled SwiftUI code, not a mockup.
13. **[1:18.5]** A watch face never carries a Pay button. The wrist can show — never sign.
14. **[1:30.5]** On digibank web, the same transcript and draft card side by side.
15. **[1:37.0]** Draft, clarify, frozen, audit — the browser is display and capture only. Even a logged-in desktop cannot sign.
16. **[1:45.5]** And the future surfaces: a speaker pings the phone instead of trusting voice. Earbuds read drafts aloud. In-car goes audio-only while moving.
17. **[1:52.0]** One signed-draft pipeline. Many mouths and ears. The phone approves.

## Beat reference

Context only — what is on screen at each cue. Do not read this aloud.

| Start | End | On screen |
|------:|----:|-----------|
| 0:00.0 | 0:03.0 | Title card: "The phone signs." |
| 0:03.0 | 0:26.4 | iPhone sim, native app looping the happy path: home → listening → confirm → Face ID authorise → receipt → audit |
| 0:26.4 | 0:29.4 | Title card: "Meta Ray-Ban Display" |
| 0:29.4 | 1:10.6 | Glasses HUD walkthrough: Capture group → Listening → Clarify → Review group → Draft card → Waiting → Sent → Stopped group → Frozen → Scam pause |
| 1:10.6 | 1:13.6 | Title card: "Smartwatch" |
| 1:13.6 | 1:30.0 | Watch film: compiled SwiftUI renders in a bezel — Ambient → Listening → Draft → Sent → Paused, with rule captions |
| 1:30.0 | 1:33.0 | Title card: "digibank web + future surfaces" |
| 1:33.0 | 1:54.6 | Web app: digibank shell with transcript + draft card, clarify / frozen / audit states, then speaker · earbuds · in-car simulation cards |
