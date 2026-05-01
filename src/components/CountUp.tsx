"use client";

import { useEffect, useRef, useState } from "react";
import { useReveal } from "@/hooks/useReveal";

/**
 * <CountUp end={247} suffix=" matters" /> — animates 0 → end when
 * scrolled into view. Uses cubic ease-out for a natural deceleration
 * (numbers tick fast at first, then settle into the final value).
 *
 * Respects prefers-reduced-motion: snaps to end value immediately.
 */
interface CountUpProps {
  end: number;
  /** Animation duration in ms. Default 1800. */
  duration?: number;
  /** Decimal places to display. Default 0 (integer). */
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

export default function CountUp({
  end,
  duration = 1800,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
}: CountUpProps) {
  const { ref, revealed } = useReveal<HTMLSpanElement>();
  const [value, setValue] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    if (!revealed) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setValue(end);
      return;
    }

    let rafId: number;
    function tick(now: number) {
      if (startTimeRef.current === null) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(end * eased);
      if (t < 1) rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(rafId);
      startTimeRef.current = null;
    };
  }, [revealed, end, duration]);

  const display =
    decimals > 0 ? value.toFixed(decimals) : Math.round(value).toString();

  return (
    <span ref={ref} className={className}>
      {prefix}
      {display}
      {suffix}
    </span>
  );
}
