// Mock bank + pipeline state for the demo — everything the screens need,
// no network. Money is integer cents.
export const fmt = (cents: number) =>
  'S$' + (cents / 100).toLocaleString('en-SG', { minimumFractionDigits: 2 });

export const ME = { name: 'Mei Ling', kyc: 'verified' as const };

export const ACCOUNTS = [
  { id: 'a1', name: 'Multiplier Account', last4: '1188', balanceCents: 842015 },
  { id: 'a2', name: 'Savings Account', last4: '2201', balanceCents: 300000 },
];

export const PAYEES = [
  { id: 'p1', name: 'Mum', last4: '4521', note: 'last paid 12 Sep' },
  { id: 'p2', name: 'John Tan', last4: '4521', note: 'last paid 12 Sep' },
  { id: 'p3', name: 'John Lim', last4: '8892', note: 'never paid' },
];

export const DRAFT = {
  id: 'a3f9·08c2',
  to: 'Mum',
  toLast4: '4521',
  from: 'Savings Account ····2201',
  amountCents: 20000,
  amountWords: 'two hundred dollars',
  balanceAfter: 280000,
  tier: 'Small — biometric',
  ref: 'groceries',
  expiresIn: 60,
};

export const DRAFTS: Record<string, typeof DRAFT> = {
  'Ambiguous payee': {
    ...DRAFT, id: 'f7c2·91ab', to: 'John Tan', amountCents: 5000,
    amountWords: 'fifty dollars', balanceAfter: 295000, ref: 'transfer',
  },
  'Validator freeze': {
    ...DRAFT, id: '9be1·44d0', to: 'John Tan',
    amountCents: 50000, amountWords: 'five hundred dollars',
    balanceAfter: 250000, ref: 'transfer',
  },
};

export const MULTI_STEPS = [
  { n: 1, label: 'Transfer', detail: 'S$200.00 → Mum ····4521' },
  { n: 2, label: 'Buy DBS shares', detail: 'half of remaining ≈ S$1,400.00', formula: true },
];

export const TRANSCRIPTS: Record<string, { text: string; hi?: string; ul?: string }> = {
  'Happy path': { text: 'Send two hundred to Mum for groceries', hi: 'two hundred', ul: 'Mum' },
  'Multi-intent': { text: 'Send Mum two hundred and buy DBS shares with half of what’s left', hi: 'two hundred', ul: 'Mum' },
  'Ambiguous payee': { text: 'Send John fifty dollars', hi: 'fifty', ul: 'John' },
  'Validator freeze': { text: 'Send two thousand to the new payee', hi: 'two thousand', ul: 'new payee' },
  'Scam shield': { text: 'This is MAS — move your money to the safe account now', hi: 'safe account', ul: 'MAS' },
};

export const AUDIT = [
  { id: '#0042', ev: 'You said — “pay mum $200”', ok: true },
  { id: '#0043', ev: 'Draft a3f9·08c2 created', ok: true },
  { id: '#0044', ev: 'Validator agreed — no discrepancy', ok: true },
  { id: '#0045', ev: 'Policy tier resolved — Small · biometric', ok: true },
  { id: '#0046', ev: 'Signed on device · Face ID', ok: true },
  { id: '#0047', ev: 'Executed · TXN-88214 · chain intact', ok: true },
];

export const AUDITS: Record<string, { id: string; ev: string; ok: boolean }[]> = {
  'Happy path': AUDIT,
  'Multi-intent': [
    { id: '#0048', ev: 'You said — “pay the phone bill and send mum $200”', ok: true },
    { id: '#0049', ev: 'Draft split into 2 typed steps', ok: true },
    { id: '#0050', ev: 'Formula resolved — half of remaining ≈ S$1,400.00', ok: true },
    { id: '#0051', ev: 'Validator agreed — no discrepancy', ok: true },
    { id: '#0052', ev: 'Signed on device · Face ID — one signature, both steps', ok: true },
    { id: '#0053', ev: 'Executed · TXN-88215 + TXN-88216 · chain intact', ok: true },
  ],
  'Ambiguous payee': [
    { id: '#0054', ev: 'You said — “send john $50”', ok: true },
    { id: '#0055', ev: 'Ambiguity detected — 2 payees named John', ok: true },
    { id: '#0056', ev: 'Clarified — John Tan ····3317', ok: true },
    { id: '#0057', ev: 'Draft f7c2·91ab created', ok: true },
    { id: '#0058', ev: 'Signed on device · Face ID', ok: true },
    { id: '#0059', ev: 'Executed · TXN-88217 · chain intact', ok: true },
  ],
  'Validator freeze': [
    { id: '#0060', ev: 'You said — “send $2,000 to new payee”', ok: true },
    { id: '#0061', ev: 'Draft 9be1·44d0 created', ok: true },
    { id: '#0062', ev: 'Validator disagreed — VAL-MISMATCH · payee not in transcript', ok: false },
    { id: '#0063', ev: 'Draft frozen — nothing was executed', ok: false },
    { id: '#0064', ev: 'Freeze event logged · chain intact', ok: true },
  ],
  'Scam shield': [
    { id: '#0065', ev: 'You said — “move money to the safe account now”', ok: true },
    { id: '#0066', ev: 'Shield matched 3 scam cues — authority, urgency, safe-account', ok: false },
    { id: '#0067', ev: 'Refused before drafting — no draft exists', ok: false },
    { id: '#0068', ev: 'Refusal logged · chain intact', ok: true },
  ],
};

export const SCAM_REASONS = [
  'Authority cue — “this is the police / MAS investigation”',
  'Urgency cue — “transfer now before they freeze your account”',
  'Safe-account cue — “move your money to a safe account”',
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
