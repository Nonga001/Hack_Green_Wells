import React from 'react';
import Card from '../components/Card';
import { api, authHeaders } from '../../../lib/api';

export default function Overview() {
  const [activeDeliveries, setActiveDeliveries] = React.useState<number>(0);
  const [salesView, setSalesView] = React.useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [metrics, setMetrics] = React.useState<{ totalOrders: number; returnedCylinders: number; sales: { daily: number; weekly: number; monthly: number } }>({ totalOrders: 0, returnedCylinders: 0, sales: { daily: 0, weekly: 0, monthly: 0 } });
  React.useEffect(() => {
    (async () => {
      try {
        const orders = await api('/orders/supplier', { headers: { ...authHeaders() } });
        const totalOrders = (orders || []).length;
        const active = (orders || []).filter((o:any)=> o.status==='Approved' || o.status==='In Transit').length;
        setActiveDeliveries(active);
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const sum = (arr:any[]) => arr.reduce((acc, o:any)=> acc + Number(o.total||0), 0);
        const daily = sum((orders||[]).filter((o:any)=> new Date(o.createdAt) >= startOfDay));
        const weekly = sum((orders||[]).filter((o:any)=> new Date(o.createdAt) >= startOfWeek));
        const monthly = sum((orders||[]).filter((o:any)=> new Date(o.createdAt) >= startOfMonth));
        setMetrics({ totalOrders, returnedCylinders: 0, sales: { daily, weekly, monthly } });
      } catch {}
    })();
  }, []);
  const alerts = [
    { id: 1, text: 'Low stock: 6kg cylinders below threshold', level: 'warning' },
    { id: 2, text: 'Delayed deliveries: 3 orders past ETA', level: 'warning' },
    { id: 3, text: 'Pending returns: 9 cylinders overdue', level: 'error' },
  ];

  // Simulate real-time count updates
  React.useEffect(() => {
    const t = setInterval(() => {
      setActiveDeliveries((v) => (v >= 25 ? 10 : v + 1));
    }, 5000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900">Operational Summary</h3>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Total Orders Received</div>
            <div className="text-2xl font-bold">{metrics.totalOrders}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Active Deliveries</div>
            <div className="text-2xl font-bold">{activeDeliveries}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Returned Cylinders</div>
            <div className="text-2xl font-bold">{metrics.returnedCylinders}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Sales Summary (KES)</span>
              <div className="inline-flex gap-1">
                <button onClick={()=>setSalesView('daily')} className={`px-2 py-0.5 rounded ${salesView==='daily'?'bg-emerald-100 text-emerald-700':'hover:bg-slate-100'}`}>D</button>
                <button onClick={()=>setSalesView('weekly')} className={`px-2 py-0.5 rounded ${salesView==='weekly'?'bg-emerald-100 text-emerald-700':'hover:bg-slate-100'}`}>W</button>
                <button onClick={()=>setSalesView('monthly')} className={`px-2 py-0.5 rounded ${salesView==='monthly'?'bg-emerald-100 text-emerald-700':'hover:bg-slate-100'}`}>M</button>
              </div>
            </div>
            <div className="text-2xl font-bold">{metrics.sales[salesView].toLocaleString()}</div>
          </div>
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Alerts</h3>
        <div className="mt-3 space-y-2">
          {alerts.map(a => (
            <div key={a.id} className={`rounded-lg p-3 text-sm ${a.level === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>{a.text}</div>
          ))}
        </div>
      </Card>

      <Card className="lg:col-span-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">Mini Map — Active Deliveries & Cylinder Locations</h3>
          <div className="text-xs text-slate-500">Service Area</div>
        </div>
        <div className="mt-3 rounded-xl overflow-hidden border border-slate-200">
          <iframe
            title="supplier-map"
            className="w-full h-64"
            src={`https://www.openstreetmap.org/export/embed.html?bbox=36.780,-1.330,36.950,-1.210&layer=mapnik&marker=-1.2921,36.8219`}
          />
        </div>
        <div className="mt-2 text-xs text-slate-600">Showing sample markers within the supplier's service area.</div>
      </Card>
    </div>
  );
}


