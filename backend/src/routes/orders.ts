import express, { type Response } from 'express';
import crypto from 'crypto';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { Order } from '../models/Order.js';
import { Cylinder } from '../models/Cylinder.js';
import { User } from '../models/User.js';

const router = express.Router();

// Customer creates order
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'customer') return res.status(403).json({ message: 'Forbidden' });
  const { supplierId, cylinder, delivery, total, notes, type } = req.body || {};
  if (!supplierId || !cylinder?.size || !cylinder?.brand || !delivery?.date || typeof total !== 'number') return res.status(400).json({ message: 'Missing fields' });
  const customer = await User.findById(req.userId);
  if (!customer) return res.status(404).json({ message: 'Customer not found' });
  let isRefill = String(type) === 'refill';
  // If a specific cylinder id is provided
  if (cylinder?.id) {
    if (isRefill) {
      // Refill: do NOT change cylinder status; optionally inherit refillPrice
      const cylDoc = await Cylinder.findOne({ supplierId, cylId: cylinder.id }).lean();
      if (!cylDoc) return res.status(404).json({ message: 'Cylinder not found for refill' });
      if (typeof cylinder.price !== 'number') {
        const rp = (cylDoc as any).refillPrice;
        if (typeof rp === 'number') cylinder.price = rp;
      }
    } else {
      // Normal order: attempt to book (Available -> Booked)
      const booked = await Cylinder.findOneAndUpdate(
        { supplierId, cylId: cylinder.id, status: 'Available' },
        { $set: { status: 'Booked' } },
        { new: true }
      );
      if (!booked) {
        // Fallback: allow refill if the customer owns a delivered cylinder with this id
        const cylDoc = await Cylinder.findOne({ supplierId, cylId: cylinder.id }).lean();
        if (cylDoc && (cylDoc as any).status === 'Delivered') {
          const owned = await Order.findOne({ customerId: req.userId, supplierId, status: 'Delivered', 'cylinder.id': cylinder.id }).sort({ deliveredAt: -1 }).lean();
          if (owned) {
            const rp = (cylDoc as any).refillPrice;
            if (typeof cylinder.price !== 'number' && typeof rp === 'number') cylinder.price = rp;
            // treat as refill, continue without changing cylinder status
            isRefill = true;
          } else {
            return res.status(409).json({ message: 'Selected cylinder is no longer available' });
          }
        } else {
          return res.status(409).json({ message: 'Selected cylinder is no longer available' });
        }
      }
      // If price wasn't included, inherit from cylinder
      if (typeof cylinder.price !== 'number' && typeof (booked as any).price === 'number') {
        cylinder.price = (booked as any).price;
      }
    }
  }
  const doc = await Order.create({ customerId: String(customer._id), supplierId, cylinder, delivery, type: isRefill ? 'refill' : 'order', total, notes });
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
  const agents = await User.find({ role: 'agent' }).select('fullName phoneNumber agentLat agentLon availability').lean();
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
  const enriched = (agents || []).map((ag: any) => ({ id: String(ag._id), name: ag.fullName || null, phone: ag.phoneNumber || null, lat: ag.agentLat, lon: ag.agentLon, availability: !!ag.availability, distanceKm: distKm(supplier, ag) }))
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
  order.status = 'Assigned';
  // generate OTP (6 digits, 20 min expiry)
  const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
  (order as any).otpHash = crypto.createHash('sha256').update(otp).digest('hex');
  (order as any).otpExpiresAt = new Date(Date.now() + 20 * 60 * 1000);
  await order.save();
  return res.json({ ok: true });
});

// Agent: get assigned orders
router.get('/agent', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'agent') return res.status(403).json({ message: 'Forbidden' });
  const docs = await Order.find({ assignedAgentId: req.userId, status: { $in: ['Assigned', 'In Transit'] } }).sort({ createdAt: -1 }).lean();
  return res.json(docs);
});

// Agent: accept/decline assignment
router.post('/:orderId/agent-response', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'agent') return res.status(403).json({ message: 'Forbidden' });
  const { orderId } = req.params;
  const { accept, lat, lon } = req.body || {};
  const order = await Order.findOne({ _id: orderId, assignedAgentId: req.userId });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.status !== 'Assigned') return res.status(400).json({ message: 'Order is not awaiting agent confirmation' });
  if (accept) {
    // Stay in Assigned on accept; transition to In Transit happens on /pickup
    await order.save();
  } else {
    order.assignedAgentId = undefined;
    order.status = 'Approved';
    await order.save();
  }
  return res.json({ ok: true });
});

// Customer: generate an OTP for delivery confirmation
router.post('/:orderId/issue-otp', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'customer') return res.status(403).json({ message: 'Forbidden' });
  const { orderId } = req.params;
  const order = await Order.findOne({ _id: orderId, customerId: req.userId });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (!['Assigned', 'In Transit'].includes(order.status)) return res.status(400).json({ message: 'OTP is only available when order is Assigned or In Transit' });
  const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
  (order as any).otpHash = crypto.createHash('sha256').update(otp).digest('hex');
  (order as any).otpExpiresAt = new Date(Date.now() + 20 * 60 * 1000);
  await order.save();
  return res.json({ otp, expiresInMinutes: 20 });
});

// Agent pickup: verify cylinder scan, transition to In Transit
router.post('/:orderId/pickup', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'agent') return res.status(403).json({ message: 'Forbidden' });
  const { orderId } = req.params;
  const { scanCylId, lat, lon } = req.body || {};
  const order = await Order.findOne({ _id: orderId, assignedAgentId: req.userId });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.status !== 'Assigned') return res.status(400).json({ message: 'Order not ready for pickup' });
  if (!scanCylId || scanCylId !== (order as any).cylinder?.id) return res.status(400).json({ message: 'Cylinder ID mismatch' });
  (order as any).status = 'In Transit';
  (order as any).pickupAt = new Date();
  if (typeof lat === 'number' && typeof lon === 'number') (order as any).pickupCoords = { lat, lon };
  await order.save();
  if ((order as any).cylinder?.id) {
    await Cylinder.findOneAndUpdate({ supplierId: (order as any).supplierId, cylId: (order as any).cylinder.id }, { $set: { status: 'In Transit', owner: 'Agent', coords: (typeof lat==='number' && typeof lon==='number') ? { lat, lon } : undefined } });
  }
  return res.json({ ok: true });
});

// Agent deliver: verify OTP or customer QR, mark Delivered
router.post('/:orderId/deliver', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'agent') return res.status(403).json({ message: 'Forbidden' });
  const { orderId } = req.params;
  const { otp, customerQrPayload, lat, lon } = req.body || {};
  const order = await Order.findOne({ _id: orderId, assignedAgentId: req.userId });
  if (!order) return res.status(404).json({ message: 'Order not found' });
  if (order.status !== 'In Transit') return res.status(400).json({ message: 'Order not in transit' });
  let ok = false;
  if (otp && (order as any).otpHash && (order as any).otpExpiresAt && (order as any).otpExpiresAt > new Date()) {
    const hash = crypto.createHash('sha256').update(String(otp)).digest('hex');
    ok = hash === (order as any).otpHash;
  }
  // basic QR fallback: accept if matches order id and cyl id
  if (!ok && customerQrPayload && typeof customerQrPayload === 'object') {
    ok = customerQrPayload.orderId === String((order as any)._id) && customerQrPayload.cylId === (order as any).cylinder?.id;
  }
  if (!ok) return res.status(400).json({ message: 'Verification failed' });
  (order as any).status = 'Delivered';
  (order as any).deliveredAt = new Date();
  if (typeof lat === 'number' && typeof lon === 'number') (order as any).deliveryCoords = { lat, lon };
  // clear OTP
  (order as any).otpHash = undefined;
  (order as any).otpExpiresAt = undefined;
  await order.save();
  if ((order as any).cylinder?.id) {
    await Cylinder.findOneAndUpdate({ supplierId: (order as any).supplierId, cylId: (order as any).cylinder.id }, { $set: { status: 'Delivered', owner: 'Customer', coords: (typeof lat==='number' && typeof lon==='number') ? { lat, lon } : undefined } });
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
  const deliveredAt = (doc as any).deliveredAt ? new Date((doc as any).deliveredAt).toISOString() : null;
  const lines = [
    `Order Placed: ${time}`,
    `Type: ${String((doc as any).type || 'order').toUpperCase()}`,
    `Cylinder ID: ${cylId}`,
    `Total Price: KES ${total.toLocaleString()}`,
    deliveredAt ? `Delivered On: ${deliveredAt}` : `Delivered On: -`,
  ];
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  return res.send(lines.join('\n'));
});


