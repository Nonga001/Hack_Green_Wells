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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-slate-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
      </div>
      
      <div className="w-full max-w-md bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 relative z-10 animate-fade-in-up border border-white/20">
        <div className="flex items-center justify-between mb-6">
          <button 
            type="button" 
            onClick={() => navigate('/')} 
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 hover:ring-emerald-300 hover:text-emerald-700 transform hover:scale-105 transition-all duration-200"
          >
            <span className="text-lg">←</span>
            <span className="text-sm font-medium">Back</span>
          </button>
        </div>
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">🔑</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Welcome Back{role ? `, ${role.charAt(0).toUpperCase() + role.slice(1)}` : ''}
          </h2>
          <p className="text-slate-600">Sign in to your SmartLPG account</p>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span>📧</span>
              Email Address
            </label>
            <input 
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 hover:border-slate-400" 
              placeholder="you@example.com" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span>🔒</span>
              Password
            </label>
            <div className="relative">
              <input 
                className="w-full rounded-xl border border-slate-300 pr-12 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 hover:border-slate-400" 
                placeholder="••••••••" 
                type={showPassword ? 'text' : 'password'} 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
              <button 
                type="button" 
                aria-label="Toggle password visibility" 
                onClick={() => setShowPassword((v) => !v)} 
                className="absolute inset-y-0 right-3 my-auto h-8 w-8 grid place-items-center rounded-lg hover:bg-slate-100 transition-all duration-200 hover:scale-110"
              >
                <span className="text-lg" role="img" aria-hidden>
                  {showPassword ? '🙈' : '👁️'}
                </span>
              </button>
            </div>
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 animate-shake">
              <div className="flex items-center gap-2">
                <span className="text-red-500">⚠️</span>
                <span className="text-sm text-red-700 font-medium">{error}</span>
              </div>
            </div>
          )}
          
          <button 
            disabled={loading} 
            type="submit" 
            className="w-full inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 text-white font-semibold shadow-lg hover:shadow-xl hover:from-emerald-700 hover:to-teal-700 active:scale-[.98] disabled:opacity-60 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 ease-out"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Signing in...
              </>
            ) : (
              <>
                <span className="mr-2">🚀</span>
                Sign In
              </>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline transition-colors duration-200">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}




