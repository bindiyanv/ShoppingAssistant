import { useEffect, useState } from "react";
import { AlertCircle, PartyPopper, ShoppingBag, X } from "lucide-react";
import { useCart } from "../../cart/CartContext.jsx";
import { placeOrder } from "../../api.js";
import { inr } from "../../format.js";
import CartLineItem from "./CartLineItem.jsx";

export default function CartDrawer() {
  const { items, count, subtotal, clear, open, setOpen } = useCart();
  const [placing, setPlacing] = useState(false);
  const [result, setResult] = useState(null); // { ok, text }

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);

  useEffect(() => {
    if (open) setResult((r) => (r?.ok ? r : null));
  }, [open]);

  async function checkout() {
    setPlacing(true);
    setResult(null);
    try {
      const order = await placeOrder(items.map((i) => ({ product_id: i.product.id, quantity: i.quantity })));
      clear();
      setResult({ ok: true, text: `Order #${order.id} placed · ${inr.format(order.total)}` });
    } catch (e) {
      setResult({ ok: false, text: e.message });
    } finally {
      setPlacing(false);
    }
  }

  return (
    <div className={`fixed inset-0 z-50 ${open ? "" : "pointer-events-none"}`} aria-hidden={!open}>
      <div
        onClick={() => setOpen(false)}
        className={`absolute inset-0 bg-slate-950/40 transition-opacity duration-300 ${open ? "opacity-100 backdrop-blur-sm" : "opacity-0"}`}
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Shopping cart"
        className={`absolute right-0 top-0 flex h-full w-full flex-col bg-white transition-[translate,visibility,box-shadow] duration-300 ease-out sm:max-w-sm dark:bg-slate-900 dark:text-slate-100 ${
          open ? "visible translate-x-0 shadow-2xl" : "invisible translate-x-full shadow-none"
        }`}
      >
        <header className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-indigo-500" />
            <h2 className="text-base font-semibold">Your cart</h2>
            {count > 0 && (
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
                {count} item{count === 1 ? "" : "s"}
              </span>
            )}
          </div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Close cart"
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-slate-800 dark:hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-5 py-2">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              {result?.ok ? (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300">
                    <PartyPopper className="h-7 w-7" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-emerald-700 dark:text-emerald-300">{result.text}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Thanks for shopping with ShopAssist!</p>
                </>
              ) : (
                <>
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                    <ShoppingBag className="h-7 w-7" />
                  </div>
                  <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-200">Your cart is empty</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Add products from the chat to see them here.</p>
                </>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.map(({ product, quantity }) => (
                <CartLineItem key={product.id} product={product} quantity={quantity} />
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <footer className="space-y-3 border-t border-slate-200 px-5 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] dark:border-slate-800">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
              <span className="text-lg font-bold">{inr.format(subtotal)}</span>
            </div>
            {result && !result.ok && (
              <p className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-700 dark:bg-red-500/10 dark:text-red-300">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {result.text}
              </p>
            )}
            <button type="button" onClick={checkout} disabled={placing}
              className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-50">
              {placing ? "Placing order…" : "Place order"}
            </button>
            <button type="button" onClick={clear}
              className="w-full text-xs text-slate-500 transition hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              Clear cart
            </button>
          </footer>
        )}
      </aside>
    </div>
  );
}
