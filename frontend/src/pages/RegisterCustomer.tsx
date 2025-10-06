import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, setToken } from '../lib/api';
import PasswordStrengthChecker from '../components/PasswordStrengthChecker';

export default function RegisterCustomer() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
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
      const data = await api('/auth/register/customer', {
        method: 'POST',
        body: JSON.stringify({
          role: 'customer', fullName, email, phoneNumber, password, confirmPassword,
          deliveryAddress: { addressLine, city, postalCode },
        }),
      });
      setToken(data.token);
      window.location.href = '/customer';
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
                     addressLine.trim() && 
                     city.trim() && 
                     postalCode.trim() && 
                     isPasswordStrong && 
                     password === confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-2xl bg-white rounded-xl shadow p-6 transition-transform duration-200 hover:shadow-md">
        <h2 className="text-2xl font-semibold text-slate-900">Register as Customer</h2>
        <form onSubmit={onSubmit} className="mt-4 grid gap-3 max-w-2xl">
          <label className="text-sm font-medium text-slate-700">
            Full Name
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="Jane Doe" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Email
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="you@example.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Phone Number
            <input className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="0712 345 678" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />
          </label>
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
          <input className="w-full rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="Delivery Address" value={addressLine} onChange={(e) => setAddressLine(e.target.value)} required />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input className="rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="City/Town" value={city} onChange={(e) => setCity(e.target.value)} required />
            <input className="rounded-md border border-slate-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400" placeholder="Postal Code" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required />
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




