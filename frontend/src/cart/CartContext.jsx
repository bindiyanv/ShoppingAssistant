import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "shopassist.cart";
const CartContext = createContext(null);

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Items: { product, quantity }. Kept client-side until checkout posts to /api/orders.
export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable — cart still works in memory */
    }
  }, [items]);

  const add = useCallback((product, qty = 1) => {
    setItems((cur) => {
      const max = product.stock > 0 ? Math.min(product.stock, 20) : 20;
      const existing = cur.find((i) => i.product.id === product.id);
      if (existing) {
        return cur.map((i) =>
          i.product.id === product.id ? { ...i, quantity: Math.min(i.quantity + qty, max) } : i
        );
      }
      return [...cur, { product, quantity: Math.min(qty, max) }];
    });
  }, []);

  const setQuantity = useCallback((id, quantity) => {
    setItems((cur) =>
      quantity <= 0
        ? cur.filter((i) => i.product.id !== id)
        : cur.map((i) => {
            if (i.product.id !== id) return i;
            const max = i.product.stock > 0 ? Math.min(i.product.stock, 20) : 20;
            return { ...i, quantity: Math.min(quantity, max) };
          })
    );
  }, []);

  const remove = useCallback((id) => setItems((cur) => cur.filter((i) => i.product.id !== id)), []);
  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0);
    const subtotal = items.reduce((n, i) => n + i.quantity * i.product.price, 0);
    const quantityOf = (id) => items.find((i) => i.product.id === id)?.quantity ?? 0;
    return { items, count, subtotal, add, setQuantity, remove, clear, quantityOf, open, setOpen };
  }, [items, add, setQuantity, remove, clear, open]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
