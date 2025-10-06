import React from 'react';
import Card from '../components/Card';

export default function Overview() {
  const summary = { today: 8, active: 3, completed: 5, earnings: 4200 };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900">Today's Summary</h3>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Total Deliveries</div>
            <div className="text-2xl font-bold">{summary.today}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Active</div>
            <div className="text-2xl font-bold">{summary.active}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Completed</div>
            <div className="text-2xl font-bold">{summary.completed}</div>
          </div>
          <div className="rounded-xl border border-slate-200 p-3">
            <div className="text-xs text-slate-500">Earnings (KES)</div>
            <div className="text-2xl font-bold">{summary.earnings}</div>
          </div>
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Tips</h3>
        <ul className="mt-2 text-sm text-slate-700 space-y-1">
          <li>Verify cylinder QR at pickup and drop-off.</li>
          <li>Call customer 10 mins before arrival.</li>
        </ul>
      </Card>
    </div>
  );
}


