import React from 'react';
import Card from '../components/Card';
import { api, authHeaders, API_URL } from '../../../lib/api';

type Rule = {
  id: string;
  name?: string;
  triggerType: 'nth_order' | 'nth_refill';
  nth: number;
  rewardType: 'percent_off' | 'free_delivery' | 'fixed_amount';
  value?: number;
  active?: boolean;
};

type Redemption = {
  _id: string;
  customerId: string;
  ruleId: string;
  status: 'pending'|'approved'|'rejected';
  eligible: boolean;
  createdAt: string;
};

export default function Loyalty() {
  const [rules, setRules] = React.useState<Rule[]>([]);
  const [redemptions, setRedemptions] = React.useState<Redemption[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<Rule | null>(null);

  React.useEffect(()=>{
    (async ()=>{
      try {
        const cfg:any = await api('/suppliers/me/loyalty', { headers: { ...authHeaders() } });
        setRules(cfg.rules || []);
        setPointsDivisor(cfg.pointsDivisor || 10);
        setTiers(cfg.tiers || []);
        const reds:any[] = await api('/suppliers/me/loyalty/redemptions', { headers: { ...authHeaders() } });
        setRedemptions(reds || []);
      } catch (e) {
        console.error('failed loading loyalty', e);
      } finally { setLoading(false); }
    })();
  }, []);

  async function saveRules(nextRules: Rule[]) {
    setLoading(true);
    try {
      // quick health check so we can surface a clearer error when the server is unreachable
      try {
        await api('/health');
      } catch (err:any) {
        throw new Error(`Server unreachable at ${API_URL} — check backend is running`);
      }

  const updated = await api('/suppliers/me/loyalty', { method: 'PUT', headers: { ...authHeaders(), 'Content-Type': 'application/json' }, body: JSON.stringify({ rules: nextRules, pointsDivisor, tiers }) });
      setRules(updated.rules || []);
      setEditing(null);
    } catch (e:any) {
      console.error('Failed saving loyalty rules', e);
      alert(e?.message || 'Failed saving loyalty rules — see console for details');
    }
    setLoading(false);
  }

  function openNewRule() {
    setEditing({ id: '', name: '', triggerType: 'nth_refill', nth: 2, rewardType: 'percent_off', value: 10, active: true });
  }

  const [pointsDivisor, setPointsDivisor] = React.useState<number>(10);
  const [tiers, setTiers] = React.useState<Array<{ id: string; name?: string; minPoints: number; benefitType: any; benefitValue?: number }>>([]);

  function addTier() {
    setTiers((cur)=>[...cur, { id: String(Math.random()).slice(2), name: 'New Tier', minPoints: 100, benefitType: 'percent_off', benefitValue: 10 }]);
  }

  function removeTier(id:string) { setTiers((cur)=>cur.filter(t=>t.id!==id)); }

  function updateTier(id:string, patch:any) { setTiers((cur)=>cur.map(t=> t.id===id ? { ...t, ...patch } : t)); }

  function editRule(r: Rule) { setEditing(r); }

  async function approveRedeem(id:string) {
    try {
      await api(`/suppliers/me/loyalty/redemptions/${id}/approve`, { method: 'POST', headers: { ...authHeaders() } });
      setRedemptions((cur)=>cur.map(c=> c._id===id ? { ...c, status: 'approved' } : c));
    } catch (e:any) { alert(e?.message || 'Failed'); }
  }

  async function rejectRedeem(id:string) {
    try {
      await api(`/suppliers/me/loyalty/redemptions/${id}/reject`, { method: 'POST', headers: { ...authHeaders() } });
      setRedemptions((cur)=>cur.map(c=> c._id===id ? { ...c, status: 'rejected' } : c));
    } catch (e:any) { alert(e?.message || 'Failed'); }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">Loyalty Rules</h3>
            <p className="mt-1 text-sm text-slate-600">Configure how loyal customers are rewarded.</p>
          </div>
          <div>
            <button onClick={openNewRule} className="px-3 py-1.5 rounded-lg bg-slate-900 text-white">Add Rule</button>
          </div>
        </div>

        <div className="mt-3 space-y-2 text-sm">
          {loading ? (<div className="text-sm text-slate-500">Loading...</div>) : (
            rules.length === 0 ? <div className="text-sm text-slate-500">No loyalty rules configured.</div> : (
              rules.map((r) => (
                <div key={r.id} className="rounded-lg border border-slate-200 p-3 flex items-center justify-between">
                  <div>
                    <div className="font-medium">{r.name || `${r.nth} ${r.triggerType === 'nth_refill' ? 'refill' : 'order'}`}</div>
                    <div className="text-xs text-slate-500">{r.rewardType === 'percent_off' ? `${r.value}% off` : r.rewardType === 'free_delivery' ? 'Free delivery' : `KES ${r.value}`}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={()=>editRule(r)} className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Edit</button>
                    <button onClick={()=>{ const next = rules.map(x => x.id===r.id ? { ...x, active: !x.active } : x); saveRules(next); }} className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">{r.active ? 'Disable' : 'Enable'}</button>
                  </div>
                </div>
              ))
            )
          )}
        </div>

        {editing && (
          <div className="mt-4 rounded-lg border border-slate-200 p-4 bg-white">
            <h4 className="font-semibold">{editing.id ? 'Edit Rule' : 'New Rule'}</h4>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <label className="text-sm">Name
                <input className="mt-1 w-full rounded border p-2" value={editing.name} onChange={(e)=>setEditing({...editing, name: e.target.value}) as any} />
              </label>
              <label className="text-sm">Trigger
                <select className="mt-1 w-full rounded border p-2" value={editing.triggerType} onChange={(e)=>setEditing({...editing, triggerType: e.target.value as any}) as any}>
                  <option value="nth_refill">Nth Refill</option>
                  <option value="nth_order">Nth Order</option>
                </select>
              </label>
              <label className="text-sm">Nth
                <input type="number" min={1} className="mt-1 w-full rounded border p-2" value={editing.nth} onChange={(e)=>setEditing({...editing, nth: Number(e.target.value)||1}) as any} />
              </label>
              <label className="text-sm">Reward
                <select className="mt-1 w-full rounded border p-2" value={editing.rewardType} onChange={(e)=>setEditing({...editing, rewardType: e.target.value as any}) as any}>
                  <option value="percent_off">Percent off</option>
                  <option value="free_delivery">Free delivery</option>
                  <option value="fixed_amount">Fixed amount</option>
                </select>
              </label>
              {editing.rewardType !== 'free_delivery' && (
                <label className="text-sm">Value
                  <input type="number" className="mt-1 w-full rounded border p-2" value={editing.value || 0} onChange={(e)=>setEditing({...editing, value: Number(e.target.value)||0}) as any} />
                </label>
              )}
            </div>
            <div className="mt-3 flex gap-2">
              <button onClick={async ()=>{
                // save locally and call API
                const nextRules = [...rules];
                const r = { ...editing, id: editing.id || String(Math.random()).slice(2) } as Rule;
                const exists = nextRules.findIndex(x=>x.id===r.id);
                if (exists === -1) nextRules.push(r); else nextRules[exists] = r;
                await saveRules(nextRules);
              }} className="px-3 py-1.5 rounded bg-slate-900 text-white">Save</button>
              <button onClick={()=>setEditing(null)} className="px-3 py-1.5 rounded ring-1 ring-slate-200">Cancel</button>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Reward Redemptions</h3>
        <div className="mt-3 space-y-2 text-sm">
          {redemptions.length === 0 ? <div className="text-sm text-slate-500">No redemption requests.</div> : (
            redemptions.map(r => (
              <div key={r._id} className="rounded-lg border border-slate-200 p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{r.customerId} • {r.eligible ? 'Eligible' : 'Not eligible'}</div>
                  <div className="text-xs text-slate-500">Requested: {new Date(r.createdAt).toLocaleString()}</div>
                </div>
                <div className="flex gap-2">
                  <div className="px-3 py-1.5 rounded text-sm">{r.status}</div>
                  {r.status === 'pending' && (
                    <>
                      <button onClick={()=>approveRedeem(r._id)} className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Approve</button>
                      <button onClick={()=>rejectRedeem(r._id)} className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Reject</button>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Points & Tiers</h3>
        <div className="mt-3 text-sm space-y-2">
          <label className="text-sm">Points divisor (1 point per N currency units)
            <input type="number" min={1} className="mt-1 w-full rounded border p-2" value={pointsDivisor} onChange={(e)=>setPointsDivisor(Number(e.target.value)||1)} />
          </label>
          <div>
            <div className="flex items-center justify-between">
              <div className="font-medium">Tiers</div>
              <button className="px-2 py-1 rounded bg-slate-100" onClick={addTier}>Add Tier</button>
            </div>
            <div className="mt-2 space-y-2">
              {tiers.map(t => (
                <div key={t.id} className="flex items-center gap-2 border rounded p-2">
                  <input className="rounded border p-1" value={t.name} onChange={(e)=>updateTier(t.id, { name: e.target.value })} />
                  <input type="number" className="rounded border p-1 w-24" value={t.minPoints} onChange={(e)=>updateTier(t.id, { minPoints: Number(e.target.value)||0 })} />
                  <select className="rounded border p-1" value={t.benefitType} onChange={(e)=>updateTier(t.id, { benefitType: e.target.value })}>
                    <option value="percent_off">Percent off</option>
                    <option value="free_delivery">Free delivery</option>
                    <option value="fixed_amount">Fixed amount</option>
                  </select>
                  {t.benefitType !== 'free_delivery' && (
                    <input type="number" className="rounded border p-1 w-24" value={t.benefitValue||0} onChange={(e)=>updateTier(t.id, { benefitValue: Number(e.target.value)||0 })} />
                  )}
                  <button className="px-2 py-1 rounded bg-rose-50" onClick={()=>removeTier(t.id)}>Remove</button>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-2">
            <button onClick={()=>saveRules(rules)} className="px-3 py-1.5 rounded bg-emerald-600 text-white">Save Points & Tiers</button>
          </div>
        </div>
      </Card>
    </div>
  );
}


