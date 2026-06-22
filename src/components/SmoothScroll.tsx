"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { setLenis } from "@/lib/smoothScroll";

/**
 * Site-wide momentum scrolling (the "weighty, eased" scroll you feel on
 * polished marketing sites). Mounted once in the root layout.
 *
 * Deliberately conservative for a law-firm tone:
 * - Desktop only gets smoothing; touch devices keep native scroll (smoothTouch
 *   off) because momentum-emulation feels worse than the real thing on phones.
 * - Fully disabled for `prefers-reduced-motion` users — we never init Lenis,
 *   so scrolling stays 1:1 native and assistive tech is unaffected.
 *
 * Renders nothing.
 */
export default function SmoothScroll() {
  useEffect(() => {
    if (
      typeof window === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const lenis = new Lenis({
      lerp: 0.09, // lower = more glide; 0.09 reads as "premium" without feeling sluggish
      smoothWheel: true,
      wheelMultiplier: 1,
    });
    setLenis(lenis);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}
