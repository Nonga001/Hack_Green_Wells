import express, { type Response } from 'express';
import { User } from '../models/User.js';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { hashPassword, comparePassword } from '../utils/password.js';

const router = express.Router();

// Get current user's basic profile
router.get('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const user = await User.findById(req.userId).lean();
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json({
    role: user.role,
    fullName: user.fullName || user.contactPersonName || '',
    businessName: user.businessName || '',
    email: user.email,
    phoneNumber: user.phoneNumber,
    deliveryAddress: user.deliveryAddress || {},
    businessAddress: user.businessAddress || '',
    businessLat: user.businessLat,
    businessLon: user.businessLon,
    availability: user.availability || false,
    agentLat: user.agentLat,
    agentLon: user.agentLon,
  });
});

// Update phone and address
router.put('/me', requireAuth, async (req: AuthRequest, res: Response) => {
  const { phoneNumber, deliveryAddress, businessAddress, businessLat, businessLon, availability, agentLat, agentLon } = req.body || {};
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
  if (user.role === 'supplier') {
    if (typeof businessAddress === 'string') user.businessAddress = businessAddress;
    if (typeof businessLat === 'number') user.businessLat = businessLat;
    if (typeof businessLon === 'number') user.businessLon = businessLon;
  }
  if (user.role === 'agent') {
    if (typeof availability === 'boolean') user.availability = availability;
    if (typeof agentLat === 'number') user.agentLat = agentLat;
    if (typeof agentLon === 'number') user.agentLon = agentLon;
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


