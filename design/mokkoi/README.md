# Mokkoi-generated screen set

React Native screens generated with **[Mokkoi](https://github.com/RHINOREX123/mokkoi-mcp-server)** — an MIT-licensed, open-source MCP server (free, no API key). All 10 screens were produced through its MCP tools (`mokkoi_create_screen` → `mokkoi_export_screen`) using one shared design-token set, so the palette, spacing grid and component conventions are consistent across the set.

## Design tokens (applied to every screen)

| Token | Value | Source |
|---|---|---|
| `primary` | `#FF4724` | DBS digital red |
| `accent` | `#0077CC` | Links / secondary actions |
| `background` | `#EEF2F5` | digibank surface |
| `surface` | `#FFFFFF` | Cards |
| `text` | `#172733` | DBS navy ink |
| `textSecondary` | `#69737B` | Muted copy |
| `border` | `#DDE3E7` | Hairlines |
| `success` | `#00AB61` | Verified / sent |
| `error` | `#D62300` | Deeper DBS red / error |
| Spacing | 4 / 8 / 16 / 24 / 32 | 4-pt grid |

## Screen set

| File | digiVoice screen | Flow role |
|---|---|---|
| `HomeScreen.tsx` | 1 · Home | digibank home + voice entry |
| `ListeningScreen.tsx` | 2 · Listening | Live transcript capture |
| `ClarifyScreen.tsx` | 3 · Clarify | "Which John?" disambiguation |
| `ConfirmScreen.tsx` | 4 · Confirm | Single-intent signed card |
| `MultiIntentConfirmScreen.tsx` | 5 · Multi-intent confirm | Ordered steps, one signature |
| `FrozenScreen.tsx` | 6a · Frozen | Validator discrepancy halt |
| `ScamInterstitialScreen.tsx` | 6b · Scam interstitial | Cooling-off + hotline |
| `AuthoriseScreen.tsx` | 7 · Authorise | Biometric + OOB signing |
| `ReceiptScreen.tsx` | 8 · Receipt | Ledger-confirmed result |
| `AuditTrailScreen.tsx` | 9 · Audit trail | "Why did the agent do this?" |

## Mokkoi's built-in checks

Every generated screen is linted at generation time (touch-target ≥ 44 pt, WCAG AA contrast, spacing-grid, accessibility labels, loading/empty states). Two flags we will adopt during implementation:

- **`textSecondary` on `background` = 4.30:1** — below AA's 4.5:1. We darken secondary text to ~`#5C646B` where it sits on `#EEF2F5` (the HTML mockup already uses a darker muted tone).
- **Min touch-target warnings** — honoured as a rule: every interactive element in the real app gets ≥ 44 pt.

## Status — honest note

These are **raw generated scaffolds**: Mokkoi emits category templates, so detail/form screens ship with generic placeholder blocks (`Custom component placeholder`, stock hero sections, a generic form on Authorise). They are kept verbatim here as the consistent-token baseline and generation record; the authoritative visual design is `design/digivoice-app-mockup.html` + `design/sleek/` renders, and `docs/ux-screens.md` defines every field. During implementation (`apps/mobile/`) these files are the starting point each screen is rebuilt from — same tokens, real content.
