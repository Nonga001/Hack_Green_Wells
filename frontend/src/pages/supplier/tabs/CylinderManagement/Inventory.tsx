import React from 'react';
import Card from '../../components/Card';
import type { CylinderRow } from '../Cylinders';

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
              <th className="py-2 pr-4">Status</th>
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
                <td className="py-2 pr-4">{r.status}</td>
                <td className="py-2 pr-4">{r.owner}</td>
                <td className="py-2 pr-4">{r.location}</td>
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
                  <img alt="QR" className="h-64 w-64 object-contain" src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${encodeURIComponent(JSON.stringify({ id: modal.row.id, size: modal.row.size, brand: modal.row.brand }))}`} />
                </div>
              )}
              {modal.type==='edit' && (
                <div className="grid gap-3 text-sm">
                  <div className="font-mono">{modal.row.id}</div>
                  <div>Size: {modal.row.size}</div>
                  <div>Brand: {modal.row.brand}</div>
                  <div>Status: {modal.row.status}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}


