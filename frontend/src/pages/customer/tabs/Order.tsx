import React from 'react';
import Card from '../components/Card';

export default function Order() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Card className="lg:col-span-2">
        <h3 className="text-lg font-semibold text-slate-900">Refill Cylinder</h3>
        <form className="mt-4 grid gap-4">
          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm font-medium text-slate-700">Cylinder Size
              <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-400">
                <option>6kg</option>
                <option>13kg</option>
                <option>22.5kg</option>
                <option>50kg</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">Supplier (nearest)
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="Type to search..." />
            </label>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm font-medium text-slate-700">Delivery Date
              <input type="date" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
            </label>
            <label className="text-sm font-medium text-slate-700">Delivery Time
              <input type="time" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" />
            </label>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <label className="text-sm font-medium text-slate-700">Payment Method
              <select className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2">
                <option>M-Pesa</option>
                <option>Cash</option>
                <option>Card</option>
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">Delivery Notes
              <input className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2" placeholder="e.g. Call on arrival" />
            </label>
          </div>
          <div className="flex items-center justify-end">
            <button type="button" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-white shadow hover:shadow-md hover:bg-emerald-700 transition">
              <span>🛒</span>
              <span>Place Order</span>
            </button>
          </div>
        </form>
      </Card>
      <Card>
        <h3 className="text-lg font-semibold text-slate-900">Price Summary</h3>
        <div className="mt-3 space-y-2 text-sm text-slate-700">
          <div className="flex justify-between"><span>13kg Cylinder</span><span>KES 2,450</span></div>
          <div className="flex justify-between"><span>Delivery</span><span>KES 150</span></div>
          <div className="flex justify-between font-semibold"><span>Total</span><span>KES 2,600</span></div>
        </div>
        <div className="mt-4 rounded-lg bg-emerald-50 text-emerald-700 text-xs p-3">Earn 26 loyalty points with this order.</div>
      </Card>
    </div>
  );
}


