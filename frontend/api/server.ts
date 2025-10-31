import serverless from 'serverless-http';
import mongoose from 'mongoose';
import app from '../../backend/src/app';

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

const handler = async (req: any, res: any) => {
  await connect();
  const fn = serverless(app as any);
  return fn(req, res);
};

export default handler;
