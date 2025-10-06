import React from 'react';
import Card from '../components/Card';

export default function Assigned() {
  const assigned = [
    { id: 'ORD-3001', pickup: 'Depot A', drop: 'Kilimani, Block C', status: 'Pending' },
    { id: 'ORD-3002', pickup: 'Depot B', drop: 'Westlands, 3rd Ave', status: 'Picked' },
  ];
  return (
    <div className="space-y-3">
      {assigned.map(o => (
        <Card key={o.id}>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="font-medium text-slate-900">{o.id}</div>
            <div className="text-slate-600">Pickup: {o.pickup}</div>
            <div className="text-slate-600">Drop-off: {o.drop}</div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full ${
                o.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                o.status === 'Picked' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
              }`}>{o.status}</span>
              <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Mark Picked</button>
              <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Complete (OTP/QR)</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}


