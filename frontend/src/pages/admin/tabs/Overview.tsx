import React from 'react';
import Card from '../components/Card';
import { api, authHeaders } from '../../../lib/api';

interface Metrics {
  customers: number;
  suppliers: number;
  agents: number;
  orders: number;
  activeDeliveries: number;
  cylinders: number;
}

interface Alert {
  id: string;
  text: string;
  level: 'warning' | 'error' | 'info';
}

export default function Overview() {
  const [metrics, setMetrics] = React.useState<Metrics>({
    customers: 0,
    suppliers: 0,
    agents: 0,
    orders: 0,
    activeDeliveries: 0,
    cylinders: 0,
  });
  const [alerts, setAlerts] = React.useState<Alert[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [metricsRes, alertsRes] = await Promise.all([
        api('/admin/metrics', { headers: authHeaders() }),
        api('/admin/alerts', { headers: authHeaders() }),
      ]);

      setMetrics(metricsRes);
      setAlerts(alertsRes.alerts || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
      console.error('Failed to fetch admin dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading && metrics.customers === 0) {
    return (
      <div className="grid place-items-center h-64">
        <div className="text-slate-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">System Overview</h3>
          <button 
            onClick={fetchData} 
            disabled={loading}
            className="px-3 py-1.5 text-xs rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        {error && (
          <div className="mt-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2">
            {error}
          </div>
        )}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Customers</div>
            <div className="text-2xl font-bold">{metrics.customers}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Suppliers</div>
            <div className="text-2xl font-bold">{metrics.suppliers}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Agents</div>
            <div className="text-2xl font-bold">{metrics.agents}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Orders</div>
            <div className="text-2xl font-bold">{metrics.orders}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Active Deliveries</div>
            <div className="text-2xl font-bold">{metrics.activeDeliveries}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Cylinders</div>
            <div className="text-2xl font-bold">{metrics.cylinders}</div>
          </div>
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">System Alerts</h3>
        <div className="mt-3 space-y-2">
          {alerts.length === 0 ? (
            <div className="text-sm text-slate-500 text-center py-4">No alerts at this time</div>
          ) : (
            alerts.map(a => (
              <div 
                key={a.id} 
                className={`rounded-lg p-3 text-sm ${
                  a.level === 'error' 
                    ? 'bg-rose-50 text-rose-700 border border-rose-200' 
                    : a.level === 'warning'
                    ? 'bg-amber-50 text-amber-800 border border-amber-200'
                    : 'bg-blue-50 text-blue-700 border border-blue-200'
                }`}
              >
                {a.text}
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}


