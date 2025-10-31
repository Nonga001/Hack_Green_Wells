import Card from '../components/Card';

export default function Support() {
  const tickets = [
    { id: 'TCK-9001', from: 'Jane (Customer)', subject: 'Delivery delayed', status: 'Open' },
    { id: 'TCK-9002', from: 'EcoGas (Supplier)', subject: 'Invoice query', status: 'Pending' },
  ];
  return (
    <div className="space-y-3">
      {tickets.map(t => (
        <Card key={t.id}>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="font-medium text-slate-900">{t.id}</div>
            <div className="text-slate-600">{t.from}</div>
            <div className="text-slate-900">{t.subject}</div>
            <span className={`px-2 py-1 rounded-full ${t.status === 'Open' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>{t.status}</span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Resolve</button>
              <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Escalate</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}


