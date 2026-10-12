# UX & accessibility audit — digiVoice

Measured against WCAG 2.2 AA, Apple HIG, and Material Design 3 on **2026-10-12**.
Contrast ratios computed from the actual hex values in `design/digivoice-app-mockup.html`
and `design/mokkoi/*.tsx` (WCAG formula, relative luminance).

## Standards checked

| Standard | Requirement | Result |
|---|---|---|
| WCAG 2.2 — 1.4.3 Contrast (Minimum) | ≥ 4.5:1 normal text, ≥ 3:1 large text | **PASS after fixes below** |
| WCAG 2.2 — 1.4.11 Non-text contrast | ≥ 3:1 for UI components / icons | **PASS** (all interactive glyphs ≥ 3:1 or paired with text) |
| WCAG 2.2 — 1.4.1 Use of colour | No status by colour alone | **PASS** — every state carries a word label (Frozen / Paused / Sent / Verified) plus icon |
| WCAG 2.2 — 2.5.8 Target size (min) | ≥ 24×24 CSS px; we target platform norms | **PASS** — see below |
| Apple HIG | ≥ 44×44 pt hit targets | **PASS** — back/bookmark buttons bumped 40 → 44 |
| Material Design 3 | ≥ 48×48 dp touch targets | **PASS** — filter chips padded to ≥ 48 dp |
| Apple HIG / M3 | Primary text ≥ 15–17 pt | **PASS** — app UI runs 15–17 pt; `docs/ux-screens.md` specifies 17 pt+ for essentials |
| ISO 9241 / Nielsen heuristics | Visibility of status, error prevention, user control | **PASS** — transcript-before-draft, card-before-sign, edit-invalidates-signature |
| Banking UX norms | Amount-digits + words, no defaults on money | **PASS** — amounts shown as `S$200.00` *and* "two hundred dollars"; ambiguity never defaulted |

## Contrast measurements (before → after fix)

| Token / pair | Ratio before | Ratio after | Verdict |
|---|---|---|---|
| `--text` #1B1B2F on white | 16.88 | 16.88 | AAA |
| `--muted` #8A8A93 → **#6E6E78** on white | 3.42 ✗ | **5.04** | AA ✓ |
| `--muted` on page bg #F4F4F2 | 3.11 ✗ | **4.58** | AA ✓ |
| `--faint` #B9B9C2 → **#6E6E78** | 1.95 ✗ | **4.58** | AA ✓ |
| `--blue` #2E7BD6 → **#2563B8** on white | 4.27 ✗ | **5.91** | AA ✓ |
| `--warntext` #9A6A15 → **#7A5210** on warn wash | 4.29 ✗ | **6.27** | AA ✓ |
| `--err` #D62300 → **#B51E00** on error wash | 4.43 ✗ | **5.77** | AA ✓ |
| `--ok` #00A651 → `--oktext` **#0E6B34** on ok wash | 2.85 ✗ | **5.90** | AA ✓ |
| White on ok-dark (verified badge, ticks) | 3.19 ✗ | **6.62** | AA ✓ |
| `--red` #E60023 ↔ white both directions | 4.78 | 4.78 | AA ✓ |
| `--warn` #E8A13A as expiry/label text | 2.19 ✗ | → `--warntext` **4.72** | AA ✓ |
| mokkoi `#FF4724` CTA with white text | 3.40 ✗ | **#E60023 → 4.78** | AA ✓ |
| mokkoi muted `#69737B` on white | 4.84 | 4.84 | AA ✓ |

Fixes applied: 7 colour tokens darkened in the mockup palette; every
white-on-green glyph moved to the AA-passing darker green; brand red unified to
`#E60023` across all 10 mokkoi scaffolds; tap targets bumped to ≥ 44 pt / 48 dp.

## Interaction standards

| Check | Status |
|---|---|
| Tap-to-talk, never hold-to-speak (motor/tremor) | ✓ FAB is tap-start / tap-stop |
| Transcript always visible before any draft | ✓ Listening + every downstream state |
| Card shows every field before authorise | ✓ payee, account, amount, formula, balance-after, tier, fingerprint |
| Edit invalidates signature | ✓ cryptographic property, not a UI promise |
| Status in words + icon, never colour alone | ✓ Frozen / Paused / Sent / Verified all labelled |
| No precision gestures required | ✓ chips/cards ≥ 44 pt; no swipe-critical actions |
| One question at a time, plain language | ✓ Clarify screen pattern |
| Amounts in digits **and** words | ✓ "S$200.00 · two hundred dollars" |
| Read-aloud before authorise (low vision) | ✓ specified in `docs/ux-screens.md` + earbuds surface |
| EN / 中文 / BM / தமிழ் copy rules | ✓ `docs/ux-screens.md` copy rules |

## Honest caveats

- **Device mockups** (watch face, HUD, speaker, buds, web strip) are scaled
  illustrations — their tiny in-mock captions are not product UI. The
  *product* targets are 44 pt / 48 dp in the real scaffolds.
- **Colour tokens in the HUD** use additive-display-aware values and passed
  Meta's own toolkit gate; measured results in `apps/glasses-hud/TEST-EVIDENCE.md`.
- **Physical-device testing** (real tremor, real screen reader) is still ahead
  of us — the mockup + RN scaffolds are where the claims currently live.
  `quickstart.md` carries the device walkthrough once `apps/mobile/` lands.
- Brand red `#FF4724` originally failed white-text AA at 3.40:1 — we moved the
  whole system to `#E60023` rather than carry a known-failing CTA.
