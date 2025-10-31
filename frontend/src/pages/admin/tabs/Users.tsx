import Card from '../components/Card';

export default function Users() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Customers</h3>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <div>Jane Doe</div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Suspend</button>
              <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Remove</button>
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Suppliers</h3>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <div>EcoGas Ltd</div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Suspend</button>
              <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Remove</button>
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Delivery Agents</h3>
        <div className="mt-3 space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
            <div>Agent #23</div>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Suspend</button>
              <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Remove</button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}


