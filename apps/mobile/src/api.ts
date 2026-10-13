// Typed client for the digiVoice service contract
// (specs/001-conversational-transaction-agent/contracts/service-api.md).
// Only used when LIVE mode is on — mock mode never touches the network.

export interface LiveDraft {
  id: string;
  status: string;
  hash: string;
  conversationId: string;
  steps: {
    intent: { kind: string; reference?: string };
    amountCents: number;
    payeeId?: string;
    billerId?: string;
    assetId?: string;
    sourceAccountId: string;
    formulaText: string | null;
  }[];
  unsupported: { kind: string; text: string }[];
  validation: { verdict: string; discrepancies: { field: string; transcriptSays: string; draftShows: string }[] } | null;
  policy: { tier: string; decisions: { ruleId: string; outcome: string; tier: string | null; reason: string }[]; hold?: { reason: string } } | null;
  ambiguities: { field: string; question: string; candidates: { id: string; label: string; detail: string }[] }[];
  warnings: string[];
  expiresAt: number;
  execution?: { results: { stepIndex: number; status: string; ledgerRef: string | null }[]; ledgerReadBack: { balanceCents: number } };
}

export interface AuditEntry {
  seq: number;
  ts: number;
  stage: string;
  payload: Record<string, unknown>;
  hash: string;
}

export const API_URL =
  (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) ||
  (typeof window !== 'undefined' && window.location
    ? new URLSearchParams(window.location.search).get('api') || 'http://localhost:8787'
    : 'http://localhost:8787');

async function call<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const j = await res.json();
  if (!res.ok) throw Object.assign(new Error(j.reason || `${res.status}`), { status: res.status, body: j });
  return j as T;
}

export const api = {
  health: () => call<{ ok: boolean; providers: Record<string, string> }>('GET', '/health'),
  home: () => call<{ customer: { name: string }; accounts: { id: string; label: string; mask: string; balanceCents: number }[]; recent: { ts: number; amountCents: number; payee: string; status: string }[] }>('GET', '/api/home'),
  registerKey: (publicKey: string, deviceId: string) =>
    call<{ registered: boolean }>('POST', '/api/device/keys', { publicKey, deviceId }),
  draft: (text: string) => call<{ draft?: LiveDraft; scam?: { cues: string[]; coolingOffMs: number; hotline: string } }>('POST', '/api/drafts', { text }),
  clarify: (id: string, field: string, choice: string) =>
    call<{ draft: LiveDraft }>('POST', `/api/drafts/${id}/clarify`, { field, choice }),
  authorise: (id: string, tier: string, method: string, signature: string, deviceId: string) =>
    call<{ draft: LiveDraft }>('POST', `/api/drafts/${id}/authorise`, { tier, method, signature, deviceId }),
  execute: (draftId: string) => call<{ execution: LiveDraft['execution']; draft: LiveDraft }>('POST', '/api/execute', { draftId }),
  getDraft: (id: string) => call<{ draft: LiveDraft }>('GET', `/api/drafts/${id}`),
  audit: (conversationId: string) => call<{ entries: AuditEntry[]; chainOk: boolean }>('GET', `/api/audit/${conversationId}`),
};
