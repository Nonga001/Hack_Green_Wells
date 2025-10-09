import express, { type Response } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { Cylinder } from '../models/Cylinder.js';
import { User } from '../models/User.js';

const router = express.Router();

// Public: list available cylinders for a supplier (New & Available)
router.get('/available', async (req, res) => {
  const supplierId = String(req.query.supplierId || '');
  if (!supplierId) return res.status(400).json({ message: 'supplierId required' });
  const docs = await Cylinder.find({ supplierId, status: 'Available', condition: 'New' })
    .select('cylId size brand price coords')
    .lean();
  return res.json(docs.map((d: any) => ({
    cylId: d.cylId,
    size: d.size,
    brand: d.brand,
    price: d.price || 0,
    coords: d.coords || null,
  })));
});

// Create cylinder (supplier only)
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'supplier') return res.status(403).json({ message: 'Forbidden' });
  const supplier = await User.findById(req.userId);
  if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
  const { cylId, size, brand, price, manufactureDate, condition, status, owner, locationText, coords } = req.body || {};
  if (!cylId || !size || !brand) return res.status(400).json({ message: 'Missing fields' });
  try {
    const doc = await Cylinder.create({
      supplierId: String(supplier._id),
      cylId,
      size,
      brand,
      manufactureDate,
      price,
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

// Update cylinder fields (price/status)
router.patch('/:cylId', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'supplier') return res.status(403).json({ message: 'Forbidden' });
  const { cylId } = req.params;
  const doc = await Cylinder.findOne({ supplierId: req.userId, cylId });
  if (!doc) return res.status(404).json({ message: 'Cylinder not found' });
  // Disallow edits when booked or delivered
  if (doc.status === 'Booked' || doc.status === 'Delivered') {
    return res.status(400).json({ message: 'This cylinder cannot be edited in its current status' });
  }
  const updates: any = {};
  if (typeof req.body.price === 'number') updates.price = req.body.price;
  if (typeof req.body.status === 'string') updates.status = req.body.status;
  await Cylinder.updateOne({ _id: doc._id }, { $set: updates });
  return res.json({ ok: true });
});

export default router;


