import Card from '../components/Card';

export default function Cylinders() {
  const cylinders = [
    { id: 'CYL-5001', status: 'With Customer', lastSeen: '2025-10-03' },
    { id: 'CYL-5002', status: 'Lost', lastSeen: '2025-09-29' },
  ];
  return (
    <div className="space-y-3">
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">All Cylinders</h3>
        <div className="mt-3 grid gap-2 text-sm">
          {cylinders.map(c => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div className="font-medium text-slate-900">{c.id}</div>
              <div className="text-slate-600">{c.lastSeen}</div>
              <div className={`text-xs px-2 py-1 rounded-full ${c.status === 'Lost' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'}`}>{c.status}</div>
              <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Report</button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}


