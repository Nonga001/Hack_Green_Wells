import mongoose from 'mongoose';

export async function connectToDatabase(uri: string): Promise<void> {
  if (!uri) {
    throw new Error('Missing MONGODB_URI');
  }
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri);
  console.log('✅ Database connected successfully');
}
