import { Sparkles, User } from "lucide-react";

export default function Avatar({ role }) {
  if (role === "user") {
    return (
      <div
        aria-hidden="true"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 ring-2 ring-white dark:bg-slate-700 dark:text-slate-200 dark:ring-slate-900"
      >
        <User className="h-4 w-4" />
      </div>
    );
  }
  return (
    <div
      aria-hidden="true"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-md shadow-indigo-500/30 ring-2 ring-white dark:ring-slate-900"
    >
      <Sparkles className="h-4 w-4" />
    </div>
  );
}
