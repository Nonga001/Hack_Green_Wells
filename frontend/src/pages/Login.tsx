import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, setToken, decodeRoleFromToken } from '../lib/api';

export default function Login() {
  const params = useParams();
  const role = (params as any).role as 'customer' | 'supplier' | 'agent' | undefined;
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setToken(data.token);
      const userRole = decodeRoleFromToken(data.token);
      if (userRole === 'admin') window.location.href = '/admin/dashboard';
      else if (userRole === 'supplier') window.location.href = '/supplier';
      else if (userRole === 'agent') window.location.href = '/agent';
      else window.location.href = '/customer';
    } catch (err: any) {
      if (err.message === 'Invalid credentials') {
        setError('Incorrect email or password. Please check your credentials and try again.');
      } else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6 transition-transform duration-200 hover:shadow-md">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => navigate('/')} className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 transition">
            <span>←</span>
            <span className="text-sm">Back</span>
          </button>
        </div>
        <h2 className="mt-2 text-xl font-semibold text-slate-900">Login{role ? ` – ${role.charAt(0).toUpperCase() + role.slice(1)}` : ''}</h2>
        <form onSubmit={onSubmit} className="mt-3 grid gap-3">
          <label className="text-sm font-medium text-slate-700">
            Email
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="you@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Password
            <div className="mt-1 relative">
              <input className="w-full rounded-md border border-slate-300 pr-12 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="••••••••" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-2 my-auto h-8 w-8 grid place-items-center rounded-md hover:bg-slate-100 transition">
                <span className="text-lg" role="img" aria-hidden>
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </button>
            </div>
          </label>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button disabled={loading} type="submit" className="inline-flex items-center justify-center rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-white shadow hover:shadow-md hover:from-emerald-700 hover:to-teal-700 active:scale-[.99] disabled:opacity-60 transition">
            {loading ? 'Loading...' : 'Login'}
          </button>
        </form>
        <div className="mt-4 text-sm text-slate-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-700 hover:underline">Register here</Link>
        </div>
      </div>
    </div>
  );
}




