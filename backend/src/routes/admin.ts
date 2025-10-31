import { Router, type Response } from 'express';
import crypto from 'crypto';
import { requireAuth, type AuthRequest } from '../middleware/auth.js';
import { User } from '../models/User.js';
import { Order } from '../models/Order.js';
import { Cylinder } from '../models/Cylinder.js';

const router = Router();

router.get('/metrics', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const [
      customersCount,
      suppliersCount,
      agentsCount,
      ordersCount,
      activeDeliveriesCount,
      cylindersCount,
    ] = await Promise.all([
      User.countDocuments({ role: 'customer' }),
      User.countDocuments({ role: 'supplier' }),
      User.countDocuments({ role: 'agent' }),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ['In Transit', 'At Supplier', 'Assigned'] } }),
      Cylinder.countDocuments(),
    ]);

    res.json({
      customers: customersCount,
      suppliers: suppliersCount,
      agents: agentsCount,
      orders: ordersCount,
      activeDeliveries: activeDeliveriesCount,
      cylinders: cylindersCount,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch metrics' });
  }
});

router.get('/alerts', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const alerts: Array<{ id: string; text: string; level: 'warning' | 'error' | 'info' }> = [];

    const pendingSuppliers = await User.countDocuments({ 
      role: 'supplier',
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    if (pendingSuppliers > 0) {
      alerts.push({
        id: `suppliers-${Date.now()}`,
        text: `${pendingSuppliers} new suppliers registered in the last 7 days`,
        level: 'info',
      });
    }

    const lostCylinders = await Cylinder.countDocuments({ 
      status: 'Lost',
      updatedAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    if (lostCylinders > 0) {
      alerts.push({
        id: `lost-cylinders-${Date.now()}`,
        text: `${lostCylinders} cylinders reported lost in last 7 days`,
        level: 'error',
      });
    }

    const damagedCylinders = await Cylinder.countDocuments({ status: 'Damaged' });
    if (damagedCylinders > 0) {
      alerts.push({
        id: `damaged-cylinders-${Date.now()}`,
        text: `${damagedCylinders} cylinders marked as damaged`,
        level: 'warning',
      });
    }

    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    if (pendingOrders > 10) {
      alerts.push({
        id: `pending-orders-${Date.now()}`,
        text: `${pendingOrders} orders pending approval`,
        level: 'warning',
      });
    }

    const stuckOrders = await Order.countDocuments({
      status: 'In Transit',
      updatedAt: { $lt: new Date(Date.now() - 48 * 60 * 60 * 1000) }
    });
    
    if (stuckOrders > 0) {
      alerts.push({
        id: `stuck-orders-${Date.now()}`,
        text: `${stuckOrders} orders in transit for more than 48 hours`,
        level: 'error',
      });
    }

    res.json({ alerts });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch alerts' });
  }
});

router.get('/users', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { role } = req.query;
    const filter: any = {};
    
    if (role && ['customer', 'supplier', 'agent'].includes(role as string)) {
      filter.role = role;
    } else if (!role) {
      filter.role = { $in: ['customer', 'supplier', 'agent'] };
    }

    const users = await User.find(filter)
      .select('_id role fullName businessName email phoneNumber status createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch users' });
  }
});

router.patch('/users/:userId/suspend', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot suspend admin users' });
    }

    user.status = user.status === 'suspended' ? 'active' : 'suspended';
    await user.save();

    res.json({ 
      message: `User ${user.status === 'suspended' ? 'suspended' : 'unsuspended'} successfully`,
      user: {
        _id: user._id,
        status: user.status,
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to suspend user' });
  }
});

router.delete('/users/:userId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(403).json({ error: 'Cannot remove admin users' });
    }

    user.status = 'removed';
    await user.save();

    res.json({ 
      message: 'User removed successfully',
      user: {
        _id: user._id,
        status: user.status,
      }
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to remove user' });
  }
});

router.get('/orders', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const customerIds = Array.from(new Set(orders.map(o => String(o.customerId))));
    const supplierIds = Array.from(new Set(orders.map(o => String(o.supplierId))));
    const agentIds = Array.from(new Set(orders.map(o => o.assignedAgentId).filter(Boolean)));

    const [customers, suppliers, agents] = await Promise.all([
      User.find({ _id: { $in: customerIds } }).select('fullName businessName email').lean(),
      User.find({ _id: { $in: supplierIds } }).select('businessName email').lean(),
      User.find({ _id: { $in: agentIds } }).select('fullName email').lean(),
    ]);

    const customerMap = new Map(customers.map(c => [String(c._id), c]));
    const supplierMap = new Map(suppliers.map(s => [String(s._id), s]));
    const agentMap = new Map(agents.map(a => [String(a._id), a]));

    const enrichedOrders = orders.map((order: any) => {
      const customer = customerMap.get(String(order.customerId));
      const supplier = supplierMap.get(String(order.supplierId));
      const agent = order.assignedAgentId ? agentMap.get(String(order.assignedAgentId)) : null;

      return {
        ...order,
        customerName: customer?.fullName || customer?.businessName || 'Unknown',
        customerEmail: customer?.email,
        supplierName: supplier?.businessName || 'Unknown',
        supplierEmail: supplier?.email,
        agentName: agent?.fullName || null,
        agentEmail: agent?.email,
      };
    });

    res.json({ orders: enrichedOrders });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch orders' });
  }
});



router.get('/cylinders', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { status } = req.query;
    const filter: any = {};
    
    if (status && ['Available', 'Booked', 'In Transit', 'At Supplier', 'Delivered', 'Lost', 'Damaged'].includes(status as string)) {
      filter.status = status;
    }

    const cylinders = await Cylinder.find(filter)
      .sort({ updatedAt: -1 })
      .limit(200)
      .lean();

    const supplierIds = Array.from(new Set(cylinders.map(c => String(c.supplierId))));
    const suppliers = await User.find({ _id: { $in: supplierIds } })
      .select('businessName email')
      .lean();

    const supplierMap = new Map(suppliers.map(s => [String(s._id), s]));

    const enrichedCylinders = cylinders.map((cyl: any) => {
      const supplier = supplierMap.get(String(cyl.supplierId));
      let formattedLocation = cyl.locationText || '';
      
      if (cyl.coords?.lat && cyl.coords?.lon) {
        const coordsText = `(${cyl.coords.lat.toFixed(6)}, ${cyl.coords.lon.toFixed(6)})`;
        formattedLocation = formattedLocation 
          ? `${formattedLocation} ${coordsText}` 
          : coordsText;
      }
      
      return {
        ...cyl,
        supplierName: supplier?.businessName || 'Unknown',
        supplierEmail: supplier?.email,
        formattedLocation,
      };
    });

    res.json({ cylinders: enrichedCylinders });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch cylinders' });
  }
});

router.get('/cylinders/stats', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const [
      available,
      booked,
      inTransit,
      atSupplier,
      delivered,
      lost,
      damaged,
      total,
    ] = await Promise.all([
      Cylinder.countDocuments({ status: 'Available' }),
      Cylinder.countDocuments({ status: 'Booked' }),
      Cylinder.countDocuments({ status: 'In Transit' }),
      Cylinder.countDocuments({ status: 'At Supplier' }),
      Cylinder.countDocuments({ status: 'Delivered' }),
      Cylinder.countDocuments({ status: 'Lost' }),
      Cylinder.countDocuments({ status: 'Damaged' }),
      Cylinder.countDocuments(),
    ]);

    res.json({
      stats: {
        available,
        booked,
        inTransit,
        atSupplier,
        delivered,
        lost,
        damaged,
        total,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch cylinder stats' });
  }
});

router.get('/analytics/overview', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalOrders,
      completedOrders,
      totalRevenue,
      avgDeliveryTime,
      ordersLast30Days,
      ordersLast7Days,
      ordersByStatus,
      ordersByType,
    ] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: 'Delivered' }),
      Order.aggregate([
        { $match: { status: 'Delivered' } },
        { $group: { _id: null, total: { $sum: '$total' } } },
      ]),
      Order.aggregate([
        { $match: { status: 'Delivered', deliveredAt: { $exists: true }, createdAt: { $exists: true } } },
        { $project: { 
          deliveryTime: { 
            $divide: [
              { $subtract: ['$deliveredAt', '$createdAt'] },
              1000 * 60 * 60
            ]
          }
        }},
        { $group: { _id: null, avgTime: { $avg: '$deliveryTime' } } },
      ]),
      Order.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
      Order.countDocuments({ createdAt: { $gte: sevenDaysAgo } }),
      Order.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Order.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
    ]);

    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;
    const avgDelivery = avgDeliveryTime.length > 0 ? Math.round(avgDeliveryTime[0].avgTime * 10) / 10 : 0;

    res.json({
      overview: {
        totalOrders,
        completedOrders,
        totalRevenue: revenue,
        avgDeliveryTimeHours: avgDelivery,
        ordersLast30Days,
        ordersLast7Days,
        completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0,
      },
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      ordersByType: ordersByType.reduce((acc, item) => {
        acc[item._id || 'order'] = item.count;
        return acc;
      }, {} as Record<string, number>),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch analytics' });
  }
});

router.get('/analytics/trends', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const ordersOverTime = await Order.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          count: { $sum: 1 },
          revenue: { $sum: '$total' },
        }
      },
      { $sort: { _id: 1 } },
    ]);

    const cylinderActivity = await Cylinder.aggregate([
      { $match: { updatedAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$updatedAt' }
          },
          count: { $sum: 1 },
        }
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      ordersOverTime,
      cylinderActivity,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch trends' });
  }
});

router.get('/analytics/suppliers', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const topSuppliers = await Order.aggregate([
      { $match: { status: 'Delivered' } },
      { 
        $group: { 
          _id: '$supplierId', 
          orders: { $sum: 1 },
          revenue: { $sum: '$total' },
        } 
      },
      { $sort: { orders: -1 } },
      { $limit: 10 },
    ]);

    const supplierIds = topSuppliers.map(s => s._id);
    const suppliers = await User.find({ _id: { $in: supplierIds } })
      .select('businessName email')
      .lean();

    const supplierMap = new Map(suppliers.map(s => [String(s._id), s]));

    const enrichedSuppliers = topSuppliers.map(item => ({
      supplierId: item._id,
      supplierName: supplierMap.get(String(item._id))?.businessName || 'Unknown',
      orders: item.orders,
      revenue: item.revenue,
    }));

    res.json({ topSuppliers: enrichedSuppliers });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch supplier analytics' });
  }
});

router.get('/system/stats', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const [userCount, orderCount, cylinderCount, activeOrders] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Cylinder.countDocuments(),
      Order.countDocuments({ status: { $in: ['Pending', 'Approved', 'Assigned', 'In Transit', 'At Supplier'] } }),
    ]);

    res.json({
      stats: {
        users: userCount,
        orders: orderCount,
        cylinders: cylinderCount,
        activeOrders,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch system stats' });
  }
});

router.get('/admins', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const admins = await User.find({ role: 'admin' })
      .select('fullName email phoneNumber status createdAt')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ admins });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch admins' });
  }
});

router.post('/admins', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { email, fullName, phoneNumber, password } = req.body || {};

    if (!email || !fullName || !phoneNumber || !password) {
      return res.status(400).json({ error: 'Email, full name, phone number, and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ error: 'User with this email already exists' });
    }

    const { hashPassword } = await import('../utils/password.js');
    const passwordHash = await hashPassword(password);

    const admin = await User.create({
      role: 'admin',
      fullName,
      email,
      phoneNumber,
      passwordHash,
      status: 'active',
    });

    res.status(201).json({ 
      message: 'Admin created successfully',
      admin: {
        _id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to create admin' });
  }
});

router.delete('/admins/:adminId', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { adminId } = req.params;

    if (adminId === req.userId) {
      return res.status(400).json({ error: 'Cannot delete your own admin account' });
    }

    const admin = await User.findOne({ _id: adminId, role: 'admin' });
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    admin.status = 'removed';
    await admin.save();

    res.json({ message: 'Admin removed successfully' });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to remove admin' });
  }
});

router.post('/system/clear-data', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    if (req.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { dataType, confirm } = req.body || {};

    if (confirm !== 'DELETE') {
      return res.status(400).json({ error: 'Confirmation required' });
    }

    let result;
    switch (dataType) {
      case 'orders':
        result = await Order.deleteMany({});
        break;
      case 'cylinders':
        result = await Cylinder.deleteMany({});
        break;
      case 'suspended-users':
        result = await User.deleteMany({ status: 'suspended' });
        break;
      case 'removed-users':
        result = await User.deleteMany({ status: 'removed' });
        break;
      default:
        return res.status(400).json({ error: 'Invalid data type' });
    }

    res.json({ 
      message: `Cleared ${result.deletedCount} records successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to clear data' });
  }
});

export default router;
