import type Lenis from "lenis";

/**
 * Module-level handle to the single Lenis instance created by <SmoothScroll>.
 * Lets non-React call sites (e.g. the header's anchor-nav handler) drive the
 * same momentum-scroll engine instead of fighting it with native
 * scrollIntoView. Returns null when smooth scroll is disabled (reduced-motion)
 * or not yet mounted — callers should fall back to native behavior.
 */
let instance: Lenis | null = null;

export function setLenis(l: Lenis | null): void {
  instance = l;
}

export function getLenis(): Lenis | null {
  return instance;
}
