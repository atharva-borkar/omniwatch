import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, CheckCircle, Eye, Clock, XCircle, PauseCircle, Star, TrendingUp } from 'lucide-react';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const STAT_CARDS = [
  { key: 'total',         label: 'Total Saved',    icon: Bookmark,    color: 'from-omni-600 to-omni-900' },
  { key: 'watching',      label: 'Watching',       icon: Eye,         color: 'from-blue-600 to-blue-900' },
  { key: 'completed',     label: 'Completed',      icon: CheckCircle, color: 'from-green-600 to-green-900' },
  { key: 'plan_to_watch', label: 'Plan to Watch',  icon: Clock,       color: 'from-slate-600 to-slate-900' },
];

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMe()
      .then(setProfile)
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 animate-pulse">
        <div className="h-32 rounded-2xl bg-slate-200 dark:bg-navy-800" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1,2,3,4].map(n => <div key={n} className="h-24 rounded-xl bg-slate-200 dark:bg-navy-800" />)}
        </div>
      </div>
    );
  }

  const stats = profile?.stats || {};

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 animate-fade-in">

      {/* Profile header */}
      <div className="relative rounded-2xl overflow-hidden bg-navy-800 shadow-card">
        {/* Background decoration */}
        <div className="h-28 bg-gradient-to-r from-omni-900 via-navy-800 to-gold-600/20 relative">
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 70% 50%, #f5c518 0%, transparent 50%)' }} />
        </div>

        <div className="px-6 pb-6 -mt-10 relative flex items-end justify-between gap-4 flex-wrap">
          <div className="flex items-end gap-4">
            {/* Avatar */}
            <div className="h-20 w-20 rounded-2xl bg-omni-600 border-4 border-navy-800 flex items-center justify-center text-3xl font-black text-white shadow-xl">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="pb-1">
              <h1 className="text-2xl font-black text-white">{profile?.username}</h1>
              <p className="text-sm text-slate-400">{profile?.email}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—'}
              </p>
            </div>
          </div>

          <Link to="/watchlist" className="btn-primary !py-2 !px-5 self-end mb-1">
            View Watchlist
          </Link>
        </div>
      </div>

      {/* Stats grid */}
      <div>
        <div className="section-header">
          <div className="accent-line" />
          <h2>Your Stats</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {STAT_CARDS.map(({ key, label, icon: Icon, color }) => (
            <div key={key} className={`relative overflow-hidden rounded-xl bg-gradient-to-br ${color} p-5 shadow-card text-white`}>
              <div className="absolute right-3 top-3 opacity-20">
                <Icon size={40} />
              </div>
              <p className="text-3xl font-black mb-1">{stats[key] ?? 0}</p>
              <p className="text-sm font-medium opacity-80">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Completion rate */}
      {stats.total > 0 && (
        <div className="rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/5 p-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUp size={18} className="text-gold-400" />
              <span className="font-semibold text-slate-900 dark:text-white">Completion Rate</span>
            </div>
            <span className="text-2xl font-black text-gold-400">
              {Math.round((stats.completed / stats.total) * 100)}%
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-slate-100 dark:bg-navy-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-700"
              style={{ width: `${Math.round((stats.completed / stats.total) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-2">
            <span>{stats.completed} completed</span>
            <span>{stats.total} total</span>
          </div>
        </div>
      )}

      {/* Status breakdown */}
      <div className="rounded-xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/5 p-6">
        <div className="section-header mb-4">
          <div className="accent-line" />
          <h2 className="!text-base">Status Breakdown</h2>
        </div>
        <div className="space-y-3">
          {[
            { key: 'watching',      label: 'Watching',      icon: Eye,         color: 'bg-blue-500' },
            { key: 'completed',     label: 'Completed',     icon: CheckCircle, color: 'bg-green-500' },
            { key: 'plan_to_watch', label: 'Plan to Watch', icon: Clock,       color: 'bg-slate-500' },
            { key: 'on_hold',       label: 'On Hold',       icon: PauseCircle, color: 'bg-yellow-500' },
            { key: 'dropped',       label: 'Dropped',       icon: XCircle,     color: 'bg-red-500' },
          ].map(({ key, label, icon: Icon, color }) => {
            const count = stats[key] || 0;
            const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            return (
              <div key={key} className="flex items-center gap-3">
                <Icon size={15} className="text-slate-400 shrink-0" />
                <span className="text-sm text-slate-600 dark:text-slate-300 w-28 shrink-0">{label}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-navy-700 overflow-hidden">
                  <div className={`h-full rounded-full ${color} transition-all duration-700`} style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-slate-400 w-8 text-right">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
