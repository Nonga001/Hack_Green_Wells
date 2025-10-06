import React from 'react';
import Card from '../components/Card';

export default function Loyalty() {
  const mockSummary = { points: 320, tier: 'Silver' };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900">Loyalty & Rewards</h3>
        <div className="mt-3 grid md:grid-cols-2 gap-3">
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <div className="text-sm text-emerald-800">Points</div>
            <div className="text-2xl font-bold text-emerald-700">{mockSummary.points}</div>
          </div>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
            <div className="text-sm text-amber-800">Tier</div>
            <div className="text-2xl font-bold text-amber-700">{mockSummary.tier}</div>
          </div>
        </div>
        <div className="mt-4">
          <h4 className="text-sm font-semibold text-slate-900">Redemption Options</h4>
          <ul className="mt-2 text-sm text-slate-700 space-y-2">
            <li>• Discount on next order</li>
            <li>• Free delivery</li>
            <li>• Free 6kg refill (high tier)</li>
          </ul>
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Referral</h3>
        <p className="mt-1 text-sm text-slate-600">Invite friends and earn bonus points.</p>
        <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm font-mono">https://smartlpg.app/r/ABCD1234</div>
        <button className="mt-3 w-full rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">Copy Link</button>
      </Card>
    </div>
  );
}


