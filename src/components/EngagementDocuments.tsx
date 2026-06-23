"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useEngagementRef } from "@/lib/useEngagementRef";
import {
  FolderLock,
  Upload,
  Download,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";

interface DocCard {
  id: string;
  label: string;
  description: string | null;
  state: "needed" | "received" | "reviewed";
  storage_path: string | null;
  uploaded_at: string | null;
}

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

function formatDate(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

const STATE_BADGE: Record<DocCard["state"], { label: string; cls: string; icon: typeof Clock }> = {
  needed: { label: "Needed", cls: "bg-amber-500/10 text-amber-700 border-amber-500/30", icon: AlertCircle },
  received: { label: "Received", cls: "bg-[#C17832]/10 text-[#C17832] border-[#C17832]/30", icon: Clock },
  reviewed: { label: "Reviewed", cls: "bg-[#7A8B6F]/10 text-[#7A8B6F] border-[#7A8B6F]/30", icon: CheckCircle2 },
};

export default function EngagementDocuments() {
  const { ref, loading: refLoading } = useEngagementRef();
  const [docs, setDocs] = useState<DocCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [downloadingDocId, setDownloadingDocId] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const engagementId = ref?.engagementId;

  const loadDocs = useCallback(async () => {
    if (!engagementId) return;
    const { data } = await supabase
      .from("engagement_documents")
      .select("id, label, description, state, storage_path, uploaded_at")
      .eq("engagement_id", engagementId)
      .order("position", { ascending: true });
    setDocs((data as DocCard[]) ?? []);
    setLoading(false);
  }, [engagementId]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs]);

  const handleUpload = async (doc: DocCard, file: File) => {
    if (!engagementId) return;
    setErrors((prev) => ({ ...prev, [doc.id]: "" }));
    if (file.size > MAX_UPLOAD_BYTES) {
      setErrors((prev) => ({ ...prev, [doc.id]: "That file is over the 25 MB limit — email it to us instead." }));
      return;
    }
    setUploadingDocId(doc.id);
    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]+/g, "-");
      const path = `${engagementId}/${doc.id}/${Date.now()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("engagement-docs")
        .upload(path, file, { upsert: false });
      if (uploadError) throw new Error(uploadError.message);
      const { error: rpcError } = await supabase.rpc("mark_document_received", {
        p_document_id: doc.id,
        p_storage_path: path,
      });
      if (rpcError) throw new Error(rpcError.message);
      // Optimistic local update — never block the UI on a full reload.
      setDocs((prev) =>
        prev.map((d) =>
          d.id === doc.id
            ? { ...d, state: "received" as const, storage_path: path, uploaded_at: new Date().toISOString() }
            : d
        )
      );
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [doc.id]: err instanceof Error && err.message ? `Upload failed: ${err.message}` : "Upload failed — please try again.",
      }));
    } finally {
      setUploadingDocId(null);
    }
  };

  const handleDownload = async (doc: DocCard) => {
    if (!doc.storage_path) return;
    setDownloadingDocId(doc.id);
    try {
      const { data, error } = await supabase.storage
        .from("engagement-docs")
        .createSignedUrl(doc.storage_path, 60);
      if (!error && data?.signedUrl) window.open(data.signedUrl, "_blank");
    } finally {
      setDownloadingDocId(null);
    }
  };

  if (refLoading || loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-10 h-10 border-4 border-[#C17832]/20 border-t-[#C17832] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-[#6B5B4E]">Opening your document room…</p>
      </div>
    );
  }

  const needed = docs.filter((d) => d.state === "needed");
  const shared = docs.filter((d) => d.state !== "needed");

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C17832] mb-2">
          Secure Document Room
        </p>
        <h2 className="text-3xl font-bold text-[#1F1810] mb-1">Documents</h2>
        <p className="text-[#6B5B4E]">
          Everything for your engagement, in one encrypted place — nothing travels by email.
        </p>
      </div>

      {/* Confidentiality posture */}
      <div className="mb-8 p-4 bg-white border border-[#7A8B6F]/30 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] flex gap-3">
        <FolderLock className="w-5 h-5 text-[#7A8B6F] shrink-0 mt-0.5" />
        <div className="text-sm text-[#6B5B4E]">
          <p>
            Every file here is encrypted, visible only to your team and your attorney, and never
            used to train any AI model.
          </p>
          {ref?.holdsPhi && (
            <p className="mt-2 text-amber-700">
              Please redact patient- and client-identifying details before sharing — PHI stays out
              of this workspace by design.
            </p>
          )}
        </div>
      </div>

      {/* Needed from you */}
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-lg font-semibold text-[#1F1810]">What we need from you</h3>
          {needed.length > 0 && (
            <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/30">
              {needed.length} outstanding
            </span>
          )}
        </div>
        {needed.length === 0 ? (
          <div className="bg-white border border-[#1F1810]/10 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-6 text-center">
            <CheckCircle2 className="w-6 h-6 text-[#7A8B6F] mx-auto mb-2" />
            <p className="text-sm text-[#6B5B4E]">All caught up — nothing outstanding right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {needed.map((doc) => (
              <DocTile
                key={doc.id}
                doc={doc}
                uploading={uploadingDocId === doc.id}
                downloading={downloadingDocId === doc.id}
                error={errors[doc.id]}
                onUpload={handleUpload}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </div>

      {/* Shared & reviewed */}
      <div>
        <h3 className="text-lg font-semibold text-[#1F1810] mb-4">Shared documents</h3>
        {shared.length === 0 ? (
          <div className="bg-white border border-[#1F1810]/10 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-6 text-center">
            <p className="text-sm text-[#6B5B4E]">Documents you share will appear here, and you can download them anytime.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shared.map((doc) => (
              <DocTile
                key={doc.id}
                doc={doc}
                uploading={uploadingDocId === doc.id}
                downloading={downloadingDocId === doc.id}
                error={errors[doc.id]}
                onUpload={handleUpload}
                onDownload={handleDownload}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DocTile({
  doc,
  uploading,
  downloading,
  error,
  onUpload,
  onDownload,
}: {
  doc: DocCard;
  uploading: boolean;
  downloading: boolean;
  error?: string;
  onUpload: (doc: DocCard, file: File) => void;
  onDownload: (doc: DocCard) => void;
}) {
  const badge = STATE_BADGE[doc.state];
  const BadgeIcon = badge.icon;
  return (
    <div className="bg-white border border-[#1F1810]/10 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-semibold text-[#1F1810]">{doc.label}</p>
        <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full border shrink-0 ${badge.cls}`}>
          <BadgeIcon className="w-3 h-3" />
          {badge.label}
        </span>
      </div>
      {doc.description && <p className="text-xs text-[#6B5B4E] mt-1">{doc.description}</p>}

      {doc.state === "needed" && (
        <label
          className={`mt-3 inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all cursor-pointer ${
            uploading ? "bg-[#C17832]/50 text-white" : "bg-[#C17832] text-white hover:bg-[#A8621F]"
          }`}
        >
          {uploading ? (
            <><Loader2 className="w-3.5 h-3.5 animate-spin" />Uploading…</>
          ) : (
            <><Upload className="w-3.5 h-3.5" />Upload document</>
          )}
          <input
            type="file"
            className="hidden"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = "";
              if (file) onUpload(doc, file);
            }}
          />
        </label>
      )}

      {(doc.state === "received" || doc.state === "reviewed") && (
        <div className="mt-3 flex items-center gap-4">
          <button
            type="button"
            onClick={() => onDownload(doc)}
            disabled={downloading || !doc.storage_path}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C17832] hover:text-[#A8621F] transition-colors disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            {downloading ? "Opening…" : "Download"}
          </button>
          {doc.state === "received" && (
            <label className="inline-flex items-center gap-1 text-xs text-[#A89279] hover:text-[#6B5B4E] transition-colors cursor-pointer">
              <Upload className="w-3 h-3" />
              {uploading ? "Uploading…" : "Replace"}
              <input
                type="file"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) onUpload(doc, file);
                }}
              />
            </label>
          )}
        </div>
      )}

      {doc.state === "received" && doc.uploaded_at && (
        <p className="text-[11px] text-[#6B5B4E] mt-2">Received {formatDate(doc.uploaded_at)} — your attorney will review it.</p>
      )}
      {doc.state === "reviewed" && (
        <p className="text-[11px] text-[#7A8B6F] mt-2">Reviewed by your attorney.</p>
      )}
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}

      <p className="text-[10px] text-[#A89279] mt-3">
        Encrypted · visible only to your team and your attorney · never used to train AI
      </p>
    </div>
  );
}
