import express, { type Response } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { Cylinder } from '../models/Cylinder.js';
import { User } from '../models/User.js';

const router = express.Router();

// Create cylinder (supplier only)
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'supplier') return res.status(403).json({ message: 'Forbidden' });
  const supplier = await User.findById(req.userId);
  if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
  const { cylId, size, brand, manufactureDate, condition, status, owner, locationText, coords } = req.body || {};
  if (!cylId || !size || !brand) return res.status(400).json({ message: 'Missing fields' });
  try {
    const doc = await Cylinder.create({
      supplierId: String(supplier._id),
      cylId,
      size,
      brand,
      manufactureDate,
      condition,
      status: status || 'Available',
      owner: owner || 'Supplier',
      locationText,
      coords: coords || null,
    });
    return res.status(201).json({ id: doc.cylId });
  } catch (e: any) {
    if (e.code === 11000) {
      return res.status(409).json({ message: 'Cylinder ID already exists for this supplier' });
    }
    return res.status(500).json({ message: 'Failed to create cylinder' });
  }
});

// List cylinders for supplier
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'supplier') return res.status(403).json({ message: 'Forbidden' });
  const docs = await Cylinder.find({ supplierId: req.userId }).sort({ createdAt: -1 }).lean();
  return res.json(docs);
});

export default router;


