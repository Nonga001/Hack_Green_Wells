import React from 'react';
import Card from '../components/Card';
import { api, authHeaders } from '../../../lib/api';

export default function Overview({ onQuickRefill }: { onQuickRefill?: (prefill: any) => void }) {
  const mockSummary = { predictionDays: 5, points: 320, tier: 'Silver' };
  const [orders, setOrders] = React.useState<any[]>([]);
  const [lastUsed, setLastUsed] = React.useState<any | null>(null);
  React.useEffect(() => {
    let alive = true;
    async function fetchOnce() {
      try { const docs = await api('/orders/customer', { headers: { ...authHeaders() } }); if (alive) setOrders(docs || []); } catch {}
    }
    fetchOnce();
    const id = setInterval(fetchOnce, 5000);
    return () => { alive = false; clearInterval(id); };
  }, []);
  // derive last used cylinder whenever orders update
  React.useEffect(() => {
    if (!orders || orders.length === 0) { setLastUsed(null); return; }
    // prefer most recent by createdAt, fallback to deliveredAt
    const sorted = [...orders].sort((a,b)=>{
      const ta = a.createdAt ? new Date(a.createdAt).getTime() : (a.deliveredAt ? new Date(a.deliveredAt).getTime() : 0);
      const tb = b.createdAt ? new Date(b.createdAt).getTime() : (b.deliveredAt ? new Date(b.deliveredAt).getTime() : 0);
      return tb - ta;
    });
    const last = sorted.find(Boolean) || null;
    setLastUsed(last);
  }, [orders]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">LPG Usage Prediction</h3>
            <p className="mt-1 text-slate-600">Your cylinder will run out in ~{mockSummary.predictionDays} days.</p>
          </div>
          <div className="w-16 h-16 rounded-xl bg-emerald-50 grid place-items-center text-2xl">🔥</div>
        </div>
        <div className="mt-4">
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-2 bg-emerald-500 rounded-full" style={{ width: `${Math.max(0, Math.min(100, (mockSummary.predictionDays / 30) * 100))}%` }} />
          </div>
          <p className="mt-2 text-xs text-slate-500">Based on your burners and daily cooking hours.</p>
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Loyalty</h3>
        <p className="mt-1 text-slate-600">Points: <span className="font-semibold">{mockSummary.points}</span></p>
        <p className="text-slate-600">Tier: <span className="font-semibold">{mockSummary.tier}</span></p>
        <button className="mt-4 w-full inline-flex items-center justify-center rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 transition">Redeem</button>
      </Card>
      <Card className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900">Active Orders</h3>
        <div className="mt-3 grid md:grid-cols-2 gap-3">
          {orders.filter((o:any)=> ['Pending','Approved','Assigned','In Transit','At Supplier'].includes(o.status) && (!lastUsed || String(o._id) !== String(lastUsed._id))).map((o:any) => (
            <div key={o._id} className="rounded-lg border border-slate-200 p-3 flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-slate-900">{o._id} • {o.cylinder?.size} • {o.cylinder?.brand} • {o.type==='refill' ? 'Refill' : 'Order'}</div>
                <div className="text-xs text-slate-600">{o.delivery?.date} • Supplier: {o.supplier?.name || '-'} • {o.supplier?.phone || '-'}</div>
                {o.destination && (
                  <div className="text-xs text-slate-600">Destination: {[o.destination?.addressLine, o.destination?.city, o.destination?.postalCode].filter(Boolean).join(', ') || '-'}</div>
                )}
                {o.agent && (
                  <div className="text-xs text-slate-600">Agent: {o.agent?.name || '-'} • {o.agent?.phone || '-'}</div>
                )}
              </div>
              <span className={`text-xs px-2 py-1 rounded-full ${
                o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                o.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                o.status === 'Approved' ? 'bg-teal-100 text-teal-700' :
                o.status === 'At Supplier' ? 'bg-orange-100 text-orange-700' :
                o.status === 'Assigned' ? 'bg-purple-100 text-purple-700' :
                o.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'
              }`}>{o.status}</span>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Quick Refill</h3>
        <p className="mt-1 text-slate-600">Order your last used cylinder quickly.</p>
        {lastUsed ? (
          <div className="mt-3">
            <div className="text-sm font-medium">{lastUsed.cylinder?.size || '-'} • {lastUsed.cylinder?.brand || '-'}</div>
            <div className="text-xs text-slate-600">Last ordered: {(lastUsed.createdAt || lastUsed.deliveredAt) ? new Date(lastUsed.createdAt || lastUsed.deliveredAt).toLocaleString() : '-'}</div>
            <button onClick={() => {
              if (onQuickRefill && lastUsed) {
                onQuickRefill({ refillCylId: lastUsed.cylinder?.id || lastUsed.cylinder?.cylId, refillSize: lastUsed.cylinder?.size, refillBrand: lastUsed.cylinder?.brand, supplierId: lastUsed.supplierId || lastUsed.supplier?._id || null });
              }
            }} className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 transition">
              <span>⚡</span>
              <span>Refill {lastUsed.cylinder?.size || ''} Now</span>
            </button>
          </div>
        ) : (
          <button disabled className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-2 text-slate-500" title="No recent cylinder found">
            <span>⚡</span>
            <span>No recent cylinder</span>
          </button>
        )}
      </Card>
    </div>
  );
}


