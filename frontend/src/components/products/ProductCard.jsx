import { Award, Check, ShoppingCart } from "lucide-react";
import { useCart } from "../../cart/CartContext.jsx";
import { inr } from "../../format.js";
import ProductThumb from "./ProductThumb.jsx";
import StarRating from "./StarRating.jsx";
import StockBadge from "./StockBadge.jsx";

export default function ProductCard({ product, bestMatch = false }) {
  const { add, quantityOf, setOpen } = useCart();
  const inCart = quantityOf(product.id);
  const outOfStock = product.stock === 0;
  const maxed = product.stock > 0 && inCart >= Math.min(product.stock, 20);

  let label = "Add to cart";
  if (outOfStock) label = "Out of stock";
  else if (maxed) label = `Max in cart (${inCart})`;
  else if (inCart) label = `In cart (${inCart}) · Add`;

  return (
    <article
      className={`group relative flex w-44 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition duration-200 motion-safe:hover:-translate-y-1 hover:shadow-xl sm:w-52 dark:bg-slate-800 ${
        bestMatch
          ? "border-amber-300 ring-1 ring-amber-200 hover:shadow-amber-200/40 dark:border-amber-400/60 dark:ring-amber-400/20"
          : "border-slate-200 hover:shadow-slate-300/50 dark:border-slate-700 dark:hover:shadow-black/40"
      }`}
    >
      {bestMatch && (
        <span className="absolute left-2 top-2 z-10 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-950 shadow-md">
          <Award className="h-3 w-3" strokeWidth={2.5} />
          Best Match
        </span>
      )}
      <div className="overflow-hidden">
        <ProductThumb product={product} className="aspect-[4/3] w-full transition duration-300 group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{product.brand}</p>
          <StockBadge stock={product.stock} />
        </div>
        <h3 className="mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-5 text-slate-900 dark:text-slate-100">{product.name}</h3>
        <div className="mt-1.5">
          <StarRating rating={product.rating} />
        </div>
        <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">{inr.format(product.price)}</p>
        <div className="mt-auto pt-3">
          <button
            type="button"
            disabled={outOfStock || maxed}
            onClick={() => add(product)}
            className={`flex w-full items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 ${
              inCart
                ? "bg-emerald-600 text-white hover:bg-emerald-700"
                : "bg-slate-900 text-white hover:bg-indigo-600 dark:bg-indigo-500 dark:hover:bg-indigo-400"
            }`}
          >
            {inCart ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : <ShoppingCart className="h-3.5 w-3.5" />}
            {label}
          </button>
          {inCart > 0 && (
            <button type="button" onClick={() => setOpen(true)}
              className="mt-1.5 w-full text-[11px] text-slate-500 underline-offset-2 hover:text-indigo-600 hover:underline dark:text-slate-400 dark:hover:text-indigo-300">
              View cart
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
