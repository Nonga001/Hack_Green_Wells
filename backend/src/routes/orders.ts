import express, { type Response } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { Order } from '../models/Order.js';
import { Cylinder } from '../models/Cylinder.js';
import { User } from '../models/User.js';

const router = express.Router();

// Customer creates order
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'customer') return res.status(403).json({ message: 'Forbidden' });
  const { supplierId, cylinder, delivery, total, notes } = req.body || {};
  if (!supplierId || !cylinder?.size || !cylinder?.brand || !delivery?.date || typeof total !== 'number') return res.status(400).json({ message: 'Missing fields' });
  const customer = await User.findById(req.userId);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  // If a specific cylinder id is provided, attempt to book it (transition from Available -> Booked)
  if (cylinder?.id) {
    const booked = await Cylinder.findOneAndUpdate(
      { supplierId, cylId: cylinder.id, status: 'Available' },
      { $set: { status: 'Booked' } },
      { new: true }
    );
    if (!booked) return res.status(409).json({ message: 'Selected cylinder is no longer available' });
    // If price wasn't included, inherit from cylinder
    if (typeof cylinder.price !== 'number' && typeof (booked as any).price === 'number') {
      cylinder.price = (booked as any).price;
    }
  }
  const doc = await Order.create({ customerId: String(customer._id), supplierId, cylinder, delivery, total, notes });
  return res.status(201).json({ id: String(doc._id) });
});

// Supplier list orders
router.get('/supplier', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'supplier') return res.status(403).json({ message: 'Forbidden' });
  const docs = await Order.find({ supplierId: req.userId }).sort({ createdAt: -1 }).lean();
  const customerIds = Array.from(new Set((docs || []).map(d => String(d.customerId))));
  const customers = await User.find({ _id: { $in: customerIds } }).select('fullName phoneNumber').lean();
  const customerById = new Map(customers.map((u: any) => [String(u._id), u]));
  const enriched = docs.map((d: any) => ({
    ...d,
    customer: {
      name: customerById.get(String(d.customerId))?.fullName || null,
      phone: customerById.get(String(d.customerId))?.phoneNumber || null,
    },
  }));
  return res.json(enriched);
});

// Customer list orders
router.get('/customer', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'customer') return res.status(403).json({ message: 'Forbidden' });
  const docs = await Order.find({ customerId: req.userId }).sort({ createdAt: -1 }).lean();
  const supplierIds = Array.from(new Set((docs || []).map(d => String(d.supplierId))));
  const suppliers = await User.find({ _id: { $in: supplierIds } }).select('businessName phoneNumber').lean();
  const supplierById = new Map(suppliers.map((u: any) => [String(u._id), u]));
  const enriched = docs.map((d: any) => ({
    ...d,
    supplier: {
      name: supplierById.get(String(d.supplierId))?.businessName || null,
      phone: supplierById.get(String(d.supplierId))?.phoneNumber || null,
    },
  }));
  return res.json(enriched);
});

// Supplier update status or assign agent
router.patch('/:orderId', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'supplier') return res.status(403).json({ message: 'Forbidden' });
  const { orderId } = req.params;
  const updates: any = {};
  if (typeof req.body.status === 'string') updates.status = req.body.status;
  if (typeof req.body.assignedAgentId === 'string') updates.assignedAgentId = req.body.assignedAgentId;
  const doc = await Order.findOneAndUpdate({ _id: orderId, supplierId: req.userId }, { $set: updates }, { new: true });
  if (!doc) return res.status(404).json({ message: 'Order not found' });
  // If rejected, release booked cylinder
  if (updates.status === 'Rejected' && doc.cylinder?.id) {
    await Cylinder.findOneAndUpdate({ supplierId: req.userId, cylId: doc.cylinder.id, status: 'Booked' }, { $set: { status: 'Available' } });
  }
  return res.json({ ok: true });
});

export default router;

// Simple invoice: time, cylinder id, total price
router.get('/:orderId/invoice', requireAuth, async (req: AuthRequest, res: Response) => {
  const { orderId } = req.params;
  const doc = await Order.findById(orderId).lean();
  if (!doc) return res.status(404).json({ message: 'Order not found' });
  // Allow only owner customer or supplier
  const requesterId = String(req.userId);
  const isOwner = requesterId === String(doc.customerId) || requesterId === String(doc.supplierId);
  if (!isOwner) return res.status(403).json({ message: 'Forbidden' });
  const time = (doc as any).createdAt ? new Date((doc as any).createdAt).toISOString() : new Date().toISOString();
  const cylId = (doc as any).cylinder?.id || '-';
  const total = Number((doc as any).total || 0);
  const lines = [
    `Time: ${time}`,
    `Cylinder ID: ${cylId}`,
    `Total Price: KES ${total.toLocaleString()}`,
  ];
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  return res.send(lines.join('\n'));
});


