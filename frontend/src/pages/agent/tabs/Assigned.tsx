import React from 'react';
import Card from '../components/Card';
import { api, authHeaders } from '../../../lib/api';

export default function Assigned() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [notice, setNotice] = React.useState<null | { type: 'success' | 'error'; text: string }>(null);
  const [acceptedIds, setAcceptedIds] = React.useState<Set<string>>(new Set());
  const load = React.useCallback(async ()=>{
    try { const docs = await api('/orders/agent', { headers: { ...authHeaders() } }); setOrders(docs||[]); } catch {}
  }, []);
  React.useEffect(()=>{ void load(); }, [load]);
  return (
    <div className="space-y-3">
      {notice && (
        <div className={`rounded-lg p-2 text-sm ${notice.type==='success'?'bg-emerald-50 border border-emerald-200 text-emerald-800':'bg-rose-50 border border-rose-200 text-rose-700'}`}>{notice.text}</div>
      )}
      {orders.map(o => (
        <Card key={o._id}>
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div className="font-medium text-slate-900">{o._id}</div>
            <div className="text-slate-600">Cylinder: {o.cylinder?.size} {o.cylinder?.brand} {o.cylinder?.id ? `#${o.cylinder.id}` : ''}</div>
            <div className="text-slate-600">When: {o.delivery?.date} {o.delivery?.time || ''}</div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 rounded-full ${o.status === 'Assigned' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>{o.status}</span>
              {o.status === 'Assigned' && (
                <>
                  <button disabled={acceptedIds.has(o._id)} onClick={async ()=>{ 
                    setNotice(null);
                    try { 
                      await api(`/orders/${o._id}/agent-response`, { method:'POST', headers: { ...authHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify({ accept: true }) }); 
                      setAcceptedIds(prev=> new Set(Array.from(prev).concat(o._id)));
                      setNotice({ type:'success', text:'Assignment accepted. Proceed to Pickup to scan the cylinder.'});
                    } catch (e:any) { setNotice({ type:'error', text: e?.message || 'Failed to accept' }); } 
                  }} className={`px-3 py-1.5 rounded-lg ${acceptedIds.has(o._id)?'bg-slate-300 text-slate-600 cursor-not-allowed':'bg-emerald-600 text-white hover:bg-emerald-700'}`}>{acceptedIds.has(o._id)? 'Accepted' : 'Accept'}</button>
                  <button onClick={async ()=>{ 
                    setNotice(null);
                    try { await api(`/orders/${o._id}/agent-response`, { method:'POST', headers: { ...authHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify({ accept: false }) }); await load(); setNotice({ type:'success', text:'Assignment declined.'}); } catch (e:any) { setNotice({ type:'error', text: e?.message || 'Failed to decline' }); } 
                  }} className="px-3 py-1.5 rounded-lg ring-1 ring-rose-200 hover:bg-rose-50">Decline</button>
                </>
              )}
            </div>
          </div>
        </Card>
      ))}
      {!orders.length && (<div className="text-sm text-slate-600">No assigned deliveries.</div>)}
    </div>
  );
}


