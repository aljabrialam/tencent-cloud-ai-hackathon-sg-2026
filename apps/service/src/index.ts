// digiVoice agent service + mock bank — plain node:http, zero framework deps.
// Routes follow specs/001-conversational-transaction-agent/contracts/service-api.md
import { createServer } from 'node:http';
import { z } from 'zod';
import { shield } from '@digivoice/shared/shield';
import { verify } from '@digivoice/shared/audit';
import { append } from '@digivoice/shared/audit';
import { mockVerify, fingerprint } from '@digivoice/shared/signing';
import {
  authoriseBody, clarifyBody, deviceKeyBody, draftsBody, executeBody, transcribeBody, ttsBody,
} from '@digivoice/shared/schema';
import { get, save, reseed, type Transcript } from './store';
import { makeDraft } from './llm/draft';
import { validate } from './llm/validate';
import { gate } from './bank/gateway';
import { drafter, validator } from './llm/provider';
import { draftHash } from '@digivoice/shared/signing';
import { T } from '@digivoice/shared/policy/thresholds';

const PORT = +(process.env.PORT || 8787);
let seq = 0;
const id = (p: string) => `${p}_${Date.now().toString(36)}${(seq++).toString(36)}`;

type Handler = (req: Req) => Promise<{ status: number; body: unknown }>;
interface Req { body: unknown; params: Record<string, string>; demo: boolean }

const json = (status: number, body: unknown) => ({ status, body });
const routes: [string, RegExp, Handler][] = [];
const route = (method: string, path: string, h: Handler) =>
  routes.push([method, new RegExp(`^${path.replace(/\{(\w+)\}/g, '(?<$1>[^/]+)')}$`), h]);

// ---------- contract routes ----------
route('GET', '/health', async () => json(200, {
  ok: true,
  providers: { drafter: drafter().name, validator: validator().name, asr: 'mock', tts: 'mock' },
  seeded: true,
}));

route('GET', '/api/home', async () => {
  const st = get();
  const recent = [...st.history].sort((a, b) => b.ts - a.ts).slice(0, 6).map(h => ({
    ts: h.ts, amountCents: h.amountCents, kind: h.kind,
    payee: st.payees.find(p => p.id === h.payeeId)?.name ?? st.billers.find(b => b.id === h.payeeId)?.name ?? st.assets.find(a => a.symbol === h.payeeId)?.name ?? h.payeeId,
    status: 'executed',
  }));
  return json(200, { customer: st.customer, accounts: st.accounts, recent });
});

route('POST', '/api/device/keys', async ({ body }) => {
  const b = deviceKeyBody.parse(body);
  const st = get();
  if (!st.deviceKeys.some(k => k.deviceId === b.deviceId)) st.deviceKeys.push(b);
  save();
  return json(200, { registered: true });
});

route('POST', '/api/transcribe', async ({ body }) => {
  const b = transcribeBody.parse(body);
  const st = get();
  const sh = shield(b.text);
  const t: Transcript = { id: id('trn'), text: sh.clean, raw: b.text, lang: 'en', ts: Date.now(), warnings: sh.flags.map(f => f.id) };
  st.transcripts.push(t);
  append(st.audit, 'input', { transcriptId: t.id, len: b.text.length });
  append(st.audit, 'shield', { transcriptId: t.id, flags: sh.flags.map(f => f.id), scamCues: sh.scamCueCount, injection: sh.injection });
  save();
  return json(200, {
    transcriptId: t.id, text: sh.clean, lang: 'en',
    warnings: [...new Set(sh.flags.map(f => f.id))],
    scamCues: sh.scamCueCount,
    injection: sh.injection,
  });
});

route('POST', '/api/drafts', async ({ body }) => {
  const b = draftsBody.parse(body);
  const st = get();
  let transcript = b.transcriptId ? st.transcripts.find(t => t.id === b.transcriptId) : undefined;
  if (!transcript) {
    // text path — run shield here so drafts API is self-contained
    const sh = shield(b.text!);
    transcript = { id: id('trn'), text: sh.clean, raw: b.text!, lang: 'en', ts: Date.now(), warnings: sh.flags.map(f => f.id) };
    st.transcripts.push(transcript);
    append(st.audit, 'input', { transcriptId: transcript.id });
    append(st.audit, 'shield', { transcriptId: transcript.id, flags: sh.flags.map(f => f.id), scamCues: sh.scamCueCount });
    // ≥2 scam cues → interstitial, no draft is made (FR-009)
    if (sh.scamCueCount >= 2) {
      append(st.audit, 'shield', { transcriptId: transcript.id, interstitial: true });
      save();
      return json(200, { scam: { cues: sh.flags.filter(f => f.kind === 'scam').map(f => f.id), coolingOffMs: 30_000, hotline: '1800 339 6963' }, transcriptId: transcript.id });
    }
  }
  const draft = await makeDraft(transcript.id, transcript.text, transcript.raw, [...new Set(transcript.warnings)]);
  if (draft.status !== 'awaiting_clarification') await validate(draft, transcript.raw);
  save();
  return json(200, { draft });
});

route('POST', '/api/drafts/{id}/clarify', async ({ body, params }) => {
  const b = clarifyBody.parse(body);
  const st = get();
  const draft = st.drafts.find(d => d.id === params.id);
  if (!draft) return json(404, { reason: 'unknown draft' });
  const amb = draft.ambiguities.find(a => a.field === b.field);
  if (!amb) return json(422, { reason: `no pending clarification for ${b.field ?? 'field'}` });
  const chosen = amb.candidates.find(c => c.id === b.choice)
    ?? (b.text ? amb.candidates.find(c => c.label.toLowerCase().includes(b.text!.toLowerCase())) : undefined);
  if (!chosen && amb.candidates.length) return json(422, { reason: 'choice does not match a candidate' });

  append(st.audit, 'clarify', { draftId: draft.id, field: b.field, choice: chosen?.id ?? b.text });
  // apply the answer, re-resolve that field only
  if (b.field === 'payee' && chosen) for (const s of draft.steps) if (s.intent.kind === 'transfer' && !s.payeeId) s.payeeId = chosen.id;
  if (b.field === 'asset' && chosen) for (const s of draft.steps) if (s.intent.kind === 'buy_equity' && !s.assetId) s.assetId = chosen.id;
  if (b.field === 'biller' && chosen) for (const s of draft.steps) if (!s.billerId) s.billerId = chosen.id;
  if (b.field === 'amount' && b.text) {
    const cents = Math.round(parseFloat(b.text.replace(/[^\d.]/g, '')) * 100);
    for (const s of draft.steps) if (!s.amountCents) s.amountCents = cents;
  }
  draft.ambiguities = draft.ambiguities.filter(a => a.field !== b.field);
  draft.version++;
  draft.hash = draftHash(draft.steps);
  draft.expiresAt = Date.now() + T.EXPIRE_MS;

  if (draft.ambiguities.length === 0) {
    draft.status = 'validating';
    save();
    const t = st.transcripts.find(x => x.id === draft.transcriptId);
    const { evaluate } = await import('@digivoice/shared/policy/engine');
    draft.policy = evaluate(draft.steps, {
      customer: st.customer, accounts: st.accounts,
      payees: new Map(st.payees.map(p => [p.id, p])),
      billers: new Map(st.billers.map(x => [x.id, x])),
      assets: new Map(st.assets.map(a => [a.symbol, a])),
      history: st.history, recentTransferTs: st.recentTransferTs,
      dailyOutCents: st.history.filter(h => h.ts > Date.now() - 86_400_000).reduce((s, h) => s + h.amountCents, 0),
      now: Date.now(),
    });
    await validate(draft, t?.raw ?? '');
  }
  save();
  return json(200, { draft });
});

route('POST', '/api/drafts/{id}/authorise', async ({ body, params }) => {
  const b = authoriseBody.parse(body);
  const st = get();
  const draft = st.drafts.find(d => d.id === params.id);
  if (!draft) return json(404, { reason: 'unknown draft' });
  if (draft.status === 'frozen' || draft.status === 'cancelled') return json(409, { reason: `draft is ${draft.status}` });
  if (Date.now() > draft.expiresAt) { draft.status = 'expired'; append(st.audit, 'expire', { draftId: draft.id }); save(); return json(410, { reason: 'draft expired' }); }
  if (draft.policy?.hold) return json(423, draft.policy.hold);
  if (draft.status !== 'ready' && draft.status !== 'authorised') return json(409, { reason: `draft is ${draft.status}` });

  const key = st.deviceKeys.find(k => k.deviceId === b.deviceId);
  if (!key) return json(403, { reason: 'unregistered device' });
  const required = draft.policy?.tier ?? 'pin';
  const RANK = { pin: 0, biometric: 1, biometric_oob: 2 };
  if (RANK[b.tier] < RANK[required]) return json(403, { reason: `requires ${required}` });
  if (!mockVerify(key.publicKey, draft.hash, b.signature)) {
    append(st.audit, 'authorise', { draftId: draft.id, rejected: 'signature mismatch' });
    save();
    return json(403, { reason: 'signature does not match draft — has it changed?' });
  }
  draft.signature = { alg: 'ed25519-mock', deviceId: b.deviceId, value: b.signature };
  draft.status = 'authorised';
  append(st.audit, 'authorise', { draftId: draft.id, tier: b.tier, method: b.method, fingerprint: fingerprint(draft.hash), deviceId: b.deviceId });
  save();
  return json(200, { draft });
});

route('POST', '/api/execute', async ({ body, req }: any) => {
  const b = executeBody.parse(body);
  const r = gate(b.draftId);
  if (!r.ok) return json(r.status, { reason: r.reason });
  const st = get();
  return json(200, { execution: r.execution, draft: st.drafts.find(d => d.id === b.draftId) });
});

route('GET', '/api/drafts/{id}', async ({ params }) => {
  const draft = get().drafts.find(d => d.id === params.id);
  if (!draft) return json(404, { reason: 'unknown draft' });
  if (draft.status === 'ready' && Date.now() > draft.expiresAt) {
    draft.status = 'expired';
    append(get().audit, 'expire', { draftId: draft.id });
    save();
  }
  return json(200, { draft });
});

route('GET', '/api/drafts/pending', async () => {
  const st = get();
  const pending = st.drafts.filter(d => d.status === 'ready' && Date.now() <= d.expiresAt).at(-1);
  return json(200, { draft: pending ?? null });
});

route('POST', '/api/drafts/{id}/cancel', async ({ params }) => {
  const st = get();
  const draft = st.drafts.find(d => d.id === params.id);
  if (!draft) return json(404, { reason: 'unknown draft' });
  if (['executed', 'failed', 'expired'].includes(draft.status)) return json(409, { reason: `cannot cancel ${draft.status} draft` });
  draft.status = 'cancelled';
  append(st.audit, 'cancel', { draftId: draft.id });
  save();
  return json(200, { draft });
});

route('POST', '/api/tts', async ({ body }) => {
  const b = ttsBody.parse(body);
  return json(200, { audioRef: `tts://${b.lang}/${Buffer.from(b.text.slice(0, 40)).toString('base64')}`, provider: 'mock' });
});

route('GET', '/api/audit/{conversationId}', async ({ params }) => {
  const st = get();
  const conv = params.conversationId;
  const entries = st.audit.filter(e =>
    String(e.payload.conversationId ?? '') === conv ||
    String(e.payload.transcriptId ?? '').includes(conv.replace('conv_', 'trn_')) ||
    String(e.payload.draftId ?? '') !== '' && st.drafts.find(d => d.id === e.payload.draftId)?.conversationId === conv
  );
  return json(200, { entries, chainOk: verify(st.audit) });
});

// ---------- demo hooks (X-Demo: 1) ----------
route('POST', '/api/demo/corrupt-draft', async ({ body, demo }) => {
  if (!demo) return json(404, { reason: 'not found' });
  const st = get();
  const draft = st.drafts.at(-1);
  if (!draft || draft.status !== 'ready') return json(409, { reason: 'no ready draft' });
  draft.steps[0].amountCents += 100_000; // post-validation tamper
  // note: hash intentionally NOT recomputed — gateway will reject; and validator
  // already recorded 'ok', so a poll shows frozen only if we re-validate.
  draft.validation = { verdict: 'discrepancy', discrepancies: [{ field: 'amount', transcriptSays: 'see transcript', draftShows: 'corrupted' }] };
  draft.status = 'frozen';
  append(st.audit, 'validate', { draftId: draft.id, verdict: 'discrepancy', note: 'demo: corrupted post-validation' });
  save();
  return json(200, { draft });
});

route('POST', '/api/demo/validator-timeout', async ({ demo }) => {
  if (!demo) return json(404, { reason: 'not found' });
  get().demoFlags.validatorTimeout = true;
  save();
  return json(200, { armed: true });
});

route('POST', '/api/demo/reset-velocity', async ({ demo }) => {
  if (!demo) return json(404, { reason: 'not found' });
  get().recentTransferTs = [];
  save();
  return json(200, { cleared: true });
});

route('POST', '/api/demo/seed', async ({ demo }) => {
  if (!demo) return json(404, { reason: 'not found' });
  reseed();
  return json(200, { seeded: true });
});

// ---------- server ----------
createServer(async (req, res) => {
  res.setHeader('access-control-allow-origin', '*');
  res.setHeader('access-control-allow-headers', 'content-type, x-demo');
  res.setHeader('access-control-allow-methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  const url = new URL(req.url ?? '/', 'http://x');
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  let body: unknown = {};
  const raw = Buffer.concat(chunks).toString('utf8');
  if (raw) { try { body = JSON.parse(raw); } catch { res.writeHead(400, { 'content-type': 'application/json' }); res.end(JSON.stringify({ reason: 'invalid JSON' })); return; } }

  for (const [method, re, handler] of routes) {
    if (method !== req.method) continue;
    const m = url.pathname.match(re);
    if (!m) continue;
    try {
      const { status, body: out } = await handler({
        body, params: (m.groups ?? {}) as Record<string, string>,
        demo: req.headers['x-demo'] === '1',
      } as Req & { req: unknown });
      res.writeHead(status, { 'content-type': 'application/json' });
      res.end(JSON.stringify(out));
    } catch (e) {
      const ze = e instanceof z.ZodError ? 400 : 500;
      res.writeHead(ze, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ reason: e instanceof z.ZodError ? 'schema-invalid request' : String(e).slice(0, 300), issues: e instanceof z.ZodError ? e.issues : undefined }));
    }
    return;
  }
  res.writeHead(404, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ reason: 'not found' }));
}).listen(PORT, () => console.log(`digiVoice service on http://localhost:${PORT} — drafter=${drafter().name} validator=${validator().name} state=${process.env.STATE_FILE || '/tmp/digivoice-state.json'}`));
