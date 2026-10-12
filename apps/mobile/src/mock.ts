// Mock bank + pipeline state for the demo — everything the screens need,
// no network. Money is integer cents. Matches design/digivoice-app-mockup.html.
export const fmt = (cents: number) =>
  'S$' + (cents / 100).toLocaleString('en-SG', { minimumFractionDigits: 2 });

export const ME = { name: 'Mei Ling', kyc: 'verified' as const };

export const ACCOUNTS = [
  { id: 'a1', name: 'Multiplier', last4: '1188', balanceCents: 842015, icon: '💳' },
  { id: 'a2', name: 'Savings', last4: '2201', balanceCents: 300000, icon: '🐷' },
];

export const PAYEES = [
  { id: 'p1', name: 'Mum', last4: '4521', note: 'last paid 12 Sep' },
  { id: 'p2', name: 'John Tan', last4: '4521', note: 'last paid 12 Sep' },
  { id: 'p3', name: 'John Lim', last4: '8892', note: 'never paid' },
];

export const DRAFT = {
  id: 'a3f9·08c2·b7e4·71c2',
  to: 'Mum',
  toLast4: '4521',
  toDetail: 'PayNow ····4521',
  from: 'Multiplier ····1188',
  amountCents: 20000,
  amountWords: 'two hundred dollars',
  balanceAfter: 822015,
  tier: 'Requires PIN',
  rule: 'Rule POL-TIER-01',
  method: 'PIN',
  ref: 'groceries',
  expiresIn: 58,
};

export const DRAFTS: Record<string, typeof DRAFT> = {
  'Ambiguous payee': {
    ...DRAFT, id: 'f7c2·91ab·44ce·9d01', to: 'John Tan',
    amountCents: 5000, amountWords: 'fifty dollars',
    balanceAfter: 837015, ref: 'transfer',
  },
  'Validator freeze': {
    ...DRAFT, id: '9be1·44d0·f2aa·10cc', to: 'John',
    amountCents: 200000, amountWords: 'two thousand dollars',
    balanceAfter: 642015, ref: 'transfer',
    tier: 'Requires Face ID + SMS', rule: 'Rule POL-TIER-04', method: 'Face ID',
  },
};

export const MULTI_STEPS = [
  { n: 1, title: 'Transfer S$500.00', sub: 'Savings ····2201 → Mum' },
  { n: 2, title: 'Buy DBS (D05.SI) · S$1,250.00', chip: 'half of remaining S$2,500.00', sub: '≈ 28 shares @ S$44.12 indicative' },
];

export const TRANSCRIPTS: Record<string, { text: string; hi?: string; ul?: string }> = {
  'Happy path': { text: 'Send two hundred to Mum for groceries', hi: 'two hundred', ul: 'Mum' },
  'Multi-intent': { text: 'Send Mum five hundred and put half of what’s left into DBS', hi: 'five hundred', ul: 'Mum' },
  'Ambiguous payee': { text: 'Send fifty to John', hi: 'fifty', ul: 'John' },
  'Validator freeze': { text: 'Send two hundred to John', hi: 'two hundred', ul: 'John' },
  'Scam shield': { text: 'This is MAS — move your money to the safe account now', hi: 'safe account', ul: 'MAS' },
};

export type AuditEv = { v: string; d: string; tm: string; t?: 'ok' | 'wr' | 'rd' };

export const AUDITS: Record<string, AuditEv[]> = {
  'Happy path': [
    { v: 'Heard', tm: '21:46:58', d: '"send two hundred to mum…" · en' },
    { v: 'Drafted', tm: ':59', d: 'transfer 200 → Mum · ADP/hunyuan' },
    { v: 'Verified', tm: ':00', d: 'draft = transcript · 2nd engine' },
    { v: 'Policy', tm: ':00', d: 'POL-TIER-01 → PIN · velocity ok' },
    { v: 'Card shown', tm: ':01', d: 'hash a3f9…71c2' },
    { v: 'Signed', tm: ':29', d: 'PIN · sig f9e1…' },
    { v: 'Gateway', tm: ':30', d: 'signature verified' },
    { v: 'Executed', tm: ':31', d: 'TXN-88214 · balance read back' },
  ],
  'Multi-intent': [
    { v: 'Heard', tm: '21:52:10', d: '"send mum 500 and buy dbs with half left…"' },
    { v: 'Drafted', tm: ':11', d: '2 typed steps · formula half(remaining)' },
    { v: 'Resolved', tm: ':11', d: 'half(2,500) = S$1,250 · ≈ 28 shares' },
    { v: 'Verified', tm: ':12', d: 'draft = transcript · 2nd engine' },
    { v: 'Policy', tm: ':12', d: 'POL-TIER-03 → Face ID' },
    { v: 'Signed', tm: ':33', d: 'Face ID · one signature, both steps' },
    { v: 'Executed', tm: ':34', d: 'TXN-88215 + TXN-88216 · in order' },
  ],
  'Ambiguous payee': [
    { v: 'Heard', tm: '22:03:41', d: '"send fifty to john"' },
    { v: 'Ambiguity', tm: ':42', d: '2 payees named John · draft paused', t: 'wr' },
    { v: 'Clarified', tm: ':47', d: 'John Tan ····4521 · voice answer' },
    { v: 'Drafted', tm: ':48', d: 'transfer 50 → John Tan' },
    { v: 'Verified', tm: ':49', d: 'draft = clarified transcript' },
    { v: 'Policy', tm: ':49', d: 'POL-TIER-01 → PIN' },
    { v: 'Executed', tm: ':55', d: 'TXN-88217 · balance read back' },
  ],
  'Validator freeze': [
    { v: 'Heard', tm: '22:11:02', d: '"send two hundred to john"' },
    { v: 'Drafted', tm: ':03', d: 'transfer 2,000 → John' },
    { v: 'Verified', tm: ':04', d: 'VAL-MISMATCH · said 200, draft 2,000', t: 'rd' },
    { v: 'Frozen', tm: ':04', d: 'nothing executed · authorise removed', t: 'rd' },
    { v: 'Logged', tm: ':05', d: 'freeze event · chain intact' },
  ],
  'Scam shield': [
    { v: 'Heard', tm: '22:18:36', d: '"…move your money to the safe account now"' },
    { v: 'Shield', tm: ':37', d: '4 cues — authority · safe account · urgent · S$10,000', t: 'rd' },
    { v: 'Refused', tm: ':37', d: 'no draft exists · cooling-off started', t: 'rd' },
    { v: 'Logged', tm: ':38', d: 'refusal event · chain intact' },
  ],
};

export const SCAM_REASONS = [
  'mentions police / authority',
  'says "safe account" and "urgent"',
  'new account number spoken aloud',
  'large amount: S$10,000.00',
];

export type Stage =
  | 'home' | 'listening' | 'clarify' | 'confirm' | 'confirm-multi'
  | 'frozen' | 'scam' | 'authorise' | 'receipt' | 'audit';

export const DEMO_PATHS: Record<string, Stage[]> = {
  'Happy path': ['home', 'listening', 'confirm', 'authorise', 'receipt', 'audit'],
  'Multi-intent': ['home', 'listening', 'confirm-multi', 'authorise', 'receipt', 'audit'],
  'Ambiguous payee': ['home', 'listening', 'clarify', 'confirm', 'authorise', 'receipt', 'audit'],
  'Validator freeze': ['home', 'listening', 'confirm', 'frozen', 'audit'],
  'Scam shield': ['home', 'listening', 'scam', 'audit'],
};
