import React from 'react';
import Card from '../components/Card';
import { api, authHeaders } from '../../../lib/api';

interface Cylinder {
  _id: string;
  cylId: string;
  supplierId: string;
  size: string;
  brand: string;
  status: string;
  condition?: string;
  owner: string;
  locationText?: string;
  formattedLocation?: string;
  coords?: { lat: number; lon: number } | null;
  supplierName?: string;
  supplierEmail?: string;
  updatedAt: string;
}

interface Stats {
  available: number;
  booked: number;
  inTransit: number;
  atSupplier: number;
  delivered: number;
  lost: number;
  damaged: number;
  total: number;
}

export default function Cylinders() {
  const [cylinders, setCylinders] = React.useState<Cylinder[]>([]);
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [filterStatus, setFilterStatus] = React.useState<string>('');

  const fetchCylinders = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const url = filterStatus 
        ? `/admin/cylinders?status=${filterStatus}` 
        : '/admin/cylinders';

      const [cylindersRes, statsRes] = await Promise.all([
        api(url, { headers: authHeaders() }),
        api('/admin/cylinders/stats', { headers: authHeaders() }),
      ]);

      setCylinders(cylindersRes.cylinders || []);
      setStats(statsRes.stats || null);
    } catch (err: any) {
      setError(err.message || 'Failed to load cylinders');
      console.error('Failed to fetch cylinders:', err);
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  React.useEffect(() => {
    fetchCylinders();
  }, [fetchCylinders]);

  const handleReportCylinder = async () => {
    if (!showReportModal || !reportStatus) return;

    try {
      setActionLoading(showReportModal._id);

      await api(`/admin/cylinders/${showReportModal._id}/status`, {
        method: 'PATCH',
        headers: { ...authHeaders(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: reportStatus,
          notes: reportNotes || undefined,
        }),
      });

      await fetchCylinders();
      setShowReportModal(null);
      setReportStatus('');
      setReportNotes('');
    } catch (err: any) {
      alert(err.message || 'Failed to update cylinder status');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Available': 'bg-emerald-100 text-emerald-700',
      'Booked': 'bg-blue-100 text-blue-700',
      'In Transit': 'bg-purple-100 text-purple-700',
      'At Supplier': 'bg-indigo-100 text-indigo-700',
      'Delivered': 'bg-green-100 text-green-700',
      'Lost': 'bg-rose-100 text-rose-700',
      'Damaged': 'bg-amber-100 text-amber-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  if (loading && !cylinders.length) {
    return (
      <div className="grid place-items-center h-64">
        <div className="text-slate-500">Loading cylinders...</div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="rounded-xl border border-slate-200 p-3 bg-white">
              <div className="text-xs text-slate-500">Total</div>
              <div className="text-xl font-bold text-slate-900">{stats.total}</div>
            </div>
            <div className="rounded-xl border border-emerald-200 p-3 bg-emerald-50">
              <div className="text-xs text-emerald-700">Available</div>
              <div className="text-xl font-bold text-emerald-900">{stats.available}</div>
            </div>
            <div className="rounded-xl border border-blue-200 p-3 bg-blue-50">
              <div className="text-xs text-blue-700">Booked</div>
              <div className="text-xl font-bold text-blue-900">{stats.booked}</div>
            </div>
            <div className="rounded-xl border border-purple-200 p-3 bg-purple-50">
              <div className="text-xs text-purple-700">In Transit</div>
              <div className="text-xl font-bold text-purple-900">{stats.inTransit}</div>
            </div>
            <div className="rounded-xl border border-indigo-200 p-3 bg-indigo-50">
              <div className="text-xs text-indigo-700">At Supplier</div>
              <div className="text-xl font-bold text-indigo-900">{stats.atSupplier}</div>
            </div>
            <div className="rounded-xl border border-green-200 p-3 bg-green-50">
              <div className="text-xs text-green-700">Delivered</div>
              <div className="text-xl font-bold text-green-900">{stats.delivered}</div>
            </div>
            <div className="rounded-xl border border-rose-200 p-3 bg-rose-50">
              <div className="text-xs text-rose-700">Lost</div>
              <div className="text-xl font-bold text-rose-900">{stats.lost}</div>
            </div>
            <div className="rounded-xl border border-amber-200 p-3 bg-amber-50">
              <div className="text-xs text-amber-700">Damaged</div>
              <div className="text-xl font-bold text-amber-900">{stats.damaged}</div>
            </div>
          </div>
        )}

        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              All Cylinders ({cylinders.length})
            </h3>
            <div className="flex gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg border border-slate-300"
              >
                <option value="">All Statuses</option>
                <option value="Available">Available</option>
                <option value="Booked">Booked</option>
                <option value="In Transit">In Transit</option>
                <option value="At Supplier">At Supplier</option>
                <option value="Delivered">Delivered</option>
                <option value="Lost">Lost</option>
                <option value="Damaged">Damaged</option>
              </select>
              <button 
                onClick={fetchCylinders} 
                disabled={loading}
                className="px-3 py-1.5 text-sm rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-3 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-3">
              {error}
            </div>
          )}

          {cylinders.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {filterStatus ? `No cylinders with status "${filterStatus}"` : 'No cylinders found'}
            </div>
          ) : (
            <div className="grid gap-2 text-sm max-h-[600px] overflow-y-auto">
              {cylinders.map(cyl => (
                <div 
                  key={cyl._id} 
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 p-3 hover:bg-slate-50"
                >
                  <div className="flex-1 min-w-[150px]">
                    <div className="font-medium text-slate-900">{cyl.cylId}</div>
                    <div className="text-xs text-slate-500">{cyl.brand} - {cyl.size}</div>
                  </div>
                  
                  <div className="flex-1 min-w-[120px] text-xs text-slate-600">
                    <div><span className="font-medium">Supplier:</span> {cyl.supplierName}</div>
                    <div><span className="font-medium">Owner:</span> {cyl.owner}</div>
                  </div>

                  <div className="flex-1 min-w-[150px] text-xs text-slate-600">
                    {cyl.condition && <div><span className="font-medium">Condition:</span> {cyl.condition}</div>}
                    {cyl.formattedLocation && (
                      <div className="flex items-start gap-1">
                        <span className="font-medium">Location:</span>
                        <span className="break-all">{cyl.formattedLocation}</span>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-500">
                    {new Date(cyl.updatedAt).toLocaleDateString()}
                  </div>

                  <div className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(cyl.status)}`}>
                    {cyl.status}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}


