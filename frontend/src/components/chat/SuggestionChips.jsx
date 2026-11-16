import { SUGGESTIONS } from "../../suggestions.js";

export default function SuggestionChips({ onPick, disabled }) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto px-3 pt-3">
      {SUGGESTIONS.map(({ label, icon: Icon }) => (
        <button
          key={label}
          type="button"
          onClick={() => onPick(label)}
          disabled={disabled}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-300 dark:hover:border-indigo-500/60 dark:hover:bg-indigo-500/10 dark:hover:text-indigo-200"
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </button>
      ))}
    </div>
  );
}
