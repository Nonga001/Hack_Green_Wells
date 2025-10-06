import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Link, useNavigate, Navigate } from 'react-router-dom';
import { getToken, decodeRoleFromToken, clearToken } from './lib/api';
import './style.css';

import Login from './pages/Login';
import RegisterCustomer from './pages/RegisterCustomer';
import RegisterSupplier from './pages/RegisterSupplier';
import RegisterAgent from './pages/RegisterAgent';

function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="max-w-4xl w-full px-6 py-10 text-center relative z-10">
        {/* Logo/Icon with animation */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg animate-bounce-slow">
            <span className="text-3xl font-bold text-white">⚡</span>
          </div>
        </div>
        
        <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-slate-900 mb-2 animate-fade-in-up">
          SmartLPG
        </h1>
        <div className="w-24 h-1 bg-gradient-to-r from-emerald-500 to-teal-600 mx-auto mb-6 animate-scale-in"></div>
        
        <p className="mt-4 text-lg md:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
          SmartLPG is a web-based system that combines AI prediction, QR-based tracking, and customer loyalty rewards to create a seamless, transparent, and sustainable LPG ecosystem.
          <span className="block mt-2 text-emerald-600 font-medium">Seamless operations. Transparent tracking. Sustainable energy.</span>
        </p>
        
        <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up animation-delay-400">
          <Link to="/login" className="group inline-flex">
            <button className="inline-flex items-center rounded-xl bg-gradient-to-r from-slate-900 to-slate-800 px-8 py-4 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-slate-300 transition-all duration-300 ease-out">
              <span className="mr-2">🔑</span>
              Login
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
          </Link>
          <Link to="/register" className="group inline-flex">
            <button className="inline-flex items-center rounded-xl bg-white px-8 py-4 text-slate-900 font-semibold ring-2 ring-slate-200 shadow-lg hover:shadow-xl hover:ring-emerald-300 hover:bg-emerald-50 transform hover:scale-105 hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-emerald-300 transition-all duration-300 ease-out">
              <span className="mr-2">✨</span>
              Register
              <span className="ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>
          </Link>
        </div>
        
        {/* Core components */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto animate-fade-in-up animation-delay-600">
          {/* A. Cylinder Tracking & Verification */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-white/20">
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🏷️</span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2 text-center">A. Cylinder Tracking & Verification</h3>
            <ul className="text-sm text-slate-600 space-y-2 text-left">
              <li className="flex gap-2"><span>•</span><span>Each cylinder has a unique QR code or NFC tag.</span></li>
              <li className="flex gap-2"><span>•</span><span>Scanned at fill, delivery, and return via web/mobile.</span></li>
              <li className="flex gap-2"><span>•</span><span>Dashboard updates ownership, location, and history.</span></li>
              <li className="flex gap-2"><span>•</span><span>Prevents theft, double-selling, and unreturned cylinders.</span></li>
            </ul>
          </div>

          {/* B. LPG Consumption Prediction */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-white/20">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔥</span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2 text-center">B. LPG Consumption Prediction</h3>
            <ul className="text-sm text-slate-600 space-y-2 text-left">
              <li className="flex gap-2"><span>•</span><span>Users input burners and daily cooking hours.</span></li>
              <li className="flex gap-2"><span>•</span><span>AI regression predicts days remaining to empty.</span></li>
              <li className="flex gap-2"><span>•</span><span>Refill alerts via SMS, email, or in‑app notification.</span></li>
              <li className="flex gap-2"><span>•</span><span>Auto-schedules refills with suppliers before depletion.</span></li>
            </ul>
          </div>

          {/* C. Loyalty & Reward System */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 border border-white/20">
            <div className="w-12 h-12 bg-rose-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎁</span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-2 text-center">C. Loyalty & Reward System</h3>
            <ul className="text-sm text-slate-600 space-y-2 text-left">
              <li className="flex gap-2"><span>•</span><span>Earn points for every refill at partner outlets.</span></li>
              <li className="flex gap-2"><span>•</span><span>Redeem for discounts, free delivery, or free refills.</span></li>
              <li className="flex gap-2"><span>•</span><span>Drives repeat business and brand loyalty.</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterChooser() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-teal-50 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-teal-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
      </div>
      
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 relative z-10 animate-fade-in-up border border-white/20">
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
            <span className="text-2xl">✨</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Join SmartLPG</h2>
          <p className="text-slate-600">Choose your account type to get started</p>
        </div>
        
        <nav className="grid gap-4">
          <Link 
            className="group rounded-xl border border-slate-200 px-6 py-4 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-lg transform hover:scale-105 transition-all duration-200 relative overflow-hidden" 
            to="/register/customer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-200">
                <span className="text-xl">👤</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 group-hover:text-emerald-900">Customer</h3>
                <p className="text-sm text-slate-600 group-hover:text-emerald-700">Order LPG for your home or business</p>
              </div>
              <span className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-200">→</span>
            </div>
          </Link>
          
          <Link 
            className="group rounded-xl border border-slate-200 px-6 py-4 hover:bg-teal-50 hover:border-teal-300 hover:shadow-lg transform hover:scale-105 transition-all duration-200 relative overflow-hidden" 
            to="/register/supplier"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors duration-200">
                <span className="text-xl">🏭</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 group-hover:text-teal-900">Supplier</h3>
                <p className="text-sm text-slate-600 group-hover:text-teal-700">Supply LPG to customers</p>
              </div>
              <span className="text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all duration-200">→</span>
            </div>
          </Link>
          
          <Link 
            className="group rounded-xl border border-slate-200 px-6 py-4 hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg transform hover:scale-105 transition-all duration-200 relative overflow-hidden" 
            to="/register/agent"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                <span className="text-xl">🚚</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-900">Delivery Agent</h3>
                <p className="text-sm text-slate-600 group-hover:text-blue-700">Deliver LPG to customers</p>
              </div>
              <span className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200">→</span>
            </div>
          </Link>
        </nav>
      </div>
    </div>
  );
}

function LoginChooser() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-slate-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob"></div>
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-60 animate-blob animation-delay-2000"></div>
      </div>
      
      <div className="w-full max-w-lg bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 relative z-10 animate-fade-in-up border border-white/20">
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
          <div className="w-16 h-16 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl">🔑</span>
          </div>
          <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
          <p className="text-slate-600">Sign in to your SmartLPG account</p>
        </div>
        
        <nav className="grid gap-4">
          <Link 
            className="group rounded-xl border border-slate-200 px-6 py-4 hover:bg-emerald-50 hover:border-emerald-300 hover:shadow-lg transform hover:scale-105 transition-all duration-200 relative overflow-hidden" 
            to="/login/customer"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center group-hover:bg-emerald-200 transition-colors duration-200">
                <span className="text-xl">👤</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 group-hover:text-emerald-900">Customer</h3>
                <p className="text-sm text-slate-600 group-hover:text-emerald-700">Access your orders and account</p>
              </div>
              <span className="text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-200">→</span>
            </div>
          </Link>
          
          <Link 
            className="group rounded-xl border border-slate-200 px-6 py-4 hover:bg-teal-50 hover:border-teal-300 hover:shadow-lg transform hover:scale-105 transition-all duration-200 relative overflow-hidden" 
            to="/login/supplier"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center group-hover:bg-teal-200 transition-colors duration-200">
                <span className="text-xl">🏭</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 group-hover:text-teal-900">Supplier</h3>
                <p className="text-sm text-slate-600 group-hover:text-teal-700">Manage your supply operations</p>
              </div>
              <span className="text-slate-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all duration-200">→</span>
            </div>
          </Link>
          
          <Link 
            className="group rounded-xl border border-slate-200 px-6 py-4 hover:bg-blue-50 hover:border-blue-300 hover:shadow-lg transform hover:scale-105 transition-all duration-200 relative overflow-hidden" 
            to="/login/agent"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                <span className="text-xl">🚚</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900 group-hover:text-blue-900">Delivery Agent</h3>
                <p className="text-sm text-slate-600 group-hover:text-blue-700">Manage your deliveries</p>
              </div>
              <span className="text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all duration-200">→</span>
            </div>
          </Link>
          
          <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center">
                <span className="text-sm">👨‍💼</span>
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900">Admin Access</p>
                <p className="text-xs text-slate-600">Visit <span className="font-mono bg-slate-200 px-1 rounded">/admin</span> for admin login</p>
              </div>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
}

function AdminLogin() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => navigate('/')} className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 transition">
            <span>←</span>
            <span className="text-sm">Back</span>
          </button>
        </div>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Admin Login</h2>
        <p className="text-sm text-slate-600 mt-1">Use your admin credentials to continue.</p>
        <div className="mt-4">
          <Login />
        </div>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: 'customer' | 'supplier' | 'agent' | 'admin' }) {
  const token = getToken();
  const userRole = decodeRoleFromToken(token);
  if (!token) return <Navigate to="/login" replace />;
  if (role && userRole !== role) return <Navigate to={`/${userRole || ''}`} replace />;
  return <>{children}</>;
}

function DashboardLayout({ title, children }: { title: string; children: React.ReactNode }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-3xl bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">{title}</h2>
          <button onClick={() => { clearToken(); navigate('/'); }} className="inline-flex items-center rounded-md bg-rose-600 px-3 py-1.5 text-white hover:bg-rose-700">Logout</button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

function CustomerDashboard() {
  return (
    <DashboardLayout title="Customer Dashboard">
      <p className="text-slate-700">Welcome, manage your orders and deliveries.</p>
    </DashboardLayout>
  );
}

function SupplierDashboard() {
  return (
    <DashboardLayout title="Supplier Dashboard">
      <p className="text-slate-700">Manage inventory and incoming orders.</p>
    </DashboardLayout>
  );
}

function AgentDashboard() {
  return (
    <DashboardLayout title="Delivery Agent Dashboard">
      <p className="text-slate-700">View assigned deliveries and routes.</p>
    </DashboardLayout>
  );
}

function AdminDashboard() {
  return (
    <DashboardLayout title="Admin Dashboard">
      <p className="text-slate-700">System overview and user management.</p>
    </DashboardLayout>
  );
}

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/login', element: <LoginChooser /> },
  { path: '/login/:role', element: <Login /> },
  { path: '/register', element: <RegisterChooser /> },
  { path: '/register/customer', element: <RegisterCustomer /> },
  { path: '/register/supplier', element: <RegisterSupplier /> },
  { path: '/register/agent', element: <RegisterAgent /> },
  { path: '/admin', element: <AdminLogin /> },
  { path: '/customer', element: (<ProtectedRoute role="customer"><CustomerDashboard /></ProtectedRoute>) },
  { path: '/supplier', element: (<ProtectedRoute role="supplier"><SupplierDashboard /></ProtectedRoute>) },
  { path: '/agent', element: (<ProtectedRoute role="agent"><AgentDashboard /></ProtectedRoute>) },
  { path: '/dashboard', element: (<ProtectedRoute><CustomerDashboard /></ProtectedRoute>) },
  { path: '/admin/dashboard', element: (<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>) },
]);

const root = createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);




