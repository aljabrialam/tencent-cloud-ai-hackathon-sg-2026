// digiVoice shared types — the deterministic zone. No IO, no floats for money.

export type Ccy = 'SGD';
export interface Money { cents: number; ccy: Ccy }

export type Formula =
  | { op: 'remaining'; account: string }
  | { op: 'half' | 'all'; of: Formula }
  | { op: 'percent'; pct: number; of: Formula };

export type IntentKind = 'transfer' | 'bill_payment' | 'buy_equity';

export interface IntentStep {
  kind: IntentKind;
  amount?: Money | Formula;
  payeeRef?: string;
  billerRef?: string;
  assetRef?: string;
  sourceRef?: string;
  reference?: string; // free text — inert, quoted verbatim, never parsed
}

export interface UnsupportedStep { kind: 'unsupported'; text: string }
export type DraftInputStep = IntentStep | UnsupportedStep;

export interface ResolvedStep {
  intent: IntentStep;
  amountCents: number;
  payeeId?: string;
  billerId?: string;
  assetId?: string;
  sourceAccountId: string;
  formulaText: string | null;
  warnings: string[];
}

export type DraftStatus =
  | 'drafting'
  | 'awaiting_clarification'
  | 'validating'
  | 'ready'
  | 'frozen'
  | 'authorised'
  | 'executing'
  | 'executed'
  | 'failed'
  | 'expired'
  | 'cancelled';

export interface ValidationResult {
  verdict: 'ok' | 'discrepancy' | 'unavailable';
  discrepancies: { field: string; transcriptSays: string; draftShows: string }[];
}

export type Tier = 'pin' | 'biometric' | 'biometric_oob';

export interface PolicyDecision {
  ruleId: string;
  outcome: 'allow' | 'step_up' | 'hold' | 'block' | 'annotate' | 'clarify';
  tier: Tier | null;
  reason: string;
}

export interface PolicyResult {
  tier: Tier;
  decisions: PolicyDecision[];
  hold?: { reason: string; resetAt?: number };
  requiresAmountConfirm?: boolean;
}

export interface TransactionDraft {
  id: string;
  version: number;
  conversationId: string;
  transcriptId: string;
  steps: ResolvedStep[];
  unsupported: UnsupportedStep[];
  status: DraftStatus;
  validation: ValidationResult | null;
  policy: PolicyResult | null;
  ambiguities: Ambiguity[];
  warnings: string[]; // SHD-* banners surfaced to the card
  hash: string;
  createdAt: number;
  expiresAt: number;
  signature: { alg: 'ed25519-mock' | 'ed25519'; deviceId: string; value: string } | null;
  execution?: ExecutionResult;
}

export interface Ambiguity {
  field: 'payee' | 'amount' | 'source' | 'asset' | 'biller';
  question: string;
  candidates: { id: string; label: string; detail: string }[];
}

export interface StepResult {
  stepIndex: number;
  status: 'executed' | 'failed' | 'skipped';
  ledgerRef: string | null;
  error: string | null;
}

export interface ExecutionResult {
  results: StepResult[];
  ledgerReadBack: { balanceCents: number };
}

export type AuditStage =
  | 'input' | 'shield' | 'draft' | 'clarify' | 'resolve' | 'validate'
  | 'policy' | 'card' | 'authorise' | 'gateway' | 'execute' | 'expire' | 'cancel';

export interface AuditEntry {
  seq: number;
  ts: number;
  stage: AuditStage;
  payload: Record<string, unknown>; // no PINs, biometric material, or secrets (FR-012)
  prevHash: string;
  hash: string;
}

export interface Customer {
  id: string;
  name: string;
  kycStatus: 'verified' | 'pending' | 'restricted';
  language: 'en' | 'zh' | 'ms' | 'ta';
  accessibility: { tapToTalk: boolean; readAloud: boolean; textScale: number };
}

export interface Account {
  id: string;
  label: string;
  mask: string;
  balanceCents: number;
  restricted: boolean;
}

export interface Payee {
  id: string;
  name: string;
  aliases: string[];
  method: 'paynow_mobile' | 'bank_account' | 'biller';
  mask: string;
  lastPaidAt: number | null;
  payCount: number;
}

export interface Biller { id: string; name: string; aliases: string[]; mask: string }

export interface Asset {
  symbol: string;
  name: string;
  priceCents: number;
  lotMinCents: number;
  marketOpen: boolean;
}

export interface HistoryEntry { ts: number; amountCents: number; payeeId: string; kind: IntentKind }

export interface ShieldFlag { id: string; kind: 'injection' | 'scam'; matched: string }

export interface ShieldResult {
  clean: string;          // transcript with injection phrasing stripped
  flags: ShieldFlag[];    // every pattern that fired
  scamCueCount: number;   // ≥2 → interstitial
  injection: boolean;
}
