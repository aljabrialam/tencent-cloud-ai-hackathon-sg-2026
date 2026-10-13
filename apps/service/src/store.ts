// JSON-file state — durable across restarts (FR-020). All mutations go through
// this module; the audit array is append-only and flushed with every save.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import type {
  Account, Asset, AuditEntry, Biller, Customer, HistoryEntry,
  Payee, TransactionDraft,
} from '@digivoice/shared/types';

export interface Transcript { id: string; text: string; raw: string; lang: string; ts: number; warnings: string[] }
export interface DeviceKey { deviceId: string; publicKey: string }

export interface State {
  customer: Customer;
  accounts: Account[];
  payees: Payee[];
  billers: Biller[];
  assets: Asset[];
  history: HistoryEntry[];
  recentTransferTs: number[];
  transcripts: Transcript[];
  drafts: TransactionDraft[];
  audit: AuditEntry[];
  deviceKeys: DeviceKey[];
  demoFlags: { corruptNextDraft: boolean; validatorTimeout: boolean };
}

export const STATE_FILE = process.env.STATE_FILE || '/tmp/digivoice-state.json';

let state: State | null = null;

export function get(): State {
  if (!state) {
    if (existsSync(STATE_FILE)) {
      state = JSON.parse(readFileSync(STATE_FILE, 'utf8')) as State;
    } else {
      state = seed();
      save();
    }
  }
  return state!;
}

export function save() {
  mkdirSync(dirname(STATE_FILE), { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

export function reseed(): State {
  state = seed();
  save();
  return state;
}

export function seed(): State {
  const now = Date.now();
  const DAY = 86_400_000;
  const payee = (id: string, name: string, aliases: string[], mask: string, lastPaidDaysAgo: number | null, payCount: number): Payee => ({
    id, name, aliases, method: 'paynow_mobile', mask,
    lastPaidAt: lastPaidDaysAgo === null ? null : now - lastPaidDaysAgo * DAY,
    payCount,
  });
  const history: HistoryEntry[] = [];
  // 20 history rows, median ≈ S$80 — feeds POL-ANOM-01 and payee recency
  for (let i = 0; i < 20; i++) {
    history.push({
      ts: now - (i + 2) * DAY,
      amountCents: [5_000, 6_500, 8_000, 8_000, 9_500, 7_200, 8_000, 12_000, 8_800, 8_000,
                    8_000, 6_000, 9_000, 8_000, 10_000, 7_000, 8_000, 8_500, 9_200, 8_000][i],
      payeeId: i % 3 === 0 ? 'payee_mum' : i % 3 === 1 ? 'payee_john_tan' : 'payee_daughter',
      kind: 'transfer',
    });
  }
  return {
    customer: {
      id: 'cust_meiling', name: 'Mei Ling', kycStatus: 'verified', language: 'en',
      accessibility: { tapToTalk: true, readAloud: true, textScale: 1 },
    },
    accounts: [
      { id: 'acc_savings', label: 'Savings', mask: '····3000', balanceCents: 300_000, restricted: false },
      { id: 'acc_multiplier', label: 'Multiplier', mask: '····1188', balanceCents: 842_015, restricted: false },
      { id: 'acc_invest', label: 'Invest', mask: '····5520', balanceCents: 0, restricted: false },
    ],
    payees: [
      payee('payee_mum', 'Mum', ['mom', 'mother', '妈妈'], '····4521', 10, 12),
      payee('payee_john_tan', 'John Tan', ['john tan', 'john t'], '····4521', 30, 4),
      payee('payee_john_lim', 'John Lim', ['john lim'], '····8892', 60, 2),
      payee('payee_daughter', '女儿 (Daughter)', ['daughter', 'mei', '女儿'], '····2210', 45, 6),
      payee('payee_new_landlord', 'New Landlord', ['landlord'], '····0001', null, 0),
    ],
    billers: [
      { id: 'biller_singtel', name: 'Singtel', aliases: ['singtel', 'phone bill'], mask: 'B-118' },
      { id: 'biller_sp', name: 'SP Group', aliases: ['sp group', 'utilities', 'electricity'], mask: 'B-207' },
      { id: 'biller_cc', name: 'DBS Credit Card', aliases: ['credit card', 'card bill'], mask: 'B-001' },
    ],
    assets: [
      { symbol: 'D05.SI', name: 'DBS Group', priceCents: 4412, lotMinCents: 4412, marketOpen: true },
      { symbol: 'AAPL', name: 'Apple Inc.', priceCents: 23_200, lotMinCents: 23_200, marketOpen: true },
    ],
    history,
    recentTransferTs: [],
    transcripts: [],
    drafts: [],
    audit: [],
    deviceKeys: [],
    demoFlags: { corruptNextDraft: false, validatorTimeout: false },
  };
}
