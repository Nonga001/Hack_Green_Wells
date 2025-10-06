import React from 'react';
import Card from '../components/Card';

export default function Overview() {
  const mockSummary = { predictionDays: 5, points: 320, tier: 'Silver' };
  const mockOrders = [
    { id: 'ORD-1024', date: '2025-10-01', size: '13kg', supplier: 'EcoGas', status: 'Delivered' },
    { id: 'ORD-1025', date: '2025-10-05', size: '6kg', supplier: 'CityLPG', status: 'In Transit' },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">LPG Usage Prediction</h3>
            <p className="mt-1 text-slate-600">Your cylinder will run out in ~{mockSummary.predictionDays} days.</p>
          </div>
          <div className="w-16 h-16 rounded-xl bg-emerald-50 grid place-items-center text-2xl">🔥</div>
        </div>
        <div className="mt-4">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${Math.max(0, Math.min(100, (mockSummary.predictionDays / 30) * 100))}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">Based on your burners and daily cooking hours.</p>
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Loyalty</h3>
        <p className="mt-1 text-slate-600">Points: <span className="font-semibold">{mockSummary.points}</span></p>
        <p className="text-slate-600">Tier: <span className="font-semibold">{mockSummary.tier}</span></p>
        <button className="mt-4 w-full inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 transition">Redeem</button>
      </Card>
      <Card className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900">Active Orders</h3>
        <div className="mt-3 grid md:grid-cols-2 gap-3">
          {mockOrders.slice(0, 2).map((o) => (
            <div key={o.id} className="rounded-lg border border-slate-200 p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-900">{o.id} • {o.size}</div>
                <div className="text-xs text-slate-600">{o.supplier} • {o.date}</div>
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                o.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                o.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'
              }`}>{o.status}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Quick Refill</h3>
        <p className="mt-1 text-slate-600">Order your last used size in one click.</p>
        <button className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 transition">
          <span>⚡</span>
          <span>Refill 13kg Now</span>
        </button>
      </Card>
    </div>
  );
}


