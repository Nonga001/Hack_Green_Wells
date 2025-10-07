import React from 'react';
import Card from '../components/Card';
import { api, authHeaders } from '../../../lib/api';

type Supplier = {
  id: string;
  name: string;
  phone: string;
  coords: { lat: number; lon: number };
  inventory: { cylId: string; size: string; brand: string; price: number }[];
};

const suppliersMock: Supplier[] = [];

function haversineKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lon - a.lon) * Math.PI / 180;
  const lat1 = a.lat * Math.PI / 180;
  const lat2 = b.lat * Math.PI / 180;
  const x = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(x));
}

export default function Order() {
  const today = React.useMemo(() => new Date().toISOString().slice(0,10), []);
  const [subTab, setSubTab] = React.useState<'order' | 'refill'>('order');
  const [customerCoords, setCustomerCoords] = React.useState<{ lat: number; lon: number } | null>(null);
  const [size, setSize] = React.useState('13kg');
  const [selectedSupplier, setSelectedSupplier] = React.useState<Supplier | null>(null);
  const [brand, setBrand] = React.useState('Oryx');
  const [selectedCylId, setSelectedCylId] = React.useState<string>('');
  const [date, setDate] = React.useState(today);
  const [time, setTime] = React.useState('12:00');
  const [payment, setPayment] = React.useState('M-Pesa');
  const [notes, setNotes] = React.useState('');
  const [locNotice, setLocNotice] = React.useState<string>('');

  React.useEffect(() => {
    async function fetchSuppliers() {
      try {
        const data = await api('/suppliers');
        const fallback = { lat: -1.2921, lon: 36.8219 };
        const mapped: Supplier[] = (data || []).map((s: any) => ({ id: s.id, name: s.name, phone: s.phone, coords: s.coords || fallback, inventory: [] }));
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
            const c = { lat: pos.coords.latitude, lon: pos.coords.longitude };
            setCustomerCoords(c);
            const nearest = mapped
              .map(s => ({ s, d: haversineKm(c, s.coords) }))
              .sort((a,b)=>a.d-b.d)[0]?.s || null;
            setSelectedSupplier(nearest);
            // Fetch nearest supplier's available inventory
            if (nearest) {
              (async () => {
                try {
                  const inv: any[] = await api(`/cylinders/available?supplierId=${nearest.id}`);
                  setSelectedSupplier((cur)=> cur ? { ...cur, inventory: (inv||[]).map(i=>({ cylId: i.cylId, size: i.size, brand: i.brand, price: i.price })) } : cur);
                  // Preselect first cylinder matching default size/brand
                  const first = (inv||[]).find(i => i.size===size && i.brand===brand);
                  setSelectedCylId(first?.cylId || '');
                } catch {}
              })();
            }
          }, (err)=> { setLocNotice(err?.message || 'Location permission denied.'); setSelectedSupplier(mapped[0] || null); });
        } else {
          setSelectedSupplier(mapped[0] || null);
        }
      } catch {
        // ignore
      }
    }
    fetchSuppliers();
  }, []);

  const supplierDistanceKm = React.useMemo(() => {
    if (!customerCoords || !selectedSupplier) return 0;
    return Math.round(haversineKm(customerCoords, selectedSupplier.coords) * 10) / 10;
  }, [customerCoords, selectedSupplier]);

  const baseDelivery = 120; // KES
  const perKm = 25; // KES/km
  const deliveryCost = Math.max(baseDelivery, Math.round(baseDelivery + supplierDistanceKm * perKm));

  const unitPrice = React.useMemo(() => {
    if (!selectedSupplier) return 0;
    const match = selectedSupplier.inventory.find(i => i.cylId === selectedCylId) || selectedSupplier.inventory.find(i => i.size === size && i.brand === brand);
    return match?.price || 0;
  }, [selectedSupplier, size, brand, selectedCylId]);

  const total = unitPrice + (deliveryCost || 0);

  const matchingCylinders = React.useMemo(() => {
    if (!selectedSupplier) return [] as { cylId: string; price: number }[];
    return selectedSupplier.inventory.filter(i => i.size===size && i.brand===brand).map(i => ({ cylId: i.cylId, price: i.price }));
  }, [selectedSupplier, size, brand]);

  const outOfStock = matchingCylinders.length === 0;

  const [notice, setNotice] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function placeOrder() {
    if (!selectedSupplier) return;
    if (outOfStock) return;
    try {
      await api('/orders', {
        method: 'POST',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId: selectedSupplier.id,
          cylinder: { id: selectedCylId, size, brand, price: unitPrice },
          delivery: { date, time, distanceKm: supplierDistanceKm, fee: deliveryCost },
          total,
          notes,
        }),
      });
      setNotice({ type: 'success', text: 'Order placed successfully.' });
      // Reset selection except location/supplier; refresh available inventory
      setSelectedCylId('');
      setSize('13kg');
      setBrand('Oryx');
      setDate(today);
      setTime('12:00');
      setPayment('M-Pesa');
      setNotes('');
      if (selectedSupplier) {
        try {
          const inv: any[] = await api(`/cylinders/available?supplierId=${selectedSupplier.id}`);
          setSelectedSupplier((cur)=> cur ? { ...cur, inventory: (inv||[]).map(i=>({ cylId: i.cylId, size: i.size, brand: i.brand, price: i.price })) } : cur);
        } catch {}
      }
    } catch (e: any) {
      setNotice({ type: 'error', text: e?.message || 'Failed to place order.' });
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <div className="flex items-center gap-2">
          <button onClick={()=>setSubTab('order')} className={`px-3 py-1.5 rounded-xl text-sm ring-1 ${subTab==='order'?'bg-emerald-600 text-white ring-emerald-600':'ring-slate-200 hover:bg-slate-50'}`}>Order</button>
          <button onClick={()=>setSubTab('refill')} className={`px-3 py-1.5 rounded-xl text-sm ring-1 ${subTab==='refill'?'bg-emerald-600 text-white ring-emerald-600':'ring-slate-200 hover:bg-slate-50'}`}>Refill</button>
        </div>
        {locNotice && (<div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{locNotice}</div>)}
        {notice && notice.type==='success' && (<div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice.text}</div>)}
        {notice && notice.type==='error' && (<div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{notice.text}</div>)}
        <form className="mt-4 grid gap-4" onSubmit={(e)=>{e.preventDefault(); void placeOrder();}}>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm font-medium text-slate-700">Cylinder Size
              <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400" value={size} onChange={(e)=>setSize(e.target.value)}>
                <option>6kg</option>
                <option>13kg</option>
                <option>22.5kg</option>
                <option>50kg</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">Brand
              <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400" value={brand} onChange={(e)=>setBrand(e.target.value)}>
                <option>Oryx</option>
                <option>Total</option>
                <option>K-Gas</option>
                <option>Pro-Gas</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">Delivery Date
              <input type="date" min={today} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={date} onChange={(e)=>setDate(e.target.value)} />
            </label>
          </div>
          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">Select Cylinder Number</div>
            <select className="w-full rounded-xl border border-slate-300 px-3 py-2" value={selectedCylId} onChange={(e)=>setSelectedCylId(e.target.value)}>
              <option value="" disabled>{matchingCylinders.length? 'Choose cylinder ID' : 'No matching cylinders'}</option>
              {matchingCylinders.map(c => (
                <option key={c.cylId} value={c.cylId}>{c.cylId} — KES {c.price}</option>
              ))}
            </select>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm font-medium text-slate-700">Delivery Time
              <input type="time" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={time} onChange={(e)=>setTime(e.target.value)} />
            </label>
            <label className="text-sm font-medium text-slate-700">Payment Method
              <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={payment} onChange={(e)=>setPayment(e.target.value)}>
                <option>M-Pesa</option>
                <option>Cash</option>
                <option>Card</option>
              </select>
            </label>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <div className="text-sm font-medium text-slate-700 mb-2">Nearest Supplier</div>
              <div className="rounded-xl border border-slate-200 p-3 text-sm">
                {selectedSupplier ? (
                  <>
                    <div className="font-semibold text-slate-900">{selectedSupplier.name}</div>
                    <div className="text-slate-600">{selectedSupplier.phone}</div>
                    <div className="text-slate-600">Distance: {supplierDistanceKm} km</div>
                    <div className="mt-2 rounded-xl overflow-hidden border border-slate-200">
                      <iframe title="supplier-map" className="w-full h-40" src={selectedSupplier?`https://www.openstreetmap.org/export/embed.html?marker=${selectedSupplier.coords.lat},${selectedSupplier.coords.lon}&layer=mapnik`:''} />
                    </div>
                  </>
                ) : (
                  <div className="text-slate-500">
                    Locating nearest supplier...
                    <div className="mt-2">
                      <button type="button" onClick={()=>{
                        if (!navigator.geolocation) { setLocNotice('Geolocation not supported.'); return; }
                        navigator.geolocation.getCurrentPosition((pos)=>{
                          const c = { lat: pos.coords.latitude, lon: pos.coords.longitude };
                          setCustomerCoords(c);
                          // refetch suppliers and recompute nearest
                          api('/suppliers').then((data:any[])=>{
                            const fallback = { lat: -1.2921, lon: 36.8219 };
                            const mapped: Supplier[] = (data || []).map((s: any) => ({ id: s.id, name: s.name, phone: s.phone, coords: s.coords || fallback, inventory: [] }));
                            const nearest = mapped.map(s=>({ s, d: haversineKm(c, s.coords) })).sort((a,b)=>a.d-b.d)[0]?.s || null;
                            setSelectedSupplier(nearest);
                            if (nearest) {
                              api(`/cylinders/available?supplierId=${nearest.id}`).then((inv:any[])=>{
                                setSelectedSupplier((cur)=> cur ? { ...cur, inventory: (inv||[]).map(i=>({ cylId: i.cylId, size: i.size, brand: i.brand, price: i.price })) } : cur);
                              }).catch(()=>{});
                            }
                            setLocNotice('');
                          });
                        }, (err)=> setLocNotice(err?.message || 'Unable to get location')); }} className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Share Location</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <label className="text-sm font-medium text-slate-700">Delivery Notes
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="e.g. Call on arrival" value={notes} onChange={(e)=>setNotes(e.target.value)} />
            </label>
          </div>

          <div className="flex items-center justify-end">
            <button disabled={!selectedSupplier || outOfStock || !selectedCylId} type="submit" className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-white shadow transition ${(!selectedSupplier || outOfStock || !selectedCylId)?'bg-gray-400 cursor-not-allowed':'bg-emerald-600 hover:bg-emerald-700'}`}>
              <span>🛒</span>
              <span>{outOfStock? 'Out of Stock' : (!selectedCylId? 'Select Cylinder' : 'Place Order')}</span>
            </button>
          </div>
        </form>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Price Summary</h3>
        <div className="mt-3 space-y-2 text-sm text-slate-700">
          <div className="flex justify-between"><span>Cylinder ID</span><span>{selectedCylId || '-'}</span></div>
          <div className="flex justify-between"><span>{size} Cylinder</span><span>KES {unitPrice.toLocaleString()}</span></div>
          <div className="flex justify-between"><span>Delivery ({supplierDistanceKm} km)</span><span>KES {deliveryCost.toLocaleString()}</span></div>
          <div className="flex justify-between font-semibold"><span>Total</span><span>KES {total.toLocaleString()}</span></div>
        </div>
        <div className="mt-4 rounded-lg bg-emerald-50 text-emerald-700 text-xs p-3">Estimated points earned: {Math.round(total/100)}</div>
      </Card>
    </div>
  );
}


