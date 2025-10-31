import mongoose from 'mongoose';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

import { User } from '../models/User.js';
import { Cylinder } from '../models/Cylinder.js';
import { Order } from '../models/Order.js';
import { syncCylinderFromOrder } from '../utils/syncCylinder.js';

async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/green-wells';
  console.log('Connecting to', uri);
  await mongoose.connect(uri);
  try {
    // create test users
    const supplier = await User.create({ role: 'supplier', businessName: 'Test Supplier', phoneNumber: '0700000000' } as any);
    const customer = await User.create({ role: 'customer', fullName: 'Test Customer', phoneNumber: '0711111111' } as any);
    const agent = await User.create({ role: 'agent', fullName: 'Test Agent', phoneNumber: '0722222222', availability: true } as any);
    console.log('Created users', { supplierId: supplier._id.toString(), customerId: customer._id.toString(), agentId: agent._id.toString() });

    // create cylinder
    const cylId = `TESTC-${Date.now()}`;
    const cyl = await Cylinder.create({ supplierId: String(supplier._id), cylId, owner: 'Supplier', status: 'Available', price: 3000, refillPrice: 1200 } as any);
    console.log('Created cylinder', cylId);

    // create refill order and mark At Supplier
    const order = await Order.create({
      customerId: String(customer._id),
      supplierId: String(supplier._id),
      cylinder: { id: cylId, size: '13kg', brand: 'TestBrand', price: 1200 },
      delivery: { date: new Date().toISOString() },
      type: 'refill',
      total: 1200,
      status: 'At Supplier',
      assignedAgentId: String(agent._id),
    } as any);
    console.log('Created order', String(order._id));

    // supplier generates OTP
    const otp = '123456';
    (order as any).otpHash = crypto.createHash('sha256').update(otp).digest('hex');
    (order as any).otpExpiresAt = new Date(Date.now() + 20 * 60 * 1000);
    await order.save();
    console.log('Generated OTP for order (plain):', otp);

    // simulate agent pickup-supplier logic (verify OTP and update)
    const fresh = await Order.findById(order._id);
    if (!fresh) throw new Error('Order disappeared');
    console.log('Before pickup - order.type/status/assigned:', (fresh as any).type, (fresh as any).status, (fresh as any).assignedAgentId);

    // verify OTP
    const hash = crypto.createHash('sha256').update(otp).digest('hex');
    if (hash !== (fresh as any).otpHash) {
      throw new Error('OTP mismatch in test');
    }

    (fresh as any).status = 'In Transit';
    (fresh as any).refilledAt = new Date();
    (fresh as any).otpHash = undefined;
    (fresh as any).otpExpiresAt = undefined;
    await fresh.save();
    console.log('Order picked up; marking In Transit');

    // sync cylinder
    await syncCylinderFromOrder(fresh);
    const updatedCyl = await Cylinder.findOne({ supplierId: String(supplier._id), cylId }).lean();
    console.log('Cylinder after sync:', { owner: (updatedCyl as any)?.owner, status: (updatedCyl as any)?.status });

    console.log('Test completed successfully');
  } catch (e:any) {
    console.error('Test failed', e?.message || e);
    process.exitCode = 2;
  } finally {
    await mongoose.disconnect();
  }
}

main();
