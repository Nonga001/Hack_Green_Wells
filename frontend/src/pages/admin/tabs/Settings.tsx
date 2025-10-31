import React, { useState, useEffect } from 'react';
import { api, authHeaders } from '../../../lib/api';

interface SystemStats {
  users: number;
  orders: number;
  cylinders: number;
  activeOrders: number;
}

interface Admin {
  _id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  status: string;
  createdAt: string;
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState<'system' | 'admins' | 'data'>('system');
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [newAdmin, setNewAdmin] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    password: '',
  });

  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [clearDataType, setClearDataType] = useState<string>('');
  const [clearConfirm, setClearConfirm] = useState('');

  useEffect(() => {
    if (activeSection === 'system') {
      loadSystemStats();
    } else if (activeSection === 'admins') {
      loadAdmins();
    }
  }, [activeSection]);

  const loadSystemStats = async () => {
    try {
      setLoading(true);
      const data = await api('/admin/system/stats', { headers: authHeaders() });
      setStats(data.stats);
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to load system stats');
    } finally {
      setLoading(false);
    }
  };

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const data = await api('/admin/admins', { headers: authHeaders() });
      setAdmins(data.admins);
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to load admins');
    } finally {
      setLoading(false);
    }
  };

  const createAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      await api('/admin/admins', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(newAdmin),
      });
      showMessage('success', 'Admin created successfully');
      setNewAdmin({ fullName: '', email: '', phoneNumber: '', password: '' });
      loadAdmins();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to create admin');
    } finally {
      setLoading(false);
    }
  };

  const removeAdmin = async (adminId: string) => {
    try {
      setLoading(true);
      await api(`/admin/admins/${adminId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      showMessage('success', 'Admin removed successfully');
      setDeleteConfirm(null);
      loadAdmins();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to remove admin');
    } finally {
      setLoading(false);
    }
  };

  const clearData = async () => {
    if (clearConfirm !== 'DELETE') {
      showMessage('error', 'Please type DELETE to confirm');
      return;
    }

    try {
      setLoading(true);
      const data = await api('/admin/system/clear-data', {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({
          dataType: clearDataType,
          confirm: clearConfirm,
        }),
      });
      showMessage('success', data.message);
      setClearDataType('');
      setClearConfirm('');
      if (activeSection === 'system') loadSystemStats();
    } catch (error: any) {
      showMessage('error', error.message || 'Failed to clear data');
    } finally {
      setLoading(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 5000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
      </div>

      {message && (
        <div className={`p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
          {message.text}
        </div>
      )}

      <div className="flex space-x-2 border-b border-gray-200">
        <button
          onClick={() => setActiveSection('system')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSection === 'system'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          System Info
        </button>
        <button
          onClick={() => setActiveSection('admins')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSection === 'admins'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Admin Management
        </button>
        <button
          onClick={() => setActiveSection('data')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeSection === 'data'
              ? 'text-emerald-600 border-b-2 border-emerald-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Data Management
        </button>
      </div>

      {activeSection === 'system' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Statistics</h3>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : stats ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <p className="text-sm text-blue-600 font-medium">Total Users</p>
                  <p className="text-3xl font-bold text-blue-900">{stats.users}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-lg">
                  <p className="text-sm text-emerald-600 font-medium">Total Orders</p>
                  <p className="text-3xl font-bold text-emerald-900">{stats.orders}</p>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <p className="text-sm text-purple-600 font-medium">Total Cylinders</p>
                  <p className="text-3xl font-bold text-purple-900">{stats.cylinders}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-lg">
                  <p className="text-sm text-amber-600 font-medium">Active Orders</p>
                  <p className="text-3xl font-bold text-amber-900">{stats.activeOrders}</p>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No stats available</p>
            )}
            <button
              onClick={loadSystemStats}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Refresh Stats
            </button>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Database Information</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Database Status</span>
                <span className="text-green-600 font-semibold">Connected</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Platform</span>
                <span className="text-gray-900 font-medium">MongoDB</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Environment</span>
                <span className="text-gray-900 font-medium">Production</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'admins' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Admin</h3>
            <form onSubmit={createAdmin} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={newAdmin.fullName}
                  onChange={(e) => setNewAdmin({ ...newAdmin, fullName: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number"
                  value={newAdmin.phoneNumber}
                  onChange={(e) => setNewAdmin({ ...newAdmin, phoneNumber: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Creating...' : 'Create Admin'}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Admins</h3>
            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : admins.length > 0 ? (
              <div className="space-y-2">
                {admins.map((admin) => (
                  <div key={admin._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-semibold text-gray-900">{admin.fullName}</p>
                      <p className="text-sm text-gray-600">{admin.email}</p>
                      <p className="text-sm text-gray-500">{admin.phoneNumber}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        admin.status === 'active' ? 'bg-green-100 text-green-800' :
                        admin.status === 'suspended' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {admin.status}
                      </span>
                      {deleteConfirm === admin._id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => removeAdmin(admin._id)}
                            className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(null)}
                            className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setDeleteConfirm(admin._id)}
                          className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded hover:bg-red-200"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No admins found</p>
            )}
          </div>
        </div>
      )}

      {activeSection === 'data' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Clear Data</h3>
            <p className="text-sm text-gray-600 mb-4">
              Permanently delete specific data from the system. This action cannot be undone.
            </p>
            <div className="space-y-4">
              <select
                value={clearDataType}
                onChange={(e) => setClearDataType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">Select data type to clear</option>
                <option value="orders">All Orders</option>
                <option value="cylinders">All Cylinders</option>
                <option value="suspended-users">Suspended Users</option>
                <option value="removed-users">Removed Users</option>
              </select>

              {clearDataType && (
                <div className="space-y-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-semibold">
                    ⚠️ Warning: This will permanently delete data!
                  </p>
                  <input
                    type="text"
                    placeholder="Type DELETE to confirm"
                    value={clearConfirm}
                    onChange={(e) => setClearConfirm(e.target.value)}
                    className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  />
                  <button
                    onClick={clearData}
                    disabled={loading || clearConfirm !== 'DELETE'}
                    className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Clearing...' : 'Clear Data'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Note:</strong> Data cleared through this interface is permanently deleted and cannot be recovered.
              Always ensure you have proper backups before clearing any data.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


