"use client";

import DashboardShell from "@/components/DashboardShell";
import { FileText, Upload, Search } from "lucide-react";

export default function DocumentsPage() {
  return (
    <DashboardShell title="Documents">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[#1F1810] mb-1">Documents</h2>
          <p className="text-sm text-[#6B5B4E]">
            Your legal documents, contracts, and deliverables
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#1F1810] text-white rounded-lg text-sm font-medium hover:bg-[#C17832] transition-all">
          <Upload className="w-4 h-4" />
          Upload
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A89279]" />
        <input
          type="text"
          placeholder="Search documents..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#1F1810]/8 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
        />
      </div>

      {/* Empty State */}
      <div className="bg-white border border-[#1F1810]/8 rounded-lg p-12">
        <div className="text-center">
          <div className="w-16 h-16 bg-[#F5F0EB] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-[#A89279]" />
          </div>
          <h3 className="text-lg font-semibold text-[#1F1810] mb-2">
            No documents yet
          </h3>
          <p className="text-sm text-[#6B5B4E] max-w-sm mx-auto mb-6">
            Documents created by Allora or uploaded by you will appear here.
            Start a conversation to get your first legal document.
          </p>
          <a
            href="/dashboard/chat"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C17832] text-white rounded-lg text-sm font-medium hover:bg-[#A8621F] transition-all"
          >
            Chat with Allora
          </a>
        </div>
      </div>
    </DashboardShell>
  );
}
