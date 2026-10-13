// SHD-* pre-draft shield: injection stripping + scam cue detection (FR-009).
import type { ShieldFlag, ShieldResult } from './types';

interface Pattern { id: string; kind: 'injection' | 'scam'; re: RegExp }

const PATTERNS: Pattern[] = [
  // SHD-INJ-01 — strip before the model ever sees it
  { id: 'SHD-INJ-01', kind: 'injection', re: /\bignore\b[^.;]{0,40}\binstructions?\b/gi },
  { id: 'SHD-INJ-01', kind: 'injection', re: /system prompt|you are now|act as|new instructions?|disregard (all |previous )?/gi },
  { id: 'SHD-INJ-01', kind: 'injection', re: /\[\/?system\]|<\|.*?\|>|```\s*system/gi },
  // scam cues — counted, not stripped (they're evidence)
  { id: 'SHD-SCAM-AUTH', kind: 'scam', re: /\b(police|MAS|monetary authority|CPF|IRAS|officer|investigation|interpol)\b/gi },
  { id: 'SHD-SCAM-URG', kind: 'scam', re: /\b(now|immediately|urgent(?:ly)?|right away|before they freeze|within \d+ (minutes?|hours?))\b/gi },
  { id: 'SHD-SCAM-SAFE', kind: 'scam', re: /\b(safe account|holding account|verify your money|secure (your |the )?(money|funds|account))\b/gi },
  { id: 'SHD-SCAM-SECRECY', kind: 'scam', re: /\b(don'?t tell|keep (this |it )?confidential|don'?t hang up|stay on the line|secrecy)\b/gi },
  { id: 'SHD-SCAM-NEWPAYEE-LARGE', kind: 'scam', re: /\b\d{3}[- ]?\d{4,5}[- ]?\d{1,3}\b/g }, // raw account number spoken
];

export function shield(raw: string): ShieldResult {
  const flags: ShieldFlag[] = [];
  let clean = raw;
  for (const p of PATTERNS) {
    const matches = [...(p.kind === 'injection' ? clean.matchAll(p.re) : raw.matchAll(p.re))];
    for (const m of matches) flags.push({ id: p.id, kind: p.kind, matched: m[0] });
    if (p.kind === 'injection') clean = clean.replace(p.re, ' ').replace(/\s{2,}/g, ' ');
  }
  const scamCueCount = new Set(flags.filter(f => f.kind === 'scam').map(f => f.id)).size;
  return {
    clean: clean.trim(),
    flags,
    scamCueCount,
    injection: flags.some(f => f.kind === 'injection'),
  };
}
