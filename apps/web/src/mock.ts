// Shared mock data — same story the phone app tells.
export const fmt = (cents: number) =>
  'S$' + (cents / 100).toLocaleString('en-SG', { minimumFractionDigits: 2 });

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
};

export const AUDIT = [
  { id: '#0042', ev: 'You said — “pay mum $200”' },
  { id: '#0043', ev: 'Draft a3f9·08c2 created' },
  { id: '#0044', ev: 'Validator agreed — no discrepancy' },
  { id: '#0045', ev: 'Policy tier resolved — Small · biometric' },
  { id: '#0046', ev: 'Signed on device · Face ID' },
  { id: '#0047', ev: 'Executed · TXN-88214 · chain intact' },
];

export type WebState = 'draft' | 'clarify' | 'frozen' | 'audit';
