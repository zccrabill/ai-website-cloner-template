"use client";

import { useEffect, useRef } from "react";

/**
 * Subtle scroll parallax. Attach the returned ref to a decorative element and
 * it drifts vertically as it passes through the viewport, adding depth without
 * touching layout. Composes with any CSS animation on *child* elements (e.g.
 * the hero's floating orbs) because it transforms the wrapper, not the kids.
 *
 * `speed` is the fraction of viewport travel applied: 0.15 ≈ gentle, 0.4 = bold.
 * Disabled entirely under `prefers-reduced-motion`.
 */
export function useParallax<T extends HTMLElement>(speed = 0.15) {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (
      !el ||
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const viewportH = window.innerHeight || 1;
      // -1 (element below viewport) → 0 (centered) → 1 (above). Drift opposite
      // to scroll for a receding-background feel.
      const progress =
        (rect.top + rect.height / 2 - viewportH / 2) /
        (viewportH / 2 + rect.height / 2);
      el.style.transform = `translate3d(0, ${(progress * speed * 100).toFixed(2)}px, 0)`;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed]);

  return ref;
}
