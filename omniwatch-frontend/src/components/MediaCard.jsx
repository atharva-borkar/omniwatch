import { Film, Tv, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

// Fallback gradient posters by type
const POSTER_GRADIENTS = {
  movie:  'from-blue-900 via-blue-800 to-navy-900',
  anime:  'from-orange-900 via-rose-900 to-navy-900',
  series: 'from-emerald-900 via-teal-900 to-navy-900',
};

const TYPE_ICONS = { movie: Film, anime: Tv, series: Tv };

export default function MediaCard({ item, onAdd, addStatus }) {
  const TypeIcon = TYPE_ICONS[item.media_type] || Film;
  const gradient = POSTER_GRADIENTS[item.media_type] || POSTER_GRADIENTS.movie;
  const isLoading = addStatus === 'loading';
  const isAdded   = addStatus === 'success';

  return (
    <div className="poster-card group flex flex-col bg-white dark:bg-navy-800 shadow-card">
      {/* Poster area */}
      <Link to={`/title/${item.id}`} className="block relative aspect-[2/3] overflow-hidden">
        {item.poster_url ? (
          <img
            src={item.poster_url}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
          />
        ) : null}
        {/* Fallback gradient poster */}
        <div
          className={`absolute inset-0 bg-gradient-to-br ${gradient} flex flex-col items-center justify-center gap-2 ${item.poster_url ? 'hidden' : 'flex'}`}
        >
          <TypeIcon size={36} className="text-white/40" />
          <span className="text-white/50 text-xs font-medium text-center px-2">{item.title}</span>
        </div>

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-navy-900/0 group-hover:bg-navy-900/50 transition-all duration-300 flex items-center justify-center">
          <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white text-sm font-semibold px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
            View Details
          </span>
        </div>

        {/* Rating badge */}
        {item.community_rating && (
          <div className="absolute top-2 left-2 rating-badge gap-1">
            <Star size={10} className="fill-navy-900 text-navy-900" />
            {item.community_rating.toFixed(1)}
          </div>
        )}

        {/* Type badge */}
        <div className={`absolute top-2 right-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full
          ${item.media_type === 'movie' ? 'bg-blue-500/80 text-white' :
            item.media_type === 'anime' ? 'bg-orange-500/80 text-white' :
            'bg-emerald-500/80 text-white'}`}>
          {item.media_type}
        </div>
      </Link>

      {/* Card info */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        <Link to={`/title/${item.id}`}>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 hover:text-omni-500 dark:hover:text-gold-400 transition-colors leading-snug">
            {item.title}
          </h3>
        </Link>

        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{item.release_year || '—'}</span>
          {item.genre?.length > 0 && (
            <span className="truncate ml-1 text-slate-400 dark:text-slate-500">{item.genre[0]}</span>
          )}
        </div>

        <button
          onClick={() => onAdd?.(item.id)}
          disabled={isLoading || isAdded}
          className={`mt-auto w-full rounded-lg py-1.5 text-xs font-semibold transition-all duration-200
            ${isAdded   ? 'bg-green-500 text-white cursor-default' :
              isLoading ? 'bg-slate-200 dark:bg-navy-700 text-slate-400 cursor-wait' :
              'bg-slate-100 dark:bg-navy-700 text-slate-700 dark:text-slate-300 hover:bg-gold-400 hover:text-navy-900 dark:hover:bg-gold-400 dark:hover:text-navy-900'}`}
        >
          {isAdded ? '✓ In Watchlist' : isLoading ? 'Adding…' : '+ Watchlist'}
        </button>
      </div>
    </div>
  );
}
