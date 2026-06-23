"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useEngagementRef } from "@/lib/useEngagementRef";
import { CheckCircle2, CircleDot, AlertCircle, Circle } from "lucide-react";

interface Phase {
  id: string;
  position: number;
  title: string;
  client_summary: string | null;
  status: "pending" | "in_progress" | "waiting_on_client" | "complete";
  completed_at: string | null;
}

const STATUS_META: Record<
  Phase["status"],
  { label: string; icon: typeof Circle; ring: string; text: string }
> = {
  complete: { label: "Complete", icon: CheckCircle2, ring: "border-[#7A8B6F] bg-[#7A8B6F]/10", text: "text-[#7A8B6F]" },
  in_progress: { label: "In progress", icon: CircleDot, ring: "border-[#C17832] bg-[#C17832]/10", text: "text-[#C17832]" },
  waiting_on_client: { label: "Needs you", icon: AlertCircle, ring: "border-amber-500 bg-amber-500/10", text: "text-amber-700" },
  pending: { label: "Upcoming", icon: Circle, ring: "border-[#1F1810]/15 bg-white", text: "text-[#A89279]" },
};

export default function EngagementJourney() {
  const { ref, loading: refLoading } = useEngagementRef();
  const [phases, setPhases] = useState<Phase[]>([]);
  const [loading, setLoading] = useState(true);

  const engagementId = ref?.engagementId;

  const load = useCallback(async () => {
    if (!engagementId) return;
    const { data } = await supabase
      .from("engagement_phases")
      .select("id, position, title, client_summary, status, completed_at")
      .eq("engagement_id", engagementId)
      .order("position", { ascending: true });
    setPhases((data as Phase[]) ?? []);
    setLoading(false);
  }, [engagementId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (refLoading || loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-10 h-10 border-4 border-[#C17832]/20 border-t-[#C17832] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-[#6B5B4E]">Opening your engagement…</p>
      </div>
    );
  }

  const complete = phases.filter((p) => p.status === "complete").length;

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C17832] mb-2">
          {ref?.title ?? "FAIIR Engagement"}
        </p>
        <h2 className="text-3xl font-bold text-[#1F1810] mb-1">Your Engagement</h2>
        <p className="text-[#6B5B4E]">
          The full path of your assessment, start to finish — {complete} of {phases.length} phases
          complete. Each phase produces work you keep.
        </p>
      </div>

      <div className="relative">
        {/* connecting spine */}
        <div className="absolute left-[18px] top-2 bottom-2 w-px bg-[#1F1810]/10" aria-hidden />
        <ol className="space-y-4">
          {phases.map((phase) => {
            const meta = STATUS_META[phase.status];
            const Icon = meta.icon;
            const isActive = phase.status === "in_progress" || phase.status === "waiting_on_client";
            return (
              <li key={phase.id} className="relative flex gap-4">
                <div
                  className={`relative z-10 w-9 h-9 rounded-full border-2 flex items-center justify-center shrink-0 ${meta.ring}`}
                >
                  <Icon className={`w-4 h-4 ${meta.text}`} />
                </div>
                <div
                  className={`flex-1 min-w-0 bg-white border rounded-lg p-4 shadow-[0_2px_8px_rgb(31_24_16/0.06)] ${
                    isActive ? "border-[#C17832]/40" : "border-[#1F1810]/10"
                  }`}
                >
                  <div className="flex items-center gap-2 flex-wrap">
                    <p
                      className={`text-sm font-semibold ${
                        phase.status === "pending" ? "text-[#6B5B4E]" : "text-[#1F1810]"
                      }`}
                    >
                      {phase.position}. {phase.title}
                    </p>
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${meta.ring} ${meta.text}`}
                    >
                      {meta.label}
                    </span>
                  </div>
                  {phase.client_summary && (
                    <p className="text-xs text-[#6B5B4E] mt-1.5 leading-relaxed">
                      {phase.client_summary}
                    </p>
                  )}
                  {phase.status === "complete" && phase.completed_at && (
                    <p className="text-[10px] text-[#7A8B6F] mt-2">
                      Completed{" "}
                      {new Date(phase.completed_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      </div>

      <p className="text-xs text-[#A89279] mt-8 text-center">
        Every deliverable is drafted with AI assistance and reviewed and signed by your attorney.
      </p>
    </div>
  );
}
