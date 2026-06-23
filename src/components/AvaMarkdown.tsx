"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Close an odd number of `**` so a mid-typing bold span doesn't flash literal
 *  asterisks while the typewriter is still revealing the closing marker. */
export function balanceMarkdown(text: string): string {
  const boldMarkers = text.match(/\*\*/g);
  if (boldMarkers && boldMarkers.length % 2 === 1) return `${text}**`;
  return text;
}

/** Hide a half-typed markdown link so the raw `[label](https://…` syntax never
 *  reveals character-by-character — the link pops in complete instead. Only call
 *  this on mid-animation text; a finished message keeps its real content (a
 *  complete `[label](url)` at the tail is left untouched). */
export function hideTrailingIncompleteLink(text: string): string {
  const lastOpen = text.lastIndexOf("[");
  if (lastOpen === -1) return text;
  if (/^\[[^\]]*\]\([^)]*\)/.test(text.slice(lastOpen))) return text;
  return text.slice(0, lastOpen);
}

/**
 * AvaMarkdown — the single renderer for Ava's replies, shared by the dashboard
 * chat and the floating widget so both format markdown identically and neither
 * ever shows raw `**` / `*` / `#` punctuation as literal text. Compact type
 * scale so it reads well inside a small chat bubble.
 */
export function AvaMarkdown({
  children,
  animating = false,
}: {
  children: string;
  animating?: boolean;
}) {
  // While typing, hide an in-progress link so its raw URL never reveals
  // char-by-char; the finished message renders its real content untouched.
  const partial = animating ? hideTrailingIncompleteLink(children) : children;
  return (
    <div className="text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-semibold text-[#1F1810]">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mb-2 space-y-1 last:mb-0">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mb-2 space-y-1 last:mb-0">
              {children}
            </ol>
          ),
          li: ({ children }) => <li>{children}</li>,
          h1: ({ children }) => (
            <h1 className="text-base font-semibold mt-2 mb-1">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-sm font-semibold mt-2 mb-1">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-semibold mt-2 mb-1">{children}</h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-sm font-semibold mt-2 mb-1">{children}</h4>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C17832] underline"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="bg-[#F5F0EB] px-1 py-0.5 rounded text-[0.85em]">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="bg-[#F5F0EB] p-2 rounded text-[0.85em] overflow-x-auto mb-2">
              {children}
            </pre>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[#D9CCBC] pl-3 italic my-2">
              {children}
            </blockquote>
          ),
          hr: () => <hr className="border-[#D9CCBC] my-2" />,
        }}
      >
        {balanceMarkdown(partial)}
      </ReactMarkdown>
    </div>
  );
}
