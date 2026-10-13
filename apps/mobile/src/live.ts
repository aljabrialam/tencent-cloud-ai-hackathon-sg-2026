// Live mode — drives the real service (apps/service) through the same screens.
// Mock mode is untouched: flip on with ?live=1 (web) or EXPO_PUBLIC_LIVE=1.
// Falls back to mock data if the service is unreachable (Principle VII honesty:
// the badge always says which mode you're seeing).
import { useEffect, useRef, useState } from 'react';
import { api, type LiveDraft, type AuditEntry, API_URL } from './api';
import { captureMic } from './audio';
import { mockSign } from './signing';
import { DRAFT, type AuditEv, type Stage } from './mock';

export const DEVICE_ID = 'demo-phone';
const DEVICE_KEY = 'devkey_demo_phone';

const PAYEE_NAMES: Record<string, { name: string; mask: string }> = {
  payee_mum: { name: 'Mum', mask: '4521' },
  payee_john_tan: { name: 'John Tan', mask: '4521' },
  payee_john_lim: { name: 'John Lim', mask: '8892' },
  payee_daughter: { name: 'Daughter', mask: '2210' },
  payee_new_landlord: { name: 'New Landlord', mask: '0001' },
};
const ACCOUNT_LABELS: Record<string, string> = {
  acc_savings: 'Savings ····3000',
  acc_multiplier: 'Multiplier ····1188',
  acc_invest: 'Invest ····5520',
};
const TIER_LABEL: Record<string, { tier: string; method: string }> = {
  pin: { tier: 'Requires PIN', method: 'PIN' },
  biometric: { tier: 'Requires Face ID', method: 'Face ID' },
  biometric_oob: { tier: 'Requires Face ID + SMS', method: 'Face ID' },
};

const WORDS = (cents: number) => {
  const d = cents / 100;
  return d === Math.round(d) ? `${d.toLocaleString()} dollars` : `${d.toFixed(2)} dollars`;
};

const STAGE_VERB: Record<string, string> = {
  input: 'Heard', shield: 'Shield', draft: 'Drafted', clarify: 'Clarified',
  resolve: 'Resolved', validate: 'Verified', policy: 'Policy', card: 'Card shown',
  authorise: 'Signed', gateway: 'Gateway', execute: 'Executed', expire: 'Expired', cancel: 'Cancelled',
};

export interface LiveState {
  ok: boolean | null;        // null = checking, false = service unreachable → mock
  draft: LiveDraft | null;
  cardDraft: typeof DRAFT;   // mapped to the screens' shape
  audit: AuditEv[] | null;
  scamCues: string[];
  clarify: { question: string; candidates: { id: string; label: string; detail: string }[] } | null;
  frozenCmp: { said: string; shows: string } | null;
  balanceReadBack: number | null;
}

const initial: LiveState = {
  ok: null, draft: null, cardDraft: DRAFT, audit: null,
  scamCues: [], clarify: null, frozenCmp: null, balanceReadBack: null,
};

/** Map a service draft onto the DRAFT shape the screens render. */
export function toCardDraft(d: LiveDraft, balanceAfter?: number): typeof DRAFT {
  const s = d.steps[0];
  const p = s?.payeeId ? PAYEE_NAMES[s.payeeId] : undefined;
  const tier = TIER_LABEL[d.policy?.tier ?? 'pin'] ?? TIER_LABEL.pin;
  const rule = d.policy?.decisions.find(x => x.outcome !== 'allow')?.ruleId
    ?? d.policy?.decisions[0]?.ruleId ?? '';
  return {
    ...DRAFT,
    id: d.hash ? `${d.hash.slice(0, 4)}·${d.hash.slice(4, 8)}·${d.hash.slice(-8, -4)}·${d.hash.slice(-4)}` : DRAFT.id,
    to: p?.name ?? d.steps[0]?.assetId ?? d.steps[0]?.billerId ?? '—',
    toLast4: p?.mask ?? '',
    toDetail: p ? `PayNow ····${p.mask}` : '',
    from: ACCOUNT_LABELS[s?.sourceAccountId ?? ''] ?? 'Savings',
    amountCents: s?.amountCents ?? 0,
    amountWords: WORDS(s?.amountCents ?? 0),
    balanceAfter: balanceAfter ?? DRAFT.balanceAfter,
    tier: tier.tier,
    method: tier.method,
    rule: rule ? `Rule ${rule}` : '',
    ref: s?.intent.reference ?? 'transfer',
    expiresIn: Math.max(0, Math.round((d.expiresAt - Date.now()) / 1000)),
  };
}

function toAuditEv(entries: AuditEntry[]): AuditEv[] {
  return entries.map(e => ({
    v: STAGE_VERB[e.stage] ?? e.stage,
    tm: new Date(e.ts).toTimeString().slice(3, 8),
    d: auditDetail(e),
    t: e.stage === 'execute' || e.stage === 'gateway' || e.stage === 'authorise' ? 'ok'
      : /frozen|discrep|reject|refus|tamper/i.test(JSON.stringify(e.payload)) ? 'rd'
      : /ambig|clarif|flag|cue/i.test(JSON.stringify(e.payload)) ? 'wr' : undefined,
  }));
}

function auditDetail(e: AuditEntry): string {
  const p = e.payload as Record<string, unknown>;
  switch (e.stage) {
    case 'input': return `transcript ${p.transcriptId ?? ''}`;
    case 'shield': return `${(p.flags as string[] ?? []).join(', ') || 'clean'}${p.interstitial ? ' → interstitial' : ''}`;
    case 'draft': return `provider ${p.provider ?? ''}`;
    case 'resolve': return `${p.steps ?? 0} steps · ambiguities: ${(p.ambiguities as string[] ?? []).join(',') || 'none'}`;
    case 'validate': return `verdict ${p.verdict ?? ''} · ${p.provider ?? ''}`;
    case 'policy': return `${(p.rules as string[] ?? []).join(', ')}`;
    case 'authorise': return `${p.tier ?? ''} · fp ${p.fingerprint ?? ''}`;
    case 'gateway': return p.accepted ? 'signature verified' : `rejected: ${p.rejected ?? ''}`;
    case 'execute': return 'ledger updated · balance read back';
    default: return JSON.stringify(p).slice(0, 60);
  }
}

/**
 * Live pipeline runner. Called once per stage change in App.tsx when LIVE=on.
 * Returns the live state; `advance(stage)` performs that stage's real call.
 */
export function useLive(enabled: boolean) {
  const [st, setSt] = useState<LiveState>(initial);
  const ref = useRef<{ draft?: LiveDraft; conv?: string; homeBal?: number; ran: Set<Stage> }>({ ran: new Set() });

  // reachability check on mount
  useEffect(() => {
    if (!enabled) return;
    api.health()
      .then(() => setSt(s => ({ ...s, ok: true })))
      .catch(() => setSt(s => ({ ...s, ok: false })));
  }, [enabled]);

  const reset = () => { ref.current = { ran: new Set() }; setSt(s => ({ ...initial, ok: s.ok })); };

  /** Fire the real call for `stage` (idempotent per draft). */
  const advance = async (stage: Stage, transcriptText: string) => {
    if (!enabled || st.ok !== true) return;
    const r = ref.current;
    if (r.ran.has(stage)) return;
    r.ran.add(stage);
    try {
      switch (stage) {
        case 'listening': {
          const home = await api.home().catch(() => null);
          r.homeBal = home?.accounts.find(a => a.id === 'acc_savings')?.balanceCents;
          // FR-021 voice path: real mic bytes → /api/transcribe → draft by id.
          // mock-asr recognises the hint sidecar; provider name is audited.
          const cap = await captureMic(3000);
          const tr = await api.transcribe({
            ...(cap ? { audio: cap.audio, mime: cap.mime } : {}),
            hint: transcriptText,
            lang: 'en',
          });
          const res = await api.draft({ transcriptId: tr.transcriptId });
          if (res.scam) {
            setSt(s => ({ ...s, scamCues: res.scam!.cues }));
            return;
          }
          const d = res.draft!;
          r.draft = d; r.conv = d.conversationId;
          const amb = d.ambiguities[0];
          setSt(s => ({
            ...s, draft: d,
            cardDraft: toCardDraft(d, r.homeBal !== undefined ? r.homeBal - (d.steps[0]?.amountCents ?? 0) : undefined),
            clarify: amb ? { question: amb.question, candidates: amb.candidates } : null,
            frozenCmp: d.status === 'frozen' && d.validation?.discrepancies[0]
              ? { said: d.validation.discrepancies[0].transcriptSays, shows: d.validation.discrepancies[0].draftShows }
              : null,
          }));
          break;
        }
        case 'clarify': {
          if (!r.draft || r.draft.status !== 'awaiting_clarification') return;
          const amb = r.draft.ambiguities[0];
          const { draft } = await api.clarify(r.draft.id, amb.field, amb.candidates[0].id);
          r.draft = draft;
          setSt(s => ({ ...s, draft, cardDraft: toCardDraft(draft), clarify: draft.ambiguities[0]
            ? { question: draft.ambiguities[0].question, candidates: draft.ambiguities[0].candidates } : null }));
          break;
        }
        case 'authorise': {
          if (!r.draft) return;
          await api.registerKey(DEVICE_KEY, DEVICE_ID);
          const sig = mockSign(DEVICE_KEY, r.draft.hash);
          const { draft } = await api.authorise(r.draft.id, r.draft.policy?.tier ?? 'pin', 'faceid', sig, DEVICE_ID);
          r.draft = draft;
          setSt(s => ({ ...s, draft }));
          break;
        }
        case 'receipt': {
          if (!r.draft) return;
          const { execution } = await api.execute(r.draft.id);
          r.draft.execution = execution ?? undefined;
          setSt(s => ({ ...s, draft: r.draft!, balanceReadBack: execution?.ledgerReadBack.balanceCents ?? null }));
          break;
        }
        case 'audit': {
          if (!r.conv) return;
          const { entries } = await api.audit(r.conv);
          setSt(s => ({ ...s, audit: toAuditEv(entries) }));
          break;
        }
      }
    } catch {
      // fail closed & honest: surface the failure on the badge
      setSt(s => ({ ...s, ok: false }));
    }
  };

  return { ...st, advance, reset, apiUrl: API_URL };
}
