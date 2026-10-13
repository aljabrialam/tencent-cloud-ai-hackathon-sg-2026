// zod gates: every LLM output and every API payload passes through these before
// anything downstream touches it. Unknown keys are rejected (Principle I wall).
import { z } from 'zod';

export const moneySchema = z.object({
  cents: z.number().int(),
  ccy: z.literal('SGD'),
});

export const formulaSchema: z.ZodType<unknown> = z.lazy(() =>
  z.union([
    z.object({ op: z.literal('remaining'), account: z.string().min(1) }).strict(),
    z.object({ op: z.enum(['half', 'all']), of: formulaSchema }).strict(),
    z.object({ op: z.literal('percent'), pct: z.number().min(0).max(100), of: formulaSchema }).strict(),
  ])
);

export const intentStepSchema = z.object({
  kind: z.enum(['transfer', 'bill_payment', 'buy_equity']),
  amount: z.union([moneySchema, formulaSchema]).optional(),
  payeeRef: z.string().optional(),
  billerRef: z.string().optional(),
  assetRef: z.string().optional(),
  sourceRef: z.string().optional(),
  reference: z.string().optional(),
}).strict();

export const unsupportedStepSchema = z.object({
  kind: z.literal('unsupported'),
  text: z.string(),
}).strict();

export const draftInputSchema = z.array(z.union([intentStepSchema, unsupportedStepSchema])).min(1).max(10);

export const verdictSchema = z.object({
  ok: z.boolean(),
  discrepancies: z.array(z.object({
    field: z.string(),
    transcriptSays: z.string(),
    draftShows: z.string(),
  })).default([]),
}).strict();

export const langSchema = z.enum(['en', 'zh', 'ms', 'ta']);
export const transcribeBody = z.object({
  text: z.string().min(1).max(2000).optional(),
  audio: z.string().min(1).max(2_000_000).optional(), // base64 capture (webm/pcm)
  mime: z.string().max(100).optional(),
  hint: z.string().max(2000).optional(), // mock-asr sidecar for demo reproducibility
  lang: langSchema.default('en'),
}).strict().refine(b => b.text || b.audio || b.hint, { message: 'text, audio or hint required' });
export const draftsBody = z.object({
  transcriptId: z.string().optional(),
  text: z.string().min(1).max(2000).optional(),
  lang: langSchema.default('en'),
}).strict().refine(b => b.transcriptId || b.text, { message: 'transcriptId or text required' });
export const clarifyBody = z.object({
  field: z.string().optional(),
  choice: z.string().optional(),
  text: z.string().max(500).optional(),
}).strict();
export const authoriseBody = z.object({
  tier: z.enum(['pin', 'biometric', 'biometric_oob']),
  method: z.string(),
  signature: z.string().min(8),
  deviceId: z.string().min(1),
}).strict();
export const deviceKeyBody = z.object({ publicKey: z.string().min(8), deviceId: z.string().min(1) }).strict();
export const executeBody = z.object({ draftId: z.string().min(1) }).strict();
export const ttsBody = z.object({ text: z.string().min(1).max(4000), lang: z.enum(['en','zh','ms','ta']).default('en') }).strict();
