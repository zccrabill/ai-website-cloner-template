"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabase";
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  Send,
  AlertCircle,
  FileText,
  Mail,
  Loader2,
} from "lucide-react";

interface Draft {
  id: string;
  user_id: string;
  conversation_id: string | null;
  title: string;
  client_request: string;
  draft_content: string;
  status: string;
  attorney_notes: string | null;
  attorney_id: string | null;
  reviewed_at: string | null;
  sent_at: string | null;
  created_at: string;
}

interface Intake {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company: string | null;
  title: string | null;
  industry: string | null;
  services: string[];
  notes: string | null;
  status: string;
  created_at: string;
}

export default function ReviewQueuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [intakes, setIntakes] = useState<Intake[]>([]);
  const [activeTab, setActiveTab] = useState<"drafts" | "intakes">("drafts");
  const [selectedDraft, setSelectedDraft] = useState<Draft | null>(null);
  const [editedContent, setEditedContent] = useState("");
  const [attorneyNotes, setAttorneyNotes] = useState("");
  const [savingAction, setSavingAction] = useState<string | null>(null);
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
        await Promise.all([loadDrafts(), loadIntakes()]);
      } catch (err) {
        console.error(err);
        setError("Failed to load review queue.");
      } finally {
        setLoading(false);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadDrafts = async () => {
    const { data, error: dErr } = await supabase
      .from("drafts")
      .select("*")
      .order("created_at", { ascending: false });
    if (dErr) {
      console.error(dErr);
      setError(dErr.message);
      return;
    }
    setDrafts((data ?? []) as Draft[]);
  };

  const loadIntakes = async () => {
    const { data, error: iErr } = await supabase
      .from("faiir_intakes")
      .select("*")
      .order("created_at", { ascending: false });
    if (iErr) {
      console.error(iErr);
      return;
    }
    setIntakes((data ?? []) as Intake[]);
  };

  const openDraft = (draft: Draft) => {
    setSelectedDraft(draft);
    setEditedContent(draft.draft_content);
    setAttorneyNotes(draft.attorney_notes ?? "");
  };

  const closeDraft = () => {
    setSelectedDraft(null);
    setEditedContent("");
    setAttorneyNotes("");
  };

  const saveDraft = async () => {
    if (!selectedDraft) return;
    setSavingAction("saving");
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const { error: upErr } = await supabase
      .from("drafts")
      .update({
        draft_content: editedContent,
        attorney_notes: attorneyNotes,
        attorney_id: session?.user?.id ?? null,
      })
      .eq("id", selectedDraft.id);
    setSavingAction(null);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    await loadDrafts();
  };

  const approveAndSend = async () => {
    if (!selectedDraft) return;
    setSavingAction("sending");
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const now = new Date().toISOString();
    const { error: upErr } = await supabase
      .from("drafts")
      .update({
        draft_content: editedContent,
        attorney_notes: attorneyNotes,
        attorney_id: session?.user?.id ?? null,
        status: "sent",
        reviewed_at: now,
        sent_at: now,
      })
      .eq("id", selectedDraft.id);

    setSavingAction(null);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    closeDraft();
    await loadDrafts();
  };

  const rejectDraft = async () => {
    if (!selectedDraft) return;
    if (!confirm("Reject this draft? It will be marked rejected and not sent to the client.")) return;
    setSavingAction("rejecting");
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const { error: upErr } = await supabase
      .from("drafts")
      .update({
        attorney_notes: attorneyNotes,
        attorney_id: session?.user?.id ?? null,
        status: "rejected",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", selectedDraft.id);
    setSavingAction(null);
    if (upErr) {
      setError(upErr.message);
      return;
    }
    closeDraft();
    await loadDrafts();
  };

  const markIntakeContacted = async (id: string) => {
    await supabase
      .from("faiir_intakes")
      .update({ status: "contacted", reviewed_at: new Date().toISOString() })
      .eq("id", id);
    await loadIntakes();
  };

  if (loading) {
    return (
      <DashboardShell title="Review Queue">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-[#C17832] animate-spin" />
        </div>
      </DashboardShell>
    );
  }

  if (!authorized) return null;

  const pendingDrafts = drafts.filter((d) => d.status === "pending_review");
  const completedDrafts = drafts.filter((d) => d.status !== "pending_review");
  const newIntakes = intakes.filter((i) => i.status === "new");

  return (
    <DashboardShell title="Review Queue">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#7A8B6F]/15 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-[#7A8B6F]" />
          </div>
          <div>
            <h1 className="text-3xl font-heading text-[#1F1810]">
              Attorney Review Queue
            </h1>
            <p className="text-sm text-[#6B5B4E]">
              Review Allora&apos;s drafts and approve, edit, or send to clients.
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-[#1F1810]/10">
          <button
            onClick={() => setActiveTab("drafts")}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === "drafts"
                ? "border-[#C17832] text-[#1F1810]"
                : "border-transparent text-[#6B5B4E] hover:text-[#1F1810]"
            }`}
          >
            Drafts{" "}
            {pendingDrafts.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#C17832] text-white text-xs rounded-full">
                {pendingDrafts.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("intakes")}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === "intakes"
                ? "border-[#C17832] text-[#1F1810]"
                : "border-transparent text-[#6B5B4E] hover:text-[#1F1810]"
            }`}
          >
            FAIIR Intakes{" "}
            {newIntakes.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-[#C17832] text-white text-xs rounded-full">
                {newIntakes.length}
              </span>
            )}
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Drafts tab */}
        {activeTab === "drafts" && (
          <div className="space-y-6">
            <div>
              <h2 className="text-sm font-semibold text-[#1F1810] uppercase tracking-wider mb-3">
                Pending Review ({pendingDrafts.length})
              </h2>
              {pendingDrafts.length === 0 ? (
                <div className="bg-white border border-[#1F1810]/8 rounded-xl p-8 text-center text-sm text-[#A89279]">
                  No drafts waiting for review. Allora&apos;s queue is clear.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingDrafts.map((draft) => (
                    <DraftCard
                      key={draft.id}
                      draft={draft}
                      onClick={() => openDraft(draft)}
                    />
                  ))}
                </div>
              )}
            </div>

            {completedDrafts.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-[#1F1810] uppercase tracking-wider mb-3">
                  History ({completedDrafts.length})
                </h2>
                <div className="space-y-3">
                  {completedDrafts.slice(0, 10).map((draft) => (
                    <DraftCard
                      key={draft.id}
                      draft={draft}
                      onClick={() => openDraft(draft)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Intakes tab */}
        {activeTab === "intakes" && (
          <div className="space-y-3">
            {intakes.length === 0 ? (
              <div className="bg-white border border-[#1F1810]/8 rounded-xl p-8 text-center text-sm text-[#A89279]">
                No intake submissions yet.
              </div>
            ) : (
              intakes.map((intake) => (
                <div
                  key={intake.id}
                  className="bg-white border border-[#1F1810]/8 rounded-xl p-5 hover:border-[#C17832]/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-[#1F1810]">
                          {intake.full_name}
                        </h3>
                        {intake.status === "new" && (
                          <span className="px-2 py-0.5 bg-[#C17832]/10 text-[#C17832] text-[10px] font-semibold uppercase rounded-full">
                            New
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-[#6B5B4E]">
                        {intake.title ? `${intake.title} · ` : ""}
                        {intake.company || "Independent"}
                        {intake.industry ? ` · ${intake.industry}` : ""}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-[#A89279]">
                        <a
                          href={`mailto:${intake.email}`}
                          className="flex items-center gap-1 hover:text-[#C17832]"
                        >
                          <Mail className="w-3 h-3" /> {intake.email}
                        </a>
                        {intake.phone && <span>· {intake.phone}</span>}
                      </div>
                    </div>
                    <span className="text-xs text-[#A89279] flex-shrink-0">
                      {new Date(intake.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {intake.services.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {intake.services.map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 bg-[#F5F0EB] text-[#6B5B4E] text-xs rounded-full"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                  {intake.notes && (
                    <p className="text-sm text-[#6B5B4E] italic mb-3">
                      &ldquo;{intake.notes}&rdquo;
                    </p>
                  )}
                  {intake.status === "new" && (
                    <button
                      onClick={() => markIntakeContacted(intake.id)}
                      className="text-xs text-[#7A8B6F] hover:text-[#1F1810] font-medium"
                    >
                      Mark as contacted →
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Draft Review Modal */}
      {selectedDraft && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1810]/60 backdrop-blur-sm overflow-y-auto"
          onClick={closeDraft}
        >
          <div
            className="relative bg-[#FAF8F5] rounded-2xl shadow-2xl w-full max-w-3xl my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#1F1810]/10 sticky top-0 bg-[#FAF8F5] z-10">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <p className="text-[10px] font-semibold text-[#A89279] uppercase tracking-widest mb-1">
                    {selectedDraft.status === "sent"
                      ? "Sent to client"
                      : selectedDraft.status === "rejected"
                      ? "Rejected"
                      : "Pending Review"}
                  </p>
                  <h3 className="text-xl font-heading text-[#1F1810]">
                    {selectedDraft.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeDraft}
                  className="text-sm text-[#6B5B4E] hover:text-[#1F1810]"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-[#1F1810] uppercase tracking-wider mb-2">
                  Client Request
                </label>
                <div className="bg-white border border-[#1F1810]/8 rounded-lg p-4 text-sm text-[#1F1810] whitespace-pre-line">
                  {selectedDraft.client_request}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1810] uppercase tracking-wider mb-2">
                  Allora&apos;s Draft (editable)
                </label>
                <textarea
                  value={editedContent}
                  onChange={(e) => setEditedContent(e.target.value)}
                  rows={12}
                  disabled={selectedDraft.status !== "pending_review"}
                  className="w-full px-4 py-3 bg-white border border-[#1F1810]/10 rounded-lg text-sm text-[#1F1810] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 resize-y disabled:opacity-70"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#1F1810] uppercase tracking-wider mb-2">
                  Attorney Notes (internal)
                </label>
                <textarea
                  value={attorneyNotes}
                  onChange={(e) => setAttorneyNotes(e.target.value)}
                  rows={3}
                  disabled={selectedDraft.status !== "pending_review"}
                  placeholder="Internal notes — not visible to client"
                  className="w-full px-4 py-3 bg-white border border-[#1F1810]/10 rounded-lg text-sm text-[#1F1810] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 resize-y disabled:opacity-70"
                />
              </div>
            </div>

            {selectedDraft.status === "pending_review" && (
              <div className="p-6 border-t border-[#1F1810]/10 sticky bottom-0 bg-[#FAF8F5] flex items-center justify-between gap-3">
                <button
                  onClick={rejectDraft}
                  disabled={!!savingAction}
                  className="px-4 py-2.5 text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                >
                  Reject
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={saveDraft}
                    disabled={!!savingAction}
                    className="px-5 py-2.5 bg-white border border-[#1F1810]/15 text-[#1F1810] rounded-lg text-sm font-medium hover:bg-[#F5F0EB] disabled:opacity-50"
                  >
                    {savingAction === "saving" ? "Saving…" : "Save Edits"}
                  </button>
                  <button
                    onClick={approveAndSend}
                    disabled={!!savingAction}
                    className="px-5 py-2.5 bg-[#7A8B6F] text-white rounded-lg text-sm font-medium hover:bg-[#1F1810] transition-all inline-flex items-center gap-2 disabled:opacity-50"
                  >
                    {savingAction === "sending" ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Sending…
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Approve &amp; Send
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardShell>
  );
}

function DraftCard({
  draft,
  onClick,
}: {
  draft: Draft;
  onClick: () => void;
}) {
  const statusBadge = (() => {
    switch (draft.status) {
      case "pending_review":
        return (
          <span className="px-2 py-0.5 bg-[#C17832]/10 text-[#C17832] text-[10px] font-semibold uppercase rounded-full inline-flex items-center gap-1">
            <Clock className="w-3 h-3" /> Pending
          </span>
        );
      case "sent":
        return (
          <span className="px-2 py-0.5 bg-[#7A8B6F]/15 text-[#7A8B6F] text-[10px] font-semibold uppercase rounded-full inline-flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Sent
          </span>
        );
      case "rejected":
        return (
          <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[10px] font-semibold uppercase rounded-full">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-[#F5F0EB] text-[#6B5B4E] text-[10px] font-semibold uppercase rounded-full">
            {draft.status}
          </span>
        );
    }
  })();

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white border border-[#1F1810]/8 rounded-xl p-5 hover:border-[#C17832]/30 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-4 mb-2">
        <div className="flex items-start gap-3">
          <FileText className="w-4 h-4 text-[#C17832] mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-base font-semibold text-[#1F1810] mb-1">
              {draft.title}
            </h3>
            <p className="text-sm text-[#6B5B4E] line-clamp-2">
              {draft.client_request}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {statusBadge}
          <span className="text-[10px] text-[#A89279]">
            {new Date(draft.created_at).toLocaleString()}
          </span>
        </div>
      </div>
    </button>
  );
}
