/**
 * Tesla regen-brake feel scroll utility.
 *
 * Drives a requestAnimationFrame scroll using an asymmetric S-curve easing:
 * slow start, fast cruise through the middle, long regen-style deceleration
 * into a soft stop. Used by RegenScrollGlobalHandler to replace the browser
 * default for in-page anchor clicks site-wide.
 *
 * Distance-aware duration: short jumps take ~1200ms, long jumps scale up to
 * a 2400ms cap so the feel stays proportional. Respects prefers-reduced-
 * motion (jumps instantly for accessibility).
 *
 * If a new regenScrollTo() call comes in mid-animation (e.g., user clicks a
 * second nav link), the prior RAF is cancelled so the two animations don't
 * fight each other.
 */

const PREFERS_REDUCED_MOTION =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

let activeRAF: number | null = null;

/**
 * Piecewise cubic. Spends 45% of time covering 60% of distance
 * (gentle ease-in + cruise), then 55% of time covering the final 40%
 * (long cubic ease-out tail). The deliberate velocity step at t=0.45
 * is the "regen engagement" feel — like lifting off the accelerator
 * in one-pedal mode.
 */
function regenEase(t: number): number {
  if (t < 0.45) {
    const u = t / 0.45;
    return 0.6 * u * u * u;
  }
  const u = (t - 0.45) / 0.55;
  return 0.6 + 0.4 * (1 - Math.pow(1 - u, 3));
}

export interface RegenScrollOptions {
  /** Pixels to subtract from target Y (e.g., for a fixed header). */
  offset?: number;
  /** Override the auto-computed duration in ms. */
  duration?: number;
}

export function regenScrollTo(
  target: number | HTMLElement,
  options: RegenScrollOptions = {}
): void {
  if (typeof window === "undefined") return;

  if (activeRAF !== null) {
    cancelAnimationFrame(activeRAF);
    activeRAF = null;
  }

  const { offset = 0, duration: forcedDuration } = options;

  const startY = window.scrollY;
  const targetY =
    typeof target === "number"
      ? target - offset
      : target.getBoundingClientRect().top + window.scrollY - offset;

  const distance = targetY - startY;
  if (Math.abs(distance) < 4) return;

  if (PREFERS_REDUCED_MOTION) {
    window.scrollTo({ top: targetY, behavior: "instant" as ScrollBehavior });
    return;
  }

  const duration =
    forcedDuration ??
    Math.min(2400, Math.max(1200, 1200 + Math.abs(distance) * 0.4));

  const startTime = performance.now();

  function step(now: number): void {
    const elapsed = now - startTime;
    const t = Math.min(1, elapsed / duration);
    const eased = regenEase(t);
    window.scrollTo({
      top: startY + distance * eased,
      behavior: "instant" as ScrollBehavior,
    });
    if (t < 1) {
      activeRAF = requestAnimationFrame(step);
    } else {
      activeRAF = null;
    }
  }

  activeRAF = requestAnimationFrame(step);
}
