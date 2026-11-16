import { Star } from "lucide-react";

export default function StarRating({ rating }) {
  if (rating == null) return null;
  const pct = Math.max(0, Math.min(5, rating)) / 5 * 100;
  return (
    <div className="flex items-center gap-1" aria-label={`Rated ${rating} out of 5`}>
      <div className="relative flex" aria-hidden="true">
        <div className="flex text-slate-200 dark:text-slate-700">
          {Array.from({ length: 5 }, (_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" strokeWidth={0} />)}
        </div>
        <div className="absolute inset-0 flex overflow-hidden text-amber-400" style={{ width: `${pct}%` }}>
          {Array.from({ length: 5 }, (_, i) => <Star key={i} className="h-3.5 w-3.5 shrink-0 fill-current" strokeWidth={0} />)}
        </div>
      </div>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{rating.toFixed(1)}</span>
    </div>
  );
}
