import { ArrowUpRight, Sparkles } from "lucide-react";
import { SUGGESTIONS } from "../../suggestions.js";

export default function WelcomeState({ onPick }) {
  return (
    <div className="mx-auto flex min-h-full max-w-xl animate-fade-in-up flex-col items-center justify-center py-6 text-center motion-reduce:animate-none">
      <div className="relative">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 opacity-40 blur-xl" />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-xl">
          <Sparkles className="h-8 w-8" />
        </div>
      </div>
      <h2 className="mt-5 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
        Hi! I'm ShopAssist 👋
      </h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Tell me what you're shopping for, including budget, use or style, and I'll find matching
        products from our catalog. Try one of these to get started:
      </p>

      <div className="mt-6 grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2">
        {SUGGESTIONS.slice(0, 4).map(({ label, icon: Icon, hint }, i) => (
          <button
            key={label}
            type="button"
            onClick={() => onPick(label)}
            style={{ animationDelay: `${80 + i * 60}ms` }}
            className="group flex animate-fade-in-up items-center gap-3 rounded-2xl border border-slate-200 bg-white/80 p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 motion-reduce:animate-none motion-reduce:hover:translate-y-0 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-indigo-500/60"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-500/15 dark:text-indigo-300">
              <Icon className="h-4.5 w-4.5" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{hint}</span>
              <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">{label}</span>
            </span>
            <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-300 transition group-hover:text-indigo-500 dark:text-slate-600" />
          </button>
        ))}
      </div>
    </div>
  );
}
