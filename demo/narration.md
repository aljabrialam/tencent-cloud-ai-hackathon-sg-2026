# Prompt — narrate & stitch `digivoice-demo.mp4`

You are a video post-production assistant. Add a spoken voice-over to the attached screen recording and return the finished video. Everything you need is below.

## Input

- `digivoice-demo.mp4` — a silent screen recording, total **2:59.4** (no audio track). 1920×1080, 30 fps. Inspect it for exact resolution, frame rate and duration.
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
- `S$200` / `S$200.00` → "two hundred Singapore dollars"; `S$2,000` → "two thousand dollars"; `S$50` → "fifty dollars"; `S$500` → "five hundred"
- `D05.SI` → "D-zero-five dot S-I"; `PayNow` → "pay-now"; `MAS` → "M-A-S"
- `VAL-MISMATCH` → "val-mismatch"; `POL-TIER-01` → "policy tier zero one"
- `SwiftUI` → "swift-U-I"; `TXN-88214` → "T-X-N eight eight two one four"
- `Face ID` → as written

## Do not

- Do not paraphrase, shorten, reorder or merge the lines — read each verbatim.
- Do not add narration to moments that have no line; let the visuals breathe.
- Do not alter, cover or comment on the on-screen text.
- Do not imply the smart speaker, earbuds or in-car surfaces are shipped native apps — they are simulated future surfaces inside the web app.

## Narration

19 lines. Format: `[start cue] line`.

1. **[0:00.0]** One banking agent across every surface — but only one surface can sign.
2. **[0:03.5]** The phone — a real iOS Simulator running the native React Native build. It walks all five demo paths by itself.
3. **[0:09.5]** Path one, the happy path — send two hundred to Mum. The model only drafts; code resolves the payee, the amount, the policy.
4. **[0:15.5]** PIN or Face ID signs the draft hash on this device. Receipt issued, audit trail chained.
5. **[0:21.0]** Path two, multi-intent — five hundred to Mum, and half of what's left into DBS. Two typed steps, one signature.
6. **[0:31.0]** The model wrote the formula; deterministic code computed the number.
7. **[0:36.5]** Path three — send fifty to John, but there are two payees named John. One targeted question. It never guesses.
8. **[0:46.5]** Only after the answer does the draft reach biometric signing.
9. **[0:53.0]** Path four, validator freeze — the user said two hundred; the draft shows two thousand. The independent model catches it.
10. **[1:02.5]** No retry, no override — the authorise button is removed. The freeze itself lands on the audit chain.
11. **[1:11.5]** Path five, scam shield — authority, urgency, a safe account. Refused before any draft exists.
12. **[1:26.5]** The same pipeline on Meta Ray-Ban Display — a real Wearables UI Toolkit app on the six hundred by six hundred lens.
13. **[1:33.5]** The lens stays dark until you speak — capture, transcribe, clarify, aloud or by pinch.
14. **[1:41.0]** The draft card glances — the only forward path is approve on your phone.
15. **[1:48.5]** Waiting means the phone is signing. Frozen and scam-pause stop the pipeline the same way.
16. **[2:02.2]** The smartwatch runs the same five states — compiled SwiftUI, not a mockup.
17. **[2:08.2]** A watch face never carries a Pay button. The wrist can show — never sign.
18. **[2:21.7]** On digibank web, the same transcript and draft card side by side — display only.
19. **[2:33.7]** Speaker, earbuds, car — simulated future surfaces. One pipeline, many mouths and ears; the phone approves.

## Beat reference

Context only — what is on screen at each cue. Do not read this aloud.

| Start | End | On screen |
|------:|----:|-----------|
| 0:00.0 | 0:03.0 | Title card: "The phone signs." |
| 0:03.0 | 1:26.1 | Phone film — **real Simulator window footage** in sync-captioned frame: Happy → Multi-intent → Ambiguous → Validator freeze → Scam shield |
| 1:26.1 | 1:29.1 | Title card: "Meta Ray-Ban Display" |
| 1:29.1 | 1:58.8 | Glasses film — wearer-view scene over real HUD footage — table, letter, Neural Band chip, phone approval card: ambient · listening · clarify · draft card · waiting · sent · frozen · scam pause |
| 1:58.8 | 2:01.8 | Title card: "Smartwatch" |
| 2:01.8 | 2:18.2 | Watch film — compiled SwiftUI renders in bezel: ambient · listening · draft · sent · paused |
| 2:18.2 | 2:21.2 | Title card: "digibank web + future surfaces" |
| 2:21.2 | 2:59.4 | Web app — live transcript + draft, clarify / frozen / audit, then speaker · earbuds · in-car simulation cards |
