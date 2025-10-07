import React from 'react';
import Card from '../components/Card';
import { api, authHeaders } from '../../../lib/api';

export default function Orders() {
  const [orders, setOrders] = React.useState<any[]>([]);
  React.useEffect(() => {
    (async () => {
      try { const docs = await api('/orders/supplier', { headers: { ...authHeaders() } }); setOrders(docs || []); } catch {}
    })();
  }, []);
  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <Card key={o.id}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-slate-900">{o._id} • {o.cylinder?.size} • {o.cylinder?.brand} • {o.cylinder?.id || '-'}</div>
              <div className="text-xs text-slate-600">{o.delivery?.date} • Price: KES {Number(o.cylinder?.price||0).toLocaleString()} • Total: KES {Number(o.total||0).toLocaleString()}</div>
              <div className="text-xs text-slate-600">Customer: {o.customer?.name || '-'} • {o.customer?.phone || '-'}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${
                o.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                o.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
              }`}>{o.status}</span>
              <button disabled={o.status!=='Pending'} onClick={async ()=>{ try { await api(`/orders/${o._id}`, { method:'PATCH', headers: { ...authHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify({ status: 'Approved' })}); o.status='Approved'; setOrders([...orders]); } catch {} }} className={`text-sm px-3 py-1.5 rounded-lg ring-1 ring-slate-200 ${o.status==='Pending'?'hover:bg-slate-50':'opacity-50 cursor-not-allowed'}`}>Accept</button>
              <button disabled={o.status!=='Pending'} onClick={async ()=>{ try { await api(`/orders/${o._id}`, { method:'PATCH', headers: { ...authHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify({ status: 'Rejected' })}); o.status='Rejected'; setOrders([...orders]); } catch {} }} className={`text-sm px-3 py-1.5 rounded-lg ring-1 ring-slate-200 ${o.status==='Pending'?'hover:bg-slate-50':'opacity-50 cursor-not-allowed'}`}>Reject</button>
              <button disabled={o.status!=='Approved'} className={`text-sm px-3 py-1.5 rounded-lg ring-1 ring-slate-200 ${o.status==='Approved'?'hover:bg-slate-50':'opacity-50 cursor-not-allowed'}`}>Assign Agent</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}


