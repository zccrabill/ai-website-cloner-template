"use client";

import { useState, useRef, useCallback } from "react";
import DashboardShell from "@/components/DashboardShell";
import {
  FileText,
  Upload,
  Search,
  Trash2,
  Download,
  X,
  CheckCircle2,
} from "lucide-react";

interface UploadedDoc {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: Date;
  status: "uploading" | "uploaded" | "reviewing" | "ready";
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIcon(type: string): string {
  if (type.includes("pdf")) return "PDF";
  if (type.includes("word") || type.includes("document")) return "DOC";
  if (type.includes("image")) return "IMG";
  if (type.includes("text")) return "TXT";
  return "FILE";
}

const ACCEPTED =
  ".pdf,.doc,.docx,.txt,.rtf,.png,.jpg,.jpeg,.heic,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,image/*";

const MAX_SIZE_MB = 25;

export default function DocumentsPage() {
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [search, setSearch] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | File[]) => {
    setError(null);
    const fileArray = Array.from(files);
    const validFiles: UploadedDoc[] = [];
    const errors: string[] = [];

    for (const file of fileArray) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        errors.push(`${file.name} is too large (max ${MAX_SIZE_MB}MB)`);
        continue;
      }
      validFiles.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        uploadedAt: new Date(),
        status: "uploading",
      });
    }

    if (errors.length > 0) setError(errors.join(" · "));
    if (validFiles.length === 0) return;

    setDocs((prev) => [...validFiles, ...prev]);

    // Simulate upload + review pipeline
    validFiles.forEach((doc, idx) => {
      setTimeout(() => {
        setDocs((prev) =>
          prev.map((d) =>
            d.id === doc.id ? { ...d, status: "uploaded" as const } : d
          )
        );
      }, 800 + idx * 200);

      setTimeout(() => {
        setDocs((prev) =>
          prev.map((d) =>
            d.id === doc.id ? { ...d, status: "reviewing" as const } : d
          )
        );
      }, 1600 + idx * 200);

      setTimeout(() => {
        setDocs((prev) =>
          prev.map((d) =>
            d.id === doc.id ? { ...d, status: "ready" as const } : d
          )
        );
      }, 3200 + idx * 200);
    });
  }, []);

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

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = (id: string) => {
    setDocs((prev) => prev.filter((d) => d.id !== id));
  };

  const filtered = docs.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase())
  );

  const statusBadge = (status: UploadedDoc["status"]) => {
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
    }
  };

  return (
    <DashboardShell title="Documents">
      {/* Hidden native file input */}
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
            Your legal documents, contracts, and deliverables
          </p>
        </div>
        <button
          onClick={handleUploadClick}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1F1810] text-white rounded-lg text-sm font-medium hover:bg-[#C17832] transition-all"
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

      {/* Drop zone (always visible, doubles as empty state) */}
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
          {isDragging ? "Drop files to upload" : "Drag files here or click to browse"}
        </p>
        <p className="text-xs text-[#6B5B4E]">
          PDF, DOC, DOCX, TXT, or image files · Max {MAX_SIZE_MB}MB each
        </p>
        {docs.length === 0 && (
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

      {/* Document list */}
      {filtered.length > 0 && (
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
                      {doc.name}
                    </p>
                    <p className="text-xs text-[#A89279] mt-0.5">
                      {fileIcon(doc.type)} · {formatBytes(doc.size)} ·{" "}
                      {doc.uploadedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {statusBadge(doc.status)}
                  <button
                    className="p-2 hover:bg-[#1F1810]/5 rounded-lg transition-colors text-[#6B5B4E] hover:text-[#1F1810] opacity-0 group-hover:opacity-100"
                    aria-label="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
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

      {/* Empty hint when no docs uploaded yet */}
      {docs.length === 0 && (
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
