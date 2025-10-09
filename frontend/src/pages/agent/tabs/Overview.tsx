import React from 'react';
import Card from '../components/Card';
import { api, authHeaders } from '../../../lib/api';

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
        <h3 className="text-lg font-semibold text-slate-900">Availability</h3>
        <ToggleAvailability />
      </Card>
    </div>
  );
}

function ToggleAvailability() {
  const [online, setOnline] = React.useState<boolean>(false);
  const [saving, setSaving] = React.useState(false);
  React.useEffect(() => {
    (async () => {
      try { const me = await api('/user/me', { headers: { ...authHeaders() } }); setOnline(!!me.availability); } catch {}
    })();
  }, []);
  return (
    <div className="mt-3 flex items-center justify-between">
      <div className="text-sm text-slate-700">Status: <span className={`font-medium ${online?'text-emerald-700':'text-slate-700'}`}>{online? 'Available' : 'Unavailable'}</span></div>
      <button disabled={saving} onClick={async ()=>{
        setSaving(true);
        try { await api('/user/me', { method:'PUT', headers: { ...authHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify({ availability: !online }) }); setOnline(!online); } finally { setSaving(false); }
      }} className={`px-3 py-1.5 rounded-lg text-white ${online?'bg-slate-600 hover:bg-slate-700':'bg-emerald-600 hover:bg-emerald-700'}`}>{online? 'Go Offline' : 'Go Online'}</button>
    </div>
  );
}


