import { Cylinder } from '../models/Cylinder.js';

export async function syncCylinderFromOrder(order: any): Promise<void> {
  try {
    if (!order) return;
    const cylId = order.cylinder?.id;
    if (!cylId) return;
    const supplierId = String(order.supplierId || '');
    const filter = { supplierId, cylId };
    const st = String(order.status || '');
    const updates: any = {};
    if (st === 'At Supplier') {
      // Cylinder is back in supplier store (in-store available) but order is at supplier
      updates.owner = 'Supplier';
      updates.status = 'Available';
    } else if (st === 'In Transit') {
      updates.owner = 'Agent';
      updates.status = 'In Transit';
    } else if (st === 'Delivered') {
      updates.owner = 'Customer';
      updates.status = 'Delivered';
    } else if (st === 'Rejected') {
      // Make available
      updates.status = 'Available';
    }
    if (Object.keys(updates).length > 0) {
      await Cylinder.updateOne(filter, { $set: updates });
    }
  } catch (err) {
    // best-effort
    // eslint-disable-next-line no-console
    console.error('syncCylinderFromOrder error', err);
  }
}
