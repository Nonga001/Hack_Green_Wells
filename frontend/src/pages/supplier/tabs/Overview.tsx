import React from 'react';
import Card from '../components/Card';

export default function Overview() {
  const metrics = {
    totalOrders: 182,
    activeDeliveries: 12,
    returnedCylinders: 34,
    salesToday: 78500,
  };
  const alerts = [
    { id: 1, text: 'Low stock: 6kg cylinders below threshold', level: 'warning' },
    { id: 2, text: 'Pending returns: 9 cylinders overdue', level: 'error' },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900">Operational Summary</h3>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Total Orders</div>
            <div className="text-2xl font-bold">{metrics.totalOrders}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Active Deliveries</div>
            <div className="text-2xl font-bold">{metrics.activeDeliveries}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Returned Cylinders</div>
            <div className="text-2xl font-bold">{metrics.returnedCylinders}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Sales Today (KES)</div>
            <div className="text-2xl font-bold">{metrics.salesToday.toLocaleString()}</div>
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
    </div>
  );
}


