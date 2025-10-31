import type { VercelRequest, VercelResponse } from '@vercel/node';
import mongoose from 'mongoose';
import app from '../backend/src/app';

// Connection reuse for serverless environments
async function connect() {
  if ((global as any)._mongo && (global as any)._mongo.conn) {
    return (global as any)._mongo.conn;
  }
  if (!(global as any)._mongo) (global as any)._mongo = {};
  if (!(global as any)._mongo.promise) {
    if (!process.env.MONGODB_URI) throw new Error('Missing MONGODB_URI');
    (global as any)._mongo.promise = mongoose.connect(process.env.MONGODB_URI).then(m => m.connection);
  }
  (global as any)._mongo.conn = await (global as any)._mongo.promise;
  return (global as any)._mongo.conn;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    await connect();
  } catch (e:any) {
    console.error('DB connect error', e?.message || e);
    res.status(500).json({ message: 'Database connection error' });
    return;
  }
  // Delegate to the Express app
  return app(req as any, res as any);
}
