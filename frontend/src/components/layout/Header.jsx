import { ShoppingBag } from "lucide-react";
import CartButton from "../cart/CartButton.jsx";
import ThemeToggle from "./ThemeToggle.jsx";

export default function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-white/60 bg-white/60 backdrop-blur-xl dark:border-slate-800/60 dark:bg-slate-950/60">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg shadow-indigo-500/30">
            <ShoppingBag className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <div className="min-w-0">
            <h1 className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-lg font-bold leading-tight tracking-tight text-transparent dark:from-indigo-300 dark:to-violet-300">
              ShopAssist
            </h1>
            <p className="hidden truncate text-xs text-slate-500 sm:block dark:text-slate-400">
              Your AI shopping companion · ask in plain language
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
