import { useRef, useState } from "react";
import { sendChat } from "../../api.js";
import ChatInput from "./ChatInput.jsx";
import MessageList from "./MessageList.jsx";
import SuggestionChips from "./SuggestionChips.jsx";
import WelcomeState from "./WelcomeState.jsx";

let nextId = 1;
const makeMessage = (fields) => ({ id: nextId++, createdAt: Date.now(), ...fields });

export default function ChatWindow() {
  const [messages, setMessages] = useState([]); // {id, role, content, createdAt, products?}
  const [sessionId, setSessionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef(null);

  async function send(text) {
    const message = text.trim();
    if (!message || loading) return;
    setError("");
    setMessages((m) => [...m, makeMessage({ role: "user", content: message })]);
    setLoading(true);
    try {
      const data = await sendChat({ message, sessionId });
      setSessionId(data.session_id);
      setMessages((m) => [...m, makeMessage({ role: "assistant", content: data.answer, products: data.products })]);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  const empty = messages.length === 0;

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white/70 backdrop-blur-sm sm:rounded-3xl sm:border sm:border-slate-200/80 sm:shadow-xl sm:shadow-slate-200/50 dark:bg-slate-900/70 dark:sm:border-slate-800 dark:sm:shadow-black/30">
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5 sm:px-6">
        {empty && !loading ? (
          <WelcomeState onPick={send} />
        ) : (
          <MessageList messages={messages} loading={loading} error={error} />
        )}
      </div>
      <div className="border-t border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80">
        {!empty && <SuggestionChips onPick={send} disabled={loading} />}
        <ChatInput ref={inputRef} onSend={send} disabled={loading} />
      </div>
    </section>
  );
}
