import React from 'react';
import Card from '../components/Card';

export default function Orders() {
  const orders = [
    { id: 'ORD-2001', customer: 'Jane Doe', size: '13kg', date: '2025-10-05', status: 'Pending' },
    { id: 'ORD-2002', customer: 'Acme Ltd', size: '22.5kg', date: '2025-10-05', status: 'In Transit' },
  ];
  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <Card key={o.id}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-slate-900">{o.id} • {o.size}</div>
              <div className="text-xs text-slate-600">{o.customer} • {o.date}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                o.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                o.status === 'In Transit' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
              }`}>{o.status}</span>
              <button className="text-sm px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Accept</button>
              <button className="text-sm px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Reject</button>
              <button className="text-sm px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Assign Agent</button>
              <button className="text-sm px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Update Status</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}


