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

// Supplier: list available agents sorted by distance to supplier
router.get('/agents/available', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'supplier') return res.status(403).json({ message: 'Forbidden' });
  const supplier = await User.findById(req.userId).lean();
  if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
  const agents = await User.find({ role: 'agent', availability: true }).select('fullName phoneNumber agentLat agentLon').lean();
  function distKm(a: any, b: any) {
    if (typeof a?.businessLat !== 'number' || typeof a?.businessLon !== 'number' || typeof b?.agentLat !== 'number' || typeof b?.agentLon !== 'number') return Number.POSITIVE_INFINITY;
    const R = 6371;
    const toRad = (x:number)=> x*Math.PI/180;
    const dLat = toRad(b.agentLat - a.businessLat);
    const dLon = toRad(b.agentLon - a.businessLon);
    const lat1 = toRad(a.businessLat), lat2 = toRad(b.agentLat);
    const x = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
    return 2 * R * Math.asin(Math.sqrt(x));
  }
  const enriched = (agents || []).map((ag: any) => ({ id: String(ag._id), name: ag.fullName || null, phone: ag.phoneNumber || null, lat: ag.agentLat, lon: ag.agentLon, distanceKm: distKm(supplier, ag) }))
    .sort((a,b)=> (a.distanceKm - b.distanceKm));
  return res.json(enriched);
});

// Supplier assigns an agent (order must be Approved)
router.post('/:orderId/assign-agent', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'supplier') return res.status(403).json({ message: 'Forbidden' });
  const { orderId } = req.params;
  const { agentId } = req.body || {};
  if (!agentId) return res.status(400).json({ message: 'agentId required' });
  const order = await Order.findOne({ _id: orderId, supplierId: req.userId });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.status !== 'Approved') return res.status(400).json({ message: 'Order must be Approved to assign agent' });
  order.assignedAgentId = agentId;
  order.status = 'In Transit';
  await order.save();
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


