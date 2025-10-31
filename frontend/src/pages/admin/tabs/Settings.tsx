import Card from '../components/Card';

export default function Settings() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">System Configuration</h3>
        <div className="mt-3 grid gap-3">
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="API Base URL" />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Notification Sender Email" />
          <button className="rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">Save Config</button>
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Admin Accounts</h3>
        <div className="mt-3 grid gap-3">
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="New Admin Email" />
          <button className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">Invite Admin</button>
          <div className="h-px bg-slate-200" />
          <button className="rounded-xl bg-rose-600 px-4 py-2 text-white hover:bg-rose-700">Backup Database</button>
          <button className="rounded-xl bg-amber-600 px-4 py-2 text-white hover:bg-amber-700">Restore Database</button>
        </div>
      </Card>
    </div>
  );
}


