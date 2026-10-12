# Contract: digiVoice service API

Base: `API_URL` — `http://localhost:8787` locally, or `PUBLIC_URL` (HTTPS) when demoing over a
tunnel. JSON in/out. **Money = integer cents.** Every mutating call is audited; the gateway
endpoint is the only write path to the ledger and it is signature-gated.

| Method | Path | Request | Response | FRs |
|---|---|---|---|---|
| GET | `/health` | — | `{ok, providers:{drafter,validator,asr,tts}, seeded:bool}` | — |
| POST | `/api/device/keys` | `{publicKey, deviceId}` | `{registered:true}` | FR-006 |
| POST | `/api/transcribe` | multipart WAV (16 kHz mono) *or* `{text}` | `{transcriptId, text, lang}` — raw text is shielded before return; `warnings[]` may carry `SHD-*` ids | FR-001, FR-009 |
| POST | `/api/drafts` | `{transcriptId}` or `{text}` | `{draft}` — status `awaiting_clarification` (with `ambiguities[]`), `frozen`, or `ready` incl. `validation`, `policy`, `hash`, `expiresAt` | FR-002..005, 008, 010 |
| POST | `/api/drafts/{id}/clarify` | `{field, choice}` (chip id) or `{text}` | `{draft}` — answer merged, re-resolved; may still be `awaiting_clarification` | FR-004 |
| POST | `/api/drafts/{id}/authorise` | `{tier, method, signature, deviceId}` — signature over `sha256(canonical(draft))` | `{draft}` status `authorised`; `403 {reason}` on tier/hash/device mismatch | FR-006 |
| POST | `/api/execute` | `{draftId}` | `{execution: ExecutionResult}` — **gateway**: verifies sig against stored draft, checks tier/nonce/idempotency, executes steps in order, returns ledger read-back. `403 unsigned/tampered/expired`; `409 frozen`; `423 hold` | FR-007, 013, 014, 019 |
| GET | `/api/drafts/{id}` | — | `{draft}` incl. latest `execution` | FR-019 |
| POST | `/api/drafts/{id}/cancel` | — | `{draft}` status `cancelled`; audited | edge |
| POST | `/api/tts` | `{text, lang}` | `{audioRef}` — card read-aloud | FR-016/021 |
| GET | `/api/audit/{conversationId}` | — | `{entries: AuditEntry[], chainOk: bool}` — `chainOk` recomputed server-side | FR-011 |
| GET | `/api/home` | — | `{customer, accounts[], recent[]}` — recent items carry status pills | — |

## Error contract

| Code | When |
|---|---|
| `400` | schema-invalid request body (zod) |
| `403` | unsigned, tampered (hash ≠ stored draft), wrong tier, device unknown, KYC blocked |
| `404` | unknown draft/conversation |
| `409` | draft `frozen` or `cancelled` |
| `410` | draft `expired` (card was shown > 60 s) |
| `422` | clarification for a field that isn't ambiguous |
| `423` | policy hold — body carries `{reason, resetAt}` |
| `502` | upstream (LLM/ASR/TTS) failure — surfaced verbatim, audited, draft goes `frozen` or clarify |

## Demo hooks (dev only — `X-Demo: 1` header, not present in prod build)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/demo/corrupt-draft` | mutate stored draft post-validation → next poll shows `frozen` (US4) |
| POST | `/api/demo/validator-timeout` | make next validator call hang past 5 s → `unavailable` → `frozen` |
| POST | `/api/demo/reset-velocity` | clear the 10-min transfer window (`POL-VEL-01`) |
| POST | `/api/demo/seed` | rewrite `STATE_FILE` to the seeded matrix |

## Wire example — `POST /api/drafts` (ready)

```json
{
  "draft": {
    "id": "drf_7k2", "version": 1, "status": "ready",
    "steps": [
      {"intent":{"kind":"transfer"}, "amountCents":20000, "payeeId":"payee_mum",
       "sourceAccountId":"acc_multiplier", "reference":"groceries", "formulaText":null}
    ],
    "validation": {"verdict":"ok","discrepancies":[]},
    "policy": {"tier":"pin","decisions":[{"ruleId":"POL-TIER-01","outcome":"allow","tier":"pin"}]},
    "hash": "9f2c…e41a", "expiresAt": 1760000000000
  }
}
```

## Glasses HUD client

`apps/glasses-hud` consumes the same contract read-only: `GET /api/drafts/{id}` for card
display, plus a `GET /api/drafts/pending` poll for "a draft arrived, pinch to see it". It can
**never** call `/authorise` or `/execute` with effect — the signature lives on the phone.
