"use client";

/**
 * AdminDashboard — admin/attorney landing view at /dashboard.
 *
 * Replaces the member-facing dashboard content when the signed-in user has
 * role='admin' or 'attorney' on their members row. Branching happens in
 * src/app/dashboard/page.tsx.
 *
 * Two sections:
 *   1. Stats row (4 cards) — pending reviews, new intakes, paying members,
 *      total members. Pulled from get_admin_dashboard_stats() RPC.
 *   2. Activity stream — last 20 events fused from members, documents,
 *      drafts, faiir_intakes, ai_act_assessments, assessment_responses.
 *      Pulled from get_admin_activity_stream() RPC.
 *
 * Both RPCs are SECURITY DEFINER with built-in role checks, so they bypass
 * RLS only after asserting caller is admin/attorney.
 */

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  FileText,
  Inbox,
  Users,
  UserCheck,
  Upload,
  Send,
  Clock,
  MessageSquare,
  Sparkles,
  Mail,
  ArrowRight,
  Loader2,
  Plus,
  Briefcase,
} from "lucide-react";

interface DashboardStats {
  pending_reviews: number;
  new_intakes: number;
  paying_members: number;
  total_members: number;
  manual_clients: number;
}

interface ActivityEvent {
  kind: string;
  occurred_at: string;
  label: string;
  sublabel: string | null;
  link: string | null;
}

const ACTIVITY_KIND_META: Record<
  string,
  { icon: typeof FileText; tint: string; chip: string }
> = {
  "member.onboarded": {
    icon: UserCheck,
    tint: "text-[#7A8B6F]",
    chip: "bg-[#7A8B6F]/10 text-[#7A8B6F]",
  },
  "document.uploaded": {
    icon: Upload,
    tint: "text-[#C17832]",
    chip: "bg-[#C17832]/10 text-[#C17832]",
  },
  "draft.sent": {
    icon: Send,
    tint: "text-[#7A8B6F]",
    chip: "bg-[#7A8B6F]/10 text-[#7A8B6F]",
  },
  "draft.pending": {
    icon: Clock,
    tint: "text-[#C17832]",
    chip: "bg-[#C17832]/10 text-[#C17832]",
  },
  "faiir.intake_received": {
    icon: Mail,
    tint: "text-[#C17832]",
    chip: "bg-[#C17832]/10 text-[#C17832]",
  },
  "ai_act.lead": {
    icon: Sparkles,
    tint: "text-[#A33B2A]",
    chip: "bg-[#A33B2A]/10 text-[#A33B2A]",
  },
  "assessment.lead": {
    icon: MessageSquare,
    tint: "text-[#6B5B4E]",
    chip: "bg-[#1F1810]/8 text-[#6B5B4E]",
  },
};

const KIND_LABELS: Record<string, string> = {
  "member.onboarded": "Signup",
  "document.uploaded": "Upload",
  "draft.sent": "Delivered",
  "draft.pending": "Review",
  "faiir.intake_received": "Intake",
  "ai_act.lead": "AI Act lead",
  "assessment.lead": "Assessment lead",
};

function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffSec = Math.round((now - then) / 1000);
  if (diffSec < 60) return "just now";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 86400 * 14) return `${Math.floor(diffSec / 86400)}d ago`;
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activity, setActivity] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const [statsRes, activityRes] = await Promise.all([
      supabase.rpc("get_admin_dashboard_stats"),
      supabase.rpc("get_admin_activity_stream", { p_limit: 20 }),
    ]);

    if (statsRes.error) {
      console.error("[admin] stats error", statsRes.error);
      setError(statsRes.error.message);
    } else if (statsRes.data) {
      setStats(statsRes.data as DashboardStats);
    }

    if (activityRes.error) {
      console.error("[admin] activity error", activityRes.error);
      if (!statsRes.error) setError(activityRes.error.message);
    } else if (activityRes.data) {
      setActivity(activityRes.data as ActivityEvent[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    // load() awaits Promise.all before any setState — all updates land in a
    // post-microtask callback, not synchronously in the effect body. Rule's
    // static analyzer can't see through async functions, so disable here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  return (
    <div>
      {/* Greeting + refresh */}
      <div className="mb-10 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold text-[#1F1810] mb-2">
            Practice overview
          </h2>
          <p className="text-[#6B5B4E]">
            Workload, recent activity, and client pulse.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void load();
            }}
            disabled={loading}
            className="text-sm font-medium text-[#6B5B4E] hover:text-[#1F1810] transition-colors disabled:opacity-50"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <Link
            href="/dashboard/clients"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F1810] text-white rounded-lg text-sm font-semibold hover:bg-[#C17832] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Client
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
        <StatCard
          icon={Clock}
          label="Pending reviews"
          value={stats?.pending_reviews}
          loading={loading}
          href="/dashboard/review"
          highlightWhen={(n) => n > 0}
        />
        <StatCard
          icon={Inbox}
          label="New intakes"
          value={stats?.new_intakes}
          loading={loading}
          href="/dashboard/review"
          highlightWhen={(n) => n > 0}
        />
        <StatCard
          icon={UserCheck}
          label="Paying members"
          value={stats?.paying_members}
          loading={loading}
          href="/dashboard/clients"
        />
        <StatCard
          icon={Users}
          label="Total members"
          value={stats?.total_members}
          loading={loading}
          href="/dashboard/clients"
        />
        <StatCard
          icon={Briefcase}
          label="Manual clients"
          value={stats?.manual_clients}
          loading={loading}
          href="/dashboard/clients"
        />
      </div>

      {/* Activity stream */}
      <div className="bg-white border border-[#1F1810]/8 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#1F1810]/8 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#1F1810]">
            Recent activity
          </h3>
          <span className="text-xs text-[#A89279] uppercase tracking-widest">
            Last 20 events
          </span>
        </div>

        {loading && activity.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[#A89279] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading activity…
          </div>
        ) : activity.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-[#A89279]">
            No activity yet. New signups, uploads, intakes, and lead captures
            will show up here.
          </div>
        ) : (
          <ul className="divide-y divide-[#1F1810]/5">
            {activity.map((ev, idx) => {
              const meta =
                ACTIVITY_KIND_META[ev.kind] ?? ACTIVITY_KIND_META["assessment.lead"];
              const Icon = meta.icon;
              const kindLabel = KIND_LABELS[ev.kind] ?? ev.kind;
              const inner = (
                <>
                  <div
                    className={`w-9 h-9 rounded-lg ${meta.chip} flex items-center justify-center flex-shrink-0`}
                  >
                    <Icon className={`w-4 h-4 ${meta.tint}`} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${meta.chip}`}
                      >
                        {kindLabel}
                      </span>
                      <span className="text-xs text-[#A89279]">
                        {relativeTime(ev.occurred_at)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-[#1F1810] truncate">
                      {ev.label}
                    </p>
                    {ev.sublabel && (
                      <p className="text-xs text-[#6B5B4E] truncate mt-0.5">
                        {ev.sublabel}
                      </p>
                    )}
                  </div>
                  {ev.link && (
                    <ArrowRight className="w-4 h-4 text-[#A89279] flex-shrink-0" />
                  )}
                </>
              );
              return (
                <li key={`${ev.kind}-${ev.occurred_at}-${idx}`}>
                  {ev.link ? (
                    <Link
                      href={ev.link}
                      className="flex items-center gap-3 px-6 py-3.5 hover:bg-[#FAF8F5] transition-colors"
                    >
                      {inner}
                    </Link>
                  ) : (
                    <div className="flex items-center gap-3 px-6 py-3.5">
                      {inner}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: typeof FileText;
  label: string;
  value: number | undefined;
  loading: boolean;
  href?: string;
  highlightWhen?: (n: number) => boolean;
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
  href,
  highlightWhen,
}: StatCardProps) {
  const display = loading || value === undefined ? "—" : value.toString();
  const highlighted =
    typeof value === "number" && highlightWhen?.(value) === true;

  const inner = (
    <>
      <div className="flex items-start justify-between mb-3">
        <Icon
          className={`w-5 h-5 ${
            highlighted ? "text-[#C17832]" : "text-[#A89279]"
          }`}
        />
        {highlighted && (
          <span className="w-2 h-2 bg-[#C17832] rounded-full" aria-hidden />
        )}
      </div>
      <p className="text-xs font-medium text-[#6B5B4E] mb-1">{label}</p>
      <p
        className={`text-3xl font-bold ${
          highlighted ? "text-[#C17832]" : "text-[#1F1810]"
        } ${loading && value === undefined ? "opacity-50" : ""}`}
      >
        {display}
      </p>
    </>
  );

  const baseCls = `bg-white border rounded-lg p-5 transition-all ${
    highlighted
      ? "border-[#C17832]/40 hover:border-[#C17832]"
      : "border-[#1F1810]/8 hover:border-[#1F1810]/12"
  }`;

  return href ? (
    <Link href={href} className={`${baseCls} block`}>
      {inner}
    </Link>
  ) : (
    <div className={baseCls}>{inner}</div>
  );
}
