import React from 'react';
import Card from '../components/Card';
import { api, authHeaders } from '../../../lib/api';

export default function Settings() {
  const [businessName, setBusinessName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [businessAddress, setBusinessAddress] = React.useState('');
  const [lat, setLat] = React.useState<number | ''>('');
  const [lon, setLon] = React.useState<number | ''>('');
  const [notice, setNotice] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [showNew, setShowNew] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        const me = await api('/user/me', { headers: { ...authHeaders() } });
        setBusinessName(me.businessName || '');
        setEmail(me.email || '');
        setPhone(me.phoneNumber || '');
        setBusinessAddress(me.businessAddress || '');
        setLat(typeof me.businessLat==='number'? me.businessLat : '');
        setLon(typeof me.businessLon==='number'? me.businessLon : '');
      } catch {}
    })();
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Business Info</h3>
        {notice && notice.type==='success' && (<div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">{notice.text}</div>)}
        {notice && notice.type==='error' && (<div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{notice.text}</div>)}
        <div className="mt-3 grid gap-3">
          <input className="rounded-xl border border-slate-300 px-3 py-2 bg-slate-50" placeholder="Business Name" value={businessName} readOnly />
          <input className="rounded-xl border border-slate-300 px-3 py-2 bg-slate-50" placeholder="Contact Email" value={email} readOnly />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Phone" value={phone} onChange={(e)=>setPhone(e.target.value)} />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Business Address" value={businessAddress} onChange={(e)=>setBusinessAddress(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Latitude" value={lat} onChange={(e)=>setLat(e.target.value===''?'':Number(e.target.value))} />
            <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Longitude" value={lon} onChange={(e)=>setLon(e.target.value===''?'':Number(e.target.value))} />
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={()=>{
              if (!navigator.geolocation) { setNotice({ type:'error', text:'Geolocation is not supported by this browser.'}); return; }
              navigator.geolocation.getCurrentPosition((pos)=>{
                const la = Number(pos.coords.latitude.toFixed(6));
                const lo = Number(pos.coords.longitude.toFixed(6));
                setLat(la); setLon(lo);
                setNotice({ type:'success', text:'Coordinates captured from your current location.'});
              }, (err)=>{
                setNotice({ type:'error', text: err?.message || 'Failed to get current location.'});
              }, { enableHighAccuracy: true, timeout: 10000 });
            }} className="rounded-xl ring-1 ring-slate-200 px-4 py-2 hover:bg-slate-50">Use Current Location</button>
            <button onClick={async ()=>{
              try { await api('/user/me', { method:'PUT', headers: { ...authHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify({ phoneNumber: phone, businessAddress, businessLat: typeof lat==='number'? lat: undefined, businessLon: typeof lon==='number'? lon: undefined })}); setNotice({ type:'success', text:'Business profile updated.'}); } catch (e: any) { setNotice({ type:'error', text: e?.message || 'Failed to update.'}); }
            }} className="rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">Save</button>
          </div>
          <div className="mt-2 rounded-xl overflow-hidden border border-slate-200">
            <iframe key={`${lat},${lon}`} title="biz-map" className="w-full h-40" src={(typeof lat==='number' && typeof lon==='number')?`https://www.openstreetmap.org/export/embed.html?marker=${lat},${lon}&layer=mapnik`:''} />
          </div>
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Security</h3>
        <div className="mt-3 grid gap-3">
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Current Password" type="password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} />
          <div className="relative">
            <input className="w-full rounded-xl border border-slate-300 px-3 py-2 pr-12" placeholder="New Password" type={showNew?'text':'password'} value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} />
            <button type="button" className="absolute inset-y-0 right-2 my-auto h-8 px-2 rounded-lg text-sm ring-1 ring-slate-200 hover:bg-slate-50" onClick={()=>setShowNew(v=>!v)}>{showNew?'🙈':'👁️'}</button>
          </div>
          <button onClick={async ()=>{ try { await api('/user/me/change-password', { method:'POST', headers: { ...authHeaders(), 'Content-Type':'application/json' }, body: JSON.stringify({ currentPassword, newPassword })}); setCurrentPassword(''); setNewPassword(''); setNotice({ type:'success', text:'Password updated.'}); } catch (e: any) { setNotice({ type:'error', text: e?.message || 'Failed to update password.'}); } }} className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">Update Password</button>
        </div>
      </Card>
    </div>
  );
}


