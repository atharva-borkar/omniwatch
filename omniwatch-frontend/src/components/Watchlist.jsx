import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ChevronUp, ChevronDown, Star, LayoutGrid, List, Film, Tv } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api';
import { SkeletonCard } from './SkeletonCard';
import StarRating from './StarRating';

const STATUS_TABS = [
  { key: 'all',           label: 'All' },
  { key: 'watching',      label: 'Watching' },
  { key: 'completed',     label: 'Completed' },
  { key: 'plan_to_watch', label: 'Plan to Watch' },
  { key: 'dropped',       label: 'Dropped' },
  { key: 'on_hold',       label: 'On Hold' },
];

const STATUS_STYLES = {
  watching:      'bg-blue-500/15 text-blue-400 border-blue-500/30',
  completed:     'bg-green-500/15 text-green-400 border-green-500/30',
  plan_to_watch: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  dropped:       'bg-red-500/15 text-red-400 border-red-500/30',
  on_hold:       'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
};

const NEXT_STATUS = {
  plan_to_watch: 'watching',
  watching:      'completed',
  completed:     'plan_to_watch',
  dropped:       'plan_to_watch',
  on_hold:       'watching',
};

function WatchlistCard({ item, onRemove, onUpdateProgress, onUpdateRating, onUpdateStatus, viewMode }) {
  const [localRating, setLocalRating] = useState(item.user_rating || 0);
  const isAnime = item.media?.media_type !== 'movie';
  const totalEpisodes = item.media?.media_metadata?.total_episodes;
  const progressPct = totalEpisodes ? Math.min(100, Math.round((item.progress / totalEpisodes) * 100)) : null;

  const handleRate = async (val) => {
    setLocalRating(val);
    try {
      await api.updateWatchlistItem(item.id, { user_rating: val });
      onUpdateRating(item.id, val);
      toast.success('Rating updated');
    } catch (err) { toast.error(err.message); }
  };

  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-4 bg-white dark:bg-navy-800 rounded-xl px-5 py-4 border border-slate-200 dark:border-white/5 hover:border-omni-300 dark:hover:border-white/10 transition-all group animate-fade-in">
        {/* Poster thumbnail */}
        <div className="h-14 w-10 rounded-lg overflow-hidden shrink-0 bg-navy-700">
          {item.media?.poster_url ? (
            <img src={item.media.poster_url} alt={item.media.title} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              {item.media?.media_type === 'movie' ? <Film size={16} className="text-slate-600" /> : <Tv size={16} className="text-slate-600" />}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <Link to={`/title/${item.media?.id}`} className="text-sm font-semibold text-slate-900 dark:text-white hover:text-omni-500 dark:hover:text-gold-400 transition-colors truncate block">
            {item.media?.title}
          </Link>
          <p className="text-xs text-slate-400">{item.media?.release_year}</p>
        </div>

        <span className={`hidden sm:inline-flex status-badge border text-xs px-2 py-0.5 ${STATUS_STYLES[item.status]}`}>
          {item.status.replace(/_/g, ' ')}
        </span>

        <div className="hidden md:flex items-center gap-1">
          <StarRating rating={localRating} interactive onRate={handleRate} size={13} />
        </div>

        {isAnime && (
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
            <button onClick={() => onUpdateProgress(item.id, item.progress, -1)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors">
              <ChevronDown size={14} />
            </button>
            <span className="font-medium text-slate-700 dark:text-slate-300 min-w-[2rem] text-center">{item.progress}</span>
            <button onClick={() => onUpdateProgress(item.id, item.progress, 1)} className="p-1 rounded hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors">
              <ChevronUp size={14} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button onClick={() => onUpdateStatus(item.id, item.status)}
            className="hidden sm:block text-xs text-omni-500 hover:text-omni-400 font-medium transition-colors">
            → {NEXT_STATUS[item.status]?.replace(/_/g, ' ')}
          </button>
          <button onClick={() => onRemove(item.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    );
  }

  // Grid card view
  return (
    <div className="bg-white dark:bg-navy-800 rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-card hover:shadow-card-hover transition-all group animate-fade-in flex flex-col">
      {/* Poster */}
      <Link to={`/title/${item.media?.id}`} className="relative block aspect-[2/3] overflow-hidden bg-navy-700">
        {item.media?.poster_url ? (
          <img src={item.media.poster_url} alt={item.media.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            {item.media?.media_type === 'movie' ? <Film size={32} className="text-slate-600" /> : <Tv size={32} className="text-slate-600" />}
          </div>
        )}
        <div className="absolute top-2 left-2">
          <span className={`status-badge border text-[10px] px-2 py-0.5 ${STATUS_STYLES[item.status]}`}>
            {item.status.replace(/_/g, ' ')}
          </span>
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-3 gap-2">
        <Link to={`/title/${item.media?.id}`} className="text-sm font-semibold text-slate-900 dark:text-white hover:text-gold-400 transition-colors line-clamp-2 leading-snug">
          {item.media?.title}
        </Link>

        {/* Star rating */}
        <StarRating rating={localRating} interactive onRate={handleRate} size={14} />

        {/* Progress bar for anime/series */}
        {isAnime && (
          <div className="space-y-1">
            {progressPct !== null && (
              <div className="h-1 w-full rounded-full bg-slate-100 dark:bg-navy-700 overflow-hidden">
                <div className="h-full rounded-full bg-omni-500 transition-all duration-300" style={{ width: `${progressPct}%` }} />
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Ep {item.progress}{totalEpisodes ? ` / ${totalEpisodes}` : ''}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => onUpdateProgress(item.id, item.progress, -1)} className="h-5 w-5 flex items-center justify-center rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors">
                  <ChevronDown size={12} />
                </button>
                <button onClick={() => onUpdateProgress(item.id, item.progress, 1)} className="h-5 w-5 flex items-center justify-center rounded text-slate-500 hover:bg-slate-100 dark:hover:bg-navy-700 transition-colors">
                  <ChevronUp size={12} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100 dark:border-white/5">
          <button onClick={() => onUpdateStatus(item.id, item.status)}
            className="text-xs text-omni-500 dark:text-omni-400 hover:text-omni-400 font-medium transition-colors truncate">
            → {NEXT_STATUS[item.status]?.replace(/_/g, ' ')}
          </button>
          <button onClick={() => onRemove(item.id)} className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Watchlist() {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    api.getWatchlist()
      .then(setItems)
      .catch(() => toast.error('Failed to load watchlist'))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (id) => {
    try {
      await api.removeFromWatchlist(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('Removed from watchlist');
    } catch (err) { toast.error(err.message); }
  };

  const handleUpdateProgress = async (id, current, delta) => {
    const newProgress = Math.max(0, current + delta);
    try {
      await api.updateWatchlistItem(id, { progress: newProgress });
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, progress: newProgress } : i));
    } catch (err) { toast.error(err.message); }
  };

  const handleUpdateRating = (id, rating) => {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, user_rating: rating } : i));
  };

  const handleUpdateStatus = async (id, currentStatus) => {
    const next = NEXT_STATUS[currentStatus] || 'plan_to_watch';
    try {
      await api.updateWatchlistItem(id, { status: next });
      setItems((prev) => prev.map((i) => i.id === id ? { ...i, status: next } : i));
      toast.success(`Moved to "${next.replace(/_/g, ' ')}"`);
    } catch (err) { toast.error(err.message); }
  };

  const filtered = activeTab === 'all' ? items : items.filter((i) => i.status === activeTab);

  // Stats
  const stats = {
    total:     items.length,
    completed: items.filter((i) => i.status === 'completed').length,
    watching:  items.filter((i) => i.status === 'watching').length,
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="h-8 w-48 skeleton rounded-lg" />
        <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5' : 'grid-cols-1'}`}>
          {[1,2,3,4,5].map((n) => <SkeletonCard key={n} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-fade-in">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">My Watchlist</h1>
          {items.length > 0 && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              <span className="font-medium text-slate-700 dark:text-slate-200">{stats.total}</span> saved ·{' '}
              <span className="font-medium text-blue-400">{stats.watching}</span> watching ·{' '}
              <span className="font-medium text-green-400">{stats.completed}</span> completed
            </p>
          )}
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-slate-100 dark:bg-navy-800 p-1 border border-slate-200 dark:border-white/5">
          <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-navy-700 text-omni-600 dark:text-gold-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
            <LayoutGrid size={16} />
          </button>
          <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-navy-700 text-omni-600 dark:text-gold-400 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
            <List size={16} />
          </button>
        </div>
      </div>

      {/* Status tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
        {STATUS_TABS.map(({ key, label }) => {
          const count = key === 'all' ? items.length : items.filter((i) => i.status === key).length;
          return (
            <button key={key} onClick={() => setActiveTab(key)}
              className={`shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold transition-all whitespace-nowrap
                ${activeTab === key
                  ? 'bg-omni-600 text-white shadow-md shadow-omni-600/30'
                  : 'bg-slate-100 dark:bg-navy-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-700 border border-slate-200 dark:border-white/5'}`}>
              {label}
              {count > 0 && (
                <span className={`text-xs rounded-full px-1.5 py-0.5 ${activeTab === key ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-navy-700 text-slate-500 dark:text-slate-400'}`}>
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Empty state */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl bg-white dark:bg-navy-800 border border-slate-200 dark:border-white/5 py-24 text-center animate-fade-in">
          <div className="h-20 w-20 rounded-full bg-omni-50 dark:bg-omni-900/20 flex items-center justify-center mb-5">
            <Star size={36} className="text-omni-400" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Nothing tracked yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm text-sm">
            Head to the catalog and add your first title to start building your watchlist.
          </p>
          <Link to="/" className="mt-6 btn-primary">
            Browse Catalog
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-slate-500 dark:text-slate-400">
          <p className="text-sm">No items in "{STATUS_TABS.find(t => t.key === activeTab)?.label}" yet.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid'
          ? 'grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
          : 'space-y-2'}>
          {filtered.map((item) => (
            <WatchlistCard
              key={item.id} item={item} viewMode={viewMode}
              onRemove={handleRemove}
              onUpdateProgress={handleUpdateProgress}
              onUpdateRating={handleUpdateRating}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}