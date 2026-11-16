import { ShoppingCart } from "lucide-react";
import { useCart } from "../../cart/CartContext.jsx";

export default function CartButton() {
  const { count, setOpen } = useCart();
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/70 text-slate-700 shadow-sm transition hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:bg-slate-800"
    >
      <ShoppingCart className="h-5 w-5" />
      {count > 0 && (
        <span
          key={count}
          className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 animate-bump items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-pink-500 px-1 text-[11px] font-semibold text-white shadow ring-2 ring-white dark:ring-slate-900"
        >
          {count > 99 ? "99+" : count}
        </span>
      )}
    </button>
  );
}
