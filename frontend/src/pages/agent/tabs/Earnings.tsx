import Card from '../components/Card';

export default function Earnings() {
  const completed = [
    { id: 'ORD-3000', amount: 500, date: '2025-10-01', paid: true },
    { id: 'ORD-3001', amount: 700, date: '2025-10-02', paid: false },
  ];
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900">Completed Deliveries</h3>
        <div className="mt-3 space-y-2 text-sm">
          {completed.map(c => (
            <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
              <div className="text-slate-900 font-medium">{c.id}</div>
              <div className="text-slate-600">{c.date}</div>
              <div className="text-slate-900">KES {c.amount}</div>
              <span className={`text-xs px-2 py-1 rounded-full ${c.paid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{c.paid ? 'Paid' : 'Pending'}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Performance</h3>
        <ul className="mt-2 text-sm text-slate-700 space-y-1">
          <li>On-time rate: 96%</li>
          <li>Completion rate: 98%</li>
        </ul>
      </Card>
    </div>
  );
}


