import React from 'react';
import Card from '../components/Card';

export default function Cylinders() {
  const cylinders = [
    { id: 'CYL-1001', size: '13kg', holder: 'Jane Doe', status: 'With Customer' },
    { id: 'CYL-1002', size: '6kg', holder: 'Agent #23', status: 'In Transit' },
  ];
  return (
    <div className="space-y-3">
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Inventory</h3>
        <div className="mt-3 grid gap-2">
          {cylinders.map(c => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3 text-sm">
              <div className="font-medium text-slate-900">{c.id} • {c.size}</div>
              <div className="text-slate-600">{c.holder}</div>
              <div className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700">{c.status}</div>
              <button className="text-sm px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Flag Lost/Damaged</button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


