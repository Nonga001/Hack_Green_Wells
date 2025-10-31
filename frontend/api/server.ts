import serverless from 'serverless-http';
import mongoose from 'mongoose';

// Reuse mongoose connection across lambda invocations
declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var __mongoClientPromise: any | undefined;
}

async function connect() {
  if (!process.env.MONGODB_URI) {
    console.warn('MONGODB_URI not set in environment; API requests may fail');
  }
  if (global.__mongoClientPromise) return global.__mongoClientPromise;
  const p = mongoose.connect(process.env.MONGODB_URI || '');
  global.__mongoClientPromise = p;
  try {
    await p;
    return p;
  } catch (e) {
    global.__mongoClientPromise = undefined;
    throw e;
  }
}

// Dynamically resolve the Express app. When deploying with project root = frontend
// we copy the backend into `frontend/backend` during build; otherwise the
// backend lives at `../../backend`. Try both locations so the same handler
// works in both setups.
let resolvedApp: any | null = null;
async function resolveApp() {
  if (resolvedApp) return resolvedApp;
  const tryPaths = ['../../backend/src/app', '../backend/src/app'];
  for (const p of tryPaths) {
    try {
      // dynamic import so the path is resolved at runtime
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      // @ts-ignore
      const mod = await import(p);
      resolvedApp = mod.default || mod;
      return resolvedApp;
    } catch (err) {
      // try next
    }
  }
  throw new Error('Could not resolve backend app module from expected paths');
}

const handler = async (req: any, res: any) => {
  await connect();
  const app = await resolveApp();
  const fn = serverless(app as any);
  return fn(req, res);
};

export default handler;
