import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, setToken } from '../lib/api';
import PasswordStrengthChecker from '../components/PasswordStrengthChecker';

export default function RegisterAgent() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [vehicleType, setVehicleType] = useState('');
  const [vehicleRegistrationNumber, setVehicleRegistrationNumber] = useState('');
  const [nationalIdOrLicense, setNationalIdOrLicense] = useState('');
  const [baseArea, setBaseArea] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordStrong, setIsPasswordStrong] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPasswordError(null);
    
    // Validate password match
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      const data = await api('/auth/register/agent', {
        method: 'POST',
        body: JSON.stringify({
          role: 'agent', fullName, email, phoneNumber, password, confirmPassword,
          vehicleType, vehicleRegistrationNumber, nationalIdOrLicense, baseArea,
        }),
      });
      setToken(data.token);
      window.location.href = '/agent';
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  // Check if all required fields are filled and password is strong
  const isFormValid = fullName.trim() && 
                     email.trim() && 
                     phoneNumber.trim() && 
                     password.trim() && 
                     confirmPassword.trim() && 
                     vehicleType.trim() && 
                     vehicleRegistrationNumber.trim() && 
                     nationalIdOrLicense.trim() && 
                     baseArea.trim() && 
                     isPasswordStrong && 
                     password === confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-emerald-50 px-4 py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
      </div>
      
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 relative z-10 animate-fade-in-up border border-white/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">🚚</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Join as Delivery Agent</h2>
          <p className="text-slate-600">Create your agent account to start delivering LPG</p>
        </div>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span>👤</span>
              Full Name
            </label>
            <input 
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 hover:border-slate-400" 
              placeholder="Jane Doe" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              required 
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span>📧</span>
                Email Address
              </label>
              <input 
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 hover:border-slate-400" 
                placeholder="you@example.com" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span>📱</span>
                Phone Number
              </label>
              <input 
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-200 hover:border-slate-400" 
                placeholder="0712 345 678" 
                value={phoneNumber} 
                onChange={(e) => setPhoneNumber(e.target.value)} 
                required 
              />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-sm font-medium text-slate-700">
              Password
              <div className="mt-1 relative">
                <input className="w-full rounded-md border border-slate-300 pr-12 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="••••••••" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button type="button" aria-label="Toggle password visibility" onClick={() => setShowPassword((v) => !v)} className="absolute inset-y-0 right-2 my-auto h-8 w-8 grid place-items-center rounded-md hover:bg-slate-100 transition">
                  <span className="text-lg" role="img" aria-hidden>{showPassword ? '🙈' : '👁️'}</span>
                </button>
              </div>
              <PasswordStrengthChecker password={password} onStrengthChange={setIsPasswordStrong} />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Confirm Password
              <div className="mt-1 relative">
                <input 
                  className={`w-full rounded-md border pr-12 px-3 py-2 focus:outline-none focus:ring-2 ${
                    passwordError ? 'border-red-300 focus:ring-red-400' : 'border-slate-300 focus:ring-slate-400'
                  }`} 
                  placeholder="••••••••" 
                  type={showConfirmPassword ? 'text' : 'password'} 
                  value={confirmPassword} 
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (passwordError) setPasswordError(null);
                  }} 
                  required 
                />
                <button type="button" aria-label="Toggle confirm password visibility" onClick={() => setShowConfirmPassword((v) => !v)} className="absolute inset-y-0 right-2 my-auto h-8 w-8 grid place-items-center rounded-md hover:bg-slate-100 transition">
                  <span className="text-lg" role="img" aria-hidden>{showConfirmPassword ? '🙈' : '👁️'}</span>
                </button>
              </div>
              {passwordError && <div className="text-sm text-red-600 mt-1">{passwordError}</div>}
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-sm font-medium text-slate-700">
              Vehicle Type
              <input className="mt-1 rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="Motorbike / Pickup" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)} required />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Vehicle Registration Number
              <input className="mt-1 rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="KAA 123A" value={vehicleRegistrationNumber} onChange={(e) => setVehicleRegistrationNumber(e.target.value)} required />
            </label>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="text-sm font-medium text-slate-700">
              National ID or Driving License Number
              <input className="mt-1 rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="12345678" value={nationalIdOrLicense} onChange={(e) => setNationalIdOrLicense(e.target.value)} required />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Base Area or Region
              <input className="mt-1 rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="Nairobi CBD" value={baseArea} onChange={(e) => setBaseArea(e.target.value)} required />
            </label>
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button 
            disabled={loading || !isFormValid} 
            type="submit" 
            className={`inline-flex items-center justify-center rounded-md px-4 py-2 text-white shadow transition ${
              isFormValid && !loading 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-md hover:from-emerald-700 hover:to-teal-700 active:scale-[.99]' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? 'Loading...' : 'Register'}
          </button>
        </form>
        <div className="mt-4 text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-700 hover:underline">Login here</Link>
        </div>
        <div className="mt-4 flex justify-center">
          <button type="button" onClick={() => navigate('/register')} className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 transition">
            <span>←</span>
            <span className="text-sm">Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}




