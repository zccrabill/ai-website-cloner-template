"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabase";
import { getTier } from "@/lib/tiers";
import {
  MessageSquare,
  ArrowDownToLine,
  ArrowUpFromLine,
  Ban,
  Loader2,
} from "lucide-react";

// Window of usage to summarize. ai_usage logs every Ava (allora-chat) call;
// this page is the admin-facing audit of that website traffic. (Dollar cost
// across ALL models lives in the Anthropic console, not here.)
const WINDOW_DAYS = 30;

interface UsageRow {
  id: string;
  created_at: string;
  user_id: string | null;
  is_anonymous: boolean;
  tier: string | null;
  model: string | null;
  tokens_in: number;
  tokens_out: number;
  status: string;
}

interface Bucket {
  key: string;
  calls: number;
  tokensIn: number;
  tokensOut: number;
}

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

function shortModel(m: string | null): string {
  if (!m) return "—";
  if (m.includes("haiku")) return "Haiku";
  if (m.includes("sonnet")) return "Sonnet";
  if (m.includes("opus")) return "Opus";
  return m;
}

export default function UsagePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [rows, setRows] = useState<UsageRow[]>([]);
  const [emails, setEmails] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) {
          router.push("/login");
          return;
        }

        const { data: member } = await supabase
          .from("members")
          .select("role")
          .eq("user_id", session.user.id)
          .maybeSingle();
        const isAdmin =
          member?.role === "admin" || member?.role === "attorney";
        if (!isAdmin) {
          router.push("/dashboard");
          return;
        }
        setAuthorized(true);

        const since = new Date(
          Date.now() - WINDOW_DAYS * 24 * 60 * 60 * 1000,
        ).toISOString();
        const { data, error: qErr } = await supabase
          .from("ai_usage")
          .select(
            "id, created_at, user_id, is_anonymous, tier, model, tokens_in, tokens_out, status",
          )
          .gte("created_at", since)
          .order("created_at", { ascending: false })
          .limit(5000);
        if (qErr) throw qErr;
        const usage = (data ?? []) as UsageRow[];
        setRows(usage);

        // Map member emails for the per-user table (best-effort; falls back to
        // a short id if member rows aren't readable).
        const ids = Array.from(
          new Set(usage.map((r) => r.user_id).filter(Boolean)),
        ) as string[];
        if (ids.length) {
          const { data: mem } = await supabase
            .from("members")
            .select("user_id, email")
            .in("user_id", ids);
          const map: Record<string, string> = {};
          (mem ?? []).forEach((m: { user_id: string; email: string | null }) => {
            if (m.email) map[m.user_id] = m.email;
          });
          setEmails(map);
        }
      } catch (e) {
        console.error("usage load failed", e);
        setError(e instanceof Error ? e.message : "Failed to load usage");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [router]);

  const stats = useMemo(() => {
    const ok = rows.filter((r) => r.status === "ok");
    const blocked = rows.filter((r) => r.status.startsWith("blocked")).length;
    const errors = rows.filter((r) => r.status === "error").length;
    const tokensIn = ok.reduce((s, r) => s + (r.tokens_in ?? 0), 0);
    const tokensOut = ok.reduce((s, r) => s + (r.tokens_out ?? 0), 0);

    const bucketize = (keyFn: (r: UsageRow) => string): Bucket[] => {
      const m = new Map<string, Bucket>();
      for (const r of ok) {
        const key = keyFn(r);
        const b = m.get(key) ?? { key, calls: 0, tokensIn: 0, tokensOut: 0 };
        b.calls += 1;
        b.tokensIn += r.tokens_in ?? 0;
        b.tokensOut += r.tokens_out ?? 0;
        m.set(key, b);
      }
      return Array.from(m.values()).sort((a, b) => b.calls - a.calls);
    };

    const byTier = bucketize((r) => r.tier || "unknown");
    const byModel = bucketize((r) => shortModel(r.model));
    const byUser = bucketize((r) =>
      r.is_anonymous || !r.user_id ? "__anon__" : r.user_id,
    );

    return {
      calls: ok.length,
      blocked,
      errors,
      tokensIn,
      tokensOut,
      byTier,
      byModel,
      byUser,
    };
  }, [rows]);

  if (loading) {
    return (
      <DashboardShell title="AI Usage">
        <div className="flex items-center gap-3 text-[#6B5B4E]">
          <Loader2 className="w-5 h-5 animate-spin text-[#C17832]" />
          Loading usage…
        </div>
      </DashboardShell>
    );
  }

  if (!authorized) return null;

  return (
    <DashboardShell title="AI Usage">
      <div className="mb-6">
        <h2 className="text-2xl font-heading text-[#1F1810] mb-1">
          Ava usage — last {WINDOW_DAYS} days
        </h2>
        <p className="text-sm text-[#6B5B4E] max-w-[680px]">
          Every Ava chat call on the website, logged server-side. Members are
          keyed by account; visitors by hashed IP. For dollar cost across all
          models, see the{" "}
          <a
            href="https://platform.claude.com/usage"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#C17832] hover:underline"
          >
            Anthropic console
          </a>
          .
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon={MessageSquare} label="Ava replies" value={fmt(stats.calls)} />
        <StatCard icon={ArrowDownToLine} label="Tokens in" value={fmt(stats.tokensIn)} />
        <StatCard icon={ArrowUpFromLine} label="Tokens out" value={fmt(stats.tokensOut)} />
        <StatCard
          icon={Ban}
          label="Rate-limited"
          value={fmt(stats.blocked)}
          hint={stats.errors ? `${fmt(stats.errors)} errors` : undefined}
        />
      </div>

      {rows.length === 0 ? (
        <div className="rounded-xl border border-[#D9CCBC] bg-white p-8 text-center text-[#6B5B4E]">
          No Ava usage recorded in the last {WINDOW_DAYS} days yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BucketTable
            title="By plan"
            colLabel="Tier"
            buckets={stats.byTier}
            renderKey={(k) => (k === "anonymous" ? "Anonymous" : getTier(k).label)}
          />
          <BucketTable
            title="By model"
            colLabel="Model"
            buckets={stats.byModel}
            renderKey={(k) => k}
          />
          <div className="lg:col-span-2">
            <BucketTable
              title="Top users"
              colLabel="User"
              buckets={stats.byUser.slice(0, 15)}
              renderKey={(k) =>
                k === "__anon__"
                  ? "Anonymous visitors (by IP)"
                  : emails[k] || `${k.slice(0, 8)}…`
              }
            />
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: typeof MessageSquare;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-[#D9CCBC] bg-white p-5">
      <div className="flex items-center gap-2 text-[#A89279] mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-[11px] font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-3xl font-bold text-[#1F1810]">{value}</div>
      {hint && <div className="text-xs text-[#A89279] mt-1">{hint}</div>}
    </div>
  );
}

function BucketTable({
  title,
  colLabel,
  buckets,
  renderKey,
}: {
  title: string;
  colLabel: string;
  buckets: Bucket[];
  renderKey: (key: string) => string;
}) {
  return (
    <div className="rounded-xl border border-[#D9CCBC] bg-white overflow-hidden">
      <div className="px-5 py-3 border-b border-[#1F1810]/8">
        <h3 className="text-sm font-semibold text-[#1F1810]">{title}</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-wider text-[#A89279]">
            <th className="text-left font-semibold px-5 py-2">{colLabel}</th>
            <th className="text-right font-semibold px-5 py-2">Replies</th>
            <th className="text-right font-semibold px-5 py-2">Tokens in</th>
            <th className="text-right font-semibold px-5 py-2">Tokens out</th>
          </tr>
        </thead>
        <tbody>
          {buckets.map((b) => (
            <tr key={b.key} className="border-t border-[#1F1810]/5">
              <td className="px-5 py-2.5 text-[#1F1810]">{renderKey(b.key)}</td>
              <td className="px-5 py-2.5 text-right text-[#6B5B4E]">{fmt(b.calls)}</td>
              <td className="px-5 py-2.5 text-right text-[#6B5B4E]">{fmt(b.tokensIn)}</td>
              <td className="px-5 py-2.5 text-right text-[#6B5B4E]">{fmt(b.tokensOut)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
