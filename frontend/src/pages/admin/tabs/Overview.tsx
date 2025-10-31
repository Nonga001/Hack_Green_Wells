import Card from '../components/Card';

export default function Overview() {
  const metrics = { customers: 1240, suppliers: 32, agents: 87, orders: 5420, activeDeliveries: 48, cylinders: 9800 };
  const alerts = [
    { id: 1, text: '3 suppliers pending verification', level: 'warning' },
    { id: 2, text: '12 cylinders reported lost in last 7 days', level: 'error' },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900">System Overview</h3>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-3">
          <div className="rounded-xl border border-slate-200 p-3"><div className="text-xs text-slate-500">Customers</div><div className="text-2xl font-bold">{metrics.customers}</div></div>
          <div className="rounded-xl border border-slate-200 p-3"><div className="text-xs text-slate-500">Suppliers</div><div className="text-2xl font-bold">{metrics.suppliers}</div></div>
          <div className="rounded-xl border border-slate-200 p-3"><div className="text-xs text-slate-500">Agents</div><div className="text-2xl font-bold">{metrics.agents}</div></div>
          <div className="rounded-xl border border-slate-200 p-3"><div className="text-xs text-slate-500">Orders</div><div className="text-2xl font-bold">{metrics.orders}</div></div>
          <div className="rounded-xl border border-slate-200 p-3"><div className="text-xs text-slate-500">Active Deliveries</div><div className="text-2xl font-bold">{metrics.activeDeliveries}</div></div>
          <div className="rounded-xl border border-slate-200 p-3"><div className="text-xs text-slate-500">Cylinders</div><div className="text-2xl font-bold">{metrics.cylinders}</div></div>
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">System Alerts</h3>
        <div className="mt-3 space-y-2">
          {alerts.map(a => (
            <div key={a.id} className={`rounded-lg p-3 text-sm ${a.level === 'error' ? 'bg-rose-50 text-rose-700 border border-rose-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>{a.text}</div>
          ))}
        </div>
      </Card>
    </div>
  );
}


