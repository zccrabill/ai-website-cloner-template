"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabase";
import { getTier, OVERAGE_PRICE_PER_PAGE_USD } from "@/lib/tiers";
import {
  FileCheck,
  Briefcase,
  Shield,
  CheckCircle,
  Scale,
  Users,
} from "lucide-react";

export default function DashboardPage() {
  const [rawTier, setRawTier] = useState<string>("explore");
  const [subStatus, setSubStatus] = useState<string>("inactive");
  const [conversationsCount, setConversationsCount] = useState(0);
  const [documentsCount, setDocumentsCount] = useState(0);
  const [workItemsUsed, setWorkItemsUsed] = useState(0);

  const loadDashboard = useCallback(async () => {
    const { data: sess } = await supabase.auth.getSession();
    const session = sess.session;
    if (!session) {
      setRawTier("explore");
      setSubStatus("inactive");
      setConversationsCount(0);
      setDocumentsCount(0);
      setWorkItemsUsed(0);
      return;
    }

    // Subscription tier + status from members table
    const { data: member } = await supabase
      .from("members")
      .select("subscription_tier, subscription_status")
      .eq("user_id", session.user.id)
      .maybeSingle();

    setRawTier(member?.subscription_tier ?? "explore");
    setSubStatus(member?.subscription_status ?? "inactive");

    // Live usage counts + this-period attorney work, scoped by RLS + explicit
    // user_id filter. get_usage_this_period is a security-definer function.
    const [convRes, docRes, usageRes] = await Promise.all([
      supabase
        .from("conversations")
        .select("id", { count: "exact", head: true })
        .eq("user_id", session.user.id),
      supabase
        .from("documents")
        .select("id", { count: "exact", head: true })
        .eq("user_id", session.user.id),
      supabase.rpc("get_usage_this_period", { p_user_id: session.user.id }),
    ]);

    setConversationsCount(convRes.count ?? 0);
    setDocumentsCount(docRes.count ?? 0);
    setWorkItemsUsed(
      typeof usageRes.data === "number" ? usageRes.data : 0
    );
  }, []);

  useEffect(() => {
    // loadDashboard awaits getSession before touching state, so all setState
    // calls happen after a microtask boundary. The lint rule still flags this
    // because it traces into the useCallback body; safe to disable here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboard();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadDashboard();
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadDashboard]);

  const tier = getTier(rawTier);
  const tierLabel = tier.label;
  const isFreeTier = tier.key === "explore";
  const workItemsLimit = tier.workItemsPerMonth;
  const workItemsRemaining = Math.max(workItemsLimit - workItemsUsed, 0);
  const isOverLimit = !isFreeTier && workItemsUsed >= workItemsLimit;

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
        <p className="text-[#6B5B4E]">
          Your {tierLabel} plan is ready when you are.
        </p>
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
          <Link
            href="/#pricing"
            className="text-xs font-medium text-amber-600 hover:text-amber-700 transition-colors"
          >
            View Plans →
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-[#1F1810]/8 rounded-lg p-6 hover:border-[#1F1810]/12 transition-all">
          <p className="text-xs font-medium text-[#6B5B4E] mb-2">Current Plan</p>
          <p className="text-3xl font-bold text-[#C17832]">{tierLabel}</p>
          <p className="text-[10px] text-[#A89279] mt-1 capitalize">
            {subStatus}
          </p>
        </div>
        <div
          className={`bg-white border rounded-lg p-6 transition-all ${
            isOverLimit
              ? "border-[#C17832]/40"
              : "border-[#1F1810]/8 hover:border-[#1F1810]/12"
          }`}
        >
          <p className="text-xs font-medium text-[#6B5B4E] mb-2">
            Attorney Work This Month
          </p>
          {isFreeTier ? (
            <>
              <p className="text-3xl font-bold text-[#A89279]">—</p>
              <p className="text-[10px] text-[#A89279] mt-1">
                Upgrade to unlock
              </p>
            </>
          ) : (
            <>
              <p className="text-3xl font-bold text-[#1F1810]">
                {workItemsUsed}
                <span className="text-lg text-[#A89279]"> / {workItemsLimit}</span>
              </p>
              <p className="text-[10px] text-[#A89279] mt-1">
                {isOverLimit
                  ? `Overage: $${OVERAGE_PRICE_PER_PAGE_USD}/page`
                  : `${workItemsRemaining} remaining`}
              </p>
            </>
          )}
        </div>
        <div className="bg-white border border-[#1F1810]/8 rounded-lg p-6 hover:border-[#1F1810]/12 transition-all">
          <p className="text-xs font-medium text-[#6B5B4E] mb-2">
            Allora Conversations
          </p>
          <p className="text-3xl font-bold text-[#1F1810]">{conversationsCount}</p>
        </div>
        <div className="bg-white border border-[#1F1810]/8 rounded-lg p-6 hover:border-[#1F1810]/12 transition-all">
          <p className="text-xs font-medium text-[#6B5B4E] mb-2">Documents</p>
          <p className="text-3xl font-bold text-[#1F1810]">{documentsCount}</p>
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
          {conversationsCount === 0 && documentsCount === 0 ? (
            <div className="text-center py-8">
              <p className="text-[#6B5B4E] text-sm">No activity yet</p>
              <p className="text-[#A89279] text-xs mt-1">
                Start by chatting with Allora or scheduling a consultation
              </p>
            </div>
          ) : (
            <div className="text-sm text-[#6B5B4E]">
              You have{" "}
              <span className="font-semibold text-[#1F1810]">
                {conversationsCount}
              </span>{" "}
              conversation{conversationsCount === 1 ? "" : "s"} and{" "}
              <span className="font-semibold text-[#1F1810]">
                {documentsCount}
              </span>{" "}
              document{documentsCount === 1 ? "" : "s"} on file.
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
