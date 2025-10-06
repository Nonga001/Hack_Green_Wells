import React from 'react';
import Card from '../components/Card';

export default function Loyalty() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900">Loyalty Rules</h3>
        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-lg border border-slate-200 p-3 flex items-center justify-between">
            <div>5th refill = 10% off</div>
            <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Edit</button>
          </div>
          <div className="rounded-lg border border-slate-200 p-3 flex items-center justify-between">
            <div>Free delivery after 8th order</div>
            <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Edit</button>
          </div>
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Reward Redemptions</h3>
        <div className="mt-3 space-y-2 text-sm">
          <div className="rounded-lg border border-slate-200 p-3 flex items-center justify-between">
            <div>Jane Doe • 10% discount</div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Approve</button>
              <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Reject</button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}


