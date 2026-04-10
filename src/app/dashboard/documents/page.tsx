"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabase";
import {
  FileText,
  Upload,
  Search,
  Trash2,
  Download,
  X,
  CheckCircle2,
} from "lucide-react";

interface DocumentRow {
  id: string;
  user_id: string;
  filename: string;
  storage_path: string;
  size_bytes: number;
  mime_type: string | null;
  source: "client_upload" | "allora_draft" | "attorney_final";
  status: "uploading" | "uploaded" | "reviewing" | "ready" | "sent";
  uploaded_at: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileTypeLabel(mime: string | null): string {
  if (!mime) return "FILE";
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("word") || mime.includes("document")) return "DOC";
  if (mime.includes("image")) return "IMG";
  if (mime.includes("text")) return "TXT";
  return "FILE";
}

const ACCEPTED =
  ".pdf,.doc,.docx,.txt,.rtf,.png,.jpg,.jpeg,.heic,.webp,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/rtf,image/*";

const MAX_SIZE_MB = 25;

export default function DocumentsPage() {
  const [docs, setDocs] = useState<DocumentRow[]>([]);
  const [search, setSearch] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing documents on mount
  useEffect(() => {
    let mounted = true;

    const load = async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) {
        setLoading(false);
        return;
      }
      if (!mounted) return;
      setUserId(uid);

      const { data, error: dbErr } = await supabase
        .from("documents")
        .select("*")
        .order("uploaded_at", { ascending: false });

      if (dbErr) {
        setError(dbErr.message);
      } else if (data && mounted) {
        setDocs(data as DocumentRow[]);
      }
      setLoading(false);
    };

    load();
    return () => {
      mounted = false;
    };
  }, []);

  const uploadFile = useCallback(
    async (file: File, uid: string) => {
      const tempId = `temp-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 9)}`;

      // Optimistic uploading row
      const optimistic: DocumentRow = {
        id: tempId,
        user_id: uid,
        filename: file.name,
        storage_path: "",
        size_bytes: file.size,
        mime_type: file.type || "application/octet-stream",
        source: "client_upload",
        status: "uploading",
        uploaded_at: new Date().toISOString(),
      };
      setDocs((prev) => [optimistic, ...prev]);

      // Sanitize the filename to keep storage paths clean
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const storagePath = `${uid}/${Date.now()}_${safeName}`;

      // Upload to Storage
      const { error: upErr } = await supabase.storage
        .from("documents")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
          contentType: file.type || undefined,
        });

      if (upErr) {
        setDocs((prev) => prev.filter((d) => d.id !== tempId));
        setError(`${file.name}: ${upErr.message}`);
        return;
      }

      // Insert DB row
      const { data: row, error: dbErr } = await supabase
        .from("documents")
        .insert({
          user_id: uid,
          filename: file.name,
          storage_path: storagePath,
          size_bytes: file.size,
          mime_type: file.type || null,
          source: "client_upload",
          status: "uploaded",
        })
        .select()
        .single();

      if (dbErr || !row) {
        // Roll back the storage upload
        await supabase.storage.from("documents").remove([storagePath]);
        setDocs((prev) => prev.filter((d) => d.id !== tempId));
        setError(`${file.name}: ${dbErr?.message ?? "DB insert failed"}`);
        return;
      }

      // Replace optimistic row with real row
      setDocs((prev) => prev.map((d) => (d.id === tempId ? (row as DocumentRow) : d)));
    },
    []
  );

  const handleFiles = useCallback(
    async (files: FileList | File[]) => {
      setError(null);
      if (!userId) {
        setError("You must be signed in to upload documents.");
        return;
      }

      const fileArray = Array.from(files);
      const validFiles: File[] = [];
      const errs: string[] = [];

      for (const file of fileArray) {
        if (file.size > MAX_SIZE_MB * 1024 * 1024) {
          errs.push(`${file.name} is too large (max ${MAX_SIZE_MB}MB)`);
          continue;
        }
        validFiles.push(file);
      }

      if (errs.length > 0) setError(errs.join(" · "));
      // Upload sequentially so progress is visible and rate-limit-friendly
      for (const f of validFiles) {
        await uploadFile(f, userId);
      }
    },
    [userId, uploadFile]
  );

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (doc: DocumentRow) => {
    const ok = window.confirm(`Delete "${doc.filename}"? This cannot be undone.`);
    if (!ok) return;

    // Remove from storage first
    if (doc.storage_path) {
      await supabase.storage.from("documents").remove([doc.storage_path]);
    }
    const { error: delErr } = await supabase
      .from("documents")
      .delete()
      .eq("id", doc.id);
    if (delErr) {
      setError(delErr.message);
      return;
    }
    setDocs((prev) => prev.filter((d) => d.id !== doc.id));
  };

  const handleDownload = async (doc: DocumentRow) => {
    const { data, error: dlErr } = await supabase.storage
      .from("documents")
      .createSignedUrl(doc.storage_path, 60);
    if (dlErr || !data) {
      setError(dlErr?.message ?? "Failed to create download link");
      return;
    }
    window.open(data.signedUrl, "_blank");
  };

  const filtered = docs.filter((d) =>
    d.filename.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: DocumentRow["status"]) => {
    switch (status) {
      case "uploading":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#A89279]/15 text-[#6B5B4E] text-[10px] font-medium rounded-full uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-[#A89279] rounded-full animate-pulse" />
            Uploading
          </span>
        );
      case "uploaded":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#7A8B6F]/15 text-[#5A6B53] text-[10px] font-medium rounded-full uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" />
            Uploaded
          </span>
        );
      case "reviewing":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#C17832]/15 text-[#C17832] text-[10px] font-medium rounded-full uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-[#C17832] rounded-full animate-pulse" />
            Allora reviewing
          </span>
        );
      case "ready":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#1F1810] text-white text-[10px] font-medium rounded-full uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" />
            Ready
          </span>
        );
      case "sent":
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#C17832] text-white text-[10px] font-medium rounded-full uppercase tracking-wider">
            <CheckCircle2 className="w-3 h-3" />
            Delivered
          </span>
        );
    }
  };

  return (
    <DashboardShell title="Documents">
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={ACCEPTED}
        onChange={handleInputChange}
        className="hidden"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#1F1810] mb-1">Documents</h2>
          <p className="text-sm text-[#6B5B4E]">
            Securely stored. Only you and your attorney can see these.
          </p>
        </div>
        <button
          onClick={handleUploadClick}
          disabled={!userId}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1F1810] text-white rounded-lg text-sm font-medium hover:bg-[#C17832] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A89279]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search documents..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#1F1810]/8 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
        />
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between gap-3">
          <p className="text-sm text-red-700">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-red-700 hover:text-red-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={docs.length === 0 ? handleUploadClick : undefined}
        className={`mb-6 border-2 border-dashed rounded-2xl p-10 text-center transition-all ${
          isDragging
            ? "border-[#C17832] bg-[#C17832]/5"
            : "border-[#1F1810]/15 bg-white hover:border-[#C17832]/40"
        } ${docs.length === 0 ? "cursor-pointer" : ""}`}
      >
        <div className="w-14 h-14 bg-[#F5F0EB] rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Upload className="w-6 h-6 text-[#C17832]" />
        </div>
        <p className="text-sm font-semibold text-[#1F1810] mb-1">
          {isDragging
            ? "Drop files to upload"
            : "Drag files here or click to browse"}
        </p>
        <p className="text-xs text-[#6B5B4E]">
          PDF, DOC, DOCX, TXT, or image files · Max {MAX_SIZE_MB}MB each
        </p>
        {docs.length === 0 && !loading && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleUploadClick();
            }}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#C17832] text-white rounded-lg text-sm font-medium hover:bg-[#A8621F] transition-all"
          >
            <Upload className="w-4 h-4" />
            Choose files
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-center text-sm text-[#A89279] py-8">
          Loading your documents…
        </p>
      )}

      {/* Document list */}
      {!loading && filtered.length > 0 && (
        <div className="bg-white border border-[#1F1810]/8 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#1F1810]/8 flex items-center justify-between">
            <p className="text-xs font-semibold text-[#6B5B4E] uppercase tracking-wider">
              {filtered.length} document{filtered.length !== 1 ? "s" : ""}
            </p>
          </div>
          <ul className="divide-y divide-[#1F1810]/5">
            {filtered.map((doc) => (
              <li
                key={doc.id}
                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#FAF8F5] transition-colors group"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <div className="w-10 h-10 bg-[#F5F0EB] rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-[#C17832]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-[#1F1810] truncate">
                      {doc.filename}
                    </p>
                    <p className="text-xs text-[#A89279] mt-0.5">
                      {fileTypeLabel(doc.mime_type)} ·{" "}
                      {formatBytes(doc.size_bytes)} ·{" "}
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {statusBadge(doc.status)}
                  {doc.storage_path && (
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-2 hover:bg-[#1F1810]/5 rounded-lg transition-colors text-[#6B5B4E] hover:text-[#1F1810] opacity-0 group-hover:opacity-100"
                      aria-label="Download"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(doc)}
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors text-[#6B5B4E] hover:text-red-600 opacity-0 group-hover:opacity-100"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Empty hint */}
      {!loading && docs.length === 0 && (
        <p className="text-xs text-center text-[#A89279] mt-4">
          Documents created by Allora or uploaded by you appear here. Need
          help?{" "}
          <a
            href="/dashboard/chat"
            className="text-[#C17832] hover:underline font-medium"
          >
            Chat with Allora →
          </a>
        </p>
      )}
    </DashboardShell>
  );
}
