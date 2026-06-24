"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useEngagementRef } from "@/lib/useEngagementRef";
import { openEngagementFile } from "@/lib/download";
import { Award, FileText, Download, Loader2 } from "lucide-react";

interface Deliverable {
  id: string;
  title: string;
  description: string | null;
  storage_path: string | null;
  released_at: string | null;
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

export default function EngagementDeliverables() {
  const { ref, loading: refLoading } = useEngagementRef();
  const [items, setItems] = useState<Deliverable[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState("");
  const [loadError, setLoadError] = useState(false);

  const engagementId = ref?.engagementId;

  const load = useCallback(async () => {
    if (!engagementId) return;
    // RLS only returns released deliverables to clients — drafts never leave
    // the database for non-admins.
    const { data, error } = await supabase
      .from("deliverables")
      .select("id, title, description, storage_path, released_at")
      .eq("engagement_id", engagementId)
      .order("released_at", { ascending: false, nullsFirst: false });
    if (error) {
      setLoadError(true);
      setLoading(false);
      return;
    }
    setLoadError(false);
    setItems((data as Deliverable[]) ?? []);
    setLoading(false);
  }, [engagementId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const handleDownload = async (d: Deliverable) => {
    if (!d.storage_path) return;
    setDownloadingId(d.id);
    setDownloadError("");
    const { ok } = await openEngagementFile(d.storage_path);
    if (!ok) setDownloadError("Couldn’t open that file — please try again, or contact your attorney.");
    setDownloadingId(null);
  };

  if (refLoading || loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-10 h-10 border-4 border-[#C17832]/20 border-t-[#C17832] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-[#6B5B4E]">Opening your library…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-[#6B5B4E]">
          We couldn’t load your deliverables just now. Please refresh — if it keeps happening, email{" "}
          <a href="mailto:zachariah@availablelaw.com" className="text-[#C17832] underline">
            zachariah@availablelaw.com
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C17832] mb-2">
          Your Library
        </p>
        <h2 className="text-3xl font-bold text-[#1F1810] mb-1">Deliverables</h2>
        <p className="text-[#6B5B4E]">
          Each work product, released as it is completed — yours to keep and download anytime.
        </p>
      </div>

      {downloadError && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {downloadError}
        </div>
      )}

      {items.length === 0 ? (
        <div className="bg-white border border-[#1F1810]/10 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-10 text-center">
          <Award className="w-8 h-8 text-[#A89279] mx-auto mb-3" />
          <p className="text-sm font-medium text-[#1F1810]">No deliverables released yet</p>
          <p className="text-xs text-[#6B5B4E] mt-1 max-w-sm mx-auto">
            As each phase of your engagement completes, the finished work product appears here —
            drafted with AI assistance and reviewed and signed by your attorney.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((d) => (
            <div
              key={d.id}
              className="bg-white border border-[#1F1810]/10 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-5 flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-[#C17832]/10 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-[#C17832]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#1F1810]">{d.title}</p>
                {d.description && <p className="text-xs text-[#6B5B4E] mt-1">{d.description}</p>}
                <p className="text-[11px] text-[#A89279] mt-2">
                  Released {formatDate(d.released_at)} · Drafted with AI assistance, reviewed and
                  signed by your attorney
                </p>
              </div>
              {d.storage_path ? (
                <button
                  type="button"
                  onClick={() => handleDownload(d)}
                  disabled={downloadingId === d.id}
                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-[#1F1810] text-white rounded-lg text-xs font-medium hover:bg-[#C17832] transition-colors disabled:opacity-50 shrink-0"
                >
                  {downloadingId === d.id ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" />Opening…</>
                  ) : (
                    <><Download className="w-3.5 h-3.5" />Download</>
                  )}
                </button>
              ) : (
                <span className="text-[11px] text-[#A89279] shrink-0 mt-2">Ready soon</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
