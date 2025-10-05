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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white to-slate-100">
      <div className="max-w-3xl w-full px-6 py-10 text-center">
        <h1 className="text-5xl font-bold tracking-tight text-slate-900">SmartLPG</h1>
        <p className="mt-4 text-base text-slate-600">
          Affordable, reliable LPG ordering and delivery for homes and businesses.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link to="/login" className="inline-flex">
            <button className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400">
              Login
            </button>
          </Link>
          <Link to="/register" className="inline-flex">
            <button className="inline-flex items-center rounded-md bg-white px-4 py-2 text-slate-900 ring-1 ring-slate-300 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400">
              Register
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function RegisterChooser() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => navigate('/')} className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 transition">
            <span>←</span>
            <span className="text-sm">Back</span>
          </button>
        </div>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Register</h2>
        <nav className="mt-4 grid gap-3">
          <Link className="rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50" to="/register/customer">Register as Customer</Link>
          <Link className="rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50" to="/register/supplier">Register as Supplier</Link>
          <Link className="rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50" to="/register/agent">Register as Delivery Agent</Link>
        </nav>
      </div>
    </div>
  );
}

function LoginChooser() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow p-6">
        <div className="flex items-center justify-between">
          <button type="button" onClick={() => navigate('/')} className="inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-slate-700 ring-1 ring-slate-300 hover:bg-slate-50 transition">
            <span>←</span>
            <span className="text-sm">Back</span>
          </button>
        </div>
        <h2 className="mt-2 text-2xl font-semibold text-slate-900">Login</h2>
        <nav className="mt-4 grid gap-3">
          <Link className="rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50" to="/login/customer">Login as Customer</Link>
          <Link className="rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50" to="/login/supplier">Login as Supplier</Link>
          <Link className="rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50" to="/login/agent">Login as Delivery Agent</Link>
          <div className="text-xs text-slate-500 mt-1">Admin: visit /admin</div>
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




