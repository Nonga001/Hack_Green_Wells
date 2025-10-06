import React from 'react';
import Card from '../components/Card';

export default function Orders() {
  const mockOrders = [
    { id: 'ORD-1024', date: '2025-10-01', size: '13kg', supplier: 'EcoGas', status: 'Delivered' },
    { id: 'ORD-1025', date: '2025-10-05', size: '6kg', supplier: 'CityLPG', status: 'In Transit' },
  ];
  return (
    <div className="space-y-3">
      {mockOrders.map((o) => (
        <Card key={o.id}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-slate-900">{o.id} • {o.size}</div>
              <div className="text-xs text-slate-600">{o.supplier} • {o.date}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                o.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                o.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'
              }`}>{o.status}</span>
              <button className="text-sm px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Reorder</button>
              <button className="text-sm px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Invoice</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}


