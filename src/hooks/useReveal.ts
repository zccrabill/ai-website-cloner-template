"use client";

import { useEffect, useRef, useState } from "react";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

/**
 * useReveal — IntersectionObserver hook for scroll-triggered animations.
 *
 * Returns a ref to attach to the element you want to watch, and a boolean
 * that flips true the first time the element enters the viewport. Pair
 * with CSS transitions (.reveal / .reveal-in classes in globals.css) for
 * fade-in-up effects, or read `revealed` directly to gate things like
 * count-up animations.
 *
 * Respects prefers-reduced-motion: skips the observer and reports
 * revealed=true immediately so animation-gated content still appears.
 */
export interface UseRevealOptions {
  /** Fraction of the element that must be visible to trigger. Default 0.15. */
  threshold?: number;
  /** Margin around the root for early/late triggering. Default fires when
   *  the element is ~10% into the viewport. */
  rootMargin?: string;
  /** If true (default), only fire once and disconnect. If false, toggles
   *  revealed on/off as the element enters/leaves. */
  once?: boolean;
}

export function useReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseRevealOptions = {}
) {
  const {
    threshold = 0.15,
    rootMargin = "0px 0px -10% 0px",
    once = true,
  } = options;

  const ref = useRef<T>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [observerRevealed, setObserverRevealed] = useState(false);

  // Under prefers-reduced-motion we report revealed=true immediately and skip
  // the observer entirely. Derived at render — no setState-in-effect needed.
  const revealed = prefersReducedMotion || observerRevealed;

  useEffect(() => {
    if (prefersReducedMotion) return;
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setObserverRevealed(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setObserverRevealed(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [prefersReducedMotion, threshold, rootMargin, once]);

  return { ref, revealed };
}
