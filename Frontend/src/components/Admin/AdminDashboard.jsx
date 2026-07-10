import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../context/AuthContext';
import { 
  Users, Bot, BadgeCent, Database, 
  Trash2, UserPlus, ArrowLeft, ArrowUpRight, Check 
} from 'lucide-react';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Edit states
  const [editingUserId, setEditingUserId] = useState(null);
  const [newRole, setNewRole] = useState('user');
  const [newPlan, setNewPlan] = useState('Free');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const [mRes, uRes] = await Promise.all([
        api.get('/admin/metrics'),
        api.get('/admin/users')
      ]);
      setMetrics(mRes.data);
      setUsers(uRes.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Access Denied or Database error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async (id) => {
    try {
      await api.put(`/admin/users/${id}`, {
        role: newRole,
        plan: newPlan
      });
      setEditingUserId(null);
      fetchAdminData();
    } catch (err) {
      alert(err.response?.data?.message || 'Update failed');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm('Are you sure you want to delete this user? All their chats will be destroyed.')) {
      try {
        await api.delete(`/admin/users/${id}`);
        fetchAdminData();
      } catch (err) {
        alert(err.response?.data?.message || 'Delete failed');
      }
    }
  };

  const startEdit = (user) => {
    setEditingUserId(user._id);
    setNewRole(user.role);
    setNewPlan(user.subscription?.plan || 'Free');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-darkBg text-white flex flex-col items-center justify-center space-y-4">
        <Bot className="w-12 h-12 text-primary animate-spin" />
        <p className="text-sm text-gray-500 font-semibold uppercase">Loading Metrics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-darkBg text-white flex flex-col items-center justify-center space-y-4 px-4 text-center">
        <div className="text-red-500 text-lg font-bold">Error loading dashboard</div>
        <p className="text-gray-500 text-sm max-w-md">{error}</p>
        <button 
          onClick={() => navigate('/')}
          className="px-6 py-2 bg-darkCard border border-darkBorder hover:bg-darkBg rounded-xl text-sm"
        >
          Return to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-darkBg text-gray-300 p-6 md:p-10 font-sans selection:bg-primary/30">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/chat')}
              className="p-2 border border-darkBorder rounded-xl hover:bg-darkCard transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">System Admin Console</h1>
              <p className="text-xs text-gray-500 mt-0.5">AlphaChatGPT Platform Monitor & Analytics</p>
            </div>
          </div>
          <button 
            onClick={fetchAdminData}
            className="px-4 py-2 border border-darkBorder rounded-xl text-xs hover:bg-darkCard font-bold text-white transition-all"
          >
            Refresh Logs
          </button>
        </div>

        {/* Metrics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 bg-darkCard border border-darkBorder rounded-premium flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Users</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">{metrics?.totalUsers}</h2>
            </div>
            <div className="p-3 bg-primary/10 rounded-xl text-primary"><Users className="w-6 h-6" /></div>
          </div>

          <div className="p-5 bg-darkCard border border-darkBorder rounded-premium flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Active Conversations</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">{metrics?.totalChats}</h2>
            </div>
            <div className="p-3 bg-secondary/10 rounded-xl text-secondary"><Bot className="w-6 h-6" /></div>
          </div>

          <div className="p-5 bg-darkCard border border-darkBorder rounded-premium flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Active Subscriptions</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">{metrics?.activeSubscriptions}</h2>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-400"><UserPlus className="w-6 h-6" /></div>
          </div>

          <div className="p-5 bg-darkCard border border-darkBorder rounded-premium flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Total Platform Revenue</span>
              <h2 className="text-3xl font-extrabold text-white mt-1">${metrics?.totalRevenue}</h2>
            </div>
            <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-400"><BadgeCent className="w-6 h-6" /></div>
          </div>
        </div>

        {/* Charts & Reports */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue */}
          <div className="p-6 bg-darkCard border border-darkBorder rounded-premium">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">Revenue Growth (Month)</h3>
            <div className="space-y-4">
              {metrics?.revenueHistory?.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-4">
                  <span className="text-xs text-gray-500 w-8">{item.month}</span>
                  <div className="flex-1 bg-darkBg rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full transition-all"
                      style={{ width: `${Math.max(10, Math.min(100, (item.revenue / (metrics.totalRevenue || 1)) * 100))}%` }}
                    />
                  </div>
                  <span className="text-xs text-white font-semibold">${item.revenue}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Usage */}
          <div className="p-6 bg-darkCard border border-darkBorder rounded-premium">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">AI Token Usage (Week)</h3>
            <div className="space-y-4">
              {metrics?.aiUsageHistory?.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-4">
                  <span className="text-xs text-gray-500 w-8">{item.day}</span>
                  <div className="flex-1 bg-darkBg rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-secondary h-full rounded-full transition-all"
                      style={{ width: `${Math.max(10, Math.min(100, (item.tokens / (metrics.totalTokens || 1)) * 100))}%` }}
                    />
                  </div>
                  <span className="text-xs text-white font-semibold">{item.tokens} tok</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Management Section */}
        <div className="p-6 bg-darkCard border border-darkBorder rounded-premium overflow-hidden">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-6">User Database Management</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-darkBorder pb-3 text-xs text-gray-500 font-semibold uppercase">
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Subscription Plan</th>
                  <th className="py-3 px-4">Verification</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-darkBorder text-sm text-gray-300">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-darkBg/30 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{u.email}</div>
                    </td>
                    <td className="py-4 px-4 capitalize">
                      {editingUserId === u._id ? (
                        <select 
                          value={newRole} 
                          onChange={(e) => setNewRole(e.target.value)}
                          className="bg-darkBg border border-darkBorder rounded px-2 py-1 text-xs text-white"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          u.role === 'admin' ? 'bg-red-950 text-red-400' : 'bg-darkBorder text-gray-400'
                        }`}>
                          {u.role}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      {editingUserId === u._id ? (
                        <select 
                          value={newPlan} 
                          onChange={(e) => setNewPlan(e.target.value)}
                          className="bg-darkBg border border-darkBorder rounded px-2 py-1 text-xs text-white"
                        >
                          <option value="Free">Free</option>
                          <option value="Pro">Pro</option>
                          <option value="Enterprise">Enterprise</option>
                        </select>
                      ) : (
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          u.subscription?.plan === 'Pro' ? 'bg-primary/20 text-primary' : 
                          u.subscription?.plan === 'Enterprise' ? 'bg-secondary/20 text-secondary' : 'bg-darkBorder text-gray-400'
                        }`}>
                          {u.subscription?.plan || 'Free'}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold">
                      {u.isVerified ? (
                        <span className="text-emerald-400">Verified</span>
                      ) : (
                        <span className="text-gray-500">Unverified</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {editingUserId === u._id ? (
                          <>
                            <button 
                              onClick={() => handleUpdateUser(u._id)}
                              className="p-1.5 border border-primary text-primary rounded-lg hover:bg-primary/10"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => setEditingUserId(null)}
                              className="px-2 py-1 border border-darkBorder text-gray-500 rounded text-xs"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => startEdit(u)}
                              className="text-xs hover:text-white underline font-semibold"
                            >
                              Modify
                            </button>
                            <button 
                              onClick={() => handleDeleteUser(u._id)}
                              className="p-1.5 hover:text-red-400 text-gray-500 hover:bg-red-500/10 rounded-lg transition-all"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
