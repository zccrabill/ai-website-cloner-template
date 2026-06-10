"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  CheckCircle2,
  Circle,
  CircleDot,
  AlertCircle,
  ShieldCheck,
  FileText,
  FolderLock,
  Award,
} from "lucide-react";

// The FAIIR client engagement workspace. Rendered as the dashboard home for
// members with an active org seat (see src/app/dashboard/page.tsx). Everything
// here is read-only in v1: RLS already scopes every query to the caller's org,
// and draft deliverables never leave the database for non-admins.

interface Org {
  id: string;
  name: string;
  holds_phi: boolean;
}

interface Engagement {
  id: string;
  title: string;
  status: "draft" | "invited" | "active" | "closed";
}

interface Phase {
  id: string;
  position: number;
  title: string;
  client_summary: string | null;
  status: "pending" | "in_progress" | "waiting_on_client" | "complete";
}

interface DocCard {
  id: string;
  label: string;
  description: string | null;
  state: "needed" | "received" | "reviewed";
}

interface StatusNote {
  id: string;
  body: string;
  author: string;
  posted_at: string;
}

interface Deliverable {
  id: string;
  title: string;
  description: string | null;
  released_at: string | null;
}

const ENGAGEMENT_STATUS_LABEL: Record<Engagement["status"], string> = {
  draft: "Preparing kickoff",
  invited: "Getting started",
  active: "In motion",
  closed: "Complete",
};

const DOC_STATE_STYLE: Record<DocCard["state"], { label: string; cls: string }> = {
  needed: { label: "Needed", cls: "bg-amber-500/10 text-amber-700 border-amber-500/30" },
  received: { label: "Received", cls: "bg-[#C17832]/10 text-[#C17832] border-[#C17832]/30" },
  reviewed: { label: "Reviewed", cls: "bg-[#7A8B6F]/10 text-[#7A8B6F] border-[#7A8B6F]/30" },
};

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function PhaseIcon({ status }: { status: Phase["status"] }) {
  if (status === "complete")
    return <CheckCircle2 className="w-5 h-5 text-[#7A8B6F]" />;
  if (status === "in_progress")
    return <CircleDot className="w-5 h-5 text-[#C17832]" />;
  if (status === "waiting_on_client")
    return <AlertCircle className="w-5 h-5 text-amber-600" />;
  return <Circle className="w-5 h-5 text-[#A89279]/50" />;
}

export default function EngagementWorkspace({ orgId }: { orgId: string }) {
  const [org, setOrg] = useState<Org | null>(null);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [docs, setDocs] = useState<DocCard[]>([]);
  const [notes, setNotes] = useState<StatusNote[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);

  const loadWorkspace = useCallback(async () => {
    const [orgRes, engRes] = await Promise.all([
      supabase.from("orgs").select("id, name, holds_phi").eq("id", orgId).maybeSingle(),
      supabase
        .from("engagements")
        .select("id, title, status")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    setOrg(orgRes.data ?? null);
    const eng = engRes.data ?? null;
    setEngagement(eng);

    if (eng) {
      const [phasesRes, docsRes, notesRes, delivRes] = await Promise.all([
        supabase
          .from("engagement_phases")
          .select("id, position, title, client_summary, status")
          .eq("engagement_id", eng.id)
          .order("position", { ascending: true }),
        supabase
          .from("engagement_documents")
          .select("id, label, description, state")
          .eq("engagement_id", eng.id)
          .order("position", { ascending: true }),
        supabase
          .from("engagement_status_notes")
          .select("id, body, author, posted_at")
          .eq("engagement_id", eng.id)
          .order("posted_at", { ascending: false }),
        // RLS only returns released rows to clients; no status filter needed.
        supabase
          .from("deliverables")
          .select("id, title, description, released_at")
          .eq("engagement_id", eng.id)
          .order("released_at", { ascending: false }),
      ]);
      setPhases(phasesRes.data ?? []);
      setDocs(docsRes.data ?? []);
      setNotes(notesRes.data ?? []);
      setDeliverables(delivRes.data ?? []);
    }
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    // All setState calls happen after awaited queries (post-microtask), same
    // pattern as the dashboard loader.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadWorkspace();
  }, [loadWorkspace]);

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-10 h-10 border-4 border-[#C17832]/20 border-t-[#C17832] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-[#6B5B4E]">Opening your workspace…</p>
      </div>
    );
  }

  if (!engagement) {
    return (
      <div className="py-16 text-center">
        <p className="text-[#6B5B4E]">
          Your workspace is being prepared. If you expected to see your
          engagement here, email{" "}
          <a href="mailto:zachariah@availablelaw.com" className="text-[#C17832] underline">
            zachariah@availablelaw.com
          </a>
          .
        </p>
      </div>
    );
  }

  const completed = phases.filter((p) => p.status === "complete").length;
  const needsYou = docs.filter((d) => d.state === "needed");

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C17832] mb-2">
          FAIIR · AI Governance
        </p>
        <h2 className="text-3xl font-bold text-[#1F1810] mb-1">{engagement.title}</h2>
        <p className="text-[#6B5B4E]">
          {org?.name} ·{" "}
          <span className="text-[#C17832] font-medium">
            {ENGAGEMENT_STATUS_LABEL[engagement.status]}
          </span>
        </p>
      </div>

      {/* Confidentiality posture — stated before anything is asked of them */}
      <div className="mb-8 p-4 bg-white border border-[#7A8B6F]/30 rounded-lg flex gap-3">
        <ShieldCheck className="w-5 h-5 text-[#7A8B6F] shrink-0 mt-0.5" />
        <div className="text-sm text-[#6B5B4E]">
          <p>
            Everything in this workspace is encrypted, visible only to your team
            and your attorney, and never used to train any AI model.
          </p>
          {org?.holds_phi && (
            <p className="mt-2 text-amber-700">
              One ask: please redact patient- and client-identifying details
              before sharing documents — PHI stays out of this workspace by
              design.
            </p>
          )}
        </div>
      </div>

      {/* Phase tracker */}
      <div className="mb-10">
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1F1810]">Where things stand</h3>
          <span className="text-xs text-[#A89279]">
            {completed} of {phases.length} phases complete
          </span>
        </div>
        <div className="bg-white border border-[#1F1810]/8 rounded-lg divide-y divide-[#1F1810]/6">
          {phases.map((phase) => (
            <div key={phase.id} className="flex gap-4 p-4">
              <div className="mt-0.5 shrink-0">
                <PhaseIcon status={phase.status} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p
                    className={`text-sm font-semibold ${
                      phase.status === "pending" ? "text-[#A89279]" : "text-[#1F1810]"
                    }`}
                  >
                    {phase.position}. {phase.title}
                  </p>
                  {phase.status === "in_progress" && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#C17832]/10 text-[#C17832] border border-[#C17832]/30">
                      In progress
                    </span>
                  )}
                  {phase.status === "waiting_on_client" && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/30">
                      Needs you
                    </span>
                  )}
                </div>
                {phase.client_summary && phase.status !== "pending" && (
                  <p className="text-xs text-[#6B5B4E] mt-1">{phase.client_summary}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Document room */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <FolderLock className="w-5 h-5 text-[#C17832]" />
          <h3 className="text-lg font-semibold text-[#1F1810]">
            What we need from you
          </h3>
          {needsYou.length > 0 && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/30">
              {needsYou.length} outstanding
            </span>
          )}
        </div>
        {docs.length === 0 ? (
          <div className="bg-white border border-[#1F1810]/8 rounded-lg p-6 text-center">
            <p className="text-sm text-[#6B5B4E]">Nothing needed from you right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {docs.map((doc) => {
              const badge = DOC_STATE_STYLE[doc.state];
              return (
                <div
                  key={doc.id}
                  className="bg-white border border-[#1F1810]/8 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-[#1F1810]">{doc.label}</p>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${badge.cls}`}
                    >
                      {badge.label}
                    </span>
                  </div>
                  {doc.description && (
                    <p className="text-xs text-[#6B5B4E] mt-1">{doc.description}</p>
                  )}
                  <p className="text-[10px] text-[#A89279] mt-3">
                    Encrypted · visible only to your team and your attorney · never
                    used to train AI
                  </p>
                </div>
              );
            })}
          </div>
        )}
        <p className="text-xs text-[#A89279] mt-3">
          Secure uploads open here shortly. Until then, reply to your engagement
          email with anything marked “Needed.”
        </p>
      </div>

      {/* Status notes */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-[#1F1810] mb-4">
          Notes from your attorney
        </h3>
        {notes.length === 0 ? (
          <div className="bg-white border border-[#1F1810]/8 rounded-lg p-6 text-center">
            <p className="text-sm text-[#6B5B4E]">
              Notes will appear here as work begins.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div key={note.id} className="bg-white border border-[#1F1810]/8 rounded-lg p-4">
                <p className="text-sm text-[#1F1810] whitespace-pre-line">{note.body}</p>
                <p className="text-[10px] text-[#A89279] mt-2">
                  {note.author} · {formatDate(note.posted_at)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Deliverables */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-[#C17832]" />
          <h3 className="text-lg font-semibold text-[#1F1810]">Your deliverables</h3>
        </div>
        {deliverables.length === 0 ? (
          <div className="bg-white border border-[#1F1810]/8 rounded-lg p-6 text-center">
            <p className="text-sm text-[#6B5B4E]">
              Deliverables release here as each phase completes.
            </p>
            <p className="text-xs text-[#A89279] mt-1">
              Drafted with AI assistance — reviewed and signed by your attorney.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {deliverables.map((d) => (
              <div
                key={d.id}
                className="bg-white border border-[#1F1810]/8 rounded-lg p-4 flex items-start gap-3"
              >
                <FileText className="w-5 h-5 text-[#C17832] shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-[#1F1810]">{d.title}</p>
                  {d.description && (
                    <p className="text-xs text-[#6B5B4E] mt-1">{d.description}</p>
                  )}
                  <p className="text-[10px] text-[#A89279] mt-1">
                    Released {formatDate(d.released_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
