import React from 'react';
import Card from '../components/Card';

export default function MapTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900">Route Map</h3>
        <div className="mt-2 h-64 rounded-lg bg-slate-50 grid place-items-center text-slate-400 text-sm">Map Placeholder</div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Active Points</h3>
        <ul className="mt-2 text-sm text-slate-700 space-y-1">
          <li>Pickup: Depot A</li>
          <li>Drop-off: Kilimani</li>
          <li>Drop-off: Westlands</li>
        </ul>
      </Card>
    </div>
  );
}


