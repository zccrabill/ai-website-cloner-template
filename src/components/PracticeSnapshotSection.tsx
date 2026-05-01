/**
 * PracticeSnapshotSection — live aggregate view of active legal work.
 *
 * Hits the get-matters-stats Edge Function on mount and renders three
 * headline stats (active clients / YTD matters / practice areas) plus
 * a practice-area breakdown chip row.
 *
 * Confidentiality contract: this component renders ONLY aggregate
 * counts and non-identifying dimensions returned by the Edge Function.
 * Never add fields here that could tie a datapoint back to a specific
 * client, deal, or matter.
 *
 * Failure mode: if the Edge Function is unreachable or returns an error,
 * we render nothing. Silent graceful degradation beats a broken widget.
 */

"use client";

import { useEffect, useState, useRef } from "react";
import { Briefcase, Layers, TrendingUp, Sparkles } from "lucide-react";

// ------------------------------------------------------------------------
// Types — practice_area values are already human-readable strings (e.g.
// "AI Consulting & Compliance"), enforced by a CHECK constraint on the
// matters.practice_area column. No label-map layer needed.
// ------------------------------------------------------------------------

interface PracticeAreaBucket {
  area: string;
  count: number;
}

interface PracticeSnapshot {
  active_clients: number;
  active_matters: number;
  total_matters: number;
  matters_ytd: number;
  matters_this_month: number;
  states: string[];
  practice_areas: string[];
  practice_area_breakdown: PracticeAreaBucket[];
  last_updated: string;
}

// ------------------------------------------------------------------------
// useCountUp — small animation hook for the headline stat numbers.
// Eases a number from 0 → target over `duration` ms. Respects reduced
// motion via prefers-reduced-motion.
// ------------------------------------------------------------------------

function useCountUp(target: number, duration = 900, enabled = true): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!enabled) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReduced || target === 0) {
      setValue(target);
      return;
    }

    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const progress = Math.min((t - start) / duration, 1);
      // ease-out cubic for a satisfying deceleration
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, enabled]);

  return value;
}

// ------------------------------------------------------------------------
// StatCard — one of three big headline numbers.
// ------------------------------------------------------------------------

function StatCard({
  icon: Icon,
  value,
  label,
  loading,
}: {
  icon: React.ComponentType<{ className?: string }>;
  value: number;
  label: string;
  loading: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = cardRef.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, []);

  const animated = useCountUp(loading ? 0 : value, 900, inView);

  return (
    <div ref={cardRef} className="flex flex-col items-center text-center p-8 bg-white rounded-xl border border-[#1F1810]/8 hover:border-[#C17832]/30 transition-colors">
      <Icon className="w-6 h-6 text-[#C17832] mb-4" />
      <div
        className={`font-heading text-5xl md:text-6xl text-[#1F1810] mb-2 tabular-nums ${
          loading ? "opacity-30" : ""
        }`}
        aria-live="polite"
      >
        {loading ? "—" : animated}
      </div>
      <div className="text-[#1F1810]/60 text-sm">{label}</div>
    </div>
  );
}

// ------------------------------------------------------------------------
// PracticeSnapshotSection — default export
// ------------------------------------------------------------------------

export default function PracticeSnapshotSection() {
  const [snapshot, setSnapshot] = useState<PracticeSnapshot | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      setHidden(true);
      return;
    }

    const controller = new AbortController();

    fetch(`${supabaseUrl}/functions/v1/get-matters-stats`, {
      signal: controller.signal,
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${anonKey}`,
      },
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data: PracticeSnapshot) => {
        // Hide entirely if there's genuinely no data yet — better than
        // a "0 clients served" section that hurts rather than helps.
        if (!data || data.total_matters === 0) {
          setHidden(true);
          return;
        }
        setSnapshot(data);
      })
      .catch((err) => {
        if (err?.name !== "AbortError") {
          console.error("PracticeSnapshotSection: stats fetch failed", err);
          setHidden(true);
        }
      });

    return () => controller.abort();
  }, []);

  if (hidden) return null;

  const active_clients = snapshot?.active_clients ?? 0;
  const matters_ytd = snapshot?.matters_ytd ?? 0;
  const practice_areas_count = snapshot?.practice_areas.length ?? 0;
  const loading = !snapshot;

  return (
    <section
      id="practice-snapshot"
      className="w-full bg-gradient-to-b from-[#F5F0EB] to-[#FAF8F5] py-[96px] px-6 border-y border-[#1F1810]/8"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-14">
          <p className="text-[#A89279] text-xs tracking-widest uppercase mb-4">
            The practice at a glance
          </p>
          <h2 className="font-heading text-3xl md:text-5xl text-[#1F1810] mb-4">
            Active work, real clients.
          </h2>
          <p className="text-[#1F1810]/60 max-w-[640px]">
            A real-time look at the work we&apos;re handling across our
            practice areas, updated live from our case ledger.
          </p>
        </div>

        {/* Three headline stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          <StatCard
            icon={Sparkles}
            value={active_clients}
            label="Active clients"
            loading={loading}
          />
          <StatCard
            icon={TrendingUp}
            value={matters_ytd}
            label="Matters handled this year"
            loading={loading}
          />
          <StatCard
            icon={Layers}
            value={practice_areas_count}
            label={
              practice_areas_count === 1 ? "Practice area" : "Practice areas"
            }
            loading={loading}
          />
        </div>

        {/* Practice-area breakdown chips — one row, counts included */}
        {snapshot && snapshot.practice_area_breakdown.length > 0 && (
          <div>
            <p className="text-[#A89279] text-xs tracking-widest uppercase mb-5 text-center">
              Where the work lives
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {snapshot.practice_area_breakdown.map((b) => (
                <div
                  key={b.area}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#1F1810]/8"
                >
                  <Briefcase className="w-3.5 h-3.5 text-[#A89279]" />
                  <span className="text-[#1F1810] font-medium text-sm">
                    {b.area}
                  </span>
                  <span className="text-[#C17832] font-semibold text-sm tabular-nums">
                    {b.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Last-updated footnote */}
        {snapshot?.last_updated && (
          <p className="text-[#A89279]/70 text-xs text-center mt-10">
            Updated{" "}
            <time dateTime={snapshot.last_updated}>
              {new Date(snapshot.last_updated).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          </p>
        )}
      </div>
    </section>
  );
}
