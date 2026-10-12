# Prompt — narrate & stitch `digivoice-demo.mp4`

You are a video post-production assistant. Add a spoken voice-over to the attached screen recording and return the finished video. Everything you need is below.

## Input

- `digivoice-demo.mp4` — a silent screen recording, total **1:50.6** (no audio track). 1920×1080, 30 fps. Inspect it for exact resolution, frame rate and duration.
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
- `S$200` / `S$200.00` → "two hundred Singapore dollars"; `S$2,000` → "two thousand dollars"; `S$50` → "fifty dollars"
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
2. **[0:03.5]** The phone, native React Native. Every request starts at the mic — speak or type.
3. **[0:06.5]** The transcript streams live. The model only hears — it never acts.
4. **[0:09.5]** It emits a typed draft: amount, payee, policy tier, hash — verified against the words.
5. **[0:12.5]** Face ID signs the draft hash on this device — nowhere else.
6. **[0:15.5]** The receipt reads the ledger back — never assumed.
7. **[0:18.5]** And every step lands on a hash-chained audit trail.
8. **[0:21.5]** Multi-intent: five hundred to Mum, and half of what's left into DBS — two steps, one signature.
9. **[0:24.5]** Ambiguity gets a question, not a guess — two payees named John.
10. **[0:27.5]** The validator freeze: you said two hundred, the draft showed two thousand. Nothing sent.
11. **[0:30.5]** And the scam shield refuses before a draft even exists.
12. **[0:37.8]** The same pipeline on Meta Ray-Ban Display — a real Wearables UI Toolkit app.
13. **[0:44.0]** The lens stays dark until you speak. Capture, transcribe, clarify — aloud or by pinch.
14. **[0:49.0]** The draft card glances — the only forward path is approve on your phone.
15. **[0:54.5]** Sent confirms, then clears. Frozen and scam-pause stop the pipeline the same way.
16. **[1:10.0]** The smartwatch runs the same five states — compiled SwiftUI, not a mockup.
17. **[1:16.0]** A watch face never carries a Pay button. The wrist can show — never sign.
18. **[1:29.5]** On digibank web, the same transcript and draft side by side — display only.
19. **[1:41.0]** Speaker, earbuds, car — simulated future surfaces. One pipeline, many mouths and ears; the phone approves.

## Beat reference

Context only — what is on screen at each cue. Do not read this aloud.

| Start | End | On screen |
|------:|----:|-----------|
| 0:00.0 | 0:03.0 | Title card: "The phone signs." |
| 0:03.0 | 0:37.5 | Phone film — iPhone bezel, real native renders: home · listening · confirm · authorise · receipt · audit · multi-intent · clarify · frozen · scam |
| 0:37.5 | 0:40.5 | Title card: "Meta Ray-Ban Display" |
| 0:40.5 | 1:06.7 | Glasses film — lens bezel, real 600×600 HUD renders: ambient · listening · clarify · draft card · waiting · sent · frozen · scam pause |
| 1:06.7 | 1:09.7 | Title card: "Smartwatch" |
| 1:09.7 | 1:26.1 | Watch film — compiled SwiftUI renders in bezel: ambient · listening · draft · sent · paused |
| 1:26.1 | 1:29.1 | Title card: "digibank web + future surfaces" |
| 1:29.1 | 1:50.6 | Web app — live transcript + draft, clarify / frozen / audit, then speaker · earbuds · in-car simulation cards |
