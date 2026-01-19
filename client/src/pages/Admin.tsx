import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Navigate } from 'react-router-dom';
import {
  CheckCircleIcon,
  XCircleIcon,
  EyeIcon,
  UsersIcon,
  LightBulbIcon,
  ClockIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import Loading from '../components/common/Loading';
import api from '../services/api';
import toast from 'react-hot-toast';

interface AdminStats {
  totalIdeas: number;
  totalUsers: number;
  pendingIdeas: number;
  activeIdeas: number;
}

interface AdminIdea {
  _id: string;
  title: string;
  tagline: string;
  description: string;
  category: string;
  stage: string;
  status: string;
  creator: {
    _id: string;
    name: string;
    email: string;
    picture?: string;
  };
  createdAt: string;
}

interface AdminUser {
  _id: string;
  email: string;
  name: string;
  picture?: string;
  role: string;
  ideasCount: number;
  contributionsCount: number;
  createdAt: string;
}

// Admin email whitelist
const ADMIN_EMAILS = ['linder@askanddeliver.com'];

export default function Admin() {
  const { user, isLoading: authLoading } = useAuth0();
  const [activeTab, setActiveTab] = useState<'overview' | 'pending' | 'all' | 'users'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingIdeas, setPendingIdeas] = useState<AdminIdea[]>([]);
  const [allIdeas, setAllIdeas] = useState<AdminIdea[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const isAdmin = user?.email && ADMIN_EMAILS.includes(user.email);

  useEffect(() => {
    if (!isAdmin) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const [statsRes, pendingRes, allRes, usersRes] = await Promise.all([
          fetch(`${baseUrl}/admin/stats`).then(r => r.json()),
          fetch(`${baseUrl}/admin/ideas/pending`).then(r => r.json()),
          fetch(`${baseUrl}/admin/ideas/all`).then(r => r.json()),
          fetch(`${baseUrl}/admin/users`).then(r => r.json()),
        ]);
        setStats(statsRes.data);
        setPendingIdeas(pendingRes.data || []);
        setAllIdeas(allRes.data || []);
        setUsers(usersRes.data || []);
      } catch (error) {
        console.error('Error fetching admin data:', error);
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAdmin]);

  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

  const handleApprove = async (ideaId: string) => {
    try {
      await fetch(`${baseUrl}/admin/ideas/${ideaId}/approve`, { method: 'PUT' });
      toast.success('Idea approved!');
      // Refresh data
      setPendingIdeas(prev => prev.filter(i => i._id !== ideaId));
      setAllIdeas(prev => prev.map(i => i._id === ideaId ? { ...i, status: 'active' } : i));
      if (stats) {
        setStats({ ...stats, pendingIdeas: stats.pendingIdeas - 1, activeIdeas: stats.activeIdeas + 1 });
      }
    } catch (error) {
      toast.error('Failed to approve idea');
    }
  };

  const handleReject = async (ideaId: string) => {
    const reason = prompt('Rejection reason (optional):');
    try {
      await fetch(`${baseUrl}/admin/ideas/${ideaId}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      toast.success('Idea rejected');
      setPendingIdeas(prev => prev.filter(i => i._id !== ideaId));
      setAllIdeas(prev => prev.map(i => i._id === ideaId ? { ...i, status: 'rejected' } : i));
      if (stats) {
        setStats({ ...stats, pendingIdeas: stats.pendingIdeas - 1 });
      }
    } catch (error) {
      toast.error('Failed to reject idea');
    }
  };

  if (authLoading) {
    return <Loading fullScreen message="Loading..." />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  if (loading) {
    return <Loading fullScreen message="Loading admin dashboard..." />;
  }

  const statusColors: Record<string, string> = {
    'pending-review': 'bg-amber-500/20 text-amber-400',
    'active': 'bg-emerald-500/20 text-emerald-400',
    'rejected': 'bg-red-500/20 text-red-400',
    'draft': 'bg-stone-500/20 text-stone-400',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
        <p className="text-stone-400">Manage submissions and platform content</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="p-5 rounded-xl bg-stone-900/50 border border-stone-800">
            <div className="flex items-center gap-3 mb-2">
              <LightBulbIcon className="w-5 h-5 text-amber-400" />
              <span className="text-sm text-stone-400">Total Ideas</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalIdeas}</p>
          </div>
          <div className="p-5 rounded-xl bg-stone-900/50 border border-stone-800">
            <div className="flex items-center gap-3 mb-2">
              <ClockIcon className="w-5 h-5 text-orange-400" />
              <span className="text-sm text-stone-400">Pending Review</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.pendingIdeas}</p>
          </div>
          <div className="p-5 rounded-xl bg-stone-900/50 border border-stone-800">
            <div className="flex items-center gap-3 mb-2">
              <ChartBarIcon className="w-5 h-5 text-emerald-400" />
              <span className="text-sm text-stone-400">Active Ideas</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.activeIdeas}</p>
          </div>
          <div className="p-5 rounded-xl bg-stone-900/50 border border-stone-800">
            <div className="flex items-center gap-3 mb-2">
              <UsersIcon className="w-5 h-5 text-blue-400" />
              <span className="text-sm text-stone-400">Total Users</span>
            </div>
            <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-stone-800 mb-6">
        <nav className="flex gap-8">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'pending', label: 'Pending Review', count: pendingIdeas.length },
            { id: 'all', label: 'All Ideas', count: allIdeas.length },
            { id: 'users', label: 'Users', count: users.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-white'
              }`}
            >
              {tab.label}
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id ? 'bg-amber-500/20' : 'bg-stone-800'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl bg-stone-900/50 border border-stone-800">
            <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveTab('pending')}
                className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-left hover:bg-amber-500/20 transition-colors"
              >
                <ClockIcon className="w-6 h-6 text-amber-400 mb-2" />
                <p className="font-medium text-white">Review Pending Ideas</p>
                <p className="text-sm text-stone-400">{pendingIdeas.length} ideas awaiting review</p>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-left hover:bg-blue-500/20 transition-colors"
              >
                <UsersIcon className="w-6 h-6 text-blue-400 mb-2" />
                <p className="font-medium text-white">Manage Users</p>
                <p className="text-sm text-stone-400">{users.length} registered users</p>
              </button>
            </div>
          </div>

          {pendingIdeas.length > 0 && (
            <div className="p-6 rounded-xl bg-stone-900/50 border border-stone-800">
              <h3 className="text-lg font-semibold text-white mb-4">Recent Pending Submissions</h3>
              <div className="space-y-3">
                {pendingIdeas.slice(0, 3).map((idea) => (
                  <div key={idea._id} className="flex items-center justify-between p-4 rounded-lg bg-stone-800/50">
                    <div>
                      <p className="font-medium text-white">{idea.title}</p>
                      <p className="text-sm text-stone-400">by {idea.creator?.name || 'Unknown'}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(idea._id)}
                        className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                      >
                        <CheckCircleIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleReject(idea._id)}
                        className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20"
                      >
                        <XCircleIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'pending' && (
        <div className="space-y-4">
          {pendingIdeas.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircleIcon className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">All caught up!</h3>
              <p className="text-stone-400">No ideas pending review.</p>
            </div>
          ) : (
            pendingIdeas.map((idea) => (
              <div key={idea._id} className="p-6 rounded-xl bg-stone-900/50 border border-stone-800">
                <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-white">{idea.title}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[idea.status]}`}>
                        {idea.status}
                      </span>
                    </div>
                    <p className="text-stone-400 mb-3">{idea.tagline}</p>
                    <p className="text-stone-300 text-sm mb-4 line-clamp-3">{idea.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-stone-500">
                      <span>Category: <span className="text-stone-300 capitalize">{idea.category}</span></span>
                      <span>Stage: <span className="text-stone-300 capitalize">{idea.stage}</span></span>
                      <span>By: <span className="text-stone-300">{idea.creator?.name || 'Unknown'}</span></span>
                      <span>Submitted: <span className="text-stone-300">{new Date(idea.createdAt).toLocaleDateString()}</span></span>
                    </div>
                  </div>
                  <div className="flex lg:flex-col gap-2">
                    <button
                      onClick={() => handleApprove(idea._id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500 text-white font-medium hover:bg-emerald-400 transition-colors"
                    >
                      <CheckCircleIcon className="w-5 h-5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(idea._id)}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-colors"
                    >
                      <XCircleIcon className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'all' && (
        <div className="space-y-4">
          {allIdeas.length === 0 ? (
            <div className="text-center py-16">
              <LightBulbIcon className="w-12 h-12 text-stone-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No ideas yet</h3>
              <p className="text-stone-400">Ideas will appear here once submitted.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-stone-500 border-b border-stone-800">
                    <th className="pb-3 font-medium">Title</th>
                    <th className="pb-3 font-medium">Creator</th>
                    <th className="pb-3 font-medium">Category</th>
                    <th className="pb-3 font-medium">Status</th>
                    <th className="pb-3 font-medium">Created</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {allIdeas.map((idea) => (
                    <tr key={idea._id} className="border-b border-stone-800/50">
                      <td className="py-4 pr-4">
                        <p className="font-medium text-white">{idea.title}</p>
                        <p className="text-sm text-stone-500 truncate max-w-xs">{idea.tagline}</p>
                      </td>
                      <td className="py-4 pr-4 text-stone-300">{idea.creator?.name || 'Unknown'}</td>
                      <td className="py-4 pr-4 text-stone-300 capitalize">{idea.category}</td>
                      <td className="py-4 pr-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[idea.status]}`}>
                          {idea.status}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-stone-400 text-sm">
                        {new Date(idea.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4">
                        <div className="flex gap-1">
                          {idea.status === 'pending-review' && (
                            <>
                              <button
                                onClick={() => handleApprove(idea._id)}
                                className="p-1.5 rounded bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                                title="Approve"
                              >
                                <CheckCircleIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleReject(idea._id)}
                                className="p-1.5 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                title="Reject"
                              >
                                <XCircleIcon className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => window.open(`/ideas/${idea._id}`, '_blank')}
                            className="p-1.5 rounded bg-stone-700 text-stone-300 hover:bg-stone-600"
                            title="View"
                          >
                            <EyeIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-stone-500 border-b border-stone-800">
                  <th className="pb-3 font-medium">User</th>
                  <th className="pb-3 font-medium">Email</th>
                  <th className="pb-3 font-medium">Role</th>
                  <th className="pb-3 font-medium">Ideas</th>
                  <th className="pb-3 font-medium">Contributions</th>
                  <th className="pb-3 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-b border-stone-800/50">
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        {u.picture && (
                          <img src={u.picture} alt={u.name} className="w-8 h-8 rounded-full" />
                        )}
                        <span className="font-medium text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-4 pr-4 text-stone-300">{u.email}</td>
                    <td className="py-4 pr-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-stone-700 text-stone-300'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-4 pr-4 text-stone-300">{u.ideasCount}</td>
                    <td className="py-4 pr-4 text-stone-300">{u.contributionsCount}</td>
                    <td className="py-4 text-stone-400 text-sm">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
