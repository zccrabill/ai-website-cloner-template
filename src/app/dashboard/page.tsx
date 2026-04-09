"use client";

import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import {
  FileCheck,
  Briefcase,
  Shield,
  CheckCircle,
  Scale,
  Users,
} from "lucide-react";

export default function DashboardPage() {
  const userTier: string = "Grow"; // Placeholder - will be fetched from subscription data
  const isFreeTier = userTier === "Explore";

  const stats = {
    conversations: 0,
    consultations:
      userTier === "Build" ? 0 : userTier === "Grow" ? 1 : userTier === "Lead" ? 2 : 0,
    documents: 0,
    billingDate: "May 9, 2026",
  };

  const quickActions = [
    { icon: FileCheck, label: "Review a Contract", href: "/dashboard/chat?action=contract-review" },
    { icon: Briefcase, label: "Form a Business", href: "/dashboard/chat?action=business-formation" },
    { icon: Shield, label: "Protect My IP", href: "/dashboard/chat?action=ip-protection" },
    { icon: CheckCircle, label: "Check Compliance", href: "/dashboard/chat?action=compliance" },
    { icon: Scale, label: "Employment Law", href: "/dashboard/chat?action=employment" },
    { icon: Users, label: "Book Attorney", href: "/dashboard/schedule" },
  ];

  return (
    <DashboardShell title="Dashboard">
      {/* Greeting */}
      <div className="mb-10">
        <h2 className="text-3xl font-bold text-[#1F1810] mb-2">Welcome back</h2>
        <p className="text-[#6B5B4E]">Your legal solutions are ready when you are.</p>
      </div>

      {/* Tier Indicator */}
      {isFreeTier && (
        <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-amber-600">No Active Plan</p>
            <p className="text-xs text-amber-600/80 mt-1">
              Upgrade to Build, Grow, or Lead to unlock full features
            </p>
          </div>
          <a
            href="/#pricing"
            className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
          >
            View Plans →
          </a>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[#1F1810]/8 rounded-lg p-6 hover:border-[#1F1810]/12 transition-all">
          <p className="text-xs font-medium text-[#6B5B4E] mb-2">Allora Conversations</p>
          <p className="text-3xl font-bold text-[#1F1810]">{stats.conversations}</p>
        </div>
        <div className="bg-white border border-[#1F1810]/8 rounded-lg p-6 hover:border-[#1F1810]/12 transition-all">
          <p className="text-xs font-medium text-[#6B5B4E] mb-2">Consultations Remaining</p>
          <p className="text-3xl font-bold text-[#C17832]">{stats.consultations}</p>
        </div>
        <div className="bg-white border border-[#1F1810]/8 rounded-lg p-6 hover:border-[#1F1810]/12 transition-all">
          <p className="text-xs font-medium text-[#6B5B4E] mb-2">Documents This Month</p>
          <p className="text-3xl font-bold text-[#1F1810]">{stats.documents}</p>
        </div>
        <div className="bg-white border border-[#1F1810]/8 rounded-lg p-6 hover:border-[#1F1810]/12 transition-all">
          <p className="text-xs font-medium text-[#6B5B4E] mb-2">Next Billing Date</p>
          <p className="text-sm font-semibold text-[#1F1810]">{stats.billingDate}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-10">
        <h3 className="text-lg font-semibold text-[#1F1810] mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <Link
                key={idx}
                href={action.href}
                className="flex items-center gap-3 bg-white border border-[#1F1810]/8 rounded-lg p-4 hover:border-[#C17832]/30 hover:bg-[#F5F0EB] transition-all group"
              >
                <Icon className="w-6 h-6 text-[#C17832] group-hover:text-[#A8621F] transition-colors" />
                <span className="text-sm font-medium text-[#6B5B4E] group-hover:text-[#1F1810] transition-colors">
                  {action.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-semibold text-[#1F1810] mb-4">Recent Activity</h3>
        <div className="bg-white border border-[#1F1810]/8 rounded-lg p-6">
          <div className="text-center py-8">
            <p className="text-[#6B5B4E] text-sm">No activity yet</p>
            <p className="text-[#A89279] text-xs mt-1">
              Start by chatting with Allora or scheduling a consultation
            </p>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
