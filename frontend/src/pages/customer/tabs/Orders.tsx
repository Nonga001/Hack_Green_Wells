import React from 'react';
import Card from '../components/Card';
import { api, authHeaders, API_URL } from '../../../lib/api';

export default function Orders() {
  const [orders, setOrders] = React.useState<any[]>([]);
  const [invoice, setInvoice] = React.useState<null | { orderId: string; text: string }>(null);
  React.useEffect(() => {
    (async () => {
      try { const docs = await api('/orders/customer', { headers: { ...authHeaders() } }); setOrders(docs || []); } catch {}
    })();
  }, []);
  return (
    <div className="space-y-3">
      {orders.map((o) => (
        <Card key={o._id}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-slate-900">{o._id} • {o.cylinder?.size} • {o.cylinder?.brand}</div>
              <div className="text-xs text-slate-600">{o.delivery?.date} • {o.type==='refill' ? 'Refill' : 'Order'} • Cylinder: {o.cylinder?.id || '-'} • Price: KES {Number(o.cylinder?.price||0).toLocaleString()} • Total: KES {Number(o.total||0).toLocaleString()}</div>
              <div className="text-xs text-slate-600">Supplier: {o.supplier?.name || '-'} • {o.supplier?.phone || '-'}</div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-1 rounded-full ${o.type==='refill' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-700'}`}>{o.type==='refill' ? 'Refill' : 'Order'}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${
                o.status === 'Delivered' ? 'bg-emerald-100 text-emerald-700' :
                o.status === 'In Transit' ? 'bg-blue-100 text-blue-700' :
                o.status === 'Assigned' ? 'bg-purple-100 text-purple-700' :
                o.status === 'Approved' ? 'bg-teal-100 text-teal-700' :
                o.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-700'
              }`}>{o.status}</span>
              <button disabled={o.status!=='Rejected'} className={`text-sm px-3 py-1.5 rounded-lg ring-1 ring-slate-200 ${ (o.status==='Rejected') ? 'hover:bg-slate-50':'opacity-50 cursor-not-allowed'}`}>Reorder</button>
              <button onClick={async ()=>{
                try {
                  const res = await fetch(`${API_URL}/orders/${o._id}/invoice`, { headers: { ...authHeaders() } as any });
                  const text = await res.text();
                  setInvoice({ orderId: o._id, text });
                } catch {}
              }} className="text-sm px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Invoice</button>
              {['Assigned','In Transit'].includes(o.status) && (
                <CustomerVerifyInline order={o} />
              )}
            </div>
          </div>
        </Card>
      ))}
      {invoice && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-slate-900">Invoice</div>
              <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50" onClick={()=>setInvoice(null)}>Close</button>
            </div>
            <div className="mt-3">
              <pre className="whitespace-pre-wrap text-sm text-slate-800 bg-slate-50 rounded-lg p-3 border border-slate-200">{invoice.text}</pre>
              <div className="mt-3 flex justify-end">
                <button onClick={()=>{
                  const blob = new Blob([invoice.text], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `invoice-${invoice.orderId}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white hover:bg-slate-800">Download</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CustomerVerifyInline({ order }: { order: any }) {
  const [open, setOpen] = React.useState(false);
  const [otp, setOtp] = React.useState<string | null>(null);
  const [otpExpires, setOtpExpires] = React.useState<number | null>(null);
  const payload = { orderId: order._id, cylId: order.cylinder?.id };
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(JSON.stringify(payload))}`;
  return (
    <>
      <button onClick={()=> setOpen(v=>!v)} className="text-sm px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Show OTP/QR</button>
      {open && (
        <div className="flex items-center gap-2">
          <img alt="Delivery QR" src={qrUrl} className="h-10 w-10 rounded-md border border-slate-200" />
          <button onClick={async ()=>{
            try {
              const res = await fetch(`${API_URL}/orders/${order._id}/issue-otp`, { method:'POST', headers: { ...authHeaders() } as any });
              const data = await res.json();
              if (res.ok) { setOtp(data.otp); setOtpExpires(data.expiresInMinutes); }
            } catch {}
          }} className="text-xs px-2 py-1 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Generate OTP</button>
          {otp && (
            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded">{otp}{otpExpires?` (expires in ${otpExpires}m)`:''}</span>
          )}
        </div>
      )}
    </>
  );
}


