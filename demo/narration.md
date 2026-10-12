# Prompt — narrate & stitch `digivoice-demo.mp4`

You are a video post-production assistant. Add a spoken voice-over to the attached screen recording and return the finished video. Everything you need is below.

## Input

- `digivoice-demo.mp4` — a silent screen recording, total **2:38.6** (no audio track). 1920×1080, 30 fps. Inspect it for exact resolution, frame rate and duration.
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
- `S$200` / `S$200.00` → "two hundred Singapore dollars"; `S$2,000` → "two thousand dollars"
- `sha256` → "S-H-A two five six"; `sha256(draft)` → "the draft hash"
- `Face ID` → as written; `PayNow` → "pay-now"; `POSB` → "P-O-S-B"; `MAS` → "M-A-S"
- `SwiftUI` → "swift-U-I"; `VAL-MISMATCH` → "val-mismatch"; `TXN-88214` → "T-X-N eight eight two one four"
- `600×600` → "six hundred by six hundred"

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
4. **[0:15.5]** Face ID signs the draft hash. Receipt issued, and the hash-chained audit trail records every step.
5. **[0:19.5]** Path two, multi-intent — pay the phone bill and send Mum two hundred in one sentence. Two typed steps, one signature.
6. **[0:27.5]** Same deterministic path: confirm, sign, receipt, audit.
7. **[0:33.0]** Path three, ambiguity — send John fifty dollars, but there are two payees named John. One targeted question. It never guesses.
8. **[0:42.0]** Only after the answer does the draft reach biometric signing.
9. **[0:49.5]** Path four, validator freeze — the independent validation model disagrees with the draft. Execution stops cold.
10. **[0:56.5]** No retry, no override, no approve button. The freeze itself lands on the audit chain.
11. **[0:61.5]** Path five, scam shield — the request matches a known fraud script, so the agent refuses before any draft exists.
12. **[0:66.0]** Refused, explained, audited. Five paths, one guarantee.
13. **[0:70.5]** The same pipeline on Meta Ray-Ban Display — a real Wearables UI Toolkit app on the six hundred by six hundred lens.
14. **[0:78.0]** The lens stays dark until you speak. Capture states listen, transcribe and clarify — aloud or by pinch.
15. **[0:88.0]** The draft card glances: amount, payee, verified. The only forward path is approve on your phone.
16. **[1:37.0]** Waiting means the phone is signing. Frozen and scam-pause stop the pipeline the same way — nothing here can sign.
17. **[1:54.5]** The smartwatch shows the same five states — compiled SwiftUI code, not a mockup.
18. **[2:00.5]** A watch face never carries a Pay button. The wrist can show — never sign.
19. **[2:14.0]** On digibank web, the same transcript and draft card side by side — display and capture only, it cannot sign either.
20. **[2:25.0]** And the future surfaces: a speaker pings the phone instead of trusting voice; earbuds read drafts aloud; the car goes audio-only while moving.
21. **[2:34.0]** One signed-draft pipeline. Many mouths and ears. The phone approves.

## Beat reference

Context only — what is on screen at each cue. Do not read this aloud.

| Start | End | On screen |
|------:|----:|-----------|
| 0:00.0 | 0:03.0 | Title card: "The phone signs." |
| 0:03.0 | 0:17.4 | Phone — Happy path: home → listening → confirm → Face ID → receipt → audit |
| 0:17.4 | 0:31.8 | Phone — Multi-intent: same pipeline with a two-step confirm |
| 0:31.8 | 0:48.6 | Phone — Ambiguous payee: "Send John fifty dollars" → clarify card → sign |
| 0:48.6 | 0:60.6 | Phone — Validator freeze: draft struck through, VAL-MISMATCH, frozen, audit |
| 0:60.6 | 0:67.1 | Phone — Scam shield: refusal card with matched cues, audit |
| 0:67.1 | 0:70.1 | Title card: "Meta Ray-Ban Display" |
| 0:70.1 | 1:51.4 | Glasses HUD: Capture → Listening → Clarify → Review → Draft card → Waiting → Sent → Stopped → Frozen → Scam pause |
| 1:51.4 | 1:54.4 | Title card: "Smartwatch" |
| 1:54.4 | 2:10.9 | Watch film: compiled SwiftUI renders in a bezel — Ambient → Listening → Draft → Sent → Paused |
| 2:10.9 | 2:13.9 | Title card: "digibank web + future surfaces" |
| 2:13.9 | 2:38.6 | Web app: transcript + draft, clarify / frozen / audit, then speaker · earbuds · in-car simulation cards |
