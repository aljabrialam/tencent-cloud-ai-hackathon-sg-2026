# Prompt — narrate & stitch `digivoice-demo.mp4`

You are a video post-production assistant. Add a spoken voice-over to the attached screen recording and return the finished video. Everything you need is below.

## Input

- `digivoice-demo.mp4` — a silent screen recording, total **2:54.7** (no audio track). 1920×1080, 30 fps. Inspect it for exact resolution, frame rate and duration.
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
- `S$200` / `S$200.00` → "two hundred Singapore dollars"; `S$2,000` → "two thousand dollars"; `S$500` → "five hundred"
- `D05.SI` → "D-zero-five dot S-I"; `PayNow` → "pay-now"; `POSB` → "P-O-S-B"; `MAS` → "M-A-S"
- `sha256` → "S-H-A two five six"; `VAL-MISMATCH` → "val-mismatch"; `POL-TIER-01` → "policy tier zero one"
- `SwiftUI` → "swift-U-I"; `TXN-88214` → "T-X-N eight eight two one four"
- `600×600` → "six hundred by six hundred"; `Face ID` → as written

## Do not

- Do not paraphrase, shorten, reorder or merge the lines — read each verbatim.
- Do not add narration to moments that have no line; let the visuals breathe.
- Do not alter, cover or comment on the on-screen text.
- Do not imply the smart speaker, earbuds or in-car surfaces are shipped native apps — they are simulated future surfaces inside the web app.

## Narration

21 lines. Format: `[start cue] line`.

1. **[0:00.0]** One banking agent across every surface — but only one surface can sign.
2. **[0:03.5]** The phone: a native React Native build, running live on an iPhone simulator. It walks all five demo paths by itself.
3. **[0:09.5]** Path one, the happy path — send two hundred to Mum. The model only drafts; code resolves the payee, the amount, the policy.
4. **[0:15.5]** PIN signs the draft hash. Receipt issued, and the hash-chained audit trail records every step.
5. **[0:20.5]** Path two, multi-intent — five hundred to Mum, and half of what's left into DBS. Two typed steps, one signature.
6. **[0:30.0]** The model wrote the formula; deterministic code computed the number. Confirm, sign, receipt, audit.
7. **[0:38.0]** Path three, ambiguity — send fifty to John, but there are two payees named John. One targeted question. It never guesses.
8. **[0:48.0]** Only after the answer does the draft reach biometric signing.
9. **[0:55.5]** Path four, validator freeze — the user said two hundred; the draft shows two thousand. The independent model catches it. Nothing was sent.
10. **[1:03.5]** No retry, no override — the authorise button is removed. The freeze itself lands on the audit chain.
11. **[1:10.0]** Path five, scam shield — the request matches a fraud script: authority, urgency, a safe account. Refused before any draft exists.
12. **[1:19.0]** Refused, explained, audited. Five paths, one guarantee.
13. **[1:27.0]** The same pipeline on Meta Ray-Ban Display — a real Wearables UI Toolkit app on the six hundred by six hundred lens.
14. **[1:35.0]** The lens stays dark until you speak. Capture states listen, transcribe and clarify — aloud or by pinch.
15. **[1:46.0]** The draft card glances: amount, payee, verified. The only forward path is approve on your phone.
16. **[1:57.0]** Waiting means the phone is signing. Frozen and scam-pause stop the pipeline the same way — nothing here can sign.
17. **[2:11.0]** The smartwatch shows the same five states — compiled SwiftUI code, not a mockup.
18. **[2:18.0]** A watch face never carries a Pay button. The wrist can show — never sign.
19. **[2:30.5]** On digibank web, the same transcript and draft card side by side — display and capture only, it cannot sign either.
20. **[2:41.0]** And the future surfaces: a speaker pings the phone instead of trusting voice; earbuds read drafts aloud; the car goes audio-only while moving.
21. **[2:50.0]** One signed-draft pipeline. Many mouths and ears. The phone approves.

## Beat reference

Context only — what is on screen at each cue. Do not read this aloud.

| Start | End | On screen |
|------:|----:|-----------|
| 0:00.0 | 0:03.0 | Title card: "The phone signs." |
| 0:03.0 | 0:20.3 | Phone — Happy path: home → listening → confirm → PIN → receipt → audit |
| 0:20.3 | 0:37.5 | Phone — Multi-intent: two-step confirm (transfer + DBS shares), one signature |
| 0:37.5 | 0:54.8 | Phone — Ambiguous payee: "Which John?" clarify card → sign → receipt |
| 0:54.8 | 1:09.2 | Phone — Validator freeze: said 200 vs draft 2,000, authorise removed, audit |
| 1:09.2 | 1:23.4 | Phone — Scam shield: 4 matched cues, hotline CTA, cooling-off, audit |
| 1:23.4 | 1:26.4 | Title card: "Meta Ray-Ban Display" |
| 1:26.4 | 2:07.7 | Glasses HUD: Capture → Listening → Clarify → Review → Draft card → Waiting → Sent → Stopped → Frozen → Scam pause |
| 2:07.7 | 2:10.7 | Title card: "Smartwatch" |
| 2:10.7 | 2:27.1 | Watch film: compiled SwiftUI renders in a bezel — Ambient → Listening → Draft → Sent → Paused |
| 2:27.1 | 2:30.1 | Title card: "digibank web + future surfaces" |
| 2:30.1 | 2:54.7 | Web app: transcript + draft, clarify / frozen / audit, then speaker · earbuds · in-car simulation cards |
