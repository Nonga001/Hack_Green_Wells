import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import cylinderRoutes from './routes/cylinders.js';
import orderRoutes from './routes/orders.js';
import suppliersRoutes from './routes/suppliers.js';
import adminRoutes from './routes/admin.js';

const app = express();

const allowedOrigin = process.env.CORS_ORIGIN || 'https://hack-green-wells.vercel.app/';

app.use(cors({ 
  origin: allowedOrigin,
  credentials: true

 }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/cylinders', cylinderRoutes);
app.use('/orders', orderRoutes);
app.use('/suppliers', suppliersRoutes);
app.use('/admin', adminRoutes);

export default app;
