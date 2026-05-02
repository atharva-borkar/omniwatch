import { Star } from 'lucide-react';

// Renders filled/half/empty stars for a 0.5-5.0 scale rating
export default function StarRating({ rating, max = 5, size = 14, interactive = false, onRate }) {
  const stars = Array.from({ length: max }, (_, i) => i + 1);

  return (
    <div className="flex items-center gap-0.5" role="group" aria-label={`Rating: ${rating} out of ${max}`}>
      {stars.map((star) => {
        const filled = rating >= star;
        const half = !filled && rating >= star - 0.5;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(star)}
            className={`transition-transform ${interactive ? 'cursor-pointer hover:scale-110' : 'cursor-default'} focus:outline-none`}
            aria-label={`${star} star`}
          >
            <Star
              size={size}
              className={
                filled ? 'fill-gold-400 text-gold-400' :
                half   ? 'fill-gold-400/50 text-gold-400' :
                         'fill-transparent text-slate-600 dark:text-slate-600'
              }
            />
          </button>
        );
      })}
    </div>
  );
}
