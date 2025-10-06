import React from 'react';
import Card from '../components/Card';

export default function Scan() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">QR/NFC Scanner</h3>
        <div className="mt-2 h-56 rounded-lg bg-slate-50 grid place-items-center text-slate-400 text-sm">Scanner Placeholder</div>
        <button className="mt-3 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-white hover:bg-slate-800">
          <span>📷</span>
          <span>Start Scan</span>
        </button>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Verification</h3>
        <div className="mt-2 text-sm text-slate-700 space-y-1">
          <div>Expected ID: CYL-1001</div>
          <div>Scanned ID: —</div>
          <div>Status: Not verified</div>
        </div>
        <div className="mt-3 flex gap-2">
          <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Report Mismatch</button>
          <button className="px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50">Confirm</button>
        </div>
      </Card>
    </div>
  );
}


