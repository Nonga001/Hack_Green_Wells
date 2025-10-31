import React from 'react';
import Card from '../components/Card';
import { api, authHeaders } from '../../../lib/api';

interface Order {
  _id: string;
  customerId: string;
  supplierId: string;
  assignedAgentId?: string;
  status: string;
  type?: string;
  total: number;
  cylinder: {
    id?: string;
    size: string;
    brand: string;
    price?: number;
  };
  delivery: {
    date: string;
    time?: string;
  };
  customerName: string;
  customerEmail?: string;
  supplierName: string;
  supplierEmail?: string;
  agentName?: string;
  agentEmail?: string;
  createdAt: string;
}

export default function Orders() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const fetchOrders = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const ordersRes = await api('/admin/orders', { headers: authHeaders() });

      setOrders(ordersRes.orders || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load orders');
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Pending': 'bg-amber-100 text-amber-700',
      'Approved': 'bg-emerald-100 text-emerald-700',
      'Rejected': 'bg-rose-100 text-rose-700',
      'Assigned': 'bg-blue-100 text-blue-700',
      'In Transit': 'bg-purple-100 text-purple-700',
      'At Supplier': 'bg-indigo-100 text-indigo-700',
      'Delivered': 'bg-green-100 text-green-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  if (loading) {
    return (
      <div className="grid place-items-center h-64">
        <div className="text-slate-500">Loading orders...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-slate-900">All Orders ({orders.length})</h2>
          <button 
            onClick={fetchOrders} 
            disabled={loading}
            className="px-3 py-1.5 text-sm rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">
            {error}
          </div>
        )}

        {orders.length === 0 ? (
          <Card>
            <div className="text-center py-8 text-slate-500">No orders found</div>
          </Card>
        ) : (
          orders.map(order => (
            <Card key={order._id}>
              <div className="flex flex-wrap items-start justify-between gap-3 text-sm">
                <div className="flex-1 min-w-[200px] space-y-1">
                  <div className="font-medium text-slate-900">Order #{order._id.slice(-6).toUpperCase()}</div>
                  <div className="text-xs text-slate-500">{order.type === 'refill' ? 'Refill' : 'New Order'}</div>
                  <div className="text-slate-600">
                    <span className="font-medium">Customer:</span> {order.customerName}
                  </div>
                  <div className="text-slate-600">
                    <span className="font-medium">Supplier:</span> {order.supplierName}
                  </div>
                  {order.agentName && (
                    <div className="text-slate-600">
                      <span className="font-medium">Agent:</span> {order.agentName}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-[200px] space-y-1 text-xs">
                  <div className="text-slate-600">
                    <span className="font-medium">Cylinder:</span> {order.cylinder.brand} {order.cylinder.size}
                  </div>
                  <div className="text-slate-600">
                    <span className="font-medium">Delivery:</span> {order.delivery.date}
                  </div>
                  <div className="text-slate-600">
                    <span className="font-medium">Total:</span> ${order.total}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  <div className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </>
  );
}


