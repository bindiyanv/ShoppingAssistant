import { SendHorizontal } from "lucide-react";
import { forwardRef, useState } from "react";

const ChatInput = forwardRef(function ChatInput({ onSend, disabled }, ref) {
  const [value, setValue] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue("");
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-2 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <input
        ref={ref}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What are you shopping for?"
        aria-label="Message ShopAssist"
        className="h-11 min-w-0 flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-indigo-500 dark:focus:bg-slate-800"
      />
      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Send message"
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-md shadow-indigo-500/25 transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:opacity-40 disabled:shadow-none sm:w-auto sm:gap-2 sm:px-4 dark:focus-visible:ring-offset-slate-900"
      >
        <SendHorizontal className="h-4.5 w-4.5" />
        <span className="hidden text-sm font-medium sm:inline">Send</span>
      </button>
    </form>
  );
});

export default ChatInput;
