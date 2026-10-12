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

export const MULTI_STEPS = [
  { n: 1, label: 'Transfer', detail: 'S$200.00 → Mum ····4521' },
  { n: 2, label: 'Buy DBS shares', detail: 'half of remaining ≈ S$1,400.00', formula: true },
];

export const AUDIT = [
  { id: '#0042', ev: 'You said — “pay mum $200”', ok: true },
  { id: '#0043', ev: 'Draft a3f9·08c2 created', ok: true },
  { id: '#0044', ev: 'Validator agreed — no discrepancy', ok: true },
  { id: '#0045', ev: 'Policy tier resolved — Small · biometric', ok: true },
  { id: '#0046', ev: 'Signed on device · Face ID', ok: true },
  { id: '#0047', ev: 'Executed · TXN-88214 · chain intact', ok: true },
];

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
