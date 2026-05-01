"use client";

import { ReactNode, ElementType, CSSProperties } from "react";
import { useReveal } from "@/hooks/useReveal";

/**
 * <Reveal> — wrap any content to fade-and-lift it into view on scroll.
 *
 * Powered by useReveal + the .reveal/.reveal-in CSS classes in globals.css.
 * Default render is a <div>; pass `as="section"` etc. if you need a
 * different tag for semantics or layout.
 *
 * Use `delay` to stagger sibling reveals (e.g., card grid: 0, 80, 160, 240ms).
 */
interface RevealProps {
  children: ReactNode;
  /** Stagger this elements transition by N ms (default 0). */
  delay?: number;
  /** Optional className appended after `reveal` so callers can layout. */
  className?: string;
  /** Render as this element type (default "div"). */
  as?: ElementType;
}

export default function Reveal({
  children,
  delay = 0,
  className = "",
  as: Component = "div",
}: RevealProps) {
  const { ref, revealed } = useReveal<HTMLElement>();

  const style: CSSProperties | undefined =
    delay > 0 ? { transitionDelay: delay + "ms" } : undefined;

  return (
    <Component
      ref={ref as React.Ref<HTMLElement>}
      className={"reveal " + (revealed ? "reveal-in " : "") + className}
      style={style}
    >
      {children}
    </Component>
  );
}
