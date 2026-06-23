"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  ShieldCheck,
  FolderLock,
  Award,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  AlertCircle,
  Clock,
} from "lucide-react";

// FAIIR client portal — Overview. A calm welcome summary: where things stand,
// what's needed now, the latest word from the attorney, and quick ways into
// the Documents and Deliverables rooms. The full phase journey lives on
// /dashboard/journey; the full document room on /dashboard/files.

interface Org {
  name: string;
  holds_phi: boolean;
}
interface Engagement {
  id: string;
  title: string;
  status: "draft" | "invited" | "active" | "closed";
}
interface Phase {
  position: number;
  title: string;
  status: "pending" | "in_progress" | "waiting_on_client" | "complete";
}
interface Note {
  body: string;
  author: string;
  posted_at: string;
}

const ENGAGEMENT_STATUS_LABEL: Record<Engagement["status"], string> = {
  draft: "Preparing kickoff",
  invited: "Getting started",
  active: "In motion",
  closed: "Complete",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function EngagementWorkspace({ orgId }: { orgId: string }) {
  const [org, setOrg] = useState<Org | null>(null);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [neededCount, setNeededCount] = useState(0);
  const [releasedCount, setReleasedCount] = useState(0);
  const [latestNote, setLatestNote] = useState<Note | null>(null);
  const [firstName, setFirstName] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const { data: sess } = await supabase.auth.getSession();
    const userId = sess.session?.user.id;

    const [orgRes, engRes, memberRes] = await Promise.all([
      supabase.from("orgs").select("name, holds_phi").eq("id", orgId).maybeSingle(),
      supabase
        .from("engagements")
        .select("id, title, status")
        .eq("org_id", orgId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      userId
        ? supabase.from("members").select("full_name").eq("user_id", userId).maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    setOrg(orgRes.data ?? null);
    const eng = engRes.data ?? null;
    setEngagement(eng);
    const fullName = (memberRes.data as { full_name?: string } | null)?.full_name;
    setFirstName(fullName ? fullName.trim().split(/\s+/)[0] : "");

    if (eng) {
      const [phasesRes, neededRes, releasedRes, noteRes] = await Promise.all([
        supabase
          .from("engagement_phases")
          .select("position, title, status")
          .eq("engagement_id", eng.id)
          .order("position", { ascending: true }),
        supabase
          .from("engagement_documents")
          .select("id", { count: "exact", head: true })
          .eq("engagement_id", eng.id)
          .eq("state", "needed"),
        supabase
          .from("deliverables")
          .select("id", { count: "exact", head: true })
          .eq("engagement_id", eng.id),
        supabase
          .from("engagement_status_notes")
          .select("body, author, posted_at")
          .eq("engagement_id", eng.id)
          .order("posted_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      setPhases((phasesRes.data as Phase[]) ?? []);
      setNeededCount(neededRes.count ?? 0);
      setReleasedCount(releasedRes.count ?? 0);
      setLatestNote((noteRes.data as Note) ?? null);
    }
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    // load() awaits getSession before any setState, so updates land after a
    // microtask, not synchronously — safe; the rule can't see through async.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

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
          Your workspace is being prepared. If you expected to see your engagement here, email{" "}
          <a href="mailto:zachariah@availablelaw.com" className="text-[#C17832] underline">
            zachariah@availablelaw.com
          </a>
          .
        </p>
      </div>
    );
  }

  const total = phases.length || 8;
  const complete = phases.filter((p) => p.status === "complete").length;
  const pct = Math.round((complete / total) * 100);
  const current =
    phases.find((p) => p.status === "in_progress" || p.status === "waiting_on_client") ??
    phases.find((p) => p.status === "pending") ??
    null;

  return (
    <div>
      {/* Welcome */}
      <div className="mb-8">
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C17832] mb-2">
          FAIIR · AI Governance
        </p>
        <h2 className="text-3xl font-bold text-[#1F1810] mb-1">
          {firstName ? `Welcome back, ${firstName}` : "Welcome back"}
        </h2>
        <p className="text-[#6B5B4E]">
          {org?.name ? `${org.name} · ` : ""}
          {engagement.title} ·{" "}
          <span className="text-[#C17832] font-medium">
            {ENGAGEMENT_STATUS_LABEL[engagement.status]}
          </span>
        </p>
      </div>

      {/* Confidentiality posture */}
      <div className="mb-8 p-4 bg-white border border-[#7A8B6F]/30 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] flex gap-3">
        <ShieldCheck className="w-5 h-5 text-[#7A8B6F] shrink-0 mt-0.5" />
        <div className="text-sm text-[#6B5B4E]">
          <p>
            Everything in this workspace is encrypted, visible only to your team and your attorney,
            and never used to train any AI model.
          </p>
          {org?.holds_phi && (
            <p className="mt-2 text-amber-700">
              Please redact patient- and client-identifying details before sharing documents — PHI
              stays out of this workspace by design.
            </p>
          )}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6 bg-white border border-[#1F1810]/10 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-6">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-lg font-semibold text-[#1F1810]">Where things stand</h3>
          <span className="text-xs text-[#A89279]">
            {complete} of {total} phases complete
          </span>
        </div>
        <div className="h-2 w-full bg-[#1F1810]/8 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#C17832] rounded-full transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        {current && (
          <p className="text-sm text-[#6B5B4E] mt-4 flex items-center gap-2">
            {current.status === "waiting_on_client" ? (
              <AlertCircle className="w-4 h-4 text-amber-600" />
            ) : current.status === "in_progress" ? (
              <CircleDot className="w-4 h-4 text-[#C17832]" />
            ) : (
              <Clock className="w-4 h-4 text-[#A89279]" />
            )}
            <span>
              Currently:{" "}
              <span className="font-medium text-[#1F1810]">
                {current.position}. {current.title}
              </span>
            </span>
          </p>
        )}
        <Link
          href="/dashboard/journey"
          className="inline-flex items-center gap-1 mt-4 text-xs font-medium text-[#C17832] hover:text-[#A8621F] transition-colors"
        >
          See your full engagement
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Needs you */}
      <div
        className={`mb-6 rounded-lg border p-5 flex items-center justify-between gap-4 shadow-[0_2px_8px_rgb(31_24_16/0.06)] ${
          neededCount > 0 ? "bg-amber-500/5 border-amber-500/30" : "bg-white border-[#1F1810]/10"
        }`}
      >
        <div className="flex items-center gap-3">
          {neededCount > 0 ? (
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-[#7A8B6F] shrink-0" />
          )}
          <div>
            <p className="text-sm font-semibold text-[#1F1810]">
              {neededCount > 0
                ? `${neededCount} document${neededCount === 1 ? "" : "s"} needed from you`
                : "All caught up"}
            </p>
            <p className="text-xs text-[#6B5B4E]">
              {neededCount > 0
                ? "Upload them at your convenience — nothing travels by email."
                : "Nothing outstanding right now."}
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/files"
          className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1F1810] text-white rounded-lg text-xs font-medium hover:bg-[#C17832] transition-colors shrink-0"
        >
          {neededCount > 0 ? "Upload" : "Documents"}
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Latest note */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-[#1F1810] mb-3">Latest from your attorney</h3>
        {latestNote ? (
          <div className="bg-white border border-[#1F1810]/10 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-4">
            <p className="text-sm text-[#1F1810] whitespace-pre-line">{latestNote.body}</p>
            <p className="text-[10px] text-[#A89279] mt-2">
              {latestNote.author} · {formatDate(latestNote.posted_at)}
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#1F1810]/10 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-4 text-center">
            <p className="text-sm text-[#6B5B4E]">Notes from your attorney will appear here.</p>
          </div>
        )}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/dashboard/files"
          className="group bg-white border border-[#1F1810]/10 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-5 hover:border-[#C17832]/40 transition-colors"
        >
          <FolderLock className="w-5 h-5 text-[#C17832] mb-3" />
          <p className="text-sm font-semibold text-[#1F1810] flex items-center gap-1">
            Documents
            <ArrowRight className="w-3.5 h-3.5 text-[#A89279] group-hover:translate-x-0.5 transition-transform" />
          </p>
          <p className="text-xs text-[#6B5B4E] mt-1">
            Share and download your documents, securely.
          </p>
        </Link>
        <Link
          href="/dashboard/deliverables"
          className="group bg-white border border-[#1F1810]/10 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-5 hover:border-[#C17832]/40 transition-colors"
        >
          <Award className="w-5 h-5 text-[#C17832] mb-3" />
          <p className="text-sm font-semibold text-[#1F1810] flex items-center gap-1">
            Deliverables
            {releasedCount > 0 && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-[#C17832]/10 text-[#C17832]">
                {releasedCount}
              </span>
            )}
            <ArrowRight className="w-3.5 h-3.5 text-[#A89279] group-hover:translate-x-0.5 transition-transform" />
          </p>
          <p className="text-xs text-[#6B5B4E] mt-1">
            Pick up each finished work product as it is released.
          </p>
        </Link>
      </div>
    </div>
  );
}
