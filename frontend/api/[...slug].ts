import handler from './server';

// Re-export the same handler as a catch-all so Vercel routes any /api/* path
// to our Express app. This ensures endpoints like /api/auth/login work.
export default handler;
