/**
 * PracticeSnapshotSection — live aggregate view of active legal work.
 *
 * Hits the get-matters-stats Edge Function on mount and renders a
 * three-stat hero row (active clients / YTD matters / jurisdictions),
 * plus a practice-type breakdown and a practice-area tag cloud.
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

import { useEffect, useState } from "react";
import {
  Briefcase,
  MapPin,
  TrendingUp,
  Sparkles,
} from "lucide-react";

// ------------------------------------------------------------------------
// Types
// ------------------------------------------------------------------------

interface PracticeTypeBucket {
  type: string;
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
  practice_type_breakdown: PracticeTypeBucket[];
  last_updated: string;
}

// ------------------------------------------------------------------------
// Label maps — human-readable versions of the lowercase_snake_case
// values stored in Supabase. Anything not in the map falls through to
// the humanize() helper, so adding a new subtype in the DB doesn't
// break the UI — it just looks slightly less polished until we add a
// label override here.
// ------------------------------------------------------------------------

const TYPE_LABELS: Record<string, string> = {
  engagement: "New engagements",
  contract_drafting: "Contracts drafted",
  contract_review: "Contracts reviewed",
  advisory: "Advisory counsel",
  governance: "Board & governance",
  litigation_support: "Litigation support",
  entity_formation: "Entity formation",
  employment: "Employment matters",
  dispute_resolution: "Dispute resolution",
  other: "Other matters",
};

const SUBTYPE_LABELS: Record<string, string> = {
  new_client_intake: "New-client intake",
  liability_waiver: "Liability waivers",
  rental_agreement: "Rental agreements",
  psa_redline: "PSA redlines",
  client_correspondence: "Advisory correspondence",
  board_advisory: "Board advisory",
  llc_operating_agreement: "LLC operating agreements",
  nda: "NDAs",
  employment_agreement: "Employment agreements",
  offer_letter: "Offer letters",
  terms_of_service: "Terms of service",
  privacy_policy: "Privacy policies",
  sweepstakes_rules: "Sweepstakes rules",
  prenuptial_agreement: "Prenuptial agreements",
  postnuptial_agreement: "Postnuptial agreements",
  real_estate_financing: "Real estate financing",
  ai_compliance_memo: "AI compliance memos",
  demand_letter: "Demand letters",
  co_ownership_dissolution: "Co-ownership dissolution",
  commercial_lease: "Commercial leases",
};

function humanize(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
}

function typeLabel(key: string): string {
  return TYPE_LABELS[key] ?? humanize(key);
}

function subtypeLabel(key: string): string {
  return SUBTYPE_LABELS[key] ?? humanize(key);
}

// ------------------------------------------------------------------------
// useCountUp — small animation hook for the headline stat numbers.
// Eases a number from 0 → target over `duration` ms. Respects reduced
// motion via prefers-reduced-motion.
// ------------------------------------------------------------------------

function useCountUp(target: number, duration = 900): number {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (typeof window === "undefined") return;

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
  }, [target, duration]);

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
  const animated = useCountUp(loading ? 0 : value);

  return (
    <div className="flex flex-col items-center text-center p-8 bg-white rounded-xl border border-[#1F1810]/8 hover:border-[#C17832]/30 transition-colors">
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
  const states_count = snapshot?.states.length ?? 0;
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
            A live snapshot of the matters we&apos;re handling right now — no
            client names, no specifics, just the shape of the practice.
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
            icon={MapPin}
            value={states_count}
            label={states_count === 1 ? "Jurisdiction" : "Jurisdictions"}
            loading={loading}
          />
        </div>

        {/* Matter-type breakdown chips */}
        {snapshot && snapshot.practice_type_breakdown.length > 0 && (
          <div className="mb-10">
            <p className="text-[#A89279] text-xs tracking-widest uppercase mb-5 text-center">
              By matter type
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {snapshot.practice_type_breakdown.map((b) => (
                <div
                  key={b.type}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#1F1810]/8"
                >
                  <Briefcase className="w-3.5 h-3.5 text-[#A89279]" />
                  <span className="text-[#1F1810] font-medium text-sm">
                    {typeLabel(b.type)}
                  </span>
                  <span className="text-[#C17832] font-semibold text-sm tabular-nums">
                    {b.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Practice-area tag cloud */}
        {snapshot && snapshot.practice_areas.length > 0 && (
          <div>
            <p className="text-[#A89279] text-xs tracking-widest uppercase mb-5 text-center">
              Practice areas
            </p>
            <div className="flex flex-wrap justify-center gap-2 max-w-[900px] mx-auto">
              {snapshot.practice_areas.map((area) => (
                <span
                  key={area}
                  className="px-3 py-1 rounded-md bg-[#1F1810]/5 text-[#1F1810]/70 text-sm"
                >
                  {subtypeLabel(area)}
                </span>
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
