// OpenAPI surface for judges — GET /api/openapi.json serves the spec,
// GET /api/docs serves Swagger UI pointing at it. Covers the contract in
// specs/001-conversational-transaction-agent/contracts/service-api.md.

export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'digiVoice Agent Service',
    version: '0.1.0',
    description: [
      'Direct Conversational Transaction Agent — the deterministic pipeline.',
      'The LLM drafts; code executes. Every draft is schema-validated, independently',
      'verified, policy-gated, and only a device signature over the exact draft',
      'reaches the ledger. Mock bank, mock biometrics — labelled honestly.',
    ].join(' '),
  },
  tags: [
    { name: 'pipeline', description: 'voice/text → draft → clarify → authorise → execute' },
    { name: 'device', description: 'device key registration — the only signing surface' },
    { name: 'audit', description: 'append-only hash-chained trail' },
    { name: 'demo', description: 'dev-only hooks — require X-Demo: 1 header' },
  ],
  paths: {
    '/health': {
      get: { tags: ['pipeline'], summary: 'Service health + active providers', responses: { '200': { description: '{ok, providers, seeded}' } } },
    },
    '/api/home': {
      get: { tags: ['pipeline'], summary: 'Customer, accounts, recent activity (read-only)', responses: { '200': { description: '{customer, accounts, recent}' } } },
    },
    '/api/device/keys': {
      post: {
        tags: ['device'], summary: 'Register a device public key',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['publicKey', 'deviceId'], properties: { publicKey: { type: 'string' }, deviceId: { type: 'string' } } } } } },
        responses: { '200': { description: '{registered:true}' }, '400': { $ref: '#/components/responses/schemaInvalid' } },
      },
    },
    '/api/transcribe': {
      post: {
        tags: ['pipeline'], summary: 'Audio or text → shielded transcript',
        description: 'Audio bytes go to the ASR provider (mock-asr uses the `hint` sidecar, honestly labelled). Injection cues are stripped, scam cues are counted.',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: {
          text: { type: 'string' }, audio: { type: 'string', description: 'base64 capture' }, mime: { type: 'string' }, hint: { type: 'string' }, lang: { $ref: '#/components/schemas/Lang' },
        } } } } },
        responses: { '200': { description: '{transcriptId, text, lang, warnings, scamCues, injection}' }, '400': { $ref: '#/components/responses/schemaInvalid' }, '502': { $ref: '#/components/responses/upstream' } },
      },
    },
    '/api/drafts': {
      post: {
        tags: ['pipeline'], summary: 'Transcript/text → typed draft (LLM → resolve → validate → policy)',
        description: 'Shield runs inline on the text path. ≥2 scam cues → scam interstitial, no draft. Ambiguity → awaiting_clarification. Validator disagreement → frozen.',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: {
          transcriptId: { type: 'string' }, text: { type: 'string' }, lang: { $ref: '#/components/schemas/Lang' },
        } } } } },
        responses: { '200': { description: '{draft} or {scam, transcriptId}' }, '400': { $ref: '#/components/responses/schemaInvalid' }, '502': { $ref: '#/components/responses/upstream' } },
      },
    },
    '/api/drafts/{id}': {
      get: { tags: ['pipeline'], summary: 'Fetch a draft (expired drafts transition here)', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: '{draft}' }, '404': { $ref: '#/components/responses/notFound' } } },
    },
    '/api/drafts/{id}/clarify': {
      post: {
        tags: ['pipeline'], summary: 'Answer the one clarifying question', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { content: { 'application/json': { schema: { type: 'object', properties: { field: { type: 'string' }, choice: { type: 'string' }, text: { type: 'string' } } } } } },
        responses: { '200': { description: '{draft} — re-resolved, re-validated, expiry refreshed' }, '404': { $ref: '#/components/responses/notFound' }, '422': { description: 'invalid clarification / choice mismatch' } },
      },
    },
    '/api/drafts/{id}/authorise': {
      post: {
        tags: ['pipeline'], summary: 'Device signature over the exact draft hash', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['tier', 'method', 'signature', 'deviceId'], properties: {
          tier: { type: 'string', enum: ['pin', 'biometric', 'biometric_oob'] }, method: { type: 'string' }, signature: { type: 'string' }, deviceId: { type: 'string' },
        } } } } },
        responses: {
          '200': { description: '{draft} — authorised' }, '403': { description: 'unsigned · tampered · wrong tier · unregistered device' },
          '404': { $ref: '#/components/responses/notFound' }, '409': { description: 'frozen/cancelled draft' }, '410': { description: 'expired draft' }, '423': { description: 'policy hold' },
        },
      },
    },
    '/api/drafts/{id}/cancel': {
      post: { tags: ['pipeline'], summary: 'Cancel a non-terminal draft', parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: '{draft}' }, '404': { $ref: '#/components/responses/notFound' }, '409': { description: 'already terminal' } } },
    },
    '/api/execute': {
      post: {
        tags: ['pipeline'], summary: 'Zero-trust gateway — ordered, idempotent execution',
        description: 'Verifies signature over exact draft, tier, device, expiry, idempotency. Steps run in order and halt on first failure. Receipt is a ledger read-back.',
        requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', required: ['draftId'], properties: { draftId: { type: 'string' } } } } } },
        responses: { '200': { description: '{execution, draft}' }, '403': { description: 'unsigned/tampered/wrong tier/unknown device' }, '404': { $ref: '#/components/responses/notFound' }, '410': { description: 'expired' } },
      },
    },
    '/api/tts': {
      post: { tags: ['pipeline'], summary: 'Text → audio ref (mock provider)', requestBody: { content: { 'application/json': { schema: { type: 'object', required: ['text'], properties: { text: { type: 'string' }, lang: { $ref: '#/components/schemas/Lang' } } } } } }, responses: { '200': { description: '{audioRef, provider}' } } },
    },
    '/api/audit/{conversationId}': {
      get: { tags: ['audit'], summary: 'Hash-chained audit entries + chain integrity', parameters: [{ name: 'conversationId', in: 'path', required: true, schema: { type: 'string' } }], responses: { '200': { description: '{entries, chainOk}' } } },
    },
    '/api/demo/seed': {
      post: { tags: ['demo'], summary: 'Reseed demo state', parameters: [{ name: 'X-Demo', in: 'header', required: true, schema: { type: 'string', enum: ['1'] } }], responses: { '200': { description: '{seeded:true}' }, '404': { description: 'without X-Demo: 1' } } },
    },
    '/api/demo/corrupt-draft': {
      post: { tags: ['demo'], summary: 'Tamper a ready draft → frozen (demo of VAL/gateway)', parameters: [{ name: 'X-Demo', in: 'header', required: true, schema: { type: 'string', enum: ['1'] } }], responses: { '200': { description: '{draft} frozen' }, '409': { description: 'no ready draft' } } },
    },
    '/api/demo/validator-timeout': {
      post: { tags: ['demo'], summary: 'Arm next validation to time out → freeze', parameters: [{ name: 'X-Demo', in: 'header', required: true, schema: { type: 'string', enum: ['1'] } }], responses: { '200': { description: '{armed:true}' } } },
    },
    '/api/demo/reset-velocity': {
      post: { tags: ['demo'], summary: 'Clear velocity counters', parameters: [{ name: 'X-Demo', in: 'header', required: true, schema: { type: 'string', enum: ['1'] } }], responses: { '200': { description: '{cleared:true}' } } },
    },
  },
  components: {
    schemas: {
      Lang: { type: 'string', enum: ['en', 'zh', 'ms', 'ta'], default: 'en' },
    },
    responses: {
      schemaInvalid: { description: '400 — schema-invalid request' },
      notFound: { description: '404 — unknown resource' },
      upstream: { description: '502 — upstream LLM/ASR/TTS error' },
    },
  },
};

export const DOCS_HTML = `<!doctype html><html><head>
<meta charset="utf-8"><title>digiVoice API</title>
<link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css">
<style>body{margin:0} .topbar{display:none}</style></head><body>
<div id="ui"></div>
<script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
<script>SwaggerUIBundle({url:'/api/openapi.json',dom_id:'#ui',deepLinking:true,tryItOutEnabled:true});</script>
</body></html>`;
