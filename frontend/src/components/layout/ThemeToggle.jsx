import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../theme/useTheme.js";

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Light mode" : "Dark mode"}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/70 text-slate-600 shadow-sm transition hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
    >
      <Sun className={`absolute h-5 w-5 transition-all duration-300 ${dark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"}`} />
      <Moon className={`absolute h-5 w-5 transition-all duration-300 ${dark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"}`} />
    </button>
  );
}
