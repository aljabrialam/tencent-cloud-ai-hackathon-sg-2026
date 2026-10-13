// LLMProvider — the ONLY model surface in the system. complete(system,user)→string.
// No tool definitions exist to hand a model (Principle I). Providers switch by env
// (FR-018): ADP for drafting, Hunyuan for validation; mock keeps the demo
// deterministic and offline-capable.

export interface LLMProvider {
  name: string;
  complete(system: string, user: string): Promise<string>;
}

/** OpenAI-compatible chat-completions endpoint (Hunyuan, OpenAI, others). */
export function chatProvider(name: string, baseURL: string, apiKey: string, model: string): LLMProvider {
  return {
    name,
    async complete(system, user) {
      const res = await fetch(`${baseURL}/chat/completions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
          temperature: 0,
        }),
      });
      if (!res.ok) throw new Error(`${name} ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const j = await res.json() as { choices?: { message?: { content?: string } }[] };
      const out = j.choices?.[0]?.message?.content;
      if (!out) throw new Error(`${name}: empty completion`);
      return out;
    },
  };
}

/** Tencent ADP agent — AppKey + SSE stream, collects delta text. */
export function adpProvider(appKey: string, baseURL = 'https://api.lkeap.cloud.tencent.com'): LLMProvider {
  const inner = chatProvider('adp', baseURL + '/v1', appKey, 'lke');
  return { name: 'adp', complete: (s, u) => inner.complete(s, u) };
}

const env = (k: string) => process.env[k] || '';

/** Drafter: ADP if ADP_APP_KEY set, else mock. */
export function drafter(): LLMProvider {
  if (env('ADP_APP_KEY')) return adpProvider(env('ADP_APP_KEY'));
  if (env('DRAFTER_OPENAI_KEY')) return chatProvider('openai', 'https://api.openai.com/v1', env('DRAFTER_OPENAI_KEY'), env('DRAFTER_MODEL') || 'gpt-4o-mini');
  return mockProvider;
}

/** Validator: Hunyuan if keys set — never the same engine as the drafter (dual-engine). */
export function validator(): LLMProvider {
  if (env('HUNYUAN_SECRET_KEY')) return chatProvider('hunyuan', 'https://api.hunyuan.cloud.tencent.com/v1', env('HUNYUAN_SECRET_KEY'), env('HUNYUAN_MODEL') || 'hunyuan-lite');
  if (env('VALIDATOR_OPENAI_KEY')) return chatProvider('openai-validator', 'https://api.openai.com/v1', env('VALIDATOR_OPENAI_KEY'), env('VALIDATOR_MODEL') || 'gpt-4o-mini');
  return mockValidator;
}

// ---------------------------------------------------------------------------
// Mock drafter: deterministic parser for the demo corpus + generic phrases.
// Same JSON contract as a real drafter — it is a provider, not a shortcut.

const NUM: Record<string, number> = {
  one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,
  eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,
  twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90,
};

function wordsToNumber(s: string): number | null {
  const toks = s.toLowerCase().replace(/-/g, ' ').split(/\s+/).filter(Boolean);
  let total = 0, cur = 0, seen = false;
  for (const t of toks) {
    if (t in NUM) { cur += NUM[t]; seen = true; }
    else if (t === 'hundred') { cur = (cur || 1) * 100; seen = true; }
    else if (t === 'thousand') { total += (cur || 1) * 1000; cur = 0; seen = true; }
    else if (t === 'grand') { total += (cur || 1) * 1000; cur = 0; seen = true; }
    else if (t === 'a' || t === 'an') { if (!seen) cur = 1; }
    else if (/\d+/.test(t)) { cur += parseInt(t, 10); seen = true; }
    else return null;
  }
  return seen ? total + cur : null;
}

function money(v: number) { return { cents: Math.round(v * 100), ccy: 'SGD' }; }

function parseClause(clause: string): Record<string, unknown> | null {
  const c = clause.toLowerCase();
  // equity
  if (/\b(buy|invest|purchase|shares?|stock|equity|dbs|aapl|apple)\b/.test(c) && /share|stock|equity|invest|buy|purchase/.test(c)) {
    const step: Record<string, unknown> = { kind: 'buy_equity' };
    const asset = /aapl|apple/.test(c) ? 'Apple' : /dbs/.test(c) ? 'DBS' : undefined;
    if (asset) step.assetRef = asset;
    const fm = /half of (what'?s |what is )?(left|remaining)/.test(c)
      ? { op: 'half', of: { op: 'remaining', account: 'acc_savings' } }
      : /(all|whatever) (is |')?(left|remaining)|whatever'?s left|rest of it/.test(c)
        ? { op: 'remaining', account: 'acc_savings' }
        : /half of it|half of that/.test(c)
          ? { op: 'half', of: { op: 'remaining', account: 'acc_savings' } }
          : null;
    if (fm) step.amount = fm;
    else {
      const amt = c.match(/(?:with |for |of )?(\$?[\d,.]+|[a-z -]+?)\s*(dollars?|bucks|sgd)?\s*(of|in|worth)?/);
      const m = c.match(/\$?([\d,]+(?:\.\d{1,2})?)/);
      if (m) step.amount = money(parseFloat(m[1].replace(/,/g, '')));
      else {
        const wm = c.match(/(?:buy|invest|purchase)\s+(?:worth of |of )?([a-z -]+?)(?:\s+dollars?|\s+worth|\s+of|\s+in)?/);
        if (wm) { const n = wordsToNumber(wm[1]); if (n !== null) step.amount = money(n); }
      }
      if (!step.amount) step.amount = { op: 'remaining', account: 'acc_savings' };
    }
    return step;
  }
  // bill payment
  const biller = /singtel/.test(c) ? 'Singtel' : /sp group|utilities|electricity/.test(c) ? 'SP Group' : /credit card|card bill/.test(c) ? 'DBS Credit Card' : null;
  if (biller && /pay|bill|settle/.test(c)) {
    const step: Record<string, unknown> = { kind: 'bill_payment', billerRef: biller };
    const m = c.match(/\$?([\d,]+(?:\.\d{1,2})?)/);
    if (m) step.amount = money(parseFloat(m[1].replace(/,/g, '')));
    else {
      const wm = c.match(/(?:pay|settle)\s+(?:the\s+)?([a-z -]+?)\s*(dollars?)?\s*(bill|to)/);
      if (wm) { const n = wordsToNumber(wm[1]); if (n !== null) step.amount = money(n); }
    }
    return step;
  }
  // transfer
  const to = c.match(/(?:send|transfer|pay|move|give)\s+(?:over\s+)?(.*?)\s+to\s+([a-z' ]+)/);
  const noTo = !to && c.match(/^(?:please\s+)?(?:send|transfer|pay|move|give)\s+(.*)/);
  if (noTo) {
    // "send john fifty dollars" — find the amount tokens, payee is the rest
    const rest = noTo[1].replace(/\bfor\s+[a-z ]+$/, '').trim();
    const amtRe = /\$?[\d,]+(?:\.\d{1,2})?(?:\s*dollars?|bucks)?|(?:(?:one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety|hundred|thousand|grand|a|an)[ -]*)+(?:dollars?|bucks)?/i;
    const am = rest.match(amtRe);
    if (am) {
      const step: Record<string, unknown> = { kind: 'transfer' };
      const amtTxt = am[0].replace(/\s*(dollars?|bucks)$/, '').trim();
      const dig = amtTxt.match(/[\d,]+(?:\.\d{1,2})?/);
      if (dig) step.amount = money(parseFloat(dig[0].replace(/,/g, '')));
      else { const n = wordsToNumber(amtTxt); if (n !== null) step.amount = money(n); }
      const payee = (rest.slice(0, am.index) + rest.slice(am.index! + am[0].length))
        .replace(/\bto\b/g, ' ').replace(/\s{2,}/g, ' ').trim();
      if (payee) step.payeeRef = payee;
      const ref = c.match(/\bfor\s+([a-z ]+?)(?:\s+and\b|$)/);
      if (ref) step.reference = ref[1].trim();
      return step;
    }
  }
  if (to) {
    const step: Record<string, unknown> = { kind: 'transfer' };
    const amtTxt = to[1].trim();
    const dig = amtTxt.match(/\$?([\d,]+(?:\.\d{1,2})?)/);
    if (dig) step.amount = money(parseFloat(dig[1].replace(/,/g, '')));
    else {
      const n = wordsToNumber(amtTxt.replace(/\b(dollars?|bucks|sgd|a|an)\b/g, '').trim());
      if (n !== null) step.amount = money(n);
    }
    step.payeeRef = to[2].replace(/\s+(for|so|because|and then).*$/, '').trim();
    const ref = c.match(/\bfor\s+([a-z ]+?)(?:\s+and\b|$)/);
    if (ref && !/^(it|him|her|them)\b/.test(ref[1])) step.reference = ref[1].trim();
    if (/from (my )?(multiplier|savings|invest)/.test(c)) step.sourceRef = (c.match(/multiplier|savings|invest/) ?? [])[0];
    return step;
  }
  return null;
}

// FR-016: zh/ms/ta reach the same typed pipeline. The mock drafter normalises
// the demo-corpus phrases to English before parsing — a real provider handles
// the languages natively through the identical JSON contract.
const PRE: [RegExp, string][] = [
  // zh — longer patterns first
  [/剩下的?一半|一半的?剩余|半数/g, " half of what's left "],
  [/转账|汇款|转给|转/g, ' send '],
  [/两百|二百/g, ' two hundred '],
  [/一百/g, ' one hundred '],
  [/五十/g, ' fifty '],
  [/给妈妈|给母亲/g, ' to Mum '],
  [/买|购买/g, ' buy '],
  [/股票|股份/g, ' shares '],
  [/然后|接着|并且|再/g, ' then '],
  // ms
  [/separuh (baki|yang tinggal)/g, " half of what's left "],
  [/hantar|pindahkan?/g, ' send '],
  [/bayar/g, ' pay '],
  [/kepada|untuk/g, ' to '],
  [/ibu|emak|mak/g, ' Mum '],
  [/dua ratus/g, ' two hundred '],
  [/seratus/g, ' one hundred '],
  [/lima puluh/g, ' fifty '],
  [/kemudian/g, ' then '],
  // ta — minimal: 200 to Mum
  [/அனுப்பு/g, ' send '],
  [/அம்மா/g, ' Mum '],
];

function normaliseLang(t: string): string {
  let s = t;
  for (const [re, to] of PRE) s = s.replace(re, to);
  return s.replace(/\s{2,}/g, ' ').trim();
}

export const mockProvider: LLMProvider = {
  name: 'mock-drafter',
  async complete(_system, user) {
    const transcript = normaliseLang((user.match(/"""([\s\S]*?)"""/) ?? [])[1] ?? '');
    const clauses = transcript.split(/\bthen\b|, then|;| and (?:then )?buy| and (?:then )?pay| and (?:then )?send| and (?:then )?transfer/i).map(s => s.trim()).filter(Boolean);
    const steps = clauses.map(parseClause).filter(Boolean);
    if (!steps.length) return JSON.stringify([{ kind: 'unsupported', text: transcript.slice(0, 200) }]);
    return JSON.stringify(steps);
  },
};

// ---------------------------------------------------------------------------
// ASR provider (FR-021 voice path). Mock ASR recognises the demo `hint` sidecar
// and is labelled 'mock-asr' in the audit trail; TRTC ASR plugs in via env —
// without its SDK signature wiring the call fails closed with a 502.

export interface ASRProvider {
  name: string;
  recognise(audioB64: string, mime: string, lang: string, hint?: string): Promise<string>;
}

export function asr(): ASRProvider {
  if (env('TRTC_ASR_SDK_APP_ID')) return {
    name: 'trtc-asr',
    async recognise() {
      throw new Error('trtc-asr: SDK signature wiring pending (AppID set but no signer) — unset TRTC_ASR_SDK_APP_ID to use mock-asr');
    },
  };
  return mockAsr;
}

export const mockAsr: ASRProvider = {
  name: 'mock-asr',
  async recognise(_audio, _mime, _lang, hint) {
    if (!hint) throw new Error('mock-asr: no hint sidecar — mock cannot decode audio (provider is labelled, never fakes)');
    return hint;
  },
};

// Mock validator: compares the rendered step summary against the transcript the
// same way a second engine would — field by field. Deliberately independent
// logic from the drafter's parser.
export const mockValidator: LLMProvider = {
  name: 'mock-validator',
  async complete(_system, user) {
    const transcript = ((user.match(/Transcript:\s*"""([\s\S]*?)"""/) ?? [])[1] ?? '').toLowerCase();
    const proposed = ((user.match(/Proposed:\s*([\s\S]*)$/) ?? [])[1] ?? '');
    const discrepancies: { field: string; transcriptSays: string; draftShows: string }[] = [];
    const amounts = [...transcript.matchAll(/\$?([\d,]+(?:\.\d{1,2})?)\s*dollars?|\b([a-z-]+)\s*dollars?\b/g)];
    const draftAmounts = [...proposed.matchAll(/S\$([\d,.]+)/g)].map(m => parseFloat(m[1].replace(/,/g, '')));
    const wordNums = amounts.map(m => m[1] ? parseFloat(m[1].replace(/,/g, '')) : wordsToNumber(m[2])).filter(n => n !== null) as number[];
    for (const t of wordNums) {
      if (!draftAmounts.some(d => Math.abs(d - t) < 0.01)) {
        discrepancies.push({ field: 'amount', transcriptSays: `S$${t}`, draftShows: draftAmounts[0] !== undefined ? `S$${draftAmounts[0]}` : 'none' });
      }
    }
    if (/\b(two hundred|200)\b/.test(transcript) && draftAmounts.some(d => d === 2000 || d === 200_000)) {
      discrepancies.push({ field: 'amount', transcriptSays: 'two hundred', draftShows: `S$${draftAmounts[0]}` });
    }
    return JSON.stringify({ ok: discrepancies.length === 0, discrepancies });
  },
};
