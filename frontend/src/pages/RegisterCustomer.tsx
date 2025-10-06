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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 py-8 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
      </div>
      
      <div className="w-full max-w-2xl bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 relative z-10 animate-fade-in-up border border-white/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">👤</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Join as Customer</h2>
          <p className="text-slate-600">Create your account to start ordering LPG</p>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span>👤</span>
              Full Name
            </label>
            <input 
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 hover:border-slate-400" 
              placeholder="Jane Doe" 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              required 
            />
          </div>
          
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
              <span>📱</span>
              Phone Number
            </label>
            <input 
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 hover:border-slate-400" 
              placeholder="0712 345 678" 
              value={phoneNumber} 
              onChange={(e) => setPhoneNumber(e.target.value)} 
              required 
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
                  <span className="text-lg" role="img" aria-hidden>{showPassword ? '🙈' : '👁️'}</span>
                </button>
              </div>
              <PasswordStrengthChecker password={password} onStrengthChange={setIsPasswordStrong} />
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span>🔐</span>
                Confirm Password
              </label>
              <div className="relative">
                <input 
                  className={`w-full rounded-xl border pr-12 px-4 py-3 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    passwordError 
                      ? 'border-red-300 focus:ring-red-400 focus:border-red-400' 
                      : 'border-slate-300 focus:ring-emerald-400 focus:border-emerald-400 hover:border-slate-400'
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
                <button 
                  type="button" 
                  aria-label="Toggle confirm password visibility" 
                  onClick={() => setShowConfirmPassword((v) => !v)} 
                  className="absolute inset-y-0 right-3 my-auto h-8 w-8 grid place-items-center rounded-lg hover:bg-slate-100 transition-all duration-200 hover:scale-110"
                >
                  <span className="text-lg" role="img" aria-hidden>{showConfirmPassword ? '🙈' : '👁️'}</span>
                </button>
              </div>
              {passwordError && (
                <div className="text-sm text-red-600 mt-1 flex items-center gap-1 animate-shake">
                  <span>⚠️</span>
                  {passwordError}
                </div>
              )}
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <span>🏠</span>
              Delivery Address
            </label>
            <input 
              className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 hover:border-slate-400" 
              placeholder="123 Main Street, Apartment 4B" 
              value={addressLine} 
              onChange={(e) => setAddressLine(e.target.value)} 
              required 
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span>🏙️</span>
                City/Town
              </label>
              <input 
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 hover:border-slate-400" 
                placeholder="Nairobi" 
                value={city} 
                onChange={(e) => setCity(e.target.value)} 
                required 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                <span>📮</span>
                Postal Code
              </label>
              <input 
                className="w-full rounded-xl border border-slate-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transition-all duration-200 hover:border-slate-400" 
                placeholder="00100" 
                value={postalCode} 
                onChange={(e) => setPostalCode(e.target.value)} 
                required 
              />
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
            disabled={loading || !isFormValid} 
            type="submit" 
            className={`w-full inline-flex items-center justify-center rounded-xl px-6 py-4 text-white font-semibold shadow-lg transition-all duration-300 ${
              isFormValid && !loading 
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-xl hover:from-emerald-700 hover:to-teal-700 active:scale-[.98] transform hover:scale-105' 
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Account...
              </>
            ) : (
              <>
                <span className="mr-2">✨</span>
                Create Account
              </>
            )}
          </button>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-700 hover:text-emerald-800 font-semibold hover:underline transition-colors duration-200">
              Login here
            </Link>
          </p>
        </div>
        
        <div className="mt-6 flex justify-center">
          <button 
            type="button" 
            onClick={() => navigate('/register')} 
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 hover:ring-emerald-300 hover:text-emerald-700 transform hover:scale-105 transition-all duration-200"
          >
            <span className="text-lg">←</span>
            <span className="text-sm font-medium">Back to Registration</span>
          </button>
        </div>
      </div>
    </div>
  );
}




