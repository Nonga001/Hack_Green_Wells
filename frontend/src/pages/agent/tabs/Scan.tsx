import React from 'react';
import Card from '../components/Card';
import { api, authHeaders } from '../../../lib/api';

export default function Scan() {
  const [orderId, setOrderId] = React.useState('');
  const [expectedCylId, setExpectedCylId] = React.useState('');
  const [scannedCylId, setScannedCylId] = React.useState('');
  const [otp, setOtp] = React.useState(''); // Delivery OTP
  const [pickupOtp, setPickupOtp] = React.useState(''); // Pickup OTP (refill)
  const [pickupMode, setPickupMode] = React.useState<'order' | 'refill'>('order');
  const [notice, setNotice] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const pickupVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const deliverVideoRef = React.useRef<HTMLVideoElement | null>(null);
  const [pickupStream, setPickupStream] = React.useState<MediaStream | null>(null);
  const [deliverStream, setDeliverStream] = React.useState<MediaStream | null>(null);
  const [assigned, setAssigned] = React.useState<any[]>([]);
  const [showSupplierPickupModal, setShowSupplierPickupModal] = React.useState(false);
  const [selectedPickupOrder, setSelectedPickupOrder] = React.useState<any | null>(null);
  const [selectedPickupOtp, setSelectedPickupOtp] = React.useState('');
  const pickupOverlayRef = React.useRef<HTMLDivElement | null>(null);
  const deliverOverlayRef = React.useRef<HTMLDivElement | null>(null);

  const getCoords = React.useCallback((): Promise<{ lat?: number; lon?: number }> => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) return resolve({});
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
        () => resolve({})
      );
    });
  }, []);

  // Load assigned orders to prefill order/cylinder ids
  React.useEffect(() => {
    (async () => {
      try {
        const docs = await api('/orders/agent', { headers: { ...authHeaders() } });
        setAssigned(docs || []);
      } catch {}
    })();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Pickup <span className="ml-2 align-middle text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">Order / Refill</span></h3>
        {notice && (<div className={`mt-2 rounded-lg p-2 text-sm ${notice.type==='success'?'bg-emerald-50 border border-emerald-200 text-emerald-800':'bg-rose-50 border border-rose-200 text-rose-700'}`}>{notice.text}</div>)}
        <div className="mt-3 grid gap-2 text-sm">
          <div className="grid gap-2">
            <select className="rounded-xl border border-slate-300 px-3 py-2" value={orderId} onChange={(e)=>{
              const id = e.target.value; setOrderId(id);
              const o = assigned.find((x:any)=> x._id===id);
              setExpectedCylId(o?.cylinder?.id || '');
              setPickupMode(o?.type==='refill' ? 'refill' : 'order');
            }}>
              <option value="">Select assigned order</option>
              {assigned.map((o:any)=> (
                <option key={o._id} value={o._id}>{o._id} • {o.type==='refill' ? 'Refill' : 'Order'} • {o.cylinder?.size} {o.cylinder?.brand} #{o.cylinder?.id || '-'}</option>
              ))}
            </select>
            <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Order ID" value={orderId} onChange={(e)=>setOrderId(e.target.value)} />
            <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Expected Cylinder ID (from order)" value={expectedCylId} onChange={(e)=>setExpectedCylId(e.target.value)} />
            <div className="flex items-center gap-3 text-xs text-slate-700">
              <label className="inline-flex items-center gap-1">
                <input type="radio" name="pickup-type" checked={pickupMode==='order'} onChange={()=>setPickupMode('order')} />
                <span>Order (scan cylinder)</span>
              </label>
              <label className="inline-flex items-center gap-1">
                <input type="radio" name="pickup-type" checked={pickupMode==='refill'} onChange={()=>setPickupMode('refill')} />
                <span>Refill (OTP)</span>
              </label>
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-slate-600">
            <div className="mb-2 text-xs text-slate-500">Camera Scanner</div>
            <div className="relative">
              <video ref={pickupVideoRef} className="w-full h-48 bg-black rounded-md" playsInline muted />
              <div ref={pickupOverlayRef} className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-emerald-500 rounded-md w-40 h-40"></div>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <button disabled={pickupMode!=='order'} onClick={async ()=>{
                try {
                  if (pickupStream) return; // already running
                  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                  setPickupStream(stream);
                  if (pickupVideoRef.current) {
                    pickupVideoRef.current.srcObject = stream;
                    await pickupVideoRef.current.play();
                  }
                  // Try BarcodeDetector for QR; fallback no-op if unsupported
                  // @ts-ignore
                  const Detector = (window as any).BarcodeDetector?.getSupportedFormats ? (window as any).BarcodeDetector : null;
                  if (Detector) {
                    // @ts-ignore
                    const det = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
                    let active = true;
                    const tick = async () => {
                      if (!active || !pickupVideoRef.current) return;
                      try {
                        const codes = await det.detect(pickupVideoRef.current);
                        if (codes && codes[0]?.rawValue) {
                          setScannedCylId(codes[0].rawValue);
                        }
                      } catch {}
                      requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                    // stop hook when stream stops
                    const stop = () => { active = false; };
                    stream.getTracks().forEach(t=> t.addEventListener('ended', stop));
                  }
                } catch {}
              }} className={`rounded-lg ring-1 ring-slate-200 px-3 py-1.5 ${pickupMode==='order'?'hover:bg-slate-50':'opacity-50 cursor-not-allowed'}`}>Start Camera</button>
              <button disabled={pickupMode!=='order'} onClick={()=>{
                if (pickupVideoRef.current) {
                  pickupVideoRef.current.pause();
                  pickupVideoRef.current.srcObject = null;
                }
                if (pickupStream) {
                  pickupStream.getTracks().forEach(t=>t.stop());
                  setPickupStream(null);
                }
              }} className={`rounded-lg ring-1 ring-slate-200 px-3 py-1.5 ${pickupMode==='order'?'hover:bg-slate-50':'opacity-50 cursor-not-allowed'}`}>Stop</button>
            </div>
          </div>
          {pickupMode==='order' && (
          <div className="flex items-center gap-2">
            <input className="flex-1 rounded-xl border border-slate-300 px-3 py-2" placeholder="Scanned Cylinder ID" value={scannedCylId} onChange={(e)=>setScannedCylId(e.target.value)} />
            <button onClick={async ()=>{
              setNotice(null);
              if (!orderId || !scannedCylId || !expectedCylId) { setNotice({ type:'error', text:'Provide order id and cylinder ids' }); return; }
              if (expectedCylId !== scannedCylId) { setNotice({ type:'error', text:'Mismatch: expected vs scanned' }); return; }
              const { lat, lon } = await getCoords();
              try {
                await api(`/orders/${orderId}/pickup`, { method:'POST', headers: { ...authHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify({ scanCylId: scannedCylId, lat, lon }) });
                const o = assigned.find((x:any)=> x._id===orderId);
                setNotice({ type:'success', text: o?.type==='refill' ? 'Picked up at Customer. Order is now In Transit.' : 'Picked up. Order is now In Transit.' });
                // Clear form and stop camera
                setOrderId('');
                setExpectedCylId('');
                setScannedCylId('');
                if (pickupVideoRef.current) {
                  pickupVideoRef.current.pause();
                  pickupVideoRef.current.srcObject = null;
                }
                if (pickupStream) {
                  pickupStream.getTracks().forEach(t=>t.stop());
                  setPickupStream(null);
                }
              } catch (e:any) {
                setNotice({ type:'error', text: e?.message || 'Pickup failed' });
              }
            }} className="rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">Confirm Pickup</button>
          </div>
          )}
          {pickupMode==='refill' && (
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <select className="w-full rounded-xl border border-slate-300 px-3 py-2" value={orderId} onChange={(e)=>{ const id = e.target.value; setOrderId(id); const o = assigned.find((x:any)=> x._id===id); setExpectedCylId(o?.cylinder?.id || ''); setSelectedPickupOrder(o || null); }}>
                <option value="">Select refill at supplier</option>
                {(assigned.filter((x:any)=> x.type==='refill' && x.status==='At Supplier')||[]).map((o:any)=> (
                  <option key={o._id} value={o._id}>{o._id} • #{o.cylinder?.id || '-'} • {o.cylinder?.size} {o.cylinder?.brand}</option>
                ))}
              </select>
            </div>
            <input className="w-40 rounded-xl border border-slate-300 px-3 py-2" placeholder="OTP (6 digits) for Pickup" value={pickupOtp} onChange={(e)=>setPickupOtp(e.target.value.replace(/[^0-9]/g,''))} />
            <button onClick={async ()=>{
              setNotice(null);
              if (!orderId) { setNotice({ type:'error', text:'Select the refill order at supplier' }); return; }
              if (!pickupOtp || pickupOtp.length !== 6) { setNotice({ type:'error', text:'Enter 6-digit OTP (refill pickup)' }); return; }
              const { lat, lon } = await getCoords();
              try {
                await api(`/orders/${orderId}/pickup-supplier`, { method:'POST', headers: { ...authHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify({ cylId: expectedCylId, otp: pickupOtp, lat, lon }) });
                setNotice({ type:'success', text: 'Pickup confirmed via OTP. Order is now In Transit.' });
                setPickupOtp('');
                setOrderId('');
                setExpectedCylId('');
                setSelectedPickupOrder(null);
                if (pickupVideoRef.current) {
                  pickupVideoRef.current.pause();
                  pickupVideoRef.current.srcObject = null;
                }
                if (pickupStream) {
                  pickupStream.getTracks().forEach(t=>t.stop());
                  setPickupStream(null);
                }
              } catch (e:any) {
                setNotice({ type:'error', text: e?.message || 'Pickup via OTP failed' });
              }
            }} className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">Confirm Pickup via OTP</button>
          </div>
          )}
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Delivery</h3>
        <div className="mt-3 grid gap-2 text-sm">
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3 text-slate-600">
            <div className="mb-2 text-xs text-slate-500">Customer QR Scanner</div>
            <div className="relative">
              <video ref={deliverVideoRef} className="w-full h-48 bg-black rounded-md" playsInline muted />
              <div ref={deliverOverlayRef} className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-emerald-500 rounded-md w-40 h-40"></div>
              </div>
            </div>
            <div className="mt-2 flex gap-2">
              <button onClick={async ()=>{
                try {
                  if (deliverStream) return;
                  const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                  setDeliverStream(stream);
                  if (deliverVideoRef.current) {
                    deliverVideoRef.current.srcObject = stream;
                    await deliverVideoRef.current.play();
                  }
                  // @ts-ignore
                  const Detector = (window as any).BarcodeDetector?.getSupportedFormats ? (window as any).BarcodeDetector : null;
                  if (Detector) {
                    // @ts-ignore
                    const det = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
                    let active = true;
                    const tick = async () => {
                      if (!active || !deliverVideoRef.current) return;
                      try {
                        const codes = await det.detect(deliverVideoRef.current);
                        if (codes && codes[0]?.rawValue) {
                          // Expect JSON payload { orderId, cylId }
                          try {
                            const payload = JSON.parse(codes[0].rawValue);
                            if (payload?.orderId && payload?.cylId) {
                              setOrderId(payload.orderId);
                              setExpectedCylId(payload.cylId);
                            }
                          } catch {}
                        }
                      } catch {}
                      requestAnimationFrame(tick);
                    };
                    requestAnimationFrame(tick);
                    const stop = () => { active = false; };
                    stream.getTracks().forEach(t=> t.addEventListener('ended', stop));
                  }
                } catch {}
              }} className="rounded-lg ring-1 ring-slate-200 px-3 py-1.5 hover:bg-slate-50">Start Camera</button>
              <button onClick={()=>{
                if (deliverVideoRef.current) {
                  deliverVideoRef.current.pause();
                  deliverVideoRef.current.srcObject = null;
                }
                if (deliverStream) {
                  deliverStream.getTracks().forEach(t=>t.stop());
                  setDeliverStream(null);
                }
              }} className="rounded-lg ring-1 ring-slate-200 px-3 py-1.5 hover:bg-slate-50">Stop</button>
            </div>
          </div>
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="OTP (6 digits)" value={otp} onChange={(e)=>setOtp(e.target.value.replace(/[^0-9]/g,''))} />
          <div className="flex items-center gap-2">
            <button onClick={async ()=>{
              setNotice(null);
              if (!orderId) { setNotice({ type:'error', text:'Provide order id' }); return; }
              const { lat, lon } = await getCoords();
              try {
                await api(`/orders/${orderId}/deliver`, { method:'POST', headers: { ...authHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify({ otp, lat, lon }) });
                setNotice({ type:'success', text:'Delivered successfully.' });
                setOtp('');
              } catch (e:any) {
                setNotice({ type:'error', text: e?.message || 'Delivery failed' });
              }
            }} className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">Confirm via OTP</button>
            <button onClick={async ()=>{
              setNotice(null);
              if (!orderId || !expectedCylId) { setNotice({ type:'error', text:'Provide order id and expected cyl id (scan or select order)' }); return; }
              const { lat, lon } = await getCoords();
              try {
                const payload = { orderId, cylId: expectedCylId };
                await api(`/orders/${orderId}/deliver`, { method:'POST', headers: { ...authHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify({ customerQrPayload: payload, lat, lon }) });
                setNotice({ type:'success', text:'Delivered successfully (QR).' });
              } catch (e:any) {
                setNotice({ type:'error', text: e?.message || 'Delivery failed' });
              }
            }} className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Confirm via QR</button>
          </div>
          <div className="mt-3 grid gap-2">
            <div className="text-xs text-slate-500">Refill handover workflow</div>
            <div className="flex items-center gap-2">
              <button onClick={async ()=>{
                setNotice(null);
                if (!orderId) { setNotice({ type:'error', text:'Provide order id' }); return; }
                const { lat, lon } = await getCoords();
                try {
                  await api(`/orders/${orderId}/arrive-supplier`, { method:'POST', headers: { ...authHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify({ lat, lon }) });
                  setNotice({ type:'success', text:'Arrived at supplier.' });
                } catch (e:any) {
                  setNotice({ type:'error', text: e?.message || 'Failed to mark arrival at supplier' });
                }
              }} className="rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">Arrive at Supplier</button>
              <button onClick={async ()=>{
                setNotice(null);
                if (!orderId) { setNotice({ type:'error', text:'Provide order id' }); return; }
                const { lat, lon } = await getCoords();
                try {
                  // Open modal listing at-supplier orders for this agent so they can choose and confirm via OTP
                    // open modal showing assigned refills at supplier (derived from assigned list)
                    setShowSupplierPickupModal(true);
                } catch (e:any) {
                  setNotice({ type:'error', text: e?.message || 'Failed to pickup from supplier' });
                }
              }} className="rounded-xl bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700">Pickup from Supplier</button>
            </div>
          </div>
        </div>
      </Card>
      {showSupplierPickupModal && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-slate-900">Pickup from Supplier — Choose Order</div>
              <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50" onClick={()=>{ setShowSupplierPickupModal(false); setSelectedPickupOrder(null); setSelectedPickupOtp(''); }}>Close</button>
            </div>
            <div className="mt-3 space-y-2">
              {(assigned.filter((x:any)=> x.type==='refill' && x.status==='At Supplier') || []).length===0 && (<div className="text-sm text-slate-600">No assigned refill orders currently at supplier.</div>)}
              {(assigned.filter((x:any)=> x.type==='refill' && x.status==='At Supplier')||[]).map((o:any)=> (
                <div key={o._id} className={`p-3 rounded-lg border ${selectedPickupOrder?._id===o._id ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'}`} onClick={()=>setSelectedPickupOrder(o)}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-slate-900">{o._id} • #{o.cylinder?.id || '-'} • {o.cylinder?.size} {o.cylinder?.brand}</div>
                    <div className="text-xs text-slate-500">Customer: {o.customer?.name || '-'}</div>
                  </div>
                  <div className="mt-2 text-xs text-slate-600">Status: {o.status} • Type: {o.type}</div>
                </div>
              ))}
              {selectedPickupOrder && (
                <div className="mt-3">
                  <div className="text-xs text-slate-600 mb-2">Enter OTP provided by supplier to confirm pickup</div>
                  <input className="rounded-xl border border-slate-300 px-3 py-2 w-full" placeholder="6-digit OTP" value={selectedPickupOtp} onChange={(e)=>setSelectedPickupOtp(e.target.value.replace(/[^0-9]/g,''))} />
                  <div className="mt-3 flex gap-2">
                    <button onClick={async ()=>{
                      if (!selectedPickupOtp || selectedPickupOtp.length !== 6) { setNotice({ type:'error', text:'Enter 6-digit OTP' }); return; }
                      const { lat, lon } = await getCoords();
                      try {
                        await api(`/orders/${selectedPickupOrder._id}/pickup-supplier`, { method:'POST', headers: { ...authHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify({ cylId: selectedPickupOrder.cylinder?.id, otp: selectedPickupOtp, lat, lon }) });
                        setNotice({ type:'success', text:'Pickup confirmed. Order is now In Transit.' });
                        setShowSupplierPickupModal(false);
                        setSelectedPickupOrder(null);
                        setSelectedPickupOtp('');
                      } catch (e:any) {
                        setNotice({ type:'error', text: e?.message || 'Pickup failed' });
                      }
                    }} className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">Confirm Pickup (OTP)</button>
                    <button onClick={()=>{ setSelectedPickupOrder(null); setSelectedPickupOtp(''); }} className="rounded-xl ring-1 ring-slate-200 px-4 py-2">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


