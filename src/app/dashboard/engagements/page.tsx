"use client";

/**
 * /dashboard/engagements — admin-only console for running FAIIR engagements.
 *
 * List (admin_list_engagements RPC) + a management side panel per engagement.
 * Reads of phases/docs/notes/deliverables go straight through supabase.from()
 * (admin RLS lets the attorney see every engagement; SELECT grant is the same
 * one the client workspace already uses). Every WRITE goes through an
 * admin_* SECURITY DEFINER RPC so it's role-gated and audit-logged.
 *
 * This is the attorney side of the workspace the client sees at /dashboard.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { openEngagementFile } from "@/lib/download";
import DashboardShell from "@/components/DashboardShell";
import {
  Briefcase,
  Plus,
  X,
  Loader2,
  Circle,
  CircleDot,
  CheckCircle2,
  AlertCircle,
  Download,
  FileText,
  Send,
  Mail,
} from "lucide-react";

type EngagementStatus = "draft" | "invited" | "active" | "closed";
type PhaseStatus = "pending" | "in_progress" | "waiting_on_client" | "complete";
type DocState = "needed" | "received" | "reviewed";
type DeliverableStatus = "draft" | "released";

interface EngagementRow {
  id: string;
  org_id: string;
  org_name: string;
  title: string;
  status: EngagementStatus;
  fee_cents: number | null;
  contact_email: string | null;
  phases_total: number;
  phases_complete: number;
  docs_outstanding: number;
  docs_to_review: number;
  last_activity_at: string;
  created_at: string;
}

interface Phase {
  id: string;
  position: number;
  title: string;
  status: PhaseStatus;
}
interface DocCard {
  id: string;
  label: string;
  description: string | null;
  state: DocState;
  storage_path: string | null;
  uploaded_at: string | null;
}
interface Note {
  id: string;
  body: string;
  author: string;
  posted_at: string;
}
interface Deliverable {
  id: string;
  title: string;
  description: string | null;
  status: DeliverableStatus;
  released_at: string | null;
}
interface EngagementMember {
  email: string;
  role: string;
  status: string;
  joined: boolean;
  invited_at: string | null;
  accepted_at: string | null;
  last_sign_in_at: string | null;
}

const ENGAGEMENT_STATUSES: EngagementStatus[] = ["draft", "invited", "active", "closed"];
const PHASE_STATUSES: { value: PhaseStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In progress" },
  { value: "waiting_on_client", label: "Needs client" },
  { value: "complete", label: "Complete" },
];

function fee(cents: number | null) {
  return cents === null ? "—" : `$${(cents / 100).toLocaleString()}`;
}
function shortDate(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function dateTime(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function EngagementsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<EngagementRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    const { data, error: rpcError } = await supabase.rpc("admin_list_engagements");
    if (rpcError) {
      console.error("[engagements] list error", rpcError);
      setError(rpcError.message);
    } else {
      setRows((data as EngagementRow[]) ?? []);
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

  const activeRow = useMemo(
    () => rows.find((r) => r.id === activeId) ?? null,
    [rows, activeId]
  );

  if (!authChecked) {
    return (
      <DashboardShell title="Engagements">
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-[#C17832] animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Engagements">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[#1F1810] mb-2">FAIIR Engagements</h2>
        <p className="text-[#6B5B4E]">
          Drive each client engagement — phases, documents, notes, deliverables.
        </p>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white border border-[#1F1810]/8 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 text-[#C17832] animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <Briefcase className="w-10 h-10 text-[#A89279] mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-[#1F1810] mb-2">
              No engagements yet
            </h3>
            <p className="text-sm text-[#6B5B4E] max-w-sm mx-auto">
              New FAIIR engagements show up here once created.
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-[#1F1810]/8">
            {rows.map((r) => (
              <li key={r.id}>
                <button
                  type="button"
                  onClick={() => setActiveId(r.id)}
                  className="group w-full text-left px-6 py-4 hover:bg-[#FAF8F5] transition-colors flex items-center gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-semibold text-[#1F1810] truncate">
                        {r.org_name}
                      </span>
                      <EngagementStatusBadge status={r.status} />
                    </div>
                    <p className="text-xs text-[#6B5B4E] truncate">
                      {r.title} · {fee(r.fee_cents)} · {r.contact_email ?? "no contact"}
                    </p>
                    <p className="text-[10px] text-[#A89279]">
                      Last activity {shortDate(r.last_activity_at)}
                    </p>
                  </div>
                  <div className="hidden sm:flex items-center gap-5 flex-shrink-0 text-center">
                    <Metric value={`${r.phases_complete}/${r.phases_total}`} label="phases" />
                    <Metric value={r.docs_to_review} label="to review" highlight={r.docs_to_review > 0} />
                    <Metric value={r.docs_outstanding} label="awaiting" />
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {activeRow && (
        <ManagePanel
          row={activeRow}
          onClose={() => setActiveId(null)}
          onChanged={load}
        />
      )}
    </DashboardShell>
  );
}

function Metric({
  value,
  label,
  highlight,
}: {
  value: string | number;
  label: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className={`text-base font-bold ${highlight ? "text-[#C17832]" : "text-[#1F1810]"}`}>
        {value}
      </p>
      <p className="text-[10px] text-[#A89279] uppercase tracking-wider">{label}</p>
    </div>
  );
}

function EngagementStatusBadge({ status }: { status: EngagementStatus }) {
  const styles: Record<EngagementStatus, string> = {
    draft: "bg-[#1F1810]/8 text-[#6B5B4E]",
    invited: "bg-[#D4A050]/15 text-[#8a5022]",
    active: "bg-[#7A8B6F]/10 text-[#4d5a44]",
    closed: "bg-[#1F1810]/10 text-[#6B5B4E]",
  };
  return (
    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${styles[status]}`}>
      {status}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Manage panel
// ---------------------------------------------------------------------------

function ManagePanel({
  row,
  onClose,
  onChanged,
}: {
  row: EngagementRow;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [phases, setPhases] = useState<Phase[]>([]);
  const [docs, setDocs] = useState<DocCard[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [members, setMembers] = useState<EngagementMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [panelError, setPanelError] = useState<string | null>(null);

  const loadDetail = useCallback(async () => {
    const [p, d, n, dl, m] = await Promise.all([
      supabase.from("engagement_phases").select("id, position, title, status").eq("engagement_id", row.id).order("position"),
      supabase.from("engagement_documents").select("id, label, description, state, storage_path, uploaded_at").eq("engagement_id", row.id).order("position"),
      supabase.from("engagement_status_notes").select("id, body, author, posted_at").eq("engagement_id", row.id).order("posted_at", { ascending: false }),
      supabase.from("deliverables").select("id, title, description, status, released_at").eq("engagement_id", row.id).order("created_at", { ascending: false }),
      supabase.rpc("admin_list_engagement_members", { p_engagement_id: row.id }),
    ]);
    setPhases((p.data as Phase[]) ?? []);
    setDocs((d.data as DocCard[]) ?? []);
    setNotes((n.data as Note[]) ?? []);
    setDeliverables((dl.data as Deliverable[]) ?? []);
    setMembers((m.data as EngagementMember[]) ?? []);
    setLoading(false);
  }, [row.id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDetail();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loadDetail, onClose]);

  // Wrap any admin RPC: run it, refresh detail + the parent list, surface errors.
  // PromiseLike (not Promise) because supabase's query builder is thenable but
  // not a real Promise — await still resolves it.
  const run = useCallback(
    async (fn: () => PromiseLike<{ error: { message: string } | null }>) => {
      setBusy(true);
      setPanelError(null);
      try {
        const { error } = await fn();
        if (error) {
          setPanelError(error.message);
          return;
        }
        await loadDetail();
        onChanged();
      } finally {
        setBusy(false);
      }
    },
    [loadDetail, onChanged]
  );

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-2xl h-full bg-[#FAF8F5] shadow-2xl overflow-y-auto flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 px-6 py-4 bg-[#FAF8F5] border-b border-[#1F1810]/8 flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[#1F1810] truncate">{row.org_name}</h2>
            <p className="text-xs text-[#6B5B4E] truncate">{row.title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-[#1F1810]/5 rounded-lg text-[#6B5B4E] hover:text-[#1F1810] transition-colors"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 p-6 space-y-8">
          {panelError && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {panelError}
            </div>
          )}

          {/* Engagement status */}
          <Block title="Engagement status">
            <div className="flex items-center gap-3">
              <select
                value={row.status}
                disabled={busy}
                onChange={(e) =>
                  run(() =>
                    supabase.rpc("admin_set_engagement_status", {
                      p_engagement_id: row.id,
                      p_status: e.target.value,
                    })
                  )
                }
                className="px-3 py-2 bg-white border border-[#1F1810]/10 rounded-lg text-sm text-[#1F1810] focus:outline-none focus:border-[#C17832]/50"
              >
                {ENGAGEMENT_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              {row.contact_email && (
                <span className="inline-flex items-center gap-1.5 text-xs text-[#6B5B4E]">
                  <Mail className="w-3.5 h-3.5" />
                  {row.contact_email}
                </span>
              )}
            </div>
          </Block>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-[#C17832] animate-spin" />
            </div>
          ) : (
            <>
              {/* Client access — who holds a seat and whether they've logged in */}
              <Block title="Client access">
                <ul className="space-y-2">
                  {members.map((m) => (
                    <li
                      key={m.email}
                      className="flex items-center gap-3 bg-white border border-[#1F1810]/10 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-3"
                    >
                      {m.joined ? (
                        <CheckCircle2 className="w-4 h-4 text-[#7A8B6F] flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#A89279]/60 flex-shrink-0" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#1F1810] truncate">{m.email}</p>
                        <p className="text-[10px] text-[#A89279] capitalize">{m.role}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {m.joined ? (
                          <>
                            <p className="text-[10px] font-semibold text-[#7A8B6F] uppercase tracking-wider">Joined</p>
                            {m.last_sign_in_at && (
                              <p className="text-[10px] text-[#A89279]">last seen {dateTime(m.last_sign_in_at)}</p>
                            )}
                          </>
                        ) : (
                          <>
                            <p className="text-[10px] font-semibold text-amber-600 uppercase tracking-wider">Not joined yet</p>
                            <p className="text-[10px] text-[#A89279]">invited {shortDate(m.invited_at)}</p>
                          </>
                        )}
                      </div>
                    </li>
                  ))}
                  {members.length === 0 && (
                    <li className="text-xs text-[#A89279]">No seats on this engagement yet.</li>
                  )}
                </ul>
              </Block>

              {/* Phases */}
              <Block title="Phase tracker">
                <ul className="space-y-2">
                  {phases.map((ph) => (
                    <li key={ph.id} className="flex items-center gap-3">
                      <PhaseStatusIcon status={ph.status} />
                      <span className="text-sm text-[#1F1810] flex-1 min-w-0 truncate">
                        {ph.position}. {ph.title}
                      </span>
                      <select
                        value={ph.status}
                        disabled={busy}
                        onChange={(e) =>
                          run(() =>
                            supabase.rpc("admin_set_phase_status", {
                              p_phase_id: ph.id,
                              p_status: e.target.value,
                            })
                          )
                        }
                        className="px-2 py-1.5 bg-white border border-[#1F1810]/10 rounded-lg text-xs text-[#1F1810] focus:outline-none focus:border-[#C17832]/50"
                      >
                        {PHASE_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </li>
                  ))}
                </ul>
              </Block>

              {/* Documents */}
              <Block title="Document room">
                <ul className="space-y-2 mb-3">
                  {docs.map((d) => (
                    <DocRow key={d.id} doc={d} busy={busy} run={run} />
                  ))}
                  {docs.length === 0 && (
                    <li className="text-xs text-[#A89279]">No documents requested yet.</li>
                  )}
                </ul>
                <AddDocForm engagementId={row.id} busy={busy} run={run} />
              </Block>

              {/* Status notes */}
              <Block title="Status notes (client sees these)">
                <PostNoteForm engagementId={row.id} busy={busy} run={run} />
                <ul className="space-y-2 mt-3">
                  {notes.map((n) => (
                    <li key={n.id} className="bg-white border border-[#1F1810]/10 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-3">
                      <p className="text-sm text-[#1F1810] whitespace-pre-line">{n.body}</p>
                      <p className="text-[10px] text-[#A89279] mt-1">{n.author} · {shortDate(n.posted_at)}</p>
                    </li>
                  ))}
                  {notes.length === 0 && (
                    <li className="text-xs text-[#A89279]">No notes posted yet.</li>
                  )}
                </ul>
              </Block>

              {/* Deliverables */}
              <Block title="Deliverables">
                <ul className="space-y-2 mb-3">
                  {deliverables.map((dl) => (
                    <li key={dl.id} className="flex items-center gap-3 bg-white border border-[#1F1810]/10 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-3">
                      <FileText className="w-4 h-4 text-[#C17832] flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#1F1810] truncate">{dl.title}</p>
                        <p className="text-[10px] text-[#A89279]">
                          {dl.status === "released"
                            ? `Released ${shortDate(dl.released_at)} — client can see this`
                            : "Draft — hidden from client"}
                        </p>
                      </div>
                      {dl.status === "draft" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            run(() =>
                              supabase.rpc("admin_set_deliverable_released", { p_deliverable_id: dl.id })
                            )
                          }
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#C17832] text-white rounded-lg text-xs font-medium hover:bg-[#A8621F] transition-colors disabled:opacity-50"
                        >
                          <Send className="w-3 h-3" />
                          Release
                        </button>
                      )}
                    </li>
                  ))}
                  {deliverables.length === 0 && (
                    <li className="text-xs text-[#A89279]">No deliverables yet.</li>
                  )}
                </ul>
                <AddDeliverableForm engagementId={row.id} busy={busy} run={run} />
              </Block>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function PhaseStatusIcon({ status }: { status: PhaseStatus }) {
  if (status === "complete") return <CheckCircle2 className="w-4 h-4 text-[#7A8B6F] flex-shrink-0" />;
  if (status === "in_progress") return <CircleDot className="w-4 h-4 text-[#C17832] flex-shrink-0" />;
  if (status === "waiting_on_client") return <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />;
  return <Circle className="w-4 h-4 text-[#A89279]/50 flex-shrink-0" />;
}

type RunFn = (fn: () => PromiseLike<{ error: { message: string } | null }>) => Promise<void>;

function DocRow({ doc, busy, run }: { doc: DocCard; busy: boolean; run: RunFn }) {
  const [downloading, setDownloading] = useState(false);
  const badge: Record<DocState, string> = {
    needed: "bg-amber-500/10 text-amber-700",
    received: "bg-[#C17832]/10 text-[#C17832]",
    reviewed: "bg-[#7A8B6F]/10 text-[#7A8B6F]",
  };

  const download = async () => {
    if (!doc.storage_path) return;
    setDownloading(true);
    await openEngagementFile(doc.storage_path);
    setDownloading(false);
  };

  return (
    <li className="bg-white border border-[#1F1810]/10 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-[#1F1810] flex-1 min-w-0 truncate">{doc.label}</span>
        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${badge[doc.state]}`}>
          {doc.state}
        </span>
      </div>
      {(doc.state === "received" || doc.state === "reviewed") && doc.storage_path && (
        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            onClick={download}
            disabled={downloading}
            className="inline-flex items-center gap-1.5 text-xs text-[#6B5B4E] hover:text-[#1F1810] transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? "Opening…" : "Download"}
          </button>
          {doc.state === "received" && (
            <button
              type="button"
              disabled={busy}
              onClick={() =>
                run(() => supabase.rpc("admin_set_document_reviewed", { p_document_id: doc.id }))
              }
              className="inline-flex items-center gap-1.5 text-xs text-[#7A8B6F] hover:text-[#4d5a44] transition-colors disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark reviewed
            </button>
          )}
        </div>
      )}
    </li>
  );
}

function AddDocForm({ engagementId, busy, run }: { engagementId: string; busy: boolean; run: RunFn }) {
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  return (
    <div className="bg-white border border-dashed border-[#1F1810]/15 rounded-lg p-3 space-y-2">
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Request a document (e.g. Everlaw order form)"
        className="w-full px-3 py-2 bg-white border border-[#1F1810]/10 rounded-lg text-sm focus:outline-none focus:border-[#C17832]/50"
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Short note to the client (optional)"
        className="w-full px-3 py-2 bg-white border border-[#1F1810]/10 rounded-lg text-xs focus:outline-none focus:border-[#C17832]/50"
      />
      <button
        type="button"
        disabled={busy || !label.trim()}
        onClick={() =>
          run(() =>
            supabase.rpc("admin_add_document_request", {
              p_engagement_id: engagementId,
              p_label: label,
              p_description: description || null,
            })
          ).then(() => {
            setLabel("");
            setDescription("");
          })
        }
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1F1810] text-white rounded-lg text-xs font-medium hover:bg-[#C17832] transition-colors disabled:opacity-50"
      >
        <Plus className="w-3.5 h-3.5" />
        Request document
      </button>
    </div>
  );
}

function PostNoteForm({ engagementId, busy, run }: { engagementId: string; busy: boolean; run: RunFn }) {
  const [body, setBody] = useState("");
  return (
    <div className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={3}
        placeholder="Post a short note in your voice — the client sees this on their workspace."
        className="w-full px-3 py-2 bg-white border border-[#1F1810]/10 rounded-lg text-sm focus:outline-none focus:border-[#C17832]/50"
      />
      <button
        type="button"
        disabled={busy || !body.trim()}
        onClick={() =>
          run(() =>
            supabase.rpc("admin_post_status_note", {
              p_engagement_id: engagementId,
              p_body: body,
            })
          ).then(() => setBody(""))
        }
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1F1810] text-white rounded-lg text-xs font-medium hover:bg-[#C17832] transition-colors disabled:opacity-50"
      >
        <Send className="w-3.5 h-3.5" />
        Post note
      </button>
    </div>
  );
}

function AddDeliverableForm({ engagementId, busy, run }: { engagementId: string; busy: boolean; run: RunFn }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseNow, setReleaseNow] = useState(false);
  return (
    <div className="bg-white border border-dashed border-[#1F1810]/15 rounded-lg p-3 space-y-2">
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Deliverable title (e.g. Vendor Data-Handling Matrix)"
        className="w-full px-3 py-2 bg-white border border-[#1F1810]/10 rounded-lg text-sm focus:outline-none focus:border-[#C17832]/50"
      />
      <input
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="One-line description (optional)"
        className="w-full px-3 py-2 bg-white border border-[#1F1810]/10 rounded-lg text-xs focus:outline-none focus:border-[#C17832]/50"
      />
      <div className="flex items-center justify-between">
        <label className="inline-flex items-center gap-2 text-xs text-[#6B5B4E] cursor-pointer">
          <input
            type="checkbox"
            checked={releaseNow}
            onChange={(e) => setReleaseNow(e.target.checked)}
            className="accent-[#C17832]"
          />
          Release to client now
        </label>
        <button
          type="button"
          disabled={busy || !title.trim()}
          onClick={() =>
            run(() =>
              supabase.rpc("admin_add_deliverable", {
                p_engagement_id: engagementId,
                p_title: title,
                p_description: description || null,
                p_phase_id: null,
                p_release: releaseNow,
              })
            ).then(() => {
              setTitle("");
              setDescription("");
              setReleaseNow(false);
            })
          }
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1F1810] text-white rounded-lg text-xs font-medium hover:bg-[#C17832] transition-colors disabled:opacity-50"
        >
          <Plus className="w-3.5 h-3.5" />
          Add
        </button>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[11px] font-semibold text-[#A89279] uppercase tracking-widest mb-3">
        {title}
      </h3>
      {children}
    </div>
  );
}
