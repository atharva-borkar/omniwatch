import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Star, TrendingUp, Tv, Film, Clapperboard, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import MediaCard from './MediaCard';
import { SkeletonCard, SkeletonHero } from './SkeletonCard';

const TABS = [
  { key: 'all',    label: 'All',    icon: Clapperboard },
  { key: 'movie',  label: 'Movies', icon: Film },
  { key: 'anime',  label: 'Anime',  icon: Tv },
  { key: 'series', label: 'Series', icon: Tv },
];

// Cinematic gradient fallbacks per type
const HERO_GRADIENTS = {
  movie:  'from-blue-950 via-blue-900 to-navy-900',
  anime:  'from-rose-950 via-orange-900 to-navy-900',
  series: 'from-emerald-950 via-teal-900 to-navy-900',
};

export default function MediaDashboard() {
  const [allMedia, setAllMedia] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [btnStatus, setBtnStatus] = useState({});
  const [heroIdx, setHeroIdx]   = useState(0);
  const [heroFading, setHeroFading] = useState(false);
  const heroTimer = useRef(null);

  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();

  const activeTab   = searchParams.get('type') || 'all';
  const searchQuery = searchParams.get('q')    || '';

  // Fetch all media once
  useEffect(() => {
    api.getMedia({ limit: 100 })
      .then(setAllMedia)
      .catch(() => toast.error('Failed to load catalog'))
      .finally(() => setLoading(false));
  }, []);

  // Client-side filter
  const filtered = allMedia.filter((item) => {
    const matchType   = activeTab === 'all' || item.media_type === activeTab;
    const matchSearch = !searchQuery || item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  // Hero rotation — only for featured items (top rated or first 5)
  const featured = allMedia.slice(0, 5);

  const rotateHero = useCallback(() => {
    setHeroFading(true);
    setTimeout(() => {
      setHeroIdx((i) => (i + 1) % Math.max(featured.length, 1));
      setHeroFading(false);
    }, 400);
  }, [featured.length]);

  useEffect(() => {
    if (featured.length < 2) return;
    heroTimer.current = setInterval(rotateHero, 6000);
    return () => clearInterval(heroTimer.current);
  }, [rotateHero, featured.length]);

  const manualHero = (dir) => {
    clearInterval(heroTimer.current);
    setHeroFading(true);
    setTimeout(() => {
      setHeroIdx((i) => (i + dir + featured.length) % featured.length);
      setHeroFading(false);
      heroTimer.current = setInterval(rotateHero, 6000);
    }, 300);
  };

  const handleAdd = async (mediaId) => {
    if (!isAuthenticated) {
      toast('Sign in to build your watchlist', { icon: '🍿' });
      navigate('/login');
      return;
    }
    setBtnStatus((s) => ({ ...s, [mediaId]: 'loading' }));
    try {
      await api.addToWatchlist(mediaId);
      setBtnStatus((s) => ({ ...s, [mediaId]: 'success' }));
      toast.success('Added to watchlist!');
    } catch (err) {
      toast.error(err.message);
      setBtnStatus((s) => ({ ...s, [mediaId]: null }));
    }
  };

  const heroItem = featured[heroIdx];
  const heroGrad = heroItem ? HERO_GRADIENTS[heroItem.media_type] || HERO_GRADIENTS.movie : HERO_GRADIENTS.movie;

  return (
    <div className="space-y-10 pb-16 animate-fade-in">

      {/* ── HERO BANNER ──────────────────────────────────────── */}
      {loading ? <SkeletonHero /> : heroItem && !searchQuery && activeTab === 'all' && (
        <div className={`relative w-full overflow-hidden rounded-2xl shadow-2xl transition-opacity duration-400 ${heroFading ? 'opacity-0' : 'opacity-100'}`}
          style={{ height: 'clamp(280px, 40vw, 520px)' }}>

          {/* Backdrop image or gradient */}
          {heroItem.backdrop_url || heroItem.poster_url ? (
            <img
              src={heroItem.backdrop_url || heroItem.poster_url}
              alt={heroItem.title}
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${heroGrad}`} />
          )}

          {/* Gradient overlay for text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-navy-900/95 via-navy-900/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 via-transparent to-transparent" />

          {/* Content */}
          <div className="relative z-10 flex flex-col justify-end h-full p-6 sm:p-10 max-w-2xl">
            <div className="mb-3 flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-400 px-3 py-0.5 text-xs font-bold text-navy-900">
                <span className="h-1.5 w-1.5 rounded-full bg-navy-900/50 animate-pulse" />
                Featured
              </span>
              <span className={`text-xs font-semibold uppercase tracking-widest px-2.5 py-0.5 rounded-full
                ${heroItem.media_type === 'movie' ? 'bg-blue-500/30 text-blue-300 border border-blue-500/30' :
                  heroItem.media_type === 'anime' ? 'bg-orange-500/30 text-orange-300 border border-orange-500/30' :
                  'bg-emerald-500/30 text-emerald-300 border border-emerald-500/30'}`}>
                {heroItem.media_type}
              </span>
              {heroItem.release_year && (
                <span className="text-xs text-slate-400">{heroItem.release_year}</span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight mb-3">
              {heroItem.title}
            </h1>

            {heroItem.community_rating && (
              <div className="flex items-center gap-2 mb-3">
                <Star size={16} className="fill-gold-400 text-gold-400" />
                <span className="text-gold-400 font-bold">{heroItem.community_rating.toFixed(1)}</span>
                <span className="text-slate-400 text-sm">/ 5</span>
              </div>
            )}

            {heroItem.description && (
              <p className="text-slate-300 text-sm leading-relaxed mb-4 line-clamp-2 max-w-lg">
                {heroItem.description}
              </p>
            )}

            {heroItem.genre?.length > 0 && (
              <div className="flex gap-2 mb-5 flex-wrap">
                {heroItem.genre.slice(0, 3).map((g) => (
                  <span key={g} className="genre-pill">{g}</span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-3">
              <Link to={`/title/${heroItem.id}`} className="btn-primary">
                View Details
              </Link>
              <button onClick={() => handleAdd(heroItem.id)} className="btn-secondary">
                + Watchlist
              </button>
            </div>
          </div>

          {/* Navigation arrows */}
          {featured.length > 1 && (
            <>
              <button onClick={() => manualHero(-1)}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-sm transition-all">
                <ChevronLeft size={20} />
              </button>
              <button onClick={() => manualHero(1)}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-black/40 text-white hover:bg-black/70 backdrop-blur-sm transition-all">
                <ChevronRight size={20} />
              </button>
              {/* Dots */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
                {featured.map((_, i) => (
                  <button key={i} onClick={() => { clearInterval(heroTimer.current); setHeroIdx(i); }}
                    className={`h-1.5 rounded-full transition-all duration-300 ${i === heroIdx ? 'w-6 bg-gold-400' : 'w-1.5 bg-white/40'}`} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ── FILTER BAR ───────────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Type tabs */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-navy-800 p-1 gap-1 border border-slate-200 dark:border-white/5">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button key={key}
              onClick={() => {
                const p = new URLSearchParams(searchParams);
                if (key === 'all') p.delete('type'); else p.set('type', key);
                setSearchParams(p);
              }}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-150 ${
                activeTab === key
                  ? 'bg-white dark:bg-navy-700 text-omni-600 dark:text-gold-400 shadow-sm'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white'
              }`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Results count */}
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {filtered.length} title{filtered.length !== 1 ? 's' : ''}
          {searchQuery && <span className="font-medium text-slate-700 dark:text-white"> for "{searchQuery}"</span>}
        </p>
      </div>

      {/* ── GRID ─────────────────────────────────────────────── */}
      {loading ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
          <div className="mb-4 text-6xl">🎬</div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No results found</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-sm">
            {searchQuery ? `Nothing matched "${searchQuery}". Try different keywords.` : 'No titles in this category yet.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 animate-fade-in">
          {filtered.map((item) => (
            <MediaCard key={item.id} item={item} onAdd={handleAdd} addStatus={btnStatus[item.id]} />
          ))}
        </div>
      )}
    </div>
  );
}