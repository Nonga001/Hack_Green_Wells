import React from 'react';
import Card from '../components/Card';
import { api, authHeaders } from '../../../lib/api';

interface Overview {
  totalOrders: number;
  completedOrders: number;
  totalRevenue: number;
  avgDeliveryTimeHours: number;
  ordersLast30Days: number;
  ordersLast7Days: number;
  completionRate: number;
}

interface OrderTrend {
  _id: string;
  count: number;
  revenue: number;
}

interface Supplier {
  supplierId: string;
  supplierName: string;
  orders: number;
  revenue: number;
}

export default function Analytics() {
  const [overview, setOverview] = React.useState<Overview | null>(null);
  const [ordersByStatus, setOrdersByStatus] = React.useState<Record<string, number>>({});
  const [ordersByType, setOrdersByType] = React.useState<Record<string, number>>({});
  const [ordersOverTime, setOrdersOverTime] = React.useState<OrderTrend[]>([]);
  const [topSuppliers, setTopSuppliers] = React.useState<Supplier[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchAnalytics = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [overviewRes, trendsRes, suppliersRes] = await Promise.all([
        api('/admin/analytics/overview', { headers: authHeaders() }),
        api('/admin/analytics/trends', { headers: authHeaders() }),
        api('/admin/analytics/suppliers', { headers: authHeaders() }),
      ]);

      setOverview(overviewRes.overview);
      setOrdersByStatus(overviewRes.ordersByStatus || {});
      setOrdersByType(overviewRes.ordersByType || {});
      setOrdersOverTime(trendsRes.ordersOverTime || []);
      setTopSuppliers(suppliersRes.topSuppliers || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (loading) {
    return (
      <div className="grid place-items-center h-64">
        <div className="text-slate-500">Loading analytics...</div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  };

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

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-900">Analytics & Reports</h2>
        <button 
          onClick={fetchAnalytics} 
          disabled={loading}
          className="px-3 py-1.5 text-sm rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {overview && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <div className="text-xs text-slate-500 mb-1">Total Orders</div>
              <div className="text-2xl font-bold text-slate-900">{overview.totalOrders}</div>
              <div className="text-xs text-slate-600 mt-1">
                {overview.ordersLast7Days} in last 7 days
              </div>
            </Card>
            
            <Card>
              <div className="text-xs text-slate-500 mb-1">Completed Orders</div>
              <div className="text-2xl font-bold text-emerald-600">{overview.completedOrders}</div>
              <div className="text-xs text-slate-600 mt-1">
                {overview.completionRate}% completion rate
              </div>
            </Card>
            
            <Card>
              <div className="text-xs text-slate-500 mb-1">Total Revenue</div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(overview.totalRevenue)}</div>
              <div className="text-xs text-slate-600 mt-1">
                From delivered orders
              </div>
            </Card>
            
            <Card>
              <div className="text-xs text-slate-500 mb-1">Avg Delivery Time</div>
              <div className="text-2xl font-bold text-purple-600">{overview.avgDeliveryTimeHours}h</div>
              <div className="text-xs text-slate-600 mt-1">
                From order to delivery
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Orders by Status</h3>
              <div className="space-y-2">
                {Object.entries(ordersByStatus).sort((a, b) => b[1] - a[1]).map(([status, count]) => (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <div className={`text-xs px-3 py-1 rounded-full ${getStatusColor(status)}`}>
                        {status}
                      </div>
                    </div>
                    <div className="font-semibold text-slate-900">{count}</div>
                    <div className="text-xs text-slate-500 ml-2 w-12 text-right">
                      {Math.round((count / overview.totalOrders) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Orders by Type</h3>
              <div className="space-y-3">
                {Object.entries(ordersByType).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="text-2xl">{type === 'refill' ? '🔄' : '🆕'}</div>
                      <div>
                        <div className="font-medium text-slate-900 capitalize">{type}</div>
                        <div className="text-xs text-slate-500">
                          {Math.round((count / overview.totalOrders) * 100)}% of all orders
                        </div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-slate-900">{count}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Orders Over Time (Last 30 Days)</h3>
            {ordersOverTime.length > 0 ? (
              <div className="space-y-2">
                <div className="grid grid-cols-7 gap-1 text-xs text-slate-500 mb-2">
                  <div>Date</div>
                  <div className="col-span-3">Orders</div>
                  <div className="col-span-3 text-right">Revenue</div>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-1">
                  {ordersOverTime.map((item) => (
                    <div key={item._id} className="grid grid-cols-7 gap-1 text-sm p-2 hover:bg-slate-50 rounded">
                      <div className="text-slate-600 text-xs">{new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
                      <div className="col-span-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-blue-500 h-full rounded-full" 
                              style={{ width: `${Math.min((item.count / Math.max(...ordersOverTime.map(o => o.count))) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-slate-900 font-medium w-8 text-right">{item.count}</span>
                        </div>
                      </div>
                      <div className="col-span-3 text-right font-medium text-slate-900">
                        {formatCurrency(item.revenue)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">No order data available</div>
            )}
          </Card>

          <Card>
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Performing Suppliers</h3>
            {topSuppliers.length > 0 ? (
              <div className="space-y-2">
                {topSuppliers.map((supplier, index) => (
                  <div key={supplier.supplierId} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                      index === 0 ? 'bg-amber-100 text-amber-700' :
                      index === 1 ? 'bg-slate-200 text-slate-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      #{index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-slate-900">{supplier.supplierName}</div>
                      <div className="text-xs text-slate-500">{supplier.orders} completed orders</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-600">{formatCurrency(supplier.revenue)}</div>
                      <div className="text-xs text-slate-500">revenue</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">No supplier data available</div>
            )}
          </Card>
        </>
      )}
    </div>
  );
}


