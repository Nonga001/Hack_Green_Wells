import React from 'react';
import Card from '../components/Card';

export default function Analytics() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900">Sales Trends</h3>
        <div className="mt-2 h-48 rounded-lg bg-slate-50 grid place-items-center text-slate-400 text-sm">Chart Placeholder</div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Active Zones</h3>
        <ul className="mt-2 text-sm text-slate-700 space-y-1">
          <li>Nairobi CBD</li>
          <li>Westlands</li>
          <li>Industrial Area</li>
        </ul>
      </Card>
      <Card className="lg:col-span-3">
        <h3 className="text-lg font-semibold text-slate-900">Customer Refill Frequency</h3>
        <div className="mt-2 h-40 rounded-lg bg-slate-50 grid place-items-center text-slate-400 text-sm">Chart Placeholder</div>
      </Card>
    </div>
  );
}


