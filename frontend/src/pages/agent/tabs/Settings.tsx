import React from 'react';
import Card from '../components/Card';
import { api, authHeaders } from '../../../lib/api';

export default function Settings() {
  const [fullName, setFullName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [online, setOnline] = React.useState(false);
  const [address, setAddress] = React.useState('');
  const [coords, setCoords] = React.useState<{ lat: number; lon: number } | null>(null);
  const [notice, setNotice] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const me = await api('/user/me', { headers: { ...authHeaders() } });
        setFullName(me.fullName || '');
        setEmail(me.email || '');
        setPhone(me.phoneNumber || '');
        setOnline(!!me.availability);
        if (typeof me.agentLat === 'number' && typeof me.agentLon === 'number') {
          setCoords({ lat: me.agentLat, lon: me.agentLon });
        }
      } catch {}
    })();
  }, []);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Profile</h3>
        {notice && (<div className={`mt-3 rounded-lg p-3 text-sm ${notice.type==='success'?'bg-emerald-50 border border-emerald-200 text-emerald-800':'bg-rose-50 border border-rose-200 text-rose-700'}`}>{notice.text}</div>)}
        <div className="mt-3 grid gap-3">
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Full Name" value={fullName} readOnly />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Email" value={email} readOnly />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} />
          <div className="grid gap-2">
            <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Address (optional)" value={address} onChange={(e)=>setAddress(e.target.value)} />
            <div className="flex items-center gap-2">
              <button type="button" onClick={()=>{
                if (!navigator.geolocation) { setNotice({ type:'error', text:'Geolocation not supported.'}); return; }
                navigator.geolocation.getCurrentPosition((pos)=>{
                  setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
                }, (err)=> setNotice({ type:'error', text: err?.message || 'Failed to get location' }));
              }} className="rounded-lg ring-1 ring-slate-200 px-3 py-1.5 hover:bg-slate-50">Use Current Location</button>
              <div className="text-xs text-slate-600">{coords? `${coords.lat.toFixed(4)}, ${coords.lon.toFixed(4)}` : 'No coordinates'}</div>
            </div>
            <div className="rounded-xl overflow-hidden border border-slate-200">
              <iframe title="agent-loc" className="w-full h-40" src={coords?`https://www.openstreetmap.org/export/embed.html?marker=${coords.lat},${coords.lon}&layer=mapnik`:`https://www.openstreetmap.org/export/embed.html?bbox=36.80,-1.34,36.95,-1.20&layer=mapnik&marker=-1.2921,36.8219`} />
            </div>
          </div>
          <button onClick={async ()=>{
            try {
              await api('/user/me', { method:'PUT', headers: { ...authHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify({ phoneNumber: phone, availability: online, agentLat: coords?.lat, agentLon: coords?.lon }) });
              setNotice({ type:'success', text:'Saved.'});
            } catch (e:any) {
              setNotice({ type:'error', text: e?.message || 'Failed to save.'});
            }
          }} className="mt-1 self-start rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">Save</button>
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Security</h3>
        <div className="mt-3 grid gap-3">
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Current Password" type="password" />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="New Password" type="password" />
          <button className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">Update Password</button>
        </div>
      </Card>
    </div>
  );
}


