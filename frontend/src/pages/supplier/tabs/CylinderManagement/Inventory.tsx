import React from 'react';
import Card from '../../components/Card';
import type { CylinderRow } from '../Cylinders';
import { api, authHeaders } from '../../../../lib/api';

export default function Inventory({ rows = [] }: { rows?: CylinderRow[] }) {
  const [status, setStatus] = React.useState<'All' | CylinderRow['status']>('All');
  const filtered = rows.filter(r => status==='All' ? true : r.status===status);
  const [modal, setModal] = React.useState<null | { type: 'map' | 'qr' | 'edit'; row: CylinderRow }>(null);
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Cylinder Inventory</h3>
        <select className="rounded-xl border border-slate-300 px-3 py-2 text-sm" value={status} onChange={(e)=>setStatus(e.target.value as any)}>
          <option>All</option>
          <option>Available</option>
          <option>Booked</option>
          <option>In Transit</option>
          <option>Delivered</option>
          <option>Lost</option>
          <option>Damaged</option>
        </select>
      </div>
      <div className="mt-3 overflow-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-slate-600">
              <th className="py-2 pr-4">Cylinder ID</th>
              <th className="py-2 pr-4">Size</th>
              <th className="py-2 pr-4">Brand</th>
              <th className="py-2 pr-4">Price</th>
              <th className="py-2 pr-4">Status</th>
              <th className="py-2 pr-4">Type</th>
              <th className="py-2 pr-4">Current Owner</th>
              <th className="py-2 pr-4">Last Scanned Location</th>
              <th className="py-2 pr-4">Date Added</th>
              <th className="py-2 pr-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r => (
              <tr key={r.id} className="border-t border-slate-200">
                <td className="py-2 pr-4 font-mono">{r.id}</td>
                <td className="py-2 pr-4">{r.size}</td>
                <td className="py-2 pr-4">{r.brand}</td>
                <td className="py-2 pr-4">{typeof (r as any).price === 'number' ? `KES ${(r as any).price}` : '-'}</td>
                <td className="py-2 pr-4">{r.status}</td>
                <td className="py-2 pr-4">
                  {((r as any).currentActiveType) ? (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${((r as any).currentActiveType)==='refill' ? 'bg-teal-100 text-teal-700' : 'bg-slate-100 text-slate-700'}`}>
                      {((r as any).currentActiveType)==='refill' ? 'Refill' : 'Order'}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">—</span>
                  )}
                </td>
                <td className="py-2 pr-4">{r.owner}</td>
                <td className="py-2 pr-4">{(r as any).lastAddressText || r.location}</td>
                <td className="py-2 pr-4">{r.added}</td>
                <td className="py-2 pr-4 flex gap-2">
                  <button onClick={()=>setModal({ type:'map', row:r })} className="px-2 py-1 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">View Map</button>
                  <button onClick={()=>setModal({ type:'qr', row:r })} className="px-2 py-1 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">QR</button>
                  <button onClick={()=>setModal({ type:'edit', row:r })} className="px-2 py-1 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modal && (
        <div className="fixed inset-0 bg-black/40 grid place-items-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl p-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-semibold text-slate-900">
                {modal.type==='map' && 'Cylinder Location Map'}
                {modal.type==='qr' && 'Cylinder QR'}
                {modal.type==='edit' && 'Edit Cylinder'}
              </div>
              <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50" onClick={()=>setModal(null)}>Close</button>
            </div>
            <div className="mt-3">
              {modal.type==='map' && (
                <div className="rounded-xl overflow-hidden border border-slate-200">
                  <iframe title="map" className="w-full h-64" src={modal.row.coords?`https://www.openstreetmap.org/export/embed.html?marker=${modal.row.coords.lat},${modal.row.coords.lon}&layer=mapnik`:`https://www.openstreetmap.org/export/embed.html?bbox=36.80,-1.34,36.95,-1.20&layer=mapnik&marker=-1.2921,36.8219`} />
                </div>
              )}
              {modal.type==='qr' && (
                <div className="grid place-items-center">
                  <img
                    alt="QR"
                    className="h-64 w-64 object-contain"
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(JSON.stringify({ id: modal.row.id, size: modal.row.size, brand: modal.row.brand, price: (modal.row as any).price }))}`}
                  />
                </div>
              )}
              {modal.type==='edit' && (
                <div className="grid gap-3 text-sm">
                  <div className="font-mono">{modal.row.id}</div>
                  <div>Size: {modal.row.size}</div>
                  <div>Brand: {modal.row.brand}</div>
                  <div className="flex items-center gap-2">Status
                    <select disabled={(modal.row as any).status==='Booked' || (modal.row as any).status==='Delivered'} className="ml-2 rounded-xl border border-slate-300 px-2 py-1 disabled:bg-slate-100" defaultValue={modal.row.status} onChange={async (e)=>{
                      try { await api(`/cylinders/${modal.row.id}`, { method:'PATCH', headers: { ...authHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify({ status: e.target.value })}); } catch {}
                    }}>
                      <option>Available</option>
                      <option disabled>Booked</option>
                      <option>In Transit</option>
                      <option>Delivered</option>
                      <option>Lost</option>
                      <option>Damaged</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">Price (KES)
                    <input id="price-input" disabled={(modal.row as any).status==='Booked' || (modal.row as any).status==='Delivered' || (modal.row as any).status==='In Transit'} className="ml-2 rounded-xl border border-slate-300 px-2 py-1 w-32 disabled:bg-slate-100" type="number" min={0} placeholder="e.g. 2450" defaultValue={(modal.row as any).price ?? ''} />
                    <button
                      disabled={(modal.row as any).status==='Booked' || (modal.row as any).status==='Delivered' || (modal.row as any).status==='In Transit'}
                      className="rounded-lg px-3 py-1.5 ring-1 ring-slate-200 hover:bg-slate-50 disabled:bg-slate-100"
                      onClick={async ()=>{
                        const input = document.getElementById('price-input') as HTMLInputElement | null;
                        if (!input) return;
                        const val = Number(input.value);
                        if (isNaN(val) || val < 0) return;
                        try { await api(`/cylinders/${modal.row.id}`, { method:'PATCH', headers: { ...authHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify({ price: val })}); (modal.row as any).price = val; } catch {}
                      }}
                    >Save Changes</button>
                  </div>
                  <div className="flex items-center gap-2">Refill Price (KES)
                    <input id="refill-price-input" disabled={(modal.row as any).status==='Booked' || (modal.row as any).status==='In Transit'} className="ml-2 rounded-xl border border-slate-300 px-2 py-1 w-32 disabled:bg-slate-100" type="number" min={0} placeholder="e.g. 1200" defaultValue={(modal.row as any).refillPrice ?? ''} />
                    <button
                      disabled={(modal.row as any).status==='Booked' || (modal.row as any).status==='In Transit'}
                      className="rounded-lg px-3 py-1.5 ring-1 ring-slate-200 hover:bg-slate-50 disabled:bg-slate-100"
                      onClick={async ()=>{
                        const input = document.getElementById('refill-price-input') as HTMLInputElement | null;
                        if (!input) return;
                        const val = Number(input.value);
                        if (isNaN(val) || val < 0) return;
                        try { await api(`/cylinders/${modal.row.id}`, { method:'PATCH', headers: { ...authHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify({ refillPrice: val })}); (modal.row as any).refillPrice = val; } catch {}
                      }}
                    >Save Changes</button>
                  </div>
                  {((modal.row as any).status==='Booked') && (
                    <div className="text-xs text-slate-500">Booked cylinders cannot be edited.</div>
                  )}
                  {((modal.row as any).status==='In Transit') && (
                    <div className="text-xs text-slate-500">In Transit cylinders cannot be price-edited.</div>
                  )}
                  {((modal.row as any).status==='Delivered') && (
                    <div className="text-xs text-slate-500">Delivered cylinders: only refill price is editable.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}


