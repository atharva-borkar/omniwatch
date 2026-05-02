import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Star, Film, Tv, Calendar, Clock, BookOpen, Send, Trash2, Plus, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../api';
import { useAuth } from '../context/AuthContext';
import { SkeletonDetail } from './SkeletonCard';
import StarRating from './StarRating';

const TYPE_COLORS = {
  movie:  { bg: 'bg-blue-500', text: 'text-blue-400', border: 'border-blue-500/30', light: 'bg-blue-500/10' },
  anime:  { bg: 'bg-orange-500', text: 'text-orange-400', border: 'border-orange-500/30', light: 'bg-orange-500/10' },
  series: { bg: 'bg-emerald-500', text: 'text-emerald-400', border: 'border-emerald-500/30', light: 'bg-emerald-500/10' },
};

function ReviewCard({ review, currentUserId, onDelete }) {
  const initials = review.user?.username?.[0]?.toUpperCase() || '?';
  return (
    <div className="bg-white dark:bg-navy-800 rounded-xl p-5 border border-slate-200 dark:border-white/5 animate-fade-in">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-full bg-omni-600/80 flex items-center justify-center text-sm font-bold text-white shrink-0">
            {initials}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{review.user?.username}</p>
            <p className="text-xs text-slate-400">
              {review.created_at ? new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {review.rating && <StarRating rating={review.rating} size={14} />}
          {currentUserId === review.user?.id && (
            <button onClick={() => onDelete(review.id)} className="text-slate-400 hover:text-red-400 transition-colors p-1">
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{review.review_text}</p>
    </div>
  );
}

export default function MediaDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const [media,    setMedia]    = useState(null);
  const [reviews,  setReviews]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded,  setIsAdded]  = useState(false);

  // Review form state
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    Promise.all([
      api.getMediaById(id),
      api.getReviews(id),
    ]).then(([m, r]) => {
      setMedia(m);
      setReviews(r);
    }).catch(() => {
      toast.error('Media not found');
      navigate('/');
    }).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleAdd = async () => {
    if (!isAuthenticated) {
      toast('Sign in to save to watchlist', { icon: '🍿' });
      navigate('/login');
      return;
    }
    setIsAdding(true);
    try {
      await api.addToWatchlist(media.id);
      setIsAdded(true);
      toast.success('Added to watchlist!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsAdding(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login'); return; }
    setSubmittingReview(true);
    try {
      const newReview = await api.createReview(id, reviewText, reviewRating || null);
      setReviews((prev) => [newReview, ...prev]);
      setMedia((m) => ({ ...m, community_rating: newReview.rating ? (((m.community_rating || 0) + newReview.rating) / 2) : m.community_rating }));
      setReviewText('');
      setReviewRating(0);
      toast.success('Review posted!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await api.deleteReview(reviewId);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success('Review removed');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) return <div className="max-w-6xl mx-auto px-4 py-8"><SkeletonDetail /></div>;
  if (!media)  return null;

  const colors = TYPE_COLORS[media.media_type] || TYPE_COLORS.movie;
  const meta   = media.media_metadata || {};

  return (
    <div className="max-w-6xl mx-auto animate-fade-in">

      {/* Back button */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-6">
        <ArrowLeft size={16} /> Back to catalog
      </button>

      {/* ── BACKDROP ─────────────────────────────────── */}
      <div className="relative w-full rounded-2xl overflow-hidden mb-8 bg-navy-900 shadow-2xl"
        style={{ height: 'clamp(220px, 30vw, 380px)' }}>

        {(media.backdrop_url || media.poster_url) ? (
          <img src={media.backdrop_url || media.poster_url} alt={media.title}
            className="absolute inset-0 w-full h-full object-cover object-center" />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${
            media.media_type === 'movie' ? 'from-blue-950 via-blue-900' :
            media.media_type === 'anime' ? 'from-rose-950 via-orange-900' : 'from-emerald-950 via-teal-900'
          } to-navy-900`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-900 via-navy-900/40 to-transparent" />
      </div>

      {/* ── MAIN CONTENT ────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-8 -mt-32 relative z-10 px-4 sm:px-0">

        {/* Poster */}
        <div className="flex flex-col gap-4 items-center md:items-start">
          <div className="w-40 md:w-full aspect-[2/3] rounded-xl overflow-hidden shadow-card-hover border border-white/10 bg-navy-800">
            {media.poster_url ? (
              <img src={media.poster_url} alt={media.title} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full flex items-center justify-center bg-gradient-to-br ${
                media.media_type === 'movie' ? 'from-blue-900 to-blue-950' :
                media.media_type === 'anime' ? 'from-orange-900 to-rose-950' : 'from-teal-900 to-navy-900'
              }`}>
                {media.media_type === 'movie' ? <Film size={48} className="text-white/30" /> : <Tv size={48} className="text-white/30" />}
              </div>
            )}
          </div>

          {/* Action button */}
          <button onClick={handleAdd} disabled={isAdding || isAdded}
            className={`w-40 md:w-full flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-sm transition-all shadow-lg
              ${isAdded ? 'bg-green-500 text-white cursor-default' :
                isAdding ? 'bg-slate-400 text-white cursor-wait' :
                'btn-primary w-full'}`}>
            {isAdded ? <><Check size={16} /> In Watchlist</> :
             isAdding ? 'Adding…' :
             <><Plus size={16} /> Add to Watchlist</>}
          </button>
        </div>

        {/* Details */}
        <div className="space-y-6">
          {/* Title & badges */}
          <div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`inline-flex px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider text-white ${colors.bg}`}>
                {media.media_type}
              </span>
              {media.release_year && (
                <span className="flex items-center gap-1 text-sm text-slate-400 dark:text-slate-400">
                  <Calendar size={12} /> {media.release_year}
                </span>
              )}
              {meta.runtime_minutes && (
                <span className="flex items-center gap-1 text-sm text-slate-400">
                  <Clock size={12} /> {meta.runtime_minutes}m
                </span>
              )}
              {media.language && (
                <span className="text-xs uppercase text-slate-500 border border-slate-300 dark:border-white/10 px-2 py-0.5 rounded">
                  {media.language}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight mb-3">
              {media.title}
            </h1>

            {/* Community rating */}
            {media.community_rating && (
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-1.5 bg-gold-400/10 border border-gold-400/30 rounded-lg px-3 py-1.5">
                  <Star size={16} className="fill-gold-400 text-gold-400" />
                  <span className="text-gold-400 font-bold text-lg">{media.community_rating.toFixed(1)}</span>
                  <span className="text-slate-400 text-sm">/ 5</span>
                </div>
                <span className="text-sm text-slate-400">
                  {reviews.length} review{reviews.length !== 1 ? 's' : ''}
                </span>
              </div>
            )}

            {/* Genre pills */}
            {media.genre?.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-4">
                {media.genre.map((g) => (
                  <span key={g} className={`genre-pill ${colors.light} ${colors.text} border ${colors.border}`}>{g}</span>
                ))}
              </div>
            )}

            {/* Description */}
            {media.description && (
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm sm:text-base">
                {media.description}
              </p>
            )}
          </div>

          {/* Metadata table */}
          <div className="rounded-xl bg-slate-50 dark:bg-navy-800 border border-slate-200 dark:border-white/5 overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-200 dark:border-white/5">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Details</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {media.media_type === 'movie' ? (
                <>
                  {meta.director    && <MetaRow label="Director"  value={meta.director} />}
                  {meta.runtime_minutes && <MetaRow label="Runtime" value={`${meta.runtime_minutes} minutes`} />}
                  {meta.box_office  && <MetaRow label="Box Office" value={meta.box_office} />}
                  {meta.cast?.length > 0 && <MetaRow label="Cast" value={meta.cast.join(', ')} />}
                </>
              ) : (
                <>
                  {meta.studio        && <MetaRow label="Studio"   value={meta.studio} />}
                  {meta.total_episodes && <MetaRow label="Episodes" value={meta.total_episodes} />}
                  {meta.seasons       && <MetaRow label="Seasons"  value={meta.seasons} />}
                  {meta.status        && <MetaRow label="Status"   value={meta.status} />}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── REVIEWS SECTION ─────────────────────────── */}
      <div className="mt-12 px-4 sm:px-0 space-y-6">
        <div className="section-header">
          <div className="accent-line" />
          <h2>User Reviews</h2>
          <span className="ml-auto text-sm text-slate-400">{reviews.length} review{reviews.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Write review form */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmitReview}
            className="bg-white dark:bg-navy-800 rounded-xl p-5 border border-slate-200 dark:border-white/5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-omni-600 flex items-center justify-center text-sm font-bold text-white shrink-0">
                {user?.username?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.username}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-slate-400">Your rating:</span>
                  <StarRating rating={reviewRating} interactive onRate={setReviewRating} size={16} />
                  {reviewRating > 0 && (
                    <button type="button" onClick={() => setReviewRating(0)} className="text-xs text-slate-400 hover:text-red-400">✕</button>
                  )}
                </div>
              </div>
            </div>
            <textarea
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="Share your thoughts about this title..."
              rows={3}
              required
              className="w-full rounded-lg bg-slate-50 dark:bg-navy-700 border border-slate-200 dark:border-white/10 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-omni-500 resize-none"
            />
            <div className="flex justify-end">
              <button type="submit" disabled={submittingReview}
                className="btn-primary !py-2 !px-5 disabled:opacity-50 flex items-center gap-2">
                <Send size={14} />
                {submittingReview ? 'Posting…' : 'Post Review'}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-white dark:bg-navy-800 rounded-xl p-5 border border-slate-200 dark:border-white/5 text-center">
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              <Link to="/login" className="text-omni-500 hover:text-omni-400 font-medium">Sign in</Link> to write a review
            </p>
          </div>
        )}

        {/* Review list */}
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <div className="text-center py-10 text-slate-400 dark:text-slate-500">
              <BookOpen size={32} className="mx-auto mb-3 opacity-40" />
              <p className="text-sm">No reviews yet. Be the first!</p>
            </div>
          ) : (
            reviews.map((r) => (
              <ReviewCard key={r.id} review={r} currentUserId={user?.id} onDelete={handleDeleteReview} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="flex items-start justify-between px-5 py-3 text-sm gap-4">
      <span className="text-slate-500 dark:text-slate-400 shrink-0">{label}</span>
      <span className="font-medium text-slate-900 dark:text-white text-right">{value}</span>
    </div>
  );
}