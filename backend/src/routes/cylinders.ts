import express, { type Response } from 'express';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { Cylinder } from '../models/Cylinder.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';

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
  const { cylId, size, brand, price, refillPrice, manufactureDate, condition, status, owner, locationText, coords } = req.body || {};
  if (!cylId || !size || !brand) return res.status(400).json({ message: 'Missing fields' });
  try {
    const doc = await Cylinder.create({
      supplierId: String(supplier._id),
      cylId,
      size,
      brand,
      manufactureDate,
      price,
      refillPrice,
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
  const docs: any[] = await Cylinder.find({ supplierId: req.userId }).sort({ createdAt: -1 }).lean();
  // Enrich with current owner names for Agent/Customer and last known address
  try {
    const cylIds = Array.from(new Set(docs.map(d => String(d.cylId))));
    if (cylIds.length > 0) {
      const orders = await Order.find({ supplierId: req.userId, 'cylinder.id': { $in: cylIds } })
        .select('cylinder.id customerId assignedAgentId status type createdAt deliveredAt')
        .sort({ createdAt: -1 })
        .lean();
      const latestByCyl = new Map<string, any>();
      const latestActiveByCyl = new Map<string, any>();
      for (const o of orders) {
        const id = String((o as any)?.cylinder?.id || '');
        if (!id) continue;
        if (!latestByCyl.has(id)) latestByCyl.set(id, o);
        if (!latestActiveByCyl.has(id) && ['Pending','Approved','Assigned','In Transit','At Supplier'].includes((o as any).status)) {
          latestActiveByCyl.set(id, o);
        }
      }
      const customerIds = Array.from(new Set(Array.from(latestByCyl.values()).map((o: any) => String(o.customerId)).filter(Boolean)));
      const agentIds = Array.from(new Set(Array.from(latestByCyl.values()).map((o: any) => String(o.assignedAgentId)).filter(Boolean)));
      const [customers, agents, supplier] = await Promise.all([
        customerIds.length ? User.find({ _id: { $in: customerIds } }).select('fullName deliveryAddress').lean() : Promise.resolve([]),
        agentIds.length ? User.find({ _id: { $in: agentIds } }).select('fullName').lean() : Promise.resolve([]),
        User.findById(req.userId).select('businessAddress').lean(),
      ]);
      const customerNameById = new Map(customers.map((u: any) => [String(u._id), u.fullName]));
      const customerAddrById = new Map(customers.map((u: any) => [String(u._id), u.deliveryAddress || null]));
      const agentById = new Map(agents.map((u: any) => [String(u._id), u.fullName]));
      for (const d of docs) {
        const latest = latestByCyl.get(String(d.cylId));
        const latestActive = latestActiveByCyl.get(String(d.cylId));
        if (!latest) continue;
        // Prefer order-derived owner/status for active flows
        if (latestActive) {
          const st = String((latestActive as any).status);
          if (st === 'At Supplier') {
            // Active order is at supplier — reflect that the cylinder is held by the supplier but is in-store (Available)
            (d as any).owner = 'Supplier';
            (d as any).status = 'Available';
            // Persist corrective update if DB is out-of-sync (best-effort)
            try {
              // Only update if the stored doc doesn't already match
              await Cylinder.updateOne({ supplierId: String(d.supplierId || req.userId), cylId: d.cylId }, { $set: { owner: 'Supplier', status: 'Available' } });
            } catch (e) {
              // ignore
            }
          } else if (st === 'In Transit') {
            (d as any).owner = 'Agent';
            (d as any).status = 'In Transit';
          } else if (st === 'Delivered') {
            (d as any).owner = 'Customer';
            (d as any).status = 'Delivered';
          }
        } else {
          if (d.owner === 'Customer') {
            (d as any).ownerName = customerNameById.get(String((latest as any).customerId)) || null;
          } else if (d.owner === 'Agent') {
            (d as any).ownerName = agentById.get(String((latest as any).assignedAgentId)) || null;
          }
        }
        // Attach last transaction type/status and current active type/status (if any) for UI badge
        (d as any).lastType = (latest as any)?.type === 'refill' ? 'refill' : 'order';
        (d as any).lastStatus = (latest as any)?.status || null;
        if (latestActive) {
          (d as any).currentActiveType = (latestActive as any).type === 'refill' ? 'refill' : 'order';
          (d as any).currentActiveStatus = (latestActive as any).status || null;
          (d as any).currentActiveOrderId = String((latestActive as any)._id || '');
        } else {
          (d as any).currentActiveStatus = null;
          (d as any).currentActiveOrderId = null;
        }
        // Derive last known address text: supplier business area before pickup, customer address for in-transit/delivered
        const formatAddr = (addr: any) => {
          if (!addr) return null;
          const a = [addr.addressLine, addr.city, addr.postalCode].filter(Boolean).join(', ');
          return a || null;
        };
        let lastAddressText: string | null = null;
        if (latestActive) {
          const st = String((latestActive as any).status);
          if (st === 'Assigned') {
            lastAddressText = String((supplier as any)?.businessAddress || '') || null;
          } else if (st === 'In Transit') {
            const ca = customerAddrById.get(String((latestActive as any).customerId)) || null;
            const fa = formatAddr(ca);
            lastAddressText = fa ? `To: ${fa}` : 'En route';
          }
        } else if (String((latest as any).status) === 'Delivered') {
          const ca = customerAddrById.get(String((latest as any).customerId)) || null;
          lastAddressText = formatAddr(ca);
        }
        if (lastAddressText) (d as any).lastAddressText = lastAddressText;
      }
    }
  } catch {
    // best-effort enrichment; ignore failures
  }
  return res.json(docs);
});

// Customer: list cylinders owned by the customer (based on delivered orders)
router.get('/customer', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'customer') return res.status(403).json({ message: 'Forbidden' });
  // Find delivered orders for this customer, latest first
  const orders = await Order.find({ customerId: req.userId, status: 'Delivered' })
    .select('supplierId cylinder createdAt')
    .sort({ createdAt: -1 })
    .lean();
  // Unique by supplierId + cylinder.id to avoid duplicates
  const seen = new Set<string>();
  const pairs: { supplierId: string; cylId: string }[] = [];
  for (const o of orders) {
    const cylId = (o as any)?.cylinder?.id;
    const supplierId = String((o as any)?.supplierId || '');
    if (!cylId || !supplierId) continue;
    const key = `${supplierId}::${cylId}`;
    if (seen.has(key)) continue;
    seen.add(key);
    pairs.push({ supplierId, cylId });
  }
  if (pairs.length === 0) return res.json([]);
  // Query cylinders for these pairs to get size, brand, refillPrice
  const bySupplier = new Map<string, string[]>();
  for (const p of pairs) {
    bySupplier.set(p.supplierId, [...(bySupplier.get(p.supplierId) || []), p.cylId]);
  }
  const results: any[] = [];
  for (const [supplierId, ids] of bySupplier) {
    const docs = await Cylinder.find({ supplierId, cylId: { $in: ids } })
      .select('cylId size brand refillPrice supplierId')
      .lean();
    results.push(...docs.map((d: any) => ({
      cylId: d.cylId,
      size: d.size,
      brand: d.brand,
      refillPrice: typeof d.refillPrice === 'number' ? d.refillPrice : null,
      supplierId: String(d.supplierId),
    })));
  }
  return res.json(results);
});

// Customer: report cylinder lost/stolen
router.post('/report', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'customer') return res.status(403).json({ message: 'Forbidden' });
  const { supplierId, cylId, reason } = req.body || {};
  if (!supplierId || !cylId) return res.status(400).json({ message: 'supplierId and cylId are required' });
  try {
    // verify customer owns this cylinder via a delivered order
    const owned = await Order.findOne({ supplierId, customerId: req.userId, 'cylinder.id': cylId, status: 'Delivered' }).sort({ deliveredAt: -1 }).lean();
    if (!owned) return res.status(403).json({ message: 'You do not own this cylinder' });
    const cyl = await Cylinder.findOne({ supplierId, cylId });
    if (!cyl) return res.status(404).json({ message: 'Cylinder not found' });
    cyl.status = 'Lost';
    // keep owner as Customer but mark reported
    (cyl as any).reportedLostBy = String(req.userId);
    (cyl as any).reportedLostAt = new Date();
    (cyl as any).reportedLostReason = reason || null;
    await cyl.save();
    return res.json({ ok: true });
  } catch (e) {
    console.error('report cylinder failed', e);
    return res.status(500).json({ message: 'Failed to report cylinder' });
  }
});

// Update cylinder fields (price/status)
router.patch('/:cylId', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'supplier') return res.status(403).json({ message: 'Forbidden' });
  const { cylId } = req.params;
  const doc = await Cylinder.findOne({ supplierId: req.userId, cylId });
  if (!doc) return res.status(404).json({ message: 'Cylinder not found' });
  // Rules: when Booked -> no edits; when Delivered -> only refillPrice can be updated; otherwise normal
  const isBooked = doc.status === 'Booked';
  const isDelivered = doc.status === 'Delivered';
  if (isBooked) {
    return res.status(400).json({ message: 'This cylinder cannot be edited while Booked' });
  }
  const updates: any = {};
  if (isDelivered) {
    if (typeof req.body.refillPrice === 'number') updates.refillPrice = req.body.refillPrice;
    // Prevent other updates when delivered
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: 'Only refillPrice can be updated for delivered cylinders' });
    }
  } else {
    if (typeof req.body.price === 'number') updates.price = req.body.price;
    if (typeof req.body.refillPrice === 'number') updates.refillPrice = req.body.refillPrice;
    if (typeof req.body.status === 'string') updates.status = req.body.status;
  }
  await Cylinder.updateOne({ _id: doc._id }, { $set: updates });
  return res.json({ ok: true });
});

export default router;


