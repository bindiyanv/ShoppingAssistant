import { formatTime } from "../../format.js";
import ProductCarousel from "../products/ProductCarousel.jsx";
import Avatar from "./Avatar.jsx";
import Markdown from "./Markdown.jsx";

export default function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const time = message.createdAt ? formatTime(message.createdAt) : null;

  if (isUser) {
    return (
      <div className="flex animate-fade-in-up items-end justify-end gap-2.5 motion-reduce:animate-none">
        <div className="flex max-w-[85%] flex-col items-end sm:max-w-[75%]">
          <div className="whitespace-pre-wrap break-words rounded-2xl rounded-br-md bg-gradient-to-br from-indigo-500 to-violet-600 px-4 py-2.5 text-sm text-white shadow-md shadow-indigo-500/20">
            {message.content}
          </div>
          {time && <span className="mt-1 px-1 text-[11px] text-slate-400 dark:text-slate-500">{time}</span>}
        </div>
        <Avatar role="user" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in-up motion-reduce:animate-none">
      <div className="flex items-end gap-2.5">
        <Avatar role="assistant" />
        <div className="flex min-w-0 max-w-[85%] flex-col items-start sm:max-w-[75%]">
          <div className="min-w-0 max-w-full rounded-2xl rounded-bl-md border border-slate-200/70 bg-white px-4 py-2.5 text-sm text-slate-700 shadow-sm dark:border-slate-700/60 dark:bg-slate-800 dark:text-slate-200">
            <Markdown>{message.content}</Markdown>
          </div>
          {time && (
            <span className="mt-1 px-1 text-[11px] text-slate-400 dark:text-slate-500">ShopAssist · {time}</span>
          )}
        </div>
      </div>
      {message.products?.length > 0 && (
        <div className="mt-2 sm:pl-10.5">
          <ProductCarousel products={message.products} />
        </div>
      )}
    </div>
  );
}
