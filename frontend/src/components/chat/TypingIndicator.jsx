import Avatar from "./Avatar.jsx";

export default function TypingIndicator() {
  return (
    <div className="flex animate-fade-in-up items-end gap-2.5 motion-reduce:animate-none" role="status" aria-label="ShopAssist is typing">
      <Avatar role="assistant" />
      <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-slate-200/70 bg-white px-4 py-3.5 shadow-sm dark:border-slate-700/60 dark:bg-slate-800">
        {[0, 160, 320].map((delay) => (
          <span
            key={delay}
            style={{ animationDelay: `${delay}ms` }}
            className="h-2 w-2 animate-typing rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 motion-reduce:animate-none"
          />
        ))}
      </div>
    </div>
  );
}
