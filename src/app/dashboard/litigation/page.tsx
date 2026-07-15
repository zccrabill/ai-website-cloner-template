"use client";

/**
 * /dashboard/litigation — attorney-only litigation console.
 *
 * Same single-route SPA pattern as /dashboard/clients (static export, list +
 * detail panel). Matters on the left; the selected matter opens a panel with
 * Deadlines / Drafts / Compliance / Details tabs.
 *
 * Design constraints (these are load-bearing, not decoration):
 *  - Every rule-computed deadline is a SUGGESTION until attorney_confirmed —
 *    the UI labels unconfirmed dates loudly and the daily notice email repeats
 *    the flag (Colo. RPC 1.1/1.3).
 *  - AI-assisted drafts cannot reach final/filed without a recorded attorney
 *    review; the DB trigger enforces it, the UI explains it (RPC 5.1/5.3).
 *  - Each matter carries an auto-seeded ethics/AI compliance checklist,
 *    including the judge-standing-order check (D. Colo. judges differ).
 *
 * Data: direct supabase.from() — all litigation_* tables are admin-only RLS.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import DashboardShell from "@/components/DashboardShell";
import {
  DEADLINE_RULES,
  JURISDICTION_LABELS,
  computeDeadline,
  type DeadlineRule,
  type Jurisdiction,
  type ServiceMethod,
} from "@/lib/litigation/deadlines";
import {
  Scale,
  Plus,
  X,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCircle2,
  Circle,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Loader2,
  Copy,
  Gavel,
  ClipboardList,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Types (mirror the litigation_* tables)
// ---------------------------------------------------------------------------

type MatterStatus = "prospective" | "active" | "stayed" | "settled" | "closed";

interface Matter {
  id: string;
  caption: string;
  client_name: string;
  case_number: string | null;
  court: string | null;
  jurisdiction: Jurisdiction;
  judge: string | null;
  division: string | null;
  matter_type: string | null;
  side: "plaintiff" | "defendant" | "other" | null;
  status: MatterStatus;
  adverse_party: string | null;
  opposing_counsel: string | null;
  trial_date: string | null;
  ai_disclosure_required: boolean;
  ai_disclosure_notes: string | null;
  notes: string | null;
}

interface Deadline {
  id: string;
  matter_id: string;
  title: string;
  rule_ref: string | null;
  basis: string | null;
  trigger_event: string | null;
  trigger_date: string | null;
  due_date: string;
  computed: boolean;
  attorney_confirmed: boolean;
  status: "pending" | "done" | "vacated";
  notes: string | null;
}

type DraftStatus =
  | "requested"
  | "in_progress"
  | "ai_draft"
  | "attorney_review"
  | "revisions"
  | "final"
  | "filed"
  | "abandoned";

interface Draft {
  id: string;
  matter_id: string;
  title: string;
  doc_type: string;
  status: DraftStatus;
  deadline_id: string | null;
  ai_assisted: boolean;
  attorney_reviewed_at: string | null;
  review_notes: string | null;
}

interface ComplianceItem {
  id: string;
  matter_id: string;
  category: string;
  item: string;
  detail: string | null;
  status: "open" | "satisfied" | "na";
}

const MATTER_STATUS_STYLE: Record<MatterStatus, string> = {
  prospective: "bg-[#A89279]/15 text-[#8A7460]",
  active: "bg-[#7A8B6F]/15 text-[#5F7052]",
  stayed: "bg-[#C17832]/15 text-[#A05F1F]",
  settled: "bg-[#6B5B4E]/15 text-[#6B5B4E]",
  closed: "bg-[#1F1810]/10 text-[#6B5B4E]",
};

const DRAFT_STATUSES: { value: DraftStatus; label: string }[] = [
  { value: "requested", label: "Requested" },
  { value: "in_progress", label: "In progress" },
  { value: "ai_draft", label: "AI draft ready" },
  { value: "attorney_review", label: "Attorney review" },
  { value: "revisions", label: "Revisions" },
  { value: "final", label: "Final" },
  { value: "filed", label: "Filed" },
  { value: "abandoned", label: "Abandoned" },
];

const CALENDAR_FN_URL =
  "https://ndxejojdxzzcjrnkscos.supabase.co/functions/v1/litigation-calendar";

// ---------------------------------------------------------------------------

export default function LitigationPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [matters, setMatters] = useState<Matter[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [compliance, setCompliance] = useState<ComplianceItem[]>([]);
  const [icsToken, setIcsToken] = useState<string | null>(null);
  const [tab, setTab] = useState<"deadlines" | "drafts" | "compliance" | "details">("deadlines");
  const [showNewMatter, setShowNewMatter] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selected = useMemo(
    () => matters.find((m) => m.id === selectedId) ?? null,
    [matters, selectedId]
  );

  // --- auth gate + initial load ------------------------------------------
  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return router.push("/login");
      const { data: member } = await supabase
        .from("members")
        .select("role")
        .eq("user_id", session.user.id)
        .maybeSingle();
      if (member?.role !== "admin" && member?.role !== "attorney") {
        return router.push("/dashboard");
      }
      setReady(true);
    };
    init();
  }, [router]);

  const loadMatters = useCallback(async () => {
    const { data, error: err } = await supabase
      .from("litigation_matters")
      .select("*")
      .order("created_at", { ascending: false });
    if (err) setError(err.message);
    else setMatters((data ?? []) as Matter[]);
  }, []);

  const loadDetail = useCallback(async (matterId: string) => {
    const [d, dr, c] = await Promise.all([
      supabase
        .from("litigation_deadlines")
        .select("*")
        .eq("matter_id", matterId)
        .order("due_date"),
      supabase
        .from("litigation_drafts")
        .select("*")
        .eq("matter_id", matterId)
        .order("created_at", { ascending: false }),
      supabase
        .from("litigation_compliance_items")
        .select("*")
        .eq("matter_id", matterId)
        .order("created_at"),
    ]);
    setDeadlines((d.data ?? []) as Deadline[]);
    setDrafts((dr.data ?? []) as Draft[]);
    setCompliance((c.data ?? []) as ComplianceItem[]);
  }, []);

  useEffect(() => {
    if (!ready) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetchers; setState fires post-await
    loadMatters();
    supabase
      .from("litigation_settings")
      .select("ics_token")
      .eq("id", true)
      .maybeSingle()
      .then(({ data }) => setIcsToken(data?.ics_token ?? null));
  }, [ready, loadMatters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async fetcher; setState fires post-await
    if (selectedId) loadDetail(selectedId);
  }, [selectedId, loadDetail]);

  const icsUrl = icsToken ? `${CALENDAR_FN_URL}?token=${icsToken}` : null;

  const copyIcsUrl = async () => {
    if (!icsUrl) return;
    await navigator.clipboard.writeText(icsUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!ready) {
    return (
      <DashboardShell title="Litigation Matters">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 animate-spin text-[#C17832]" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Litigation Matters">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-[#1F1810] flex items-center gap-2">
            <Scale className="w-5 h-5 text-[#C17832]" /> Litigation Matters
          </h2>
          <p className="text-sm text-[#6B5B4E] mt-1">
            Available Law · deadline calendaring, drafting queue, and
            ethics/AI compliance per matter.
          </p>
        </div>
        <button
          onClick={() => setShowNewMatter(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#C17832] text-white rounded-lg text-sm font-medium hover:bg-[#A05F1F] transition-colors"
        >
          <Plus className="w-4 h-4" /> New Matter
        </button>
      </div>

      {/* Calendar feed card */}
      <div className="bg-white border border-[#1F1810]/8 rounded-xl p-4 mb-6 flex flex-wrap items-center gap-3">
        <CalendarPlus className="w-5 h-5 text-[#7A8B6F] shrink-0" />
        <div className="flex-1 min-w-[240px]">
          <p className="text-sm font-medium text-[#1F1810]">
            Live calendar feed — subscribe once, every deadline lands on your
            calendar automatically
          </p>
          <p className="text-xs text-[#6B5B4E] mt-0.5">
            Outlook / Google / Apple Calendar → “Subscribe from web / URL” →
            paste this address. Includes T-30 / T-14 / T-7 heads-up events.
          </p>
        </div>
        <button
          onClick={copyIcsUrl}
          disabled={!icsUrl}
          className="flex items-center gap-2 px-3 py-2 border border-[#1F1810]/10 rounded-lg text-xs font-medium text-[#6B5B4E] hover:bg-[#F5F0EB] transition-colors disabled:opacity-50"
        >
          {copied ? <Check className="w-4 h-4 text-[#7A8B6F]" /> : <Copy className="w-4 h-4" />}
          {copied ? "Copied" : "Copy feed URL"}
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6 items-start">
        {/* Matter list */}
        <div className="space-y-3">
          {matters.length === 0 && (
            <div className="bg-white border border-dashed border-[#1F1810]/15 rounded-xl p-8 text-center">
              <Gavel className="w-8 h-8 text-[#A89279] mx-auto mb-3" />
              <p className="text-sm text-[#6B5B4E]">
                No litigation matters yet. Create the first one to start
                calendaring.
              </p>
            </div>
          )}
          {matters.map((m) => (
            <button
              key={m.id}
              onClick={() => {
                setSelectedId(m.id);
                setTab("deadlines");
              }}
              className={`w-full text-left bg-white border rounded-xl p-4 transition-all ${
                selectedId === m.id
                  ? "border-[#C17832]/40 ring-1 ring-[#C17832]/20"
                  : "border-[#1F1810]/8 hover:border-[#C17832]/25"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold text-[#1F1810]">{m.caption}</p>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${MATTER_STATUS_STYLE[m.status]}`}
                >
                  {m.status}
                </span>
              </div>
              <p className="text-xs text-[#6B5B4E] mt-1">
                {m.client_name} · {JURISDICTION_LABELS[m.jurisdiction]}
              </p>
              {m.case_number && (
                <p className="text-xs text-[#A89279] mt-0.5">{m.case_number}</p>
              )}
            </button>
          ))}
        </div>

        {/* Detail panel */}
        {selected ? (
          <div className="bg-white border border-[#1F1810]/8 rounded-xl">
            <div className="p-5 border-b border-[#1F1810]/8">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-[#1F1810]">
                    {selected.caption}
                  </h3>
                  <p className="text-sm text-[#6B5B4E] mt-0.5">
                    {selected.client_name}
                    {selected.side ? ` (${selected.side})` : ""} ·{" "}
                    {selected.court || JURISDICTION_LABELS[selected.jurisdiction]}
                    {selected.judge ? ` · ${selected.judge}` : ""}
                  </p>
                </div>
                {selected.ai_disclosure_required && (
                  <span className="flex items-center gap-1 px-2 py-1 bg-[#C17832]/10 text-[#A05F1F] rounded-full text-[10px] font-semibold uppercase tracking-wide">
                    <AlertTriangle className="w-3 h-3" /> AI disclosure required
                  </span>
                )}
              </div>
              <div className="flex gap-1 mt-4">
                {(
                  [
                    ["deadlines", "Deadlines", CalendarDays],
                    ["drafts", "Drafts", FileText],
                    ["compliance", "Compliance", ShieldCheck],
                    ["details", "Details", ClipboardList],
                  ] as const
                ).map(([key, label, Icon]) => (
                  <button
                    key={key}
                    onClick={() => setTab(key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      tab === key
                        ? "bg-[#C17832]/10 text-[#C17832]"
                        : "text-[#6B5B4E] hover:bg-[#F5F0EB]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-5">
              {tab === "deadlines" && (
                <DeadlinesTab
                  matter={selected}
                  deadlines={deadlines}
                  onChanged={() => loadDetail(selected.id)}
                />
              )}
              {tab === "drafts" && (
                <DraftsTab
                  matter={selected}
                  drafts={drafts}
                  deadlines={deadlines}
                  onChanged={() => loadDetail(selected.id)}
                />
              )}
              {tab === "compliance" && (
                <ComplianceTab
                  matter={selected}
                  items={compliance}
                  onChanged={() => {
                    loadDetail(selected.id);
                    loadMatters();
                  }}
                />
              )}
              {tab === "details" && <DetailsTab matter={selected} />}
            </div>
          </div>
        ) : (
          <div className="bg-white border border-dashed border-[#1F1810]/15 rounded-xl p-12 text-center">
            <Scale className="w-8 h-8 text-[#A89279] mx-auto mb-3" />
            <p className="text-sm text-[#6B5B4E]">
              Select a matter to manage its deadlines, drafts, and compliance
              checklist.
            </p>
          </div>
        )}
      </div>

      {showNewMatter && (
        <NewMatterModal
          onClose={() => setShowNewMatter(false)}
          onCreated={(id) => {
            setShowNewMatter(false);
            loadMatters().then(() => setSelectedId(id));
          }}
        />
      )}
    </DashboardShell>
  );
}

// ---------------------------------------------------------------------------
// Deadlines tab
// ---------------------------------------------------------------------------

function DeadlinesTab({
  matter,
  deadlines,
  onChanged,
}: {
  matter: Matter;
  deadlines: Deadline[];
  onChanged: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [mode, setMode] = useState<"rule" | "custom">("rule");
  const [ruleId, setRuleId] = useState("");
  const [triggerDate, setTriggerDate] = useState("");
  const [serviceMethod, setServiceMethod] = useState<ServiceMethod>("efiling");
  const [customTitle, setCustomTitle] = useState("");
  const [customDue, setCustomDue] = useState("");
  const [saving, setSaving] = useState(false);

  const rules = useMemo(
    () => DEADLINE_RULES.filter((r) => r.jurisdiction === matter.jurisdiction),
    [matter.jurisdiction]
  );
  const rule: DeadlineRule | undefined = rules.find((r) => r.id === ruleId);

  // Trial-anchored rules default their trigger to the matter's trial date.
  const pickRule = (id: string) => {
    setRuleId(id);
    const r = rules.find((x) => x.id === id);
    if (r?.direction === "before" && matter.trial_date) {
      setTriggerDate(matter.trial_date);
    }
  };

  const preview =
    rule && triggerDate
      ? computeDeadline({ rule, triggerDate, serviceMethod })
      : null;

  const save = async () => {
    setSaving(true);
    const row =
      mode === "rule" && rule && preview
        ? {
            matter_id: matter.id,
            title: rule.name,
            rule_ref: rule.ruleRef,
            basis: preview.basis,
            trigger_event: rule.trigger,
            trigger_date: triggerDate,
            due_date: preview.dueDate,
            computed: true,
          }
        : {
            matter_id: matter.id,
            title: customTitle,
            basis: "Entered manually",
            due_date: customDue,
            computed: false,
          };
    const { error } = await supabase.from("litigation_deadlines").insert(row);
    setSaving(false);
    if (!error) {
      setAdding(false);
      setRuleId("");
      setTriggerDate("");
      setCustomTitle("");
      setCustomDue("");
      onChanged();
    } else {
      alert(error.message);
    }
  };

  const update = async (id: string, patch: Partial<Deadline>) => {
    const { error } = await supabase
      .from("litigation_deadlines")
      .update(patch)
      .eq("id", id);
    if (error) alert(error.message);
    else onChanged();
  };

  const pending = deadlines.filter((d) => d.status === "pending");
  const resolved = deadlines.filter((d) => d.status !== "pending");
  const canSave =
    mode === "rule" ? Boolean(preview) : Boolean(customTitle && customDue);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-[#6B5B4E]">
          Computed dates are suggestions — confirm each against the current
          rule and any case-management order before relying on it.
        </p>
        <button
          onClick={() => setAdding(!adding)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C17832] text-white rounded-lg text-xs font-medium hover:bg-[#A05F1F] transition-colors shrink-0"
        >
          {adding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {adding ? "Cancel" : "Add deadline"}
        </button>
      </div>

      {adding && (
        <div className="border border-[#C17832]/25 bg-[#C17832]/[0.04] rounded-xl p-4 mb-5 space-y-3">
          <div className="flex gap-2">
            {(["rule", "custom"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  mode === m
                    ? "bg-[#C17832] text-white"
                    : "bg-white border border-[#1F1810]/10 text-[#6B5B4E]"
                }`}
              >
                {m === "rule" ? "From rule library" : "Custom"}
              </button>
            ))}
          </div>

          {mode === "rule" ? (
            <>
              <select
                value={ruleId}
                onChange={(e) => pickRule(e.target.value)}
                className="w-full px-3 py-2 border border-[#1F1810]/10 rounded-lg text-sm bg-white"
              >
                <option value="">
                  Select a rule ({JURISDICTION_LABELS[matter.jurisdiction]})…
                </option>
                {rules.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — {r.ruleRef}
                  </option>
                ))}
              </select>
              {rule && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="text-xs text-[#6B5B4E]">
                    Trigger: {rule.trigger}
                    <input
                      type="date"
                      value={triggerDate}
                      onChange={(e) => setTriggerDate(e.target.value)}
                      className="mt-1 w-full px-3 py-2 border border-[#1F1810]/10 rounded-lg text-sm bg-white"
                    />
                  </label>
                  {rule.serviceExtension && (
                    <label className="text-xs text-[#6B5B4E]">
                      Service method
                      <select
                        value={serviceMethod}
                        onChange={(e) =>
                          setServiceMethod(e.target.value as ServiceMethod)
                        }
                        className="mt-1 w-full px-3 py-2 border border-[#1F1810]/10 rounded-lg text-sm bg-white"
                      >
                        <option value="personal">Personal service</option>
                        <option value="efiling">E-filing / e-service</option>
                        <option value="mail">Mail (+3 days)</option>
                      </select>
                    </label>
                  )}
                </div>
              )}
              {rule?.note && (
                <p className="text-xs text-[#A05F1F] flex items-start gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  {rule.note}
                </p>
              )}
              {preview && (
                <div className="bg-white border border-[#7A8B6F]/30 rounded-lg p-3">
                  <p className="text-sm font-semibold text-[#1F1810]">
                    Computed due date: {preview.dueDate}
                  </p>
                  <p className="text-xs text-[#6B5B4E] mt-1">{preview.basis}</p>
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                placeholder="Deadline title"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="px-3 py-2 border border-[#1F1810]/10 rounded-lg text-sm bg-white"
              />
              <input
                type="date"
                value={customDue}
                onChange={(e) => setCustomDue(e.target.value)}
                className="px-3 py-2 border border-[#1F1810]/10 rounded-lg text-sm bg-white"
              />
            </div>
          )}

          <button
            onClick={save}
            disabled={!canSave || saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#7A8B6F] text-white rounded-lg text-sm font-medium hover:bg-[#5F7052] transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save deadline
          </button>
        </div>
      )}

      {pending.length === 0 && !adding && (
        <p className="text-sm text-[#A89279] py-6 text-center">
          No pending deadlines.
        </p>
      )}

      <div className="space-y-2">
        {pending.map((d) => (
          <div
            key={d.id}
            className="border border-[#1F1810]/8 rounded-lg p-3 flex items-start gap-3"
          >
            <CalendarDays className="w-4 h-4 text-[#C17832] mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#1F1810]">
                {d.title}
                {d.rule_ref && (
                  <span className="text-[#A89279] font-normal"> · {d.rule_ref}</span>
                )}
              </p>
              <p className="text-xs text-[#6B5B4E] mt-0.5">
                Due <strong>{d.due_date}</strong>
                {d.basis ? ` — ${d.basis}` : ""}
              </p>
              {!d.attorney_confirmed && (
                <p className="text-xs text-[#A05F1F] mt-1 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Unconfirmed — verify
                  against the rule, then confirm.
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              {!d.attorney_confirmed && (
                <button
                  onClick={() => update(d.id, { attorney_confirmed: true })}
                  className="px-2 py-1 text-[11px] font-medium bg-[#7A8B6F]/10 text-[#5F7052] rounded hover:bg-[#7A8B6F]/20"
                >
                  Confirm
                </button>
              )}
              <button
                onClick={() =>
                  update(d.id, { status: "done", completed_at: new Date().toISOString() } as Partial<Deadline> & {
                    completed_at: string;
                  })
                }
                className="px-2 py-1 text-[11px] font-medium bg-[#F5F0EB] text-[#6B5B4E] rounded hover:bg-[#EAE2D8]"
              >
                Done
              </button>
              <button
                onClick={() => update(d.id, { status: "vacated" })}
                className="px-2 py-1 text-[11px] font-medium text-[#A89279] rounded hover:bg-[#F5F0EB]"
              >
                Vacate
              </button>
            </div>
          </div>
        ))}
      </div>

      {resolved.length > 0 && (
        <details className="mt-4">
          <summary className="text-xs text-[#A89279] cursor-pointer">
            {resolved.length} completed / vacated
          </summary>
          <div className="mt-2 space-y-1">
            {resolved.map((d) => (
              <p key={d.id} className="text-xs text-[#A89279] line-through">
                {d.title} — {d.due_date} ({d.status})
              </p>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Drafts tab
// ---------------------------------------------------------------------------

/**
 * Sample AI-use certification per the verified D. Colo. standing orders
 * (Wang 12/2025 — every filing; Crews 1/2026 — substantive motions; Prose
 * 10/2024). Two-prong form: no-AI, or AI-with-human-verification. SAMPLE
 * LANGUAGE ONLY — always conform it to the assigned judge's current order
 * before filing.
 */
function aiCertificationText(matter: Matter, d: Draft): string {
  const judge = matter.judge?.trim() || "[ASSIGNED JUDGE]";
  const header =
    "CERTIFICATION REGARDING THE USE OF GENERATIVE ARTIFICIAL INTELLIGENCE\n\n";
  if (d.ai_assisted) {
    return (
      header +
      `Pursuant to the standing order of ${judge} regarding the use of generative artificial intelligence in court filings, the undersigned certifies that portions of this document were drafted with the assistance of a generative artificial intelligence tool. The undersigned personally reviewed the entire document for accuracy, and every citation to legal authority contained herein has been verified against the official source as citing an actual, existing case, statute, rule, or other authority, and not fictitious authority. The undersigned assumes full responsibility for the contents of this filing.`
    );
  }
  return (
    header +
    `Pursuant to the standing order of ${judge} regarding the use of generative artificial intelligence in court filings, the undersigned certifies that no portion of this document was drafted by generative artificial intelligence.`
  );
}

function DraftsTab({
  matter,
  drafts,
  deadlines,
  onChanged,
}: {
  matter: Matter;
  drafts: Draft[];
  deadlines: Deadline[];
  onChanged: () => void;
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("motion");
  const [deadlineId, setDeadlineId] = useState("");
  const [saving, setSaving] = useState(false);

  const add = async () => {
    setSaving(true);
    const { error } = await supabase.from("litigation_drafts").insert({
      matter_id: matter.id,
      title,
      doc_type: docType,
      deadline_id: deadlineId || null,
    });
    setSaving(false);
    if (error) alert(error.message);
    else {
      setAdding(false);
      setTitle("");
      setDeadlineId("");
      onChanged();
    }
  };

  const setStatus = async (d: Draft, status: DraftStatus) => {
    const { error } = await supabase
      .from("litigation_drafts")
      .update({ status })
      .eq("id", d.id);
    if (error) {
      // The DB review gate fires here for AI drafts w/o recorded review.
      alert(error.message);
    } else onChanged();
  };

  const markReviewed = async (d: Draft) => {
    const notes = window.prompt(
      "Attorney review notes (what you verified — citations pulled & read, facts checked):"
    );
    if (notes === null) return;
    const { error } = await supabase
      .from("litigation_drafts")
      .update({
        attorney_reviewed_at: new Date().toISOString(),
        review_notes: notes || null,
        status: "final",
      })
      .eq("id", d.id);
    if (error) alert(error.message);
    else onChanged();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-[#6B5B4E]">
          AI-assisted drafts are blocked from “Final”/“Filed” until an attorney
          review is recorded — the database enforces it (Colo. RPC 5.1–5.3).
        </p>
        <button
          onClick={() => setAdding(!adding)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C17832] text-white rounded-lg text-xs font-medium hover:bg-[#A05F1F] transition-colors shrink-0"
        >
          {adding ? <X className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
          {adding ? "Cancel" : "New draft"}
        </button>
      </div>

      {adding && (
        <div className="border border-[#C17832]/25 bg-[#C17832]/[0.04] rounded-xl p-4 mb-5 space-y-3">
          <input
            placeholder="Document title (e.g. Response to Motion to Dismiss)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-[#1F1810]/10 rounded-lg text-sm bg-white"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="px-3 py-2 border border-[#1F1810]/10 rounded-lg text-sm bg-white"
            >
              {["pleading", "motion", "response", "reply", "discovery", "correspondence", "other"].map(
                (t) => (
                  <option key={t} value={t}>
                    {t[0].toUpperCase() + t.slice(1)}
                  </option>
                )
              )}
            </select>
            <select
              value={deadlineId}
              onChange={(e) => setDeadlineId(e.target.value)}
              className="px-3 py-2 border border-[#1F1810]/10 rounded-lg text-sm bg-white"
            >
              <option value="">Link to deadline (optional)</option>
              {deadlines
                .filter((d) => d.status === "pending")
                .map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} — {d.due_date}
                  </option>
                ))}
            </select>
          </div>
          <button
            onClick={add}
            disabled={!title || saving}
            className="flex items-center gap-2 px-4 py-2 bg-[#7A8B6F] text-white rounded-lg text-sm font-medium hover:bg-[#5F7052] transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Create draft record
          </button>
        </div>
      )}

      {drafts.length === 0 && !adding && (
        <p className="text-sm text-[#A89279] py-6 text-center">
          No drafts yet. Track every pleading and motion here from request to
          filing.
        </p>
      )}

      <div className="space-y-2">
        {drafts.map((d) => (
          <div key={d.id} className="border border-[#1F1810]/8 rounded-lg p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[#1F1810]">{d.title}</p>
                <p className="text-xs text-[#6B5B4E] mt-0.5 capitalize">
                  {d.doc_type}
                  {d.ai_assisted ? " · AI-assisted" : ""}
                  {d.attorney_reviewed_at
                    ? ` · reviewed ${d.attorney_reviewed_at.slice(0, 10)}`
                    : ""}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => {
                    void navigator.clipboard
                      .writeText(aiCertificationText(matter, d))
                      .then(() =>
                        alert(
                          "AI certification copied (sample language — conform it to the assigned judge's current standing order before filing).\n\nD. Colo.: Wang requires it in EVERY filing; Crews in substantive motions/responses/replies; Prose per her 10/2024 order."
                        )
                      );
                  }}
                  title="Copy an AI-use certification block for this document"
                  className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[#6B5B4E] border border-[#1F1810]/10 rounded hover:border-[#C17832]/40 hover:text-[#C17832] transition-colors"
                >
                  <Copy className="w-3 h-3" />
                  AI cert
                </button>
                <select
                  value={d.status}
                  onChange={(e) => setStatus(d, e.target.value as DraftStatus)}
                  className="px-2 py-1 border border-[#1F1810]/10 rounded-lg text-xs bg-white"
                >
                  {DRAFT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {d.ai_assisted && !d.attorney_reviewed_at && (
              <div className="mt-2 flex items-center justify-between gap-2 bg-[#C17832]/[0.06] rounded-lg px-3 py-2">
                <p className="text-xs text-[#A05F1F] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  Attorney review required before this can be finalized.
                </p>
                <button
                  onClick={() => markReviewed(d)}
                  className="px-2 py-1 text-[11px] font-medium bg-[#7A8B6F]/10 text-[#5F7052] rounded hover:bg-[#7A8B6F]/20 shrink-0"
                >
                  Record review → Final
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Compliance tab
// ---------------------------------------------------------------------------

const CATEGORY_LABELS: Record<string, string> = {
  ai_disclosure: "AI disclosure",
  ethics: "Ethics",
  confidentiality: "Confidentiality",
  insurance: "Insurance",
  court_order: "Court orders",
  other: "Other",
};

function ComplianceTab({
  matter,
  items,
  onChanged,
}: {
  matter: Matter;
  items: ComplianceItem[];
  onChanged: () => void;
}) {
  const setStatus = async (item: ComplianceItem, status: ComplianceItem["status"]) => {
    const { error } = await supabase
      .from("litigation_compliance_items")
      .update({
        status,
        resolved_at: status === "open" ? null : new Date().toISOString(),
      })
      .eq("id", item.id);
    if (error) alert(error.message);
    else onChanged();
  };

  const toggleDisclosure = async () => {
    const { error } = await supabase
      .from("litigation_matters")
      .update({ ai_disclosure_required: !matter.ai_disclosure_required })
      .eq("id", matter.id);
    if (error) alert(error.message);
    else onChanged();
  };

  const open = items.filter((i) => i.status === "open");

  return (
    <div className="space-y-5">
      {/* Current-framework reference card */}
      <div className="bg-[#F5F0EB] rounded-xl p-4 text-xs text-[#6B5B4E] space-y-2">
        <p className="font-semibold text-[#1F1810] text-sm">
          Colorado AI compliance framework (as of July 2026)
        </p>
        <ul className="list-disc pl-4 space-y-1">
          <li>
            <strong>Colo. RPC amendments (eff. Jan. 8, 2026)</strong> — Scope
            ¶[20A] + Rule 1.1 cmts. [8]–[9]: technology use never diminishes
            professional obligations; AI output must be independently verified;
            duties under Rules 1.4, 1.5, 1.6, 3.3, 5.1–5.3, 7.1, 8.4(g) attach.
          </li>
          <li>
            <strong>Colorado AI Act:</strong> the original CAIA (SB 24-205)
            never took effect — repealed &amp; replaced by SB 26-189 (signed
            May 14, 2026), a narrower ADMT-disclosure law{" "}
            <strong>effective Jan. 1, 2027</strong>. Internal drafting/
            docketing use with attorney final judgment is unlikely to be
            covered; revisit before 2027.
          </li>
          <li>
            <strong>ABA Formal Op. 512</strong> — verification, confidentiality
            vetting, client communication, supervision, and honest billing for
            AI-assisted work (persuasive; cross-referenced by the Colorado
            comments).
          </li>
          <li>
            <strong>D. Colo. AI standing orders (verified 7/2026):</strong>{" "}
            Judge Wang — AI certification in <em>every filing</em> (eff.
            12/1/2025); Judge Crews — certification in every substantive
            motion, response &amp; reply (eff. 1/1/2026); Mag. Judge Prose —
            certification per her 10/2024 order (consent vs. referral scope);
            Mag. Judge Dominguez Braswell — guidance only, no certification.
            No district-wide rule and no Colorado state-court or 10th Cir.
            certification rule found — but always check the assigned judge&apos;s
            practice standards at assignment and reassignment.
          </li>
          <li>
            <strong>Colorado watch item:</strong> the Supreme Court&apos;s Legal
            Technology Advisory Committee is due to propose statewide AI
            guidance by Oct. 1, 2026 — recheck this card then.
          </li>
        </ul>
      </div>

      {/* AI disclosure toggle */}
      <div className="border border-[#1F1810]/8 rounded-xl p-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#1F1810]">
            This court requires AI disclosure / certification
          </p>
          <p className="text-xs text-[#6B5B4E] mt-0.5">
            When on, the matter shows an “AI disclosure required” badge and the
            reminder applies to every filing.
          </p>
        </div>
        <button
          onClick={toggleDisclosure}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            matter.ai_disclosure_required
              ? "bg-[#C17832] text-white"
              : "bg-[#F5F0EB] text-[#6B5B4E] hover:bg-[#EAE2D8]"
          }`}
        >
          {matter.ai_disclosure_required ? "Required" : "Not required"}
        </button>
      </div>

      {/* Checklist */}
      <div>
        <p className="text-xs font-semibold text-[#A89279] uppercase tracking-widest mb-2">
          Checklist — {open.length} open
        </p>
        <div className="space-y-2">
          {items.map((item) => (
            <div
              key={item.id}
              className={`border rounded-lg p-3 flex items-start gap-3 ${
                item.status === "open"
                  ? "border-[#1F1810]/8"
                  : "border-[#1F1810]/5 opacity-60"
              }`}
            >
              <button
                onClick={() =>
                  setStatus(item, item.status === "open" ? "satisfied" : "open")
                }
                className="mt-0.5 shrink-0"
                title={item.status === "open" ? "Mark satisfied" : "Reopen"}
              >
                {item.status === "satisfied" ? (
                  <CheckCircle2 className="w-4 h-4 text-[#7A8B6F]" />
                ) : (
                  <Circle className="w-4 h-4 text-[#A89279]" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-[#1F1810]">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[#A89279] mr-2">
                    {CATEGORY_LABELS[item.category] ?? item.category}
                  </span>
                  {item.item}
                </p>
                {item.detail && (
                  <p className="text-xs text-[#6B5B4E] mt-1">{item.detail}</p>
                )}
              </div>
              {item.status !== "na" && (
                <button
                  onClick={() => setStatus(item, "na")}
                  className="text-[10px] text-[#A89279] hover:text-[#6B5B4E] shrink-0"
                >
                  N/A
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Details tab
// ---------------------------------------------------------------------------

function DetailsTab({ matter }: { matter: Matter }) {
  const rows: [string, string | null][] = [
    ["Client", matter.client_name],
    ["Case number", matter.case_number],
    ["Court", matter.court],
    ["Jurisdiction", JURISDICTION_LABELS[matter.jurisdiction]],
    ["Judge", matter.judge],
    ["Division", matter.division],
    ["Matter type", matter.matter_type],
    ["Side", matter.side],
    ["Adverse party", matter.adverse_party],
    ["Opposing counsel", matter.opposing_counsel],
    ["Trial date", matter.trial_date],
    ["Notes", matter.notes],
  ];
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt className="text-[10px] font-semibold uppercase tracking-widest text-[#A89279]">
            {label}
          </dt>
          <dd className="text-sm text-[#1F1810] mt-0.5">{value || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

// ---------------------------------------------------------------------------
// New matter modal
// ---------------------------------------------------------------------------

function NewMatterModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [form, setForm] = useState({
    caption: "",
    client_name: "",
    case_number: "",
    court: "",
    jurisdiction: "co_state" as Jurisdiction,
    judge: "",
    matter_type: "",
    side: "" as "" | "plaintiff" | "defendant" | "other",
    status: "prospective" as MatterStatus,
    adverse_party: "",
    opposing_counsel: "",
    trial_date: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    setErr(null);
    const { data, error } = await supabase
      .from("litigation_matters")
      .insert({
        caption: form.caption,
        client_name: form.client_name,
        case_number: form.case_number || null,
        court: form.court || null,
        jurisdiction: form.jurisdiction,
        judge: form.judge || null,
        matter_type: form.matter_type || null,
        side: form.side || null,
        status: form.status,
        adverse_party: form.adverse_party || null,
        opposing_counsel: form.opposing_counsel || null,
        trial_date: form.trial_date || null,
      })
      .select("id")
      .single();
    setSaving(false);
    if (error) setErr(error.message);
    else onCreated(data.id);
  };

  const input =
    "w-full px-3 py-2 border border-[#1F1810]/10 rounded-lg text-sm bg-white focus:outline-none focus:border-[#C17832]/50";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 my-8">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-semibold text-[#1F1810]">
            New litigation matter
          </h3>
          <button onClick={onClose} className="p-1 hover:bg-[#F5F0EB] rounded-lg">
            <X className="w-5 h-5 text-[#6B5B4E]" />
          </button>
        </div>
        <div className="space-y-3">
          <input placeholder="Caption (Smith v. Jones) *" value={form.caption} onChange={set("caption")} className={input} />
          <input placeholder="Client name *" value={form.client_name} onChange={set("client_name")} className={input} />
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Case number" value={form.case_number} onChange={set("case_number")} className={input} />
            <select value={form.jurisdiction} onChange={set("jurisdiction")} className={input}>
              {(Object.keys(JURISDICTION_LABELS) as Jurisdiction[]).map((j) => (
                <option key={j} value={j}>
                  {JURISDICTION_LABELS[j]}
                </option>
              ))}
            </select>
            <input placeholder="Court (e.g. Denver District)" value={form.court} onChange={set("court")} className={input} />
            <input placeholder="Judge" value={form.judge} onChange={set("judge")} className={input} />
            <input placeholder="Matter type (contract, PI…)" value={form.matter_type} onChange={set("matter_type")} className={input} />
            <select value={form.side} onChange={set("side")} className={input}>
              <option value="">Our side…</option>
              <option value="plaintiff">Plaintiff</option>
              <option value="defendant">Defendant</option>
              <option value="other">Other</option>
            </select>
            <input placeholder="Adverse party" value={form.adverse_party} onChange={set("adverse_party")} className={input} />
            <input placeholder="Opposing counsel" value={form.opposing_counsel} onChange={set("opposing_counsel")} className={input} />
            <select value={form.status} onChange={set("status")} className={input}>
              {(["prospective", "active", "stayed", "settled", "closed"] as MatterStatus[]).map((s) => (
                <option key={s} value={s}>
                  {s[0].toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
            <label className="text-xs text-[#6B5B4E]">
              Trial date (if set)
              <input type="date" value={form.trial_date} onChange={set("trial_date")} className={input + " mt-1"} />
            </label>
          </div>
          {err && <p className="text-sm text-red-600">{err}</p>}
          <p className="text-xs text-[#A89279]">
            Creating a matter auto-seeds its ethics/AI compliance checklist —
            including the judge standing-order check.
          </p>
          <button
            onClick={save}
            disabled={!form.caption || !form.client_name || saving}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#C17832] text-white rounded-lg text-sm font-medium hover:bg-[#A05F1F] transition-colors disabled:opacity-50"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Create matter
          </button>
        </div>
      </div>
    </div>
  );
}
