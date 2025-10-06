import React from 'react';
import Card from '../components/Card';

export default function Settings() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Business Info</h3>
        <div className="mt-3 grid gap-3">
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Business Name" />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Contact Email" />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Phone" />
          <button className="mt-1 self-start rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">Save</button>
        </div>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Security & Staff</h3>
        <div className="mt-3 grid gap-3">
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="New Staff Email" />
          <button className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">Invite Staff</button>
          <div className="h-px bg-slate-200" />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="Current Password" type="password" />
          <input className="rounded-xl border border-slate-300 px-3 py-2" placeholder="New Password" type="password" />
          <button className="rounded-xl bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700">Update Password</button>
        </div>
      </Card>
    </div>
  );
}


