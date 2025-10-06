import React from 'react';
import Card from '../../components/Card';
import type { CylinderRow } from '../Cylinders';
import { api, authHeaders } from '../../../../lib/api';

function generateCylinderId(): string {
  const num = Math.floor(100000 + Math.random() * 900000);
  return `CYL-KE-${num}`;
}

export default function AddCylinder({ onAdd }: { onAdd: (row: CylinderRow) => void }) {
  const [size, setSize] = React.useState('13kg');
  const [brand, setBrand] = React.useState('Oryx');
  const [manufactureDate, setManufactureDate] = React.useState('');
  const [condition, setCondition] = React.useState<'New' | 'Used' | 'Damaged'>('New');
  const [cylId, setCylId] = React.useState(generateCylinderId());
  const [status] = React.useState('Available');
  const [location, setLocation] = React.useState<string>('Business Address');
  const [coords, setCoords] = React.useState<{ lat: number; lon: number } | null>(null);
  const [notice, setNotice] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [useGps, setUseGps] = React.useState(false);
  const [qrUrl, setQrUrl] = React.useState<string>('');

  React.useEffect(() => {
    if (!useGps) {
      setCoords(null);
      setLocation('Business Address');
      return;
    }
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lon: longitude });
        setLocation(`GPS (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
      });
    }
  }, [useGps]);

  function resetForm() {
    setSize('13kg');
    setBrand('Oryx');
    setManufactureDate('');
    setCondition('New');
    setCylId(generateCylinderId());
  }

  function supplierScopedId(baseId: string): string {
    const supplierId = localStorage.getItem('supplierId') || 'SUP-LOCAL';
    return `${supplierId}-${baseId}`; // ensures uniqueness scoping by supplier
  }

  function buildQrPayload() {
    return {
      id: supplierScopedId(cylId),
      size,
      brand,
      manufactureDate,
    };
  }

  async function generateQrUrl() {
    const payload = encodeURIComponent(JSON.stringify(buildQrPayload()));
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${payload}`;
    setQrUrl(url);
  }

  async function downloadQr(filename: string) {
    if (!qrUrl) return;
    try {
      const res = await fetch(qrUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch {}
  }

  return (
    <Card>
      <h3 className="text-lg font-semibold text-slate-900">Add Cylinder</h3>
      {notice && (
        <div className={`mt-3 rounded-lg p-3 text-sm ${notice.type==='success'?'bg-emerald-50 border border-emerald-200 text-emerald-800':'bg-rose-50 border border-rose-200 text-rose-700'}`}>{notice.text}</div>
      )}
      <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={async (e)=>{
        e.preventDefault();
        if (!manufactureDate) { setNotice({ type:'error', text:'Please provide a valid manufacture date.'}); return; }
        const today = new Date().toISOString().slice(0,10);
        if (manufactureDate > today) { setNotice({ type:'error', text:'Manufacture date cannot be in the future.'}); return; }
        const id = supplierScopedId(cylId);
        const row: CylinderRow = {
          id,
          size,
          brand,
          status: 'Available',
          owner: 'Supplier',
          location,
          added: new Date().toISOString().slice(0,10),
          coords,
        };
        try {
          await api('/cylinders', { method:'POST', headers: { ...authHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify({
            cylId: id,
            size,
            brand,
            manufactureDate,
            condition,
            status: 'Available',
            owner: 'Supplier',
            locationText: location,
            coords,
          }) });
          setNotice({ type:'success', text:'Cylinder saved to inventory. QR generated.'});
        } catch (e: any) {
          setNotice({ type:'error', text: e?.message || 'Failed to save cylinder.'});
          return;
        }
        onAdd(row);
        await generateQrUrl();
        resetForm();
      }}>
        <label className="text-sm font-medium text-slate-700">Cylinder Size
          <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={size} onChange={(e)=>setSize(e.target.value)}>
            <option>6kg</option>
            <option>13kg</option>
            <option>22.5kg</option>
            <option>50kg</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">Brand
          <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={brand} onChange={(e)=>setBrand(e.target.value)}>
            <option>Total</option>
            <option>Oryx</option>
            <option>K-Gas</option>
            <option>Pro-Gas</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">Manufacture Date
          <input type="date" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={manufactureDate} onChange={(e)=>setManufactureDate(e.target.value)} />
        </label>
        <label className="text-sm font-medium text-slate-700">Condition
          <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" value={condition} onChange={(e)=>setCondition(e.target.value as any)}>
            <option>New</option>
            <option>Used</option>
            <option>Damaged</option>
          </select>
        </label>
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-xs text-slate-500">Cylinder ID</div>
            <div className="text-base font-mono font-semibold">{cylId}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Status</div>
            <div className="text-base font-semibold">{status}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Initial Location</div>
            <div className="text-sm text-slate-700">{location}</div>
          </div>
        </div>
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm font-medium text-slate-700 mb-2">QR Code (Preview)</div>
            {qrUrl ? (
              <img src={qrUrl} alt="QR" className="h-40 w-40 border border-dashed border-slate-300 rounded-xl object-contain bg-white" />
            ) : (
              <div className="h-40 w-40 grid place-items-center border border-dashed border-slate-300 rounded-xl text-slate-400">No QR</div>
            )}
            <div className="mt-2 flex items-center gap-2">
              <button type="button" onClick={generateQrUrl} className="text-sm px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Generate QR</button>
              <button type="button" onClick={()=>downloadQr(`${supplierScopedId(cylId)}.png`)} className="text-sm px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50" disabled={!qrUrl}>Download Label</button>
            </div>
          </div>
          <div className="rounded-xl overflow-hidden border border-slate-200">
            <iframe
              title="cyl-loc-map"
              className="w-full h-40"
              src={coords?`https://www.openstreetmap.org/export/embed.html?marker=${coords.lat},${coords.lon}&layer=mapnik`:`https://www.openstreetmap.org/export/embed.html?bbox=36.80,-1.34,36.95,-1.20&layer=mapnik&marker=-1.2921,36.8219`}
            />
          </div>
        </div>
        <div className="md:col-span-2 flex items-center gap-2">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700 mr-auto">
            <input type="checkbox" checked={useGps} onChange={(e)=>setUseGps(e.target.checked)} />
            <span>Use current GPS for initial location (otherwise Business Address)</span>
          </label>
          <button type="submit" className="rounded-xl bg-teal-600 px-4 py-2 text-white hover:bg-teal-700">Save Cylinder</button>
          <button type="button" onClick={resetForm} className="rounded-xl ring-1 ring-slate-200 px-4 py-2 hover:bg-slate-50">Reset</button>
        </div>
      </form>
    </Card>
  );
}


