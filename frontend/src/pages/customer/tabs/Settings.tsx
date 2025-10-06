import React from 'react';
import Card from '../components/Card';
// No DB/token population for profile fields per requirement
import PasswordStrengthChecker from '../../../components/PasswordStrengthChecker';
import { api, authHeaders } from '../../../lib/api';

export default function Settings() {
  const [fullName, setFullName] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [phone, setPhone] = React.useState('');
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [addressLine, setAddressLine] = React.useState('');
  const [city, setCity] = React.useState('');
  const [postalCode, setPostalCode] = React.useState('');
  const [useLocation, setUseLocation] = React.useState(false);
  const [coords, setCoords] = React.useState<{ lat: number; lon: number } | null>(null);
  const [notice, setNotice] = React.useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const isPasswordValid = newPassword.length > 0 && newPassword === confirmPassword && currentPassword.length > 0;
  const isProfileDirty = phone.trim().length > 0; // allow Save only if phone changed/non-empty
  const isAddressDirty = addressLine.trim() || city.trim() || postalCode.trim() ? true : false;

  React.useEffect(() => {
    (async () => {
      try {
        const me = await api('/user/me', { headers: { ...authHeaders() } });
        setFullName(me.fullName || '');
        setEmail(me.email || '');
        setPhone(me.phoneNumber || '');
        if (me.deliveryAddress) {
          setAddressLine(me.deliveryAddress.addressLine || '');
          setCity(me.deliveryAddress.city || '');
          setPostalCode(me.deliveryAddress.postalCode || '');
        }
        setNotice(null);
      } catch {}
    })();
  }, []);

  function onUseLocationToggle() {
    const next = !useLocation;
    setUseLocation(next);
    if (next && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lon: longitude });
        try {
          const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`);
          const data = await resp.json();
          const addr = data.address || {};
          setAddressLine(data.display_name || addressLine);
          setCity(addr.city || addr.town || addr.village || city || '');
          setPostalCode(addr.postcode || postalCode || '');
        } catch {
          setAddressLine(`Near (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
        }
      }, () => {
        // Fallback if permission denied
        setAddressLine('Current Location');
      });
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Profile</h3>
        {notice && notice.type === 'success' && (
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm p-3">{notice.text}</div>
        )}
        {notice && notice.type === 'error' && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 text-sm p-3">{notice.text}</div>
        )}
        <div className="mt-3 grid gap-3">
          <input className="rounded-xl border border-slate-300 px-3 py-2 bg-slate-50" placeholder="Full Name" value={fullName} readOnly />
          <input className="rounded-xl border border-slate-300 px-3 py-2 bg-slate-50" placeholder="Email" value={email} readOnly />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <button
            disabled={!isProfileDirty}
            onClick={async ()=>{
              try {
                await api('/user/me', { method:'PUT', headers: { ...authHeaders() }, body: JSON.stringify({ phoneNumber: phone })});
                setNotice({ type: 'success', text: 'Profile updated successfully.' });
              } catch (e: any) {
                setNotice({ type: 'error', text: e?.message || 'Failed to update profile.' });
              }
            }}
            className={`mt-1 self-start rounded-xl px-4 py-2 text-white ${isProfileDirty ? 'bg-slate-900 hover:bg-slate-800' : 'bg-gray-400 cursor-not-allowed'}`}
          >Save</button>
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Security</h3>
        <div className="mt-3 grid gap-3">
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Current Password" type="password" value={currentPassword} onChange={(e)=>setCurrentPassword(e.target.value)} />
          <div className="relative">
            <input className="w-full rounded-xl border border-slate-300 px-3 py-2 pr-12" placeholder="New Password" type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} />
            <button type="button" className="absolute inset-y-0 right-2 my-auto h-8 px-2 rounded-lg text-sm ring-1 ring-slate-200 hover:bg-slate-50" onClick={()=>setShowNewPassword(v=>!v)}>{showNewPassword ? '🙈' : '👁️'}</button>
          </div>
          <PasswordStrengthChecker password={newPassword} />
          <div className="relative">
            <input className="w-full rounded-xl border border-slate-300 px-3 py-2 pr-12" placeholder="Confirm Password" type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} />
            <button type="button" className="absolute inset-y-0 right-2 my-auto h-8 px-2 rounded-lg text-sm ring-1 ring-slate-200 hover:bg-slate-50" onClick={()=>setShowConfirmPassword(v=>!v)}>{showConfirmPassword ? '🙈' : '👁️'}</button>
          </div>
          <button
            disabled={!isPasswordValid}
            onClick={async ()=>{
              try {
                await api('/user/me/change-password', { method:'POST', headers: { ...authHeaders() }, body: JSON.stringify({ currentPassword, newPassword })});
                setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                setNotice({ type: 'success', text: 'Password updated successfully.' });
              } catch (e: any) {
                setNotice({ type: 'error', text: e?.message || 'Failed to update password.' });
              }
            }}
            className={`mt-1 self-start rounded-xl px-4 py-2 text-white ${isPasswordValid ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-400 cursor-not-allowed'}`}
          >Update Password</button>
        </div>
      </Card>
      <Card className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900">Addresses</h3>
        <div className="mt-3 grid md:grid-cols-3 gap-3">
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Address Line" value={addressLine} onChange={(e)=>setAddressLine(e.target.value)} />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="City" value={city} onChange={(e)=>setCity(e.target.value)} />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Postal Code" value={postalCode} onChange={(e)=>setPostalCode(e.target.value)} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={useLocation} onChange={onUseLocationToggle} />
            <span>Use current location</span>
          </label>
          <button
            disabled={!isAddressDirty}
            onClick={async ()=>{
              try {
                await api('/user/me', { method:'PUT', headers: { ...authHeaders() }, body: JSON.stringify({ deliveryAddress: { addressLine, city, postalCode } })});
                setNotice({ type: 'success', text: 'Address saved.' });
              } catch (e: any) {
                setNotice({ type: 'error', text: e?.message || 'Failed to save address.' });
              }
            }}
            className={`rounded-xl px-4 py-2 text-white ${isAddressDirty ? 'bg-slate-900 hover:bg-slate-800' : 'bg-gray-400 cursor-not-allowed'}`}
          >Save Address</button>
        </div>
        {coords && (
          <div className="mt-4 rounded-xl overflow-hidden border border-slate-200">
            <iframe
              title="map"
              className="w-full h-56"
              src={`https://www.openstreetmap.org/export/embed.html?marker=${coords.lat},${coords.lon}&layer=mapnik`}
            />
          </div>
        )}
      </Card>
    </div>
  );
}


