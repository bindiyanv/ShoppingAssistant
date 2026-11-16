import { useEffect, useRef } from "react";
import { AlertCircle } from "lucide-react";
import MessageBubble from "./MessageBubble.jsx";
import TypingIndicator from "./TypingIndicator.jsx";

export default function MessageList({ messages, loading, error }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading, error]);

  return (
    <div aria-live="polite" className="space-y-5">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} />
      ))}
      {loading && <TypingIndicator />}
      {error && (
        <div className="flex animate-fade-in-up items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <div ref={bottomRef} />
    </div>
  );
}
