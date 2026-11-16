export default function StockBadge({ stock }) {
  let label, cls, dot;
  if (stock > 10) {
    label = "In stock";
    cls = "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300";
    dot = "bg-emerald-500";
  } else if (stock > 0) {
    label = `Only ${stock} left`;
    cls = "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300";
    dot = "bg-amber-500";
  } else {
    label = "Out of stock";
    cls = "bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400";
    dot = "bg-slate-400";
  }
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cls}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}
