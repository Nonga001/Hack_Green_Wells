import 'dotenv/config';
import { connectToDatabase } from './config/db.js';
import app from './app.js';

const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const mongoUri = process.env.MONGODB_URI || '';

async function start() {
  try {
    await connectToDatabase(mongoUri);
    app.listen(port, () => {
      console.log(`✅ Server is running on http://localhost:${port}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
