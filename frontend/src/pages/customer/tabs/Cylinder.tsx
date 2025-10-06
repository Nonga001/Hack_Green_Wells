import React from 'react';
import Card from '../components/Card';

function CylinderPredictionCard() {
  const [burners, setBurners] = React.useState(1);
  const [dailyHours, setDailyHours] = React.useState(2);
  const [cylinderSizeKg, setCylinderSizeKg] = React.useState(13);
  const [remainingPercent, setRemainingPercent] = React.useState(50);

  const burnRateKgPerHourPerBurner = 0.18;
  const remainingKg = (cylinderSizeKg * Math.max(0, Math.min(100, remainingPercent))) / 100;
  const dailyConsumptionKg = Math.max(0, burners) * Math.max(0, dailyHours) * burnRateKgPerHourPerBurner;
  const estimatedDays = dailyConsumptionKg > 0 ? Math.max(0, remainingKg / dailyConsumptionKg) : 0;

  return (
    <Card className="lg:col-span-1">
      <h3 className="text-lg font-semibold text-slate-900">Usage-based Prediction</h3>
      <p className="mt-1 text-sm text-slate-600">Enter your cooking details to estimate remaining days.</p>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <label className="text-sm font-medium text-slate-700">Number of Burners
          <input type="number" min={1} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={burners} onChange={(e) => setBurners(Number(e.target.value) || 0)} />
        </label>
        <label className="text-sm font-medium text-slate-700">Daily Cooking Hours
          <input type="number" min={0} step={0.5} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={dailyHours} onChange={(e) => setDailyHours(Number(e.target.value) || 0)} />
        </label>
        <label className="text-sm font-medium text-slate-700">Cylinder Size (kg)
          <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={cylinderSizeKg} onChange={(e) => setCylinderSizeKg(Number(e.target.value))}>
            <option value={6}>6</option>
            <option value={13}>13</option>
            <option value={22.5}>22.5</option>
            <option value={50}>50</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">Estimated Remaining (%)
          <input type="number" min={0} max={100} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={remainingPercent} onChange={(e) => setRemainingPercent(Number(e.target.value) || 0)} />
        </label>
      </div>
      <div className="mt-4 rounded-lg bg-emerald-50 text-emerald-800 p-3 text-sm">
        Estimated remaining: <span className="font-semibold">~{estimatedDays.toFixed(1)} days</span>
      </div>
      <p className="mt-2 text-xs text-slate-500">Assumes burn rate {burnRateKgPerHourPerBurner} kg/hour per burner.</p>
    </Card>
  );
}

export default function Cylinder() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-1">
        <h3 className="text-lg font-semibold text-slate-900">Scan Cylinder (QR/NFC)</h3>
        <p className="mt-1 text-sm text-slate-600">Frontend-only placeholder for scan action.</p>
        <button className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">
          <span>📷</span>
          <span>Open Scanner</span>
        </button>
      </Card>
      <Card className="lg:col-span-1">
        <h3 className="text-lg font-semibold text-slate-900">Cylinder Details</h3>
        <div className="mt-2 text-sm text-slate-700 space-y-1">
          <div>Current ID: CYL-438922</div>
          <div>Last Refill: 2025-09-29</div>
        </div>
        <button className="mt-4 inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-white hover:bg-rose-700">
          <span>🚨</span>
          <span>Report Lost/Stolen</span>
        </button>
      </Card>
      <CylinderPredictionCard />
    </div>
  );
}


