"use client";

/**
 * /dashboard/clients — admin-only CRM list view.
 *
 * Single-route SPA pattern (rather than separate /new and /[id] routes)
 * because:
 *   1. `output: "export"` in next.config.ts can't enumerate dynamic IDs at
 *      build time, so [id] routes require either generateStaticParams or
 *      query-driven state. Query-driven is simpler here.
 *   2. CRM detail views typically want the list to stay visible behind a
 *      side panel — that maps naturally to one route with two panels.
 *
 * Data path:
 *   - list_admin_clients() RPC returns the unified subscription + manual
 *     list with last_touch_at + days_since_touch computed server-side.
 *   - create_manual_client / update_manual_client / close_manual_client
 *     RPCs handle the writes (all SECURITY DEFINER + admin role check).
 *
 * Auth: DashboardShell handles the magic-link gate. This page additionally
 * sanity-checks role and redirects non-admins back to /dashboard.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardShell from "@/components/DashboardShell";
import {
  Users,
  Plus,
  X,
  Search,
  Mail,
  Phone,
  Building2,
  FileText,
  Calendar as CalendarIcon,
  AlertCircle,
  CheckCircle2,
  Archive,
  Loader2,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types — mirror the list_admin_clients() RPC return shape.
// ---------------------------------------------------------------------------

type ClientKind = "subscription" | "manual";
type FeeArrangement = "flat_fee" | "hourly" | "pro_bono" | "other";
type ClientStatus = "active" | "on_hold" | "closed";

interface ClientRow {
  id: string;
  kind: ClientKind;
  user_id: string | null;
  full_name: string | null;
  email: string;
  business_name: string | null;
  phone: string | null;
  role: string;
  subscription_tier: string | null;
  subscription_status: string | null;
  current_period_end: string | null;
  matter_description: string | null;
  fee_arrangement: FeeArrangement | null;
  client_status: ClientStatus | null;
  start_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  last_touch_at: string;
  days_since_touch: number;
}

type KindFilter = "all" | "subscription" | "manual";

// ---------------------------------------------------------------------------
// Aging signals — keeps the threshold logic in one place so the legend and
// the row dots stay in sync.
// ---------------------------------------------------------------------------

interface AgingStyle {
  dot: string;
  label: string;
  description: string;
}

function agingStyle(days: number, isClosed: boolean): AgingStyle {
  if (isClosed) {
    return {
      dot: "bg-[#A89279]",
      label: "Closed",
      description: "Engagement closed",
    };
  }
  if (days < 7) {
    return { dot: "bg-[#7A8B6F]", label: "Fresh", description: "Within last week" };
  }
  if (days < 14) {
    return { dot: "bg-[#D4A050]", label: "1–2 weeks", description: "7–13 days since last touch" };
  }
  if (days < 30) {
    return { dot: "bg-[#C17832]", label: "2–4 weeks", description: "14–29 days since last touch" };
  }
  return {
    dot: "bg-red-500 animate-pulse",
    label: "Stale (30+ days)",
    description: "Over 30 days since last touch — overdue",
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function ClientsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<ClientRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<KindFilter>("all");
  const [activePanel, setActivePanel] = useState<
    { mode: "create" } | { mode: "detail"; id: string } | null
  >(null);
  // Authorization sanity check — DashboardShell also runs this, but the
  // dashboard/clients route is admin-only and we want a hard redirect for
  // non-admins instead of just rendering an empty list.
  const [authChecked, setAuthChecked] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    const { data, error: rpcError } = await supabase.rpc("list_admin_clients");
    if (rpcError) {
      console.error("[clients] list error", rpcError);
      setError(rpcError.message);
    } else {
      setRows((data as ClientRow[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const check = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.push("/login");
        return;
      }
      const { data: member } = await supabase
        .from("members")
        .select("role")
        .eq("user_id", sessionData.session.user.id)
        .maybeSingle();

      if (cancelled) return;

      if (member?.role !== "admin" && member?.role !== "attorney") {
        router.push("/dashboard");
        return;
      }
      setAuthChecked(true);
      void load();
    };
    void check();
    return () => {
      cancelled = true;
    };
  }, [router, load]);

  // Filter + search happens client-side. The list is bounded by the firm's
  // total client count, which is small enough that a network round-trip per
  // keystroke would be wasteful.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (kindFilter !== "all" && r.kind !== kindFilter) return false;
      if (!q) return true;
      const haystack = [
        r.full_name,
        r.email,
        r.business_name,
        r.matter_description,
      ]
        .filter((s): s is string => !!s)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [rows, query, kindFilter]);

  const counts = useMemo(() => {
    let subscription = 0;
    let manualActive = 0;
    let stale = 0;
    for (const r of rows) {
      if (r.kind === "subscription") subscription += 1;
      else if (r.client_status !== "closed") manualActive += 1;
      if (
        r.days_since_touch >= 30 &&
        !(r.kind === "manual" && r.client_status === "closed")
      ) {
        stale += 1;
      }
    }
    return { subscription, manualActive, stale, total: rows.length };
  }, [rows]);

  const handleCreated = (row: ClientRow) => {
    setRows((prev) => [row, ...prev]);
    setActivePanel({ mode: "detail", id: row.id });
  };

  const handleUpdated = (row: ClientRow) => {
    setRows((prev) => prev.map((r) => (r.id === row.id ? { ...r, ...row } : r)));
  };

  if (!authChecked) {
    return (
      <DashboardShell title="Clients">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-[#C17832] animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  const activeRow =
    activePanel?.mode === "detail"
      ? rows.find((r) => r.id === activePanel.id) ?? null
      : null;

  return (
    <DashboardShell title="Clients">
      {/* Page header */}
      <div className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-3xl font-bold text-[#1F1810] mb-2">Clients</h2>
          <p className="text-[#6B5B4E]">
            Subscription members and project clients in one place.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setActivePanel({ mode: "create" })}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1F1810] text-white rounded-lg text-sm font-semibold hover:bg-[#C17832] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Client
        </button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatTile icon={Users} label="Total" value={counts.total} />
        <StatTile
          icon={CheckCircle2}
          label="Subscription members"
          value={counts.subscription}
        />
        <StatTile
          icon={FileText}
          label="Manual clients (active)"
          value={counts.manualActive}
        />
        <StatTile
          icon={AlertCircle}
          label="Stale (30d+)"
          value={counts.stale}
          highlight={counts.stale > 0}
        />
      </div>

      {/* Controls */}
      <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A89279]" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, business, matter…"
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-[#1F1810]/8 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20"
          />
        </div>
        <div className="inline-flex rounded-lg border border-[#1F1810]/10 bg-white p-1">
          {(
            [
              { key: "all" as const, label: "All" },
              { key: "subscription" as const, label: "Subscription" },
              { key: "manual" as const, label: "Manual" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setKindFilter(opt.key)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                kindFilter === opt.key
                  ? "bg-[#1F1810] text-white"
                  : "text-[#6B5B4E] hover:text-[#1F1810]"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {/* List */}
      <div className="bg-white border border-[#1F1810]/8 rounded-2xl overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_140px_1.2fr_160px_120px] gap-4 px-6 py-3 border-b border-[#1F1810]/8 text-[10px] font-semibold text-[#A89279] uppercase tracking-widest">
          <span>Client</span>
          <span>Kind</span>
          <span>Matter / Tier</span>
          <span>Last touch</span>
          <span className="text-right">Status</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-[#C17832] animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            onAdd={() => setActivePanel({ mode: "create" })}
            hasAnyRows={rows.length > 0}
          />
        ) : (
          <ul>
            {filtered.map((row) => (
              <ClientListRow
                key={row.id}
                row={row}
                active={activeRow?.id === row.id}
                onClick={() =>
                  setActivePanel({ mode: "detail", id: row.id })
                }
              />
            ))}
          </ul>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] text-[#6B5B4E]">
        <span className="font-semibold text-[#A89279] uppercase tracking-widest">
          Aging
        </span>
        <LegendDot color="bg-[#7A8B6F]" label="< 1 week" />
        <LegendDot color="bg-[#D4A050]" label="1–2 weeks" />
        <LegendDot color="bg-[#C17832]" label="2–4 weeks" />
        <LegendDot color="bg-red-500" label="30+ days · overdue" />
      </div>

      {/* Side panels */}
      {activePanel?.mode === "create" && (
        <SidePanel onClose={() => setActivePanel(null)} title="Add Client">
          <AddClientForm
            onCreated={(row) => handleCreated(row)}
            onCancel={() => setActivePanel(null)}
          />
        </SidePanel>
      )}

      {activeRow && (
        <SidePanel
          onClose={() => setActivePanel(null)}
          title="Client details"
        >
          <ClientDetail
            row={activeRow}
            onUpdated={handleUpdated}
            onClose={() => setActivePanel(null)}
          />
        </SidePanel>
      )}
    </DashboardShell>
  );
}

// ---------------------------------------------------------------------------
// Stat tile
// ---------------------------------------------------------------------------

function StatTile({
  icon: Icon,
  label,
  value,
  highlight,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-white border rounded-xl p-4 transition-colors ${
        highlight
          ? "border-red-300 bg-red-50/40"
          : "border-[#1F1810]/8"
      }`}
    >
      <div className="flex items-center gap-2 text-[11px] font-semibold text-[#A89279] uppercase tracking-widest mb-2">
        <Icon className="w-3.5 h-3.5" />
        {label}
      </div>
      <div
        className={`text-3xl font-bold ${
          highlight ? "text-red-600" : "text-[#1F1810]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// List row
// ---------------------------------------------------------------------------

function ClientListRow({
  row,
  active,
  onClick,
}: {
  row: ClientRow;
  active: boolean;
  onClick: () => void;
}) {
  const isClosed = row.kind === "manual" && row.client_status === "closed";
  const aging = agingStyle(row.days_since_touch, isClosed);
  const name = row.full_name || row.email;
  const matterOrTier =
    row.kind === "manual"
      ? row.matter_description || "—"
      : row.subscription_tier
      ? `${capitalize(row.subscription_tier)} · ${capitalize(
          row.subscription_status || ""
        )}`
      : "Explore (free)";

  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`group w-full text-left px-6 py-4 border-b border-[#1F1810]/8 last:border-b-0 transition-colors ${
          active ? "bg-[#F5F0EB]" : "hover:bg-[#FAF8F5]"
        }`}
      >
        {/* Desktop layout */}
        <div className="hidden md:grid grid-cols-[1fr_140px_1.2fr_160px_120px] gap-4 items-center">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-[#1F1810] truncate">
              {name}
            </div>
            <div className="text-xs text-[#6B5B4E] truncate">{row.email}</div>
            {row.business_name && (
              <div className="text-xs text-[#A89279] truncate">
                {row.business_name}
              </div>
            )}
          </div>
          <div>
            <KindBadge kind={row.kind} />
          </div>
          <div className="min-w-0 text-sm text-[#1F1810] truncate" title={matterOrTier}>
            {matterOrTier}
          </div>
          <div className="flex items-center gap-2 text-xs text-[#6B5B4E]">
            <span
              className={`w-2.5 h-2.5 rounded-full ${aging.dot}`}
              title={aging.description}
            />
            <span>{relativeDays(row.days_since_touch)}</span>
          </div>
          <div className="text-right">
            <StatusBadge row={row} />
          </div>
        </div>

        {/* Mobile layout */}
        <div className="md:hidden flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-2 h-2 rounded-full ${aging.dot}`}
                title={aging.description}
              />
              <span className="text-sm font-semibold text-[#1F1810] truncate">
                {name}
              </span>
            </div>
            <div className="text-xs text-[#6B5B4E] truncate">{row.email}</div>
            <div className="text-xs text-[#1F1810] mt-1 truncate">
              {matterOrTier}
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <KindBadge kind={row.kind} />
            <span className="text-[10px] text-[#A89279]">
              {relativeDays(row.days_since_touch)}
            </span>
          </div>
        </div>
      </button>
    </li>
  );
}

function KindBadge({ kind }: { kind: ClientKind }) {
  if (kind === "subscription") {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#C17832]/10 text-[#8a5022] text-[11px] font-semibold uppercase tracking-wider">
        <CheckCircle2 className="w-3 h-3" />
        Subscription
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#7A8B6F]/10 text-[#4d5a44] text-[11px] font-semibold uppercase tracking-wider">
      <FileText className="w-3 h-3" />
      Manual
    </span>
  );
}

function StatusBadge({ row }: { row: ClientRow }) {
  if (row.kind === "manual") {
    const status = row.client_status ?? "active";
    const styles: Record<string, string> = {
      active: "bg-[#7A8B6F]/10 text-[#4d5a44]",
      on_hold: "bg-[#D4A050]/15 text-[#8a5022]",
      closed: "bg-[#1F1810]/10 text-[#6B5B4E]",
    };
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
          styles[status] || styles.active
        }`}
      >
        {status.replace("_", " ")}
      </span>
    );
  }
  const status = row.subscription_status || "—";
  const styles: Record<string, string> = {
    active: "bg-[#7A8B6F]/10 text-[#4d5a44]",
    trialing: "bg-[#D4A050]/15 text-[#8a5022]",
    past_due: "bg-red-100 text-red-700",
    canceled: "bg-[#1F1810]/10 text-[#6B5B4E]",
    inactive: "bg-[#1F1810]/10 text-[#6B5B4E]",
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
        styles[status] || styles.inactive
      }`}
    >
      {status.replace("_", " ")}
    </span>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-2 h-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Empty state
// ---------------------------------------------------------------------------

function EmptyState({
  onAdd,
  hasAnyRows,
}: {
  onAdd: () => void;
  hasAnyRows: boolean;
}) {
  if (hasAnyRows) {
    return (
      <div className="px-6 py-16 text-center">
        <p className="text-sm text-[#6B5B4E]">
          No clients match the current search/filter.
        </p>
      </div>
    );
  }
  return (
    <div className="px-6 py-20 text-center">
      <Users className="w-10 h-10 text-[#A89279] mx-auto mb-3" />
      <h3 className="text-lg font-semibold text-[#1F1810] mb-2">
        No clients yet
      </h3>
      <p className="text-sm text-[#6B5B4E] mb-6 max-w-sm mx-auto">
        Subscription members show up here automatically once they onboard.
        Add manual clients for any non-subscription work you take on.
      </p>
      <button
        type="button"
        onClick={onAdd}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1F1810] text-white rounded-lg text-sm font-semibold hover:bg-[#C17832] transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add your first client
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Side panel chrome
// ---------------------------------------------------------------------------

function SidePanel({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  // Esc closes the panel — standard CRM expectation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-xl h-full bg-[#FAF8F5] shadow-2xl overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 px-6 py-4 bg-[#FAF8F5] border-b border-[#1F1810]/8 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1F1810]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-[#1F1810]/5 rounded-lg text-[#6B5B4E] hover:text-[#1F1810] transition-colors"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-1 p-6">{children}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Add client form
// ---------------------------------------------------------------------------

function AddClientForm({
  onCreated,
  onCancel,
}: {
  onCreated: (row: ClientRow) => void;
  onCancel: () => void;
}) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [matter, setMatter] = useState("");
  const [feeArrangement, setFeeArrangement] = useState<FeeArrangement | "">(
    ""
  );
  const [startDate, setStartDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("create_manual_client", {
        p_full_name: fullName,
        p_email: email,
        p_business_name: businessName || null,
        p_phone: phone || null,
        p_matter_description: matter || null,
        p_fee_arrangement: feeArrangement || null,
        p_start_date: startDate || null,
        p_notes: notes || null,
      });
      if (error) throw error;
      onCreated(data as ClientRow);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Could not save";
      setErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormField
        label="Full name"
        required
        value={fullName}
        onChange={setFullName}
        placeholder="Jane Doe"
      />
      <FormField
        label="Email"
        required
        type="email"
        value={email}
        onChange={setEmail}
        placeholder="jane@acme.com"
      />
      <FormField
        label="Business / Company"
        value={businessName}
        onChange={setBusinessName}
        placeholder="Acme Inc."
      />
      <FormField
        label="Phone"
        value={phone}
        onChange={setPhone}
        placeholder="(555) 555-5555"
      />
      <FormTextarea
        label="Matter description"
        value={matter}
        onChange={setMatter}
        placeholder="One or two sentences on what you're helping them with."
        rows={3}
      />
      <FormSelect
        label="Fee arrangement"
        value={feeArrangement}
        onChange={(v) => setFeeArrangement(v as FeeArrangement | "")}
        options={[
          { value: "", label: "— Choose —" },
          { value: "flat_fee", label: "Flat fee" },
          { value: "hourly", label: "Hourly" },
          { value: "pro_bono", label: "Pro bono" },
          { value: "other", label: "Other" },
        ]}
      />
      <FormField
        label="Start date"
        type="date"
        value={startDate}
        onChange={setStartDate}
      />
      <FormTextarea
        label="Notes"
        value={notes}
        onChange={setNotes}
        placeholder="Anything else worth keeping next to this matter."
        rows={3}
      />

      {err && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1F1810] text-white rounded-lg text-sm font-semibold hover:bg-[#C17832] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? "Saving…" : "Save client"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="py-2.5 px-5 border border-[#1F1810]/15 rounded-lg text-sm font-medium text-[#6B5B4E] hover:bg-white hover:text-[#1F1810] transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Detail / edit panel
// ---------------------------------------------------------------------------

function ClientDetail({
  row,
  onUpdated,
  onClose,
}: {
  row: ClientRow;
  onUpdated: (row: ClientRow) => void;
  onClose: () => void;
}) {
  if (row.kind === "subscription") {
    return <SubscriptionDetail row={row} onClose={onClose} />;
  }
  return <ManualDetail row={row} onUpdated={onUpdated} onClose={onClose} />;
}

function SubscriptionDetail({
  row,
  onClose,
}: {
  row: ClientRow;
  onClose: () => void;
}) {
  return (
    <div className="space-y-6">
      <Header row={row} />
      <Section title="Subscription">
        <KeyValue label="Tier" value={capitalize(row.subscription_tier || "explore")} />
        <KeyValue
          label="Status"
          value={capitalize((row.subscription_status || "—").replace("_", " "))}
        />
        <KeyValue
          label="Renews"
          value={
            row.current_period_end
              ? new Date(row.current_period_end).toLocaleDateString()
              : "—"
          }
        />
      </Section>
      <Section title="Contact">
        <KeyValue icon={Mail} label="Email" value={row.email} />
        <KeyValue icon={Building2} label="Business" value={row.business_name || "—"} />
      </Section>
      <Section title="Timeline">
        <KeyValue
          icon={CalendarIcon}
          label="Member since"
          value={new Date(row.created_at).toLocaleDateString()}
        />
        <KeyValue
          icon={CalendarIcon}
          label="Last touch"
          value={`${new Date(row.last_touch_at).toLocaleDateString()} · ${relativeDays(
            row.days_since_touch
          )}`}
        />
      </Section>
      <div className="pt-2 flex gap-3">
        <a
          href="/dashboard/review"
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1F1810] text-white rounded-lg text-sm font-semibold hover:bg-[#C17832] transition-colors"
        >
          Open Review Queue
        </a>
        <button
          type="button"
          onClick={onClose}
          className="py-2.5 px-5 border border-[#1F1810]/15 rounded-lg text-sm font-medium text-[#6B5B4E] hover:bg-white hover:text-[#1F1810] transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}

function ManualDetail({
  row,
  onUpdated,
  onClose,
}: {
  row: ClientRow;
  onUpdated: (row: ClientRow) => void;
  onClose: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(row.full_name || "");
  const [email, setEmail] = useState(row.email);
  const [businessName, setBusinessName] = useState(row.business_name || "");
  const [phone, setPhone] = useState(row.phone || "");
  const [matter, setMatter] = useState(row.matter_description || "");
  const [feeArrangement, setFeeArrangement] = useState<FeeArrangement | "">(
    row.fee_arrangement || ""
  );
  const [clientStatus, setClientStatus] = useState<ClientStatus>(
    row.client_status || "active"
  );
  const [startDate, setStartDate] = useState(row.start_date || "");
  const [notes, setNotes] = useState(row.notes || "");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const handleSave = async () => {
    setErr(null);
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("update_manual_client", {
        p_id: row.id,
        p_full_name: fullName,
        p_email: email,
        p_business_name: businessName,
        p_phone: phone,
        p_matter_description: matter,
        p_fee_arrangement: feeArrangement || null,
        p_client_status: clientStatus,
        p_start_date: startDate || null,
        p_notes: notes,
      });
      if (error) throw error;
      onUpdated(data as ClientRow);
      setEditing(false);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Could not save";
      setErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async () => {
    if (
      !window.confirm(
        "Close this client? They'll move to the bottom of the list. You can reopen later by changing status back to active."
      )
    ) {
      return;
    }
    setErr(null);
    setSubmitting(true);
    try {
      const { data, error } = await supabase.rpc("close_manual_client", {
        p_id: row.id,
      });
      if (error) throw error;
      onUpdated(data as ClientRow);
      onClose();
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Could not close";
      setErr(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!editing) {
    return (
      <div className="space-y-6">
        <Header row={row} />
        <Section title="Matter">
          <p className="text-sm text-[#1F1810] leading-relaxed">
            {row.matter_description || "No matter description yet."}
          </p>
        </Section>
        <Section title="Engagement">
          <KeyValue
            label="Fee arrangement"
            value={
              row.fee_arrangement
                ? capitalize(row.fee_arrangement.replace("_", " "))
                : "—"
            }
          />
          <KeyValue
            label="Status"
            value={capitalize((row.client_status || "active").replace("_", " "))}
          />
          <KeyValue
            label="Start date"
            value={row.start_date ? new Date(row.start_date).toLocaleDateString() : "—"}
          />
        </Section>
        <Section title="Contact">
          <KeyValue icon={Mail} label="Email" value={row.email} />
          <KeyValue icon={Phone} label="Phone" value={row.phone || "—"} />
          <KeyValue icon={Building2} label="Business" value={row.business_name || "—"} />
        </Section>
        <Section title="Notes">
          <p className="text-sm text-[#6B5B4E] leading-relaxed whitespace-pre-wrap">
            {row.notes || "—"}
          </p>
        </Section>
        <Section title="Timeline">
          <KeyValue
            icon={CalendarIcon}
            label="Added"
            value={new Date(row.created_at).toLocaleDateString()}
          />
          <KeyValue
            icon={CalendarIcon}
            label="Last touch"
            value={`${new Date(row.last_touch_at).toLocaleDateString()} · ${relativeDays(
              row.days_since_touch
            )}`}
          />
        </Section>

        {err && (
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {err}
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1F1810] text-white rounded-lg text-sm font-semibold hover:bg-[#C17832] transition-colors"
          >
            Edit
          </button>
          {row.client_status !== "closed" && (
            <button
              type="button"
              onClick={handleClose}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 py-2.5 px-5 border border-[#1F1810]/15 rounded-lg text-sm font-medium text-[#6B5B4E] hover:bg-white hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-60"
            >
              <Archive className="w-4 h-4" />
              Close
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Header row={row} />
      <FormField label="Full name" required value={fullName} onChange={setFullName} />
      <FormField label="Email" required type="email" value={email} onChange={setEmail} />
      <FormField label="Business / Company" value={businessName} onChange={setBusinessName} />
      <FormField label="Phone" value={phone} onChange={setPhone} />
      <FormTextarea
        label="Matter description"
        value={matter}
        onChange={setMatter}
        rows={3}
      />
      <FormSelect
        label="Fee arrangement"
        value={feeArrangement}
        onChange={(v) => setFeeArrangement(v as FeeArrangement | "")}
        options={[
          { value: "", label: "— Choose —" },
          { value: "flat_fee", label: "Flat fee" },
          { value: "hourly", label: "Hourly" },
          { value: "pro_bono", label: "Pro bono" },
          { value: "other", label: "Other" },
        ]}
      />
      <FormSelect
        label="Status"
        value={clientStatus}
        onChange={(v) => setClientStatus(v as ClientStatus)}
        options={[
          { value: "active", label: "Active" },
          { value: "on_hold", label: "On hold" },
          { value: "closed", label: "Closed" },
        ]}
      />
      <FormField
        label="Start date"
        type="date"
        value={startDate}
        onChange={setStartDate}
      />
      <FormTextarea label="Notes" value={notes} onChange={setNotes} rows={3} />

      {err && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {err}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={submitting}
          className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-[#1F1810] text-white rounded-lg text-sm font-semibold hover:bg-[#C17832] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          disabled={submitting}
          className="py-2.5 px-5 border border-[#1F1810]/15 rounded-lg text-sm font-medium text-[#6B5B4E] hover:bg-white hover:text-[#1F1810] transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

function Header({ row }: { row: ClientRow }) {
  const isClosed = row.kind === "manual" && row.client_status === "closed";
  const aging = agingStyle(row.days_since_touch, isClosed);
  return (
    <div className="pb-4 border-b border-[#1F1810]/8">
      <div className="flex items-center gap-2 mb-2">
        <span className={`w-2.5 h-2.5 rounded-full ${aging.dot}`} />
        <span className="text-[11px] font-semibold text-[#A89279] uppercase tracking-widest">
          {aging.label}
        </span>
        <KindBadge kind={row.kind} />
      </div>
      <h3 className="text-2xl font-bold text-[#1F1810]">
        {row.full_name || row.email}
      </h3>
      <p className="text-sm text-[#6B5B4E]">{row.email}</p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h4 className="text-[10px] font-semibold text-[#A89279] uppercase tracking-widest mb-2">
        {title}
      </h4>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function KeyValue({
  icon: Icon,
  label,
  value,
}: {
  icon?: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2 text-sm">
      {Icon && <Icon className="w-4 h-4 text-[#A89279] mt-0.5 flex-shrink-0" />}
      <span className="text-[#6B5B4E] w-32 flex-shrink-0">{label}</span>
      <span className="text-[#1F1810] break-words">{value}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form atoms
// ---------------------------------------------------------------------------

function FormField({
  label,
  required,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-[#6B5B4E] mb-1.5">
        {label}
        {required && <span className="text-[#C17832]"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-white border border-[#1F1810]/10 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20"
      />
    </label>
  );
}

function FormTextarea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-[#6B5B4E] mb-1.5">
        {label}
      </span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-3 py-2 bg-white border border-[#1F1810]/10 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20"
      />
    </label>
  );
}

function FormSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-[#6B5B4E] mb-1.5">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-[#1F1810]/10 rounded-lg text-sm text-[#1F1810] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function capitalize(s: string) {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function relativeDays(days: number) {
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  if (days < 365) return `${Math.floor(days / 30)}mo ago`;
  return `${Math.floor(days / 365)}y ago`;
}
