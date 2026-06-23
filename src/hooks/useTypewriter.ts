"use client";

import { useEffect, useState } from "react";
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

interface UseTypewriterOptions {
  /** When false, the full text shows immediately with no reveal. */
  enabled?: boolean;
  /** Milliseconds between reveal ticks. */
  tickMs?: number;
  /**
   * Characters revealed per tick. Defaults to an adaptive value so short
   * replies type at roughly tickMs-per-char (matching the homepage hero demo)
   * while long replies still finish in about the same wall-clock time instead
   * of dragging on.
   */
  charsPerTick?: number;
}

/**
 * useTypewriter — progressively reveals `text` so a chat reply appears to be
 * typed out instead of popping in all at once.
 *
 * Built for chat-bubble components: each message renders its own bubble, so
 * the reveal runs once when the bubble mounts. If a bubble's component
 * instance is later reused for different text (e.g. after a thread reset where
 * React reconciles by array index), the reveal restarts — handled with the
 * supported "adjust state during render" pattern rather than an effect, so we
 * never trip the React 19 `react-hooks/set-state-in-effect` rule.
 *
 * Honors prefers-reduced-motion and the `enabled` flag by showing the full
 * text immediately.
 */
export function useTypewriter(
  text: string,
  options: UseTypewriterOptions = {},
): { displayed: string; isAnimating: boolean } {
  const { enabled = true, tickMs = 20 } = options;
  const prefersReducedMotion = usePrefersReducedMotion();
  const animate = enabled && !prefersReducedMotion;

  // ~constant reveal duration: short messages keep a hero-like per-char feel,
  // long ones speed up so they don't outstay their welcome (~120 ticks max).
  const charsPerTick =
    options.charsPerTick ?? Math.max(1, Math.ceil(text.length / 120));

  const [count, setCount] = useState(animate ? 0 : text.length);

  // Restart the reveal when the rendered text changes under a reused instance.
  // Setting state during render is React's supported way to reset state on a
  // prop change; it re-renders in place without an extra committed paint.
  const [trackedText, setTrackedText] = useState(text);
  if (text !== trackedText) {
    setTrackedText(text);
    setCount(animate ? 0 : text.length);
  }

  useEffect(() => {
    if (!animate || count >= text.length) return;
    // setState lives inside the timer callback (async), which is the pattern
    // the codebase already uses for char-by-char reveals.
    const timer = window.setTimeout(() => {
      setCount((c) => Math.min(c + charsPerTick, text.length));
    }, tickMs);
    return () => window.clearTimeout(timer);
  }, [animate, count, text.length, charsPerTick, tickMs]);

  const clampedCount = animate ? Math.min(count, text.length) : text.length;

  return {
    displayed: text.slice(0, clampedCount),
    isAnimating: animate && clampedCount < text.length,
  };
}
