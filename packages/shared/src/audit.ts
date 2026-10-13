// Append-only, tamper-evident audit chain (FR-011). hash = sha256(prevHash + canonical(payload)).
import { canonical, sha256Hex } from './signing.js';
import type { AuditEntry, AuditStage } from './types.js';

const GENESIS = '0'.repeat(64);

export function append(log: AuditEntry[], stage: AuditStage, payload: Record<string, unknown>, ts = Date.now()): AuditEntry {
  const prevHash = log.length ? log[log.length - 1].hash : GENESIS;
  const entry: AuditEntry = {
    seq: log.length,
    ts,
    stage,
    payload,
    prevHash,
    hash: sha256Hex(prevHash + canonical(payload)),
  };
  log.push(entry);
  return entry;
}

export function verify(log: AuditEntry[]): boolean {
  let prev = GENESIS;
  for (const e of log) {
    if (e.prevHash !== prev) return false;
    if (e.hash !== sha256Hex(prev + canonical(e.payload))) return false;
    prev = e.hash;
  }
  return true;
}
