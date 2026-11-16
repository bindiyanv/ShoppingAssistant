import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// Tailwind-styled renderers so assistant replies show bold text, lists and tables cleanly.
const components = {
  p: ({ children }) => <p className="my-1.5 leading-relaxed first:mt-0 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-slate-900 dark:text-white">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  ul: ({ children }) => <ul className="my-1.5 list-disc space-y-0.5 pl-5">{children}</ul>,
  ol: ({ children }) => <ol className="my-1.5 list-decimal space-y-0.5 pl-5">{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed marker:text-indigo-400">{children}</li>,
  h1: ({ children }) => <h3 className="mb-1 mt-2 text-base font-semibold text-slate-900 dark:text-white">{children}</h3>,
  h2: ({ children }) => <h3 className="mb-1 mt-2 text-sm font-semibold text-slate-900 dark:text-white">{children}</h3>,
  h3: ({ children }) => <h4 className="mb-1 mt-2 text-sm font-semibold text-slate-900 dark:text-white">{children}</h4>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" rel="noreferrer" className="text-indigo-600 underline underline-offset-2 dark:text-indigo-300">
      {children}
    </a>
  ),
  code: ({ children }) => (
    <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.8em] dark:bg-slate-700/70">{children}</code>
  ),
  table: ({ children }) => (
    <div className="my-2 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full border-collapse text-left text-xs">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-slate-50 text-slate-600 dark:bg-slate-900/60 dark:text-slate-300">{children}</thead>
  ),
  th: ({ children }) => (
    <th className="whitespace-nowrap border-b border-slate-200 px-3 py-2 font-semibold dark:border-slate-700">{children}</th>
  ),
  td: ({ children }) => <td className="border-b border-slate-100 px-3 py-2 align-top dark:border-slate-700/60">{children}</td>,
  hr: () => <hr className="my-3 border-slate-200 dark:border-slate-700" />,
};

export default function Markdown({ children }) {
  return (
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
      {children}
    </ReactMarkdown>
  );
}
