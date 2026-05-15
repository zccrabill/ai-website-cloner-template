"use client";

import { useSyncExternalStore } from "react";

/**
 * usePrefersReducedMotion — subscribes to the OS's prefers-reduced-motion
 * setting and re-renders on change.
 *
 * Implemented with useSyncExternalStore so the value is read during render
 * rather than via a setState inside an effect. This sidesteps the React 19
 * `react-hooks/set-state-in-effect` rule that flags the older
 * `useState + useEffect(setState(mq.matches))` pattern.
 *
 * SSR: returns `false` server-side. The first client render hydrates with
 * the actual value, which is fine — every callsite in this codebase uses
 * the value to skip an animation (not to gate an SSR'd layout), so a brief
 * "motion permitted" flash before the real value lands is acceptable.
 */

function subscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getServerSnapshot(): boolean {
  return false;
}

export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
