"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import ShareTheWin from "@/components/ShareTheWin";
import {
  ShieldCheck,
  FolderLock,
  Award,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  AlertCircle,
  Clock,
  Upload,
  MessageSquare,
  Flag,
} from "lucide-react";

// FAIIR client portal — Overview. A calm welcome summary: where things stand,
// what's needed now, the latest word from the attorney, recent activity, and
// quick ways into the Documents and Deliverables rooms. The full phase journey
// lives on /dashboard/journey; the full document room on /dashboard/files.

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
  completed_at: string | null;
}
interface Doc {
  label: string;
  state: "needed" | "received" | "reviewed";
  uploaded_at: string | null;
  reviewed_at: string | null;
}
interface Deliverable {
  title: string;
  released_at: string | null;
}
interface Note {
  body: string;
  author: string;
  posted_at: string;
}

type ActivityKind = "upload" | "reviewed" | "released" | "note" | "phase";
interface ActivityItem {
  at: string;
  text: string;
  kind: ActivityKind;
}

const ENGAGEMENT_STATUS_LABEL: Record<Engagement["status"], string> = {
  draft: "Preparing kickoff",
  invited: "Getting started",
  active: "In motion",
  closed: "Complete",
};

const ACTIVITY_META: Record<ActivityKind, { icon: typeof Upload; tint: string }> = {
  upload: { icon: Upload, tint: "text-[#C17832] bg-[#C17832]/10" },
  reviewed: { icon: CheckCircle2, tint: "text-[#7A8B6F] bg-[#7A8B6F]/10" },
  released: { icon: Award, tint: "text-[#C17832] bg-[#C17832]/10" },
  note: { icon: MessageSquare, tint: "text-[#6B5B4E] bg-[#1F1810]/8" },
  phase: { icon: Flag, tint: "text-[#7A8B6F] bg-[#7A8B6F]/10" },
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
function relativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function EngagementWorkspace({ orgId }: { orgId: string }) {
  const [org, setOrg] = useState<Org | null>(null);
  const [engagement, setEngagement] = useState<Engagement | null>(null);
  const [phases, setPhases] = useState<Phase[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [firstName, setFirstName] = useState<string>("");
  const [certified, setCertified] = useState(false);
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
      const [phasesRes, docsRes, delivRes, notesRes, certRes] = await Promise.all([
        supabase
          .from("engagement_phases")
          .select("position, title, status, completed_at")
          .eq("engagement_id", eng.id)
          .order("position", { ascending: true }),
        supabase
          .from("engagement_documents")
          .select("label, state, uploaded_at, reviewed_at")
          .eq("engagement_id", eng.id),
        supabase
          .from("deliverables")
          .select("title, released_at")
          .eq("engagement_id", eng.id),
        supabase
          .from("engagement_status_notes")
          .select("body, author, posted_at")
          .eq("engagement_id", eng.id)
          .order("posted_at", { ascending: false })
          .limit(5),
        supabase
          .from("faiir_certifications")
          .select("id")
          .eq("org_id", orgId)
          .eq("status", "active")
          .limit(1)
          .maybeSingle(),
      ]);
      setPhases((phasesRes.data as Phase[]) ?? []);
      setDocs((docsRes.data as Doc[]) ?? []);
      setDeliverables((delivRes.data as Deliverable[]) ?? []);
      setNotes((notesRes.data as Note[]) ?? []);
      setCertified(Boolean(certRes.data));
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
  const neededCount = docs.filter((d) => d.state === "needed").length;
  const releasedCount = deliverables.filter((d) => d.released_at).length;
  const latestNote = notes[0] ?? null;

  // Synthesize a curated activity feed from client-readable data only.
  const activity: ActivityItem[] = [];
  for (const d of docs) {
    if (d.uploaded_at && (d.state === "received" || d.state === "reviewed"))
      activity.push({ at: d.uploaded_at, text: `You shared “${d.label}”`, kind: "upload" });
    if (d.reviewed_at && d.state === "reviewed")
      activity.push({ at: d.reviewed_at, text: `“${d.label}” reviewed by your attorney`, kind: "reviewed" });
  }
  for (const dl of deliverables)
    if (dl.released_at) activity.push({ at: dl.released_at, text: `“${dl.title}” released to your library`, kind: "released" });
  for (const n of notes) activity.push({ at: n.posted_at, text: "New note from your attorney", kind: "note" });
  for (const p of phases)
    if (p.completed_at && p.status === "complete")
      activity.push({ at: p.completed_at, text: `${p.title} completed`, kind: "phase" });
  activity.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const recent = activity.slice(0, 6);

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
          <span className="text-[#C17832] font-medium">{ENGAGEMENT_STATUS_LABEL[engagement.status]}</span>
        </p>
      </div>

      {/* Confidentiality posture */}
      <div className="mb-8 p-4 bg-white border border-[#7A8B6F]/30 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] flex gap-3">
        <ShieldCheck className="w-5 h-5 text-[#7A8B6F] shrink-0 mt-0.5" />
        <div className="text-sm text-[#6B5B4E]">
          <p>
            Everything in this workspace is encrypted, visible only to your team and your attorney, and
            never used to train any AI model.
          </p>
          {org?.holds_phi && (
            <p className="mt-2 text-amber-700">
              Please redact patient- and client-identifying details before sharing documents — PHI stays
              out of this workspace by design.
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
          <div className="h-full bg-[#C17832] rounded-full transition-all" style={{ width: `${pct}%` }} />
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
      <div className="mb-6">
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

      {/* Close-of-engagement asks. Certified firms get the Share-the-win card
          on the Certification page at the cert reveal; an engagement that
          closes without a certification component gets it here instead, with
          the FAIIR-certified directory ask hidden because it doesn't apply. */}
      {engagement.status === "closed" && !certified && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-[#1F1810] mb-3">Before you go</h3>
          <ShareTheWin
            engagementId={engagement.id}
            firmName={org?.name ?? "your firm"}
            certified={false}
          />
        </div>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <Link
          href="/dashboard/files"
          className="group bg-white border border-[#1F1810]/10 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-5 hover:border-[#C17832]/40 transition-colors"
        >
          <FolderLock className="w-5 h-5 text-[#C17832] mb-3" />
          <p className="text-sm font-semibold text-[#1F1810] flex items-center gap-1">
            Documents
            <ArrowRight className="w-3.5 h-3.5 text-[#A89279] group-hover:translate-x-0.5 transition-transform" />
          </p>
          <p className="text-xs text-[#6B5B4E] mt-1">Share and download your documents, securely.</p>
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
          <p className="text-xs text-[#6B5B4E] mt-1">Pick up each finished work product as it is released.</p>
        </Link>
      </div>

      {/* Recent activity */}
      {recent.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-[#1F1810] mb-3">Recent activity</h3>
          <div className="bg-white border border-[#1F1810]/10 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] divide-y divide-[#1F1810]/6">
            {recent.map((item, idx) => {
              const meta = ACTIVITY_META[item.kind];
              const Icon = meta.icon;
              return (
                <div key={`${item.kind}-${item.at}-${idx}`} className="flex items-center gap-3 px-4 py-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.tint}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <p className="text-sm text-[#1F1810] flex-1 min-w-0 truncate">{item.text}</p>
                  <span className="text-[11px] text-[#A89279] shrink-0">{relativeDate(item.at)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
