import React from 'react';
import Card from '../components/Card';

export default function Orders() {
  const orders = [
    { id: 'ORD-4001', customer: 'Jane', supplier: 'EcoGas', agent: 'Agent #12', status: 'In Transit' },
  ];
  return (
    <div className="space-y-3">
      {orders.map(o => (
        <Card key={o.id}>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="font-medium text-slate-900">{o.id}</div>
            <div className="text-slate-600">{o.customer}</div>
            <div className="text-slate-600">Supplier: {o.supplier}</div>
            <div className="text-slate-600">Agent: {o.agent}</div>
            <div className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">{o.status}</div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Assign</button>
              <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Reassign</button>
              <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Resolve Dispute</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}


