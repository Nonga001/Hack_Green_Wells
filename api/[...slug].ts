import handler from '../frontend/api/server';

// Root-level catch-all API route so Vercel (when project root = repository root)
// will route any /api/* requests to the existing serverless Express handler
// that lives under `frontend/api/server.ts`.
export default handler;
