import express, { type Response } from 'express';
import { User } from '../models/User.js';
import { requireAuth } from '../middleware/auth.js';
import type { AuthRequest } from '../middleware/auth.js';
import Loyalty from '../models/Loyalty.js';
import LoyaltyRedemption from '../models/LoyaltyRedemption.js';
import { Order } from '../models/Order.js';
import crypto from 'crypto';

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

// Get or initialize loyalty config for the authenticated supplier
router.get('/me/loyalty', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'supplier') return res.status(403).json({ message: 'Forbidden' });
  const supplierId = req.userId as string;
  let cfg = await Loyalty.findOne({ supplierId });
  if (!cfg) {
    // create an empty config with sensible defaults
    cfg = await Loyalty.create({ supplierId, rules: [], pointsDivisor: 10, tiers: [] });
  }
  return res.json(cfg);
});

// Replace loyalty config for supplier
router.put('/me/loyalty', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'supplier') return res.status(403).json({ message: 'Forbidden' });
  const supplierId = req.userId as string;
  const payload = req.body || {};
  // Expect payload.rules as an array; ensure each has id
  const rules = Array.isArray(payload.rules) ? payload.rules.map((r:any) => ({ ...r, id: r.id || crypto.randomUUID(), active: !!r.active })) : [];
  const pointsDivisor = typeof payload.pointsDivisor === 'number' && payload.pointsDivisor > 0 ? Number(payload.pointsDivisor) : 10;
  const tiers = Array.isArray(payload.tiers) ? payload.tiers.map((t:any) => ({ id: t.id || crypto.randomUUID(), name: t.name || '', minPoints: Number(t.minPoints)||0, benefitType: t.benefitType || 'percent_off', benefitValue: t.benefitValue })) : [];
  const updated = await Loyalty.findOneAndUpdate({ supplierId }, { $set: { rules, pointsDivisor, tiers } }, { upsert: true, new: true });
  return res.json(updated);
});

// List redemptions for this supplier
router.get('/me/loyalty/redemptions', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'supplier') return res.status(403).json({ message: 'Forbidden' });
  const supplierId = req.userId as string;
  const rows = await LoyaltyRedemption.find({ supplierId }).sort({ createdAt: -1 }).lean();
  return res.json(rows);
});

// Approve a redemption (supplier action)
router.post('/me/loyalty/redemptions/:id/approve', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'supplier') return res.status(403).json({ message: 'Forbidden' });
  const supplierId = req.userId as string;
  const id = req.params.id;
  const r = await LoyaltyRedemption.findOne({ _id: id, supplierId });
  if (!r) return res.status(404).json({ message: 'Not found' });
  r.status = 'approved';
  r.processedAt = new Date();
  r.processedBy = supplierId;
  await r.save();
  return res.json(r);
});

// Reject a redemption (supplier action)
router.post('/me/loyalty/redemptions/:id/reject', requireAuth, async (req: AuthRequest, res: Response) => {
  if (req.role !== 'supplier') return res.status(403).json({ message: 'Forbidden' });
  const supplierId = req.userId as string;
  const id = req.params.id;
  const r = await LoyaltyRedemption.findOne({ _id: id, supplierId });
  if (!r) return res.status(404).json({ message: 'Not found' });
  r.status = 'rejected';
  r.processedAt = new Date();
  r.processedBy = supplierId;
  await r.save();
  return res.json(r);
});

// Create a redemption request (customer or supplier can call). Validates eligibility.
router.post('/me/loyalty/redemptions', requireAuth, async (req: AuthRequest, res: Response) => {
  // allow a supplier to create for a customer, or a customer to request redemption
  const supplierId = req.role === 'supplier' ? req.userId as string : req.body.supplierId;
  if (!supplierId) return res.status(400).json({ message: 'Missing supplierId' });
  const customerId = req.body.customerId || req.userId;
  if (!customerId) return res.status(400).json({ message: 'Missing customerId' });
  const ruleId = req.body.ruleId;
  if (!ruleId) return res.status(400).json({ message: 'Missing ruleId' });
  const orderId = req.body.orderId;

  const cfg = await Loyalty.findOne({ supplierId }).lean();
  if (!cfg) return res.status(404).json({ message: 'No loyalty configured' });
  const rule = (cfg.rules || []).find((r:any) => r.id === ruleId && r.active);
  if (!rule) return res.status(404).json({ message: 'Rule not found or inactive' });

  // Determine customer's count of events based on trigger
  let count = 0;
  if (rule.triggerType === 'nth_order') {
    count = await Order.countDocuments({ supplierId, customerId });
  } else if (rule.triggerType === 'nth_refill') {
    count = await Order.countDocuments({ supplierId, customerId, type: 'refill' });
  }
  // count is historical orders; redemption is eligible when count >= (nth - 1)
  const eligible = count + 1 >= rule.nth;

  const red = await LoyaltyRedemption.create({ supplierId, customerId, orderId, ruleId, eligible, status: eligible ? 'pending' : 'rejected' });
  return res.json(red);
});

export default router;


