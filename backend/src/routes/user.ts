import express, { type Response } from 'express';
import { User } from '../models/User.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { hashPassword, comparePassword } from '../utils/password.js';

const router = express.Router();

// Get current user's basic profile
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).lean();
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({ fullName: user.fullName || '', email: user.email, phoneNumber: user.phoneNumber, deliveryAddress: user.deliveryAddress || {} });
});

// Update phone and address
router.put('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const { phoneNumber, deliveryAddress } = req.body || {};
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (typeof phoneNumber === 'string') user.phoneNumber = phoneNumber;
  if (deliveryAddress && typeof deliveryAddress === 'object') {
    user.deliveryAddress = {
      addressLine: deliveryAddress.addressLine || user.deliveryAddress?.addressLine,
      city: deliveryAddress.city || user.deliveryAddress?.city,
      postalCode: deliveryAddress.postalCode || user.deliveryAddress?.postalCode,
    };
  }
  await user.save();
  return res.json({ ok: true });
});

// Change password
router.post('/me/change-password', requireAuth, async (req: AuthRequest, res: Response) => {
  const { currentPassword, newPassword } = req.body || {};
  if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Missing fields' });
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const ok = await comparePassword(currentPassword, user.passwordHash);
  if (!ok) return res.status(401).json({ message: 'Incorrect current password' });
  user.passwordHash = await hashPassword(newPassword);
  await user.save();
  return res.json({ ok: true });
});

export default router;


