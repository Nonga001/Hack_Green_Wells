import express, { type Response } from 'express';
import { User } from '../models/User.js';

const router = express.Router();

// Public: list suppliers (basic info)
router.get('/', async (_req, res: Response) => {
  const suppliers = await User.find({ role: 'supplier' }).select('businessName contactPersonName phoneNumber businessAddress businessLat businessLon').lean();
  const mapped = suppliers.map((s: any) => ({
    id: String(s._id),
    name: s.businessName || s.contactPersonName || 'Supplier',
    phone: s.phoneNumber || '',
    businessAddress: s.businessAddress || '',
    coords: (typeof s.businessLat==='number' && typeof s.businessLon==='number') ? { lat: s.businessLat, lon: s.businessLon } : null,
  }));
  return res.json(mapped);
});

export default router;


