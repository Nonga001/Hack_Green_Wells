import React from 'react';
import Card from '../components/Card';
import AddCylinder from './CylinderManagement/Add';
import Inventory from './CylinderManagement/Inventory';
import { api, authHeaders } from '../../../lib/api';

export type CylinderRow = {
  id: string;
  size: string;
  brand: string;
  price?: number;
  status: 'Available' | 'In Transit' | 'Delivered' | 'Lost' | 'Damaged';
  owner: string;
  location: string;
  added: string;
  coords?: { lat: number; lon: number } | null;
  lastType?: 'order' | 'refill';
  currentActiveType?: 'order' | 'refill';
  lastAddressText?: string | null;
};

export default function Cylinders() {
  const [tab, setTab] = React.useState<'add' | 'inventory'>('add');
  const [rows, setRows] = React.useState<CylinderRow[]>([]);

  function handleAdd(row: CylinderRow) {
    setRows((prev) => [row, ...prev]);
    setTab('inventory');
  }

  const loadCylinders = React.useCallback(async () => {
    try {
      const docs = await api('/cylinders', { headers: { ...authHeaders() } });
      const mapped: CylinderRow[] = (docs || []).map((d: any) => ({
        id: d.cylId,
        size: d.size,
        brand: d.brand,
        price: d.price,
        status: d.status || 'Available',
        owner: (d.ownerName && (d.owner === 'Customer' || d.owner === 'Agent')) ? `${d.owner} (${d.ownerName})` : (d.owner || 'Supplier'),
        location: d.locationText || '',
        added: (d.createdAt || '').slice(0,10),
        coords: d.coords || null,
        lastType: d.lastType === 'refill' ? 'refill' : 'order',
        currentActiveType: d.currentActiveType === 'refill' ? 'refill' : (d.currentActiveType === 'order' ? 'order' : undefined),
        lastAddressText: d.lastAddressText || '',
      }));
      setRows(mapped);
    } catch {
      // ignore load errors for now
    }
  }, []);

  React.useEffect(() => {
    loadCylinders();
  }, [loadCylinders]);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button onClick={()=>setTab('add')} className={`px-3 py-1.5 rounded-xl text-sm ring-1 ${tab==='add'?'bg-teal-600 text-white ring-teal-600':'ring-slate-200 hover:bg-slate-50'}`}>Add Cylinder</button>
        <button onClick={()=>setTab('inventory')} className={`px-3 py-1.5 rounded-xl text-sm ring-1 ${tab==='inventory'?'bg-teal-600 text-white ring-teal-600':'ring-slate-200 hover:bg-slate-50'}`}>Cylinder Inventory</button>
        {tab==='inventory' && (
          <button onClick={loadCylinders} className="ml-auto px-3 py-1.5 rounded-xl text-sm bg-emerald-600 text-white hover:bg-emerald-700">
            🔄 Refresh
          </button>
        )}
      </div>
      {tab==='add' && <AddCylinder onAdd={handleAdd} />}
      {tab==='inventory' && <Inventory rows={rows} />}
    </div>
  );
}


