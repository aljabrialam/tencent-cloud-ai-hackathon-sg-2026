// digiVoice agent service — local entrypoint. Routes live in app.ts so the
// same handler runs on plain node:http (dev) and Vercel serverless (prod).
import { createServer } from 'node:http';
import { handle } from './app.js';
import { drafter, validator, asr } from './llm/provider.js';

const PORT = +(process.env.PORT || 8787);
createServer(handle).listen(PORT, () =>
  console.log(`digiVoice service on http://localhost:${PORT} — drafter=${drafter().name} validator=${validator().name} asr=${asr().name} state=${process.env.STATE_FILE || '/tmp/digivoice-state.json'}`));
