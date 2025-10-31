import React from 'react';
import Card from '../components/Card';
import { api, authHeaders } from '../../../lib/api';

export default function Orders() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [assignModal, setAssignModal] = React.useState<null | { orderId: string; agents: any[] }>(null);
  const [otpModal, setOtpModal] = React.useState<null | { orderId: string; otp: string; expiresInMinutes?: number }>(null);
  React.useEffect(() => {
    let alive = true;
    async function fetchOnce() {
      try { const docs = await api('/orders/supplier', { headers: { ...authHeaders() } }); if (alive) setOrders(docs || []); } catch {}
    }
    fetchOnce();
    const id = setInterval(fetchOnce, 5000);
    return () => { alive = false; clearInterval(id); };
  }, []);
  const [view, setView] = React.useState<'all' | 'orders' | 'refills'>('all');
  const filtered = React.useMemo(() => {
    if (view === 'all') return orders;
    if (view === 'orders') return orders.filter((o:any) => o.type !== 'refill');
    return orders.filter((o:any) => o.type === 'refill');
  }, [orders, view]);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 mb-2">
        <div className="inline-flex rounded-md shadow-sm" role="tablist">
          <button onClick={()=>setView('all')} className={`px-3 py-1.5 rounded-l-md ${view==='all' ? 'bg-slate-900 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}>All ({orders.length})</button>
          <button onClick={()=>setView('orders')} className={`px-3 py-1.5 ${view==='orders' ? 'bg-emerald-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}>Orders ({orders.filter((x:any)=> x.type!=='refill').length})</button>
          <button onClick={()=>setView('refills')} className={`px-3 py-1.5 rounded-r-md ${view==='refills' ? 'bg-teal-600 text-white' : 'bg-white text-slate-700 ring-1 ring-slate-200'}`}>Refills ({orders.filter((x:any)=> x.type==='refill').length})</button>
        </div>
      </div>

      {filtered.map((o) => (
        <Card key={o.id}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-slate-900">{o._id} • {o.cylinder?.size} • {o.cylinder?.brand} • {o.cylinder?.id || '-'}</div>
              <div className="text-xs text-slate-600">{o.delivery?.date} • {o.type==='refill' ? 'Refill' : 'Order'} • Price: KES {Number(o.cylinder?.price||0).toLocaleString()} • Total: KES {Number(o.total||0).toLocaleString()}</div>
              <div className="text-xs text-slate-600">Customer: {o.customer?.name || '-'} • {o.customer?.phone || '-'}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${o.type==='refill' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-700'}`}>{o.type==='refill' ? 'Refill' : 'Order'}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                o.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                o.status === 'Approved' ? 'bg-blue-100 text-blue-700' :
                o.status === 'Assigned' ? 'bg-purple-100 text-purple-700' :
                o.status === 'In Transit' ? 'bg-indigo-100 text-indigo-700' :
                o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'
              }`}>{o.status}</span>
              <button disabled={o.status!=='Pending'} onClick={async ()=>{ try { await api(`/orders/${o._id}`, { method:'PATCH', headers: { ...authHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify({ status: 'Approved' })}); o.status='Approved'; setOrders([...orders]); } catch {} }} className={`text-sm px-3 py-1.5 rounded-lg ring-1 ring-slate-200 ${o.status==='Pending'?'hover:bg-slate-50':'opacity-50 cursor-not-allowed'}`}>Accept</button>
              <button disabled={o.status!=='Pending'} onClick={async ()=>{ try { await api(`/orders/${o._id}`, { method:'PATCH', headers: { ...authHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify({ status: 'Rejected' })}); o.status='Rejected'; setOrders([...orders]); } catch {} }} className={`text-sm px-3 py-1.5 rounded-lg ring-1 ring-slate-200 ${o.status==='Pending'?'hover:bg-slate-50':'opacity-50 cursor-not-allowed'}`}>Reject</button>
              <button disabled={!(o.status==='Approved' || (o.type==='refill' && o.status==='At Supplier'))} onClick={async ()=>{
                try {
                  const list = await api('/orders/agents/available', { headers: { ...authHeaders() } });
                  setAssignModal({ orderId: o._id, agents: list || [] });
                } catch {}
              }} className={`text-sm px-3 py-1.5 rounded-lg ring-1 ring-slate-200 ${(o.status==='Approved' || (o.type==='refill' && o.status==='At Supplier'))?'hover:bg-slate-50':'opacity-50 cursor-not-allowed'}`}>Assign Agent</button>
              {/* Generate pickup OTP when refill is At Supplier */}
              <button disabled={!(o.type==='refill' && o.status==='At Supplier')} onClick={async ()=>{
                try {
                  const resp = await api(`/orders/${o._id}/generate-supplier-otp`, { method: 'POST', headers: { ...authHeaders() } });
                  // resp should be { otp, expiresInMinutes }
                  setOtpModal({ orderId: o._id, otp: String((resp || {}).otp || ''), expiresInMinutes: (resp || {}).expiresInMinutes });
                } catch (e) {
                  // ignore
                }
              }} className={`text-sm px-3 py-1.5 rounded-lg ring-1 ring-slate-200 ${o.type==='refill' && o.status==='At Supplier' ? 'hover:bg-slate-50' : 'opacity-50 cursor-not-allowed'}`}>Generate Pickup OTP</button>
            </div>
          </div>
        </Card>
      ))}
      {otpModal && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-slate-900">Pickup OTP</div>
              <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50" onClick={()=>setOtpModal(null)}>Close</button>
            </div>
            <div className="mt-4">
              <div className="text-sm text-slate-600">Order: {otpModal.orderId}</div>
              <div className="mt-3 text-3xl font-mono text-center tracking-wider">{otpModal.otp}</div>
              {typeof otpModal.expiresInMinutes === 'number' && (<div className="mt-2 text-xs text-slate-500 text-center">Expires in {otpModal.expiresInMinutes} minutes</div>)}
              <div className="mt-4 flex justify-center">
                <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={()=>{ navigator.clipboard?.writeText(otpModal.otp || ''); }}>Copy OTP</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {assignModal && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-slate-900">Assign Delivery Agent</div>
              <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50" onClick={()=>setAssignModal(null)}>Close</button>
            </div>
            <div className="mt-3 space-y-2">
              {(assignModal.agents||[]).map((ag:any)=>(
                <div key={ag.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-2">
                  <div className="text-sm text-slate-800">{ag.name || '-'} • {ag.phone || '-'} • {isFinite(ag.distanceKm)? `${ag.distanceKm.toFixed(1)} km` : '—'}
                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs ${ag.availability? 'bg-emerald-100 text-emerald-700':'bg-slate-100 text-slate-700'}`}>{ag.availability? 'Online':'Offline'}</span>
                  </div>
                  <button disabled={!ag.availability} onClick={async ()=>{
                    try {
                      await api(`/orders/${assignModal.orderId}/assign-agent`, { method:'POST', headers: { ...authHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify({ agentId: ag.id }) });
                      const idx = orders.findIndex((o)=> o._id===assignModal.orderId);
                      if (idx>=0) {
                        // set assignedAgentId and update status only if it was Approved -> Assigned. If it was At Supplier (refill), keep At Supplier
                        (orders[idx] as any).assignedAgentId = ag.id;
                        if ((orders[idx] as any).status === 'Approved') {
                          (orders[idx] as any).status = 'Assigned';
                        }
                        setOrders([...orders]);
                      }
                      setAssignModal(null);
                    } catch {}
                  }} className={`text-sm px-3 py-1.5 rounded-lg ${ag.availability? 'bg-emerald-600 text-white hover:bg-emerald-700':'bg-slate-300 text-slate-600 cursor-not-allowed'}`}>Assign</button>
                </div>
              ))}
              {!assignModal.agents?.length && (
                <div className="text-sm text-slate-600">No available agents found.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


