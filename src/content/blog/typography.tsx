import type { ReactNode } from "react";

/**
 * Shared typography primitives for blog post content files.
 *
 * Why this exists:
 * - Content files under src/content/blog/*.tsx should focus on the words,
 *   not on repeating Tailwind classes for every <h2>, <p>, <ul>, etc.
 * - Keeps the design system in one place. If we later adopt
 *   @tailwindcss/typography, we can swap these out for `prose` classes
 *   without rewriting every post.
 * - Matches the existing site's color tokens (#1F1810 text, #6B5B4E body,
 *   #C17832 accent) so posts feel native.
 */

export function H2({ children }: { children: ReactNode }) {
  return (
    <h2
      className="font-heading text-2xl md:text-3xl text-[#1F1810] mt-12 mb-4 leading-tight"
      style={{ fontWeight: 400 }}
    >
      {children}
    </h2>
  );
}

export function H3({ children }: { children: ReactNode }) {
  return (
    <h3
      className="font-heading text-xl md:text-2xl text-[#1F1810] mt-10 mb-3 leading-tight"
      style={{ fontWeight: 400 }}
    >
      {children}
    </h3>
  );
}

export function P({ children }: { children: ReactNode }) {
  return (
    <p className="text-[#6B5B4E] text-[15px] md:text-[16px] leading-relaxed mb-5">
      {children}
    </p>
  );
}

export function Lead({ children }: { children: ReactNode }) {
  return (
    <p className="text-[#1F1810] text-lg md:text-xl leading-relaxed mb-6">
      {children}
    </p>
  );
}

export function UL({ children }: { children: ReactNode }) {
  return (
    <ul className="list-disc pl-6 mb-6 space-y-2 text-[#6B5B4E] text-[15px] md:text-[16px] leading-relaxed marker:text-[#C17832]">
      {children}
    </ul>
  );
}

export function OL({ children }: { children: ReactNode }) {
  return (
    <ol className="list-decimal pl-6 mb-6 space-y-2 text-[#6B5B4E] text-[15px] md:text-[16px] leading-relaxed marker:text-[#C17832] marker:font-semibold">
      {children}
    </ol>
  );
}

export function LI({ children }: { children: ReactNode }) {
  return <li className="pl-1">{children}</li>;
}

export function Strong({ children }: { children: ReactNode }) {
  return <strong className="text-[#1F1810] font-semibold">{children}</strong>;
}

export function InlineLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  const external = /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      className="text-[#C17832] underline decoration-[#C17832]/30 underline-offset-2 hover:text-[#D4893F] hover:decoration-[#D4893F]"
      {...(external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : undefined)}
    >
      {children}
    </a>
  );
}

export function Callout({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside className="my-8 rounded-lg border-l-4 border-[#C17832] bg-[#F5F0EB] p-5 md:p-6">
      {title ? (
        <p className="font-heading text-[#1F1810] text-lg mb-2" style={{ fontWeight: 500 }}>
          {title}
        </p>
      ) : null}
      <div className="[&>p:last-child]:mb-0 [&>p]:text-[#6B5B4E] [&>p]:text-[15px] [&>p]:leading-relaxed [&>p]:mb-3">
        {children}
      </div>
    </aside>
  );
}

export function Blockquote({ children }: { children: ReactNode }) {
  return (
    <blockquote className="my-8 border-l-4 border-[#C17832]/60 pl-5 italic text-[#1F1810] text-lg leading-relaxed">
      {children}
    </blockquote>
  );
}

/**
 * Disclaimer block appended to the end of every legal blog post.
 * Centralized so we only maintain the language in one place and every post
 * consistently separates general information from advice.
 */
export function LegalDisclaimer() {
  return (
    <aside className="mt-12 rounded-lg border border-[#1F1810]/10 bg-[#FAF8F5] p-5 md:p-6 text-[13px] text-[#6B5B4E] leading-relaxed">
      <p className="font-semibold text-[#1F1810] mb-1">
        This article is general information, not legal advice.
      </p>
      <p>
        Reading this article does not create an attorney-client relationship
        with Available Law, LLC. Every business is different, and the Colorado
        AI Act applies in different ways depending on your industry, the
        specific AI systems you use, and the decisions they influence. If you
        want a real compliance review for your business, schedule a FAIIR
        assessment with a Colorado attorney on our team.
      </p>
    </aside>
  );
}
