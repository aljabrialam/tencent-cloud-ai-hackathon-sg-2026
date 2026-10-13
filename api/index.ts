// Vercel serverless entry — repo-root deployment so the function can reach
// packages/shared. vercel.json rewrites every path here; the original path
// arrives in the x-matched-path header, which the router uses.
import type { IncomingMessage, ServerResponse } from 'node:http';
import { handle } from '../apps/service/src/app.js';

export default async function (req: IncomingMessage, res: ServerResponse) {
  const orig = req.headers['x-matched-path'];
  if (typeof orig === 'string' && orig) req.url = orig;
  return handle(req, res);
}
