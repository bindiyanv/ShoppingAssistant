import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "../../cart/CartContext.jsx";
import { inr } from "../../format.js";
import ProductThumb from "../products/ProductThumb.jsx";

const stepBtn =
  "flex h-7 w-7 items-center justify-center text-slate-600 transition hover:bg-slate-100 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-700";

export default function CartLineItem({ product, quantity }) {
  const { setQuantity, remove } = useCart();
  const max = product.stock > 0 ? Math.min(product.stock, 20) : 20;

  return (
    <li className="flex animate-fade-in-up gap-3 py-3 motion-reduce:animate-none">
      <ProductThumb product={product} className="aspect-square w-16 shrink-0 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700" iconClassName="h-7 w-7" />
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-wide text-slate-400 dark:text-slate-500">{product.brand}</p>
        <p className="line-clamp-2 text-sm font-medium text-slate-900 dark:text-slate-100">{product.name}</p>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700">
            <button type="button" onClick={() => setQuantity(product.id, quantity - 1)} aria-label="Decrease quantity" className={stepBtn}>
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="w-7 text-center text-sm tabular-nums">{quantity}</span>
            <button type="button" onClick={() => setQuantity(product.id, quantity + 1)} disabled={quantity >= max}
              aria-label="Increase quantity" className={stepBtn}>
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <span className="text-sm font-semibold text-slate-900 dark:text-white">{inr.format(product.price * quantity)}</span>
        </div>
      </div>
      <button type="button" onClick={() => remove(product.id)} aria-label={`Remove ${product.name}`}
        className="self-start rounded-lg p-1.5 text-slate-400 transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10 dark:hover:text-red-400">
        <Trash2 className="h-4 w-4" />
      </button>
    </li>
  );
}
