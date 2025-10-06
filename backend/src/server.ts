import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { connectToDatabase } from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import cylinderRoutes from './routes/cylinders.js';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
const origin = process.env.CORS_ORIGIN || '*';
const mongoUri = process.env.MONGODB_URI || '';

app.use(cors({ origin }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/cylinders', cylinderRoutes);

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
