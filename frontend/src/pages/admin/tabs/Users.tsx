import Card from '../components/Card';
import { api, authHeaders } from '../../../lib/api';

interface User {
  _id: string;
  role: 'customer' | 'supplier' | 'agent';
  fullName?: string;
  businessName?: string;
  email: string;
  phoneNumber: string;
  status?: 'active' | 'suspended' | 'removed';
  createdAt: string;
}

export default function Users() {
  const [customers, setCustomers] = React.useState<User[]>([]);
  const [suppliers, setSuppliers] = React.useState<User[]>([]);
  const [agents, setAgents] = React.useState<User[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [actionLoading, setActionLoading] = React.useState<string | null>(null);

  const fetchUsers = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [customersRes, suppliersRes, agentsRes] = await Promise.all([
        api('/admin/users?role=customer', { headers: authHeaders() }),
        api('/admin/users?role=supplier', { headers: authHeaders() }),
        api('/admin/users?role=agent', { headers: authHeaders() }),
      ]);

      setCustomers(customersRes.users || []);
      setSuppliers(suppliersRes.users || []);
      setAgents(agentsRes.users || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSuspend = async (userId: string, role: 'customer' | 'supplier' | 'agent') => {
    if (!confirm('Are you sure you want to suspend/unsuspend this user?')) return;
    
    try {
      setActionLoading(userId);
      await api(`/admin/users/${userId}/suspend`, {
        method: 'PATCH',
        headers: authHeaders(),
      });
      
      const updateUser = (user: User) => 
        user._id === userId 
          ? { ...user, status: (user.status === 'suspended' ? 'active' : 'suspended') as 'active' | 'suspended' }
          : user;

      if (role === 'customer') setCustomers(prev => prev.map(updateUser));
      if (role === 'supplier') setSuppliers(prev => prev.map(updateUser));
      if (role === 'agent') setAgents(prev => prev.map(updateUser));
    } catch (err: any) {
      alert(err.message || 'Failed to suspend user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRemove = async (userId: string, role: 'customer' | 'supplier' | 'agent') => {
    if (!confirm('Are you sure you want to remove this user? This action marks the user as removed and they will not be able to login.')) return;
    
    try {
      setActionLoading(userId);
      await api(`/admin/users/${userId}`, {
        method: 'DELETE',
        headers: authHeaders(),
      });
      
      const updateUser = (user: User) => 
        user._id === userId 
          ? { ...user, status: 'removed' as const }
          : user;

      if (role === 'customer') setCustomers(prev => prev.map(updateUser));
      if (role === 'supplier') setSuppliers(prev => prev.map(updateUser));
      if (role === 'agent') setAgents(prev => prev.map(updateUser));
    } catch (err: any) {
      alert(err.message || 'Failed to remove user');
    } finally {
      setActionLoading(null);
    }
  };

  const renderUserCard = (title: string, users: User[], role: 'customer' | 'supplier' | 'agent') => (
    <Card>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
        <span className="text-xs text-slate-500">{users.length} total</span>
      </div>
      {error && (
        <div className="mt-2 text-sm text-rose-600 bg-rose-50 border border-rose-200 rounded-lg p-2">
          {error}
        </div>
      )}
      <div className="mt-3 space-y-2 text-sm max-h-96 overflow-y-auto">
        {loading ? (
          <div className="text-center py-4 text-slate-500">Loading...</div>
        ) : users.length === 0 ? (
          <div className="text-center py-4 text-slate-500">No {title.toLowerCase()} found</div>
        ) : (
          users.map(user => (
            <div 
              key={user._id} 
              className={`flex items-center justify-between rounded-lg border p-3 ${
                user.status === 'suspended' 
                  ? 'border-amber-300 bg-amber-50' 
                  : user.status === 'removed'
                  ? 'border-rose-300 bg-rose-50'
                  : 'border-slate-200'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="font-medium text-slate-900 truncate">
                  {user.fullName || user.businessName || 'N/A'}
                </div>
                <div className="text-xs text-slate-500 truncate">{user.email}</div>
                {user.status && user.status !== 'active' && (
                  <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
                    user.status === 'suspended' 
                      ? 'bg-amber-200 text-amber-800' 
                      : 'bg-rose-200 text-rose-800'
                  }`}>
                    {user.status}
                  </span>
                )}
              </div>
              <div className="flex gap-2 ml-2">
                <button 
                  onClick={() => handleSuspend(user._id, role)}
                  disabled={actionLoading === user._id || user.status === 'removed'}
                  className={`px-3 py-1.5 rounded-lg ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed ${
                    user.status === 'suspended' ? 'bg-emerald-50 text-emerald-700' : ''
                  }`}
                >
                  {user.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                </button>
                <button 
                  onClick={() => handleRemove(user._id, role)}
                  disabled={actionLoading === user._id || user.status === 'removed'}
                  className="px-3 py-1.5 rounded-lg ring-1 ring-rose-200 text-rose-600 hover:bg-rose-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {renderUserCard('Customers', customers, 'customer')}
      {renderUserCard('Suppliers', suppliers, 'supplier')}
      {renderUserCard('Delivery Agents', agents, 'agent')}
    </div>
  );
}


