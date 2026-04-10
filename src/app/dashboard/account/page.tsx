"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabase";
import { getTier, OVERAGE_PRICE_PER_PAGE_USD } from "@/lib/tiers";
import { CreditCard, Mail, Shield, ExternalLink } from "lucide-react";

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [rawTier, setRawTier] = useState<string>("explore");
  const [subStatus, setSubStatus] = useState<string>("inactive");
  const [workItemsUsed, setWorkItemsUsed] = useState(0);

  const loadProfile = useCallback(async () => {
    const { data: sess } = await supabase.auth.getSession();
    const session = sess.session;
    if (!session) {
      setEmail("");
      setFullName("");
      setRawTier("explore");
      setSubStatus("inactive");
      setWorkItemsUsed(0);
      return;
    }

    setEmail(session.user.email ?? "");

    const [memberRes, usageRes] = await Promise.all([
      supabase
        .from("members")
        .select("full_name, subscription_tier, subscription_status")
        .eq("user_id", session.user.id)
        .maybeSingle(),
      supabase.rpc("get_usage_this_period", { p_user_id: session.user.id }),
    ]);

    setFullName(memberRes.data?.full_name ?? "");
    setRawTier(memberRes.data?.subscription_tier ?? "explore");
    setSubStatus(memberRes.data?.subscription_status ?? "inactive");
    setWorkItemsUsed(typeof usageRes.data === "number" ? usageRes.data : 0);
  }, []);

  useEffect(() => {
    loadProfile();
    const { data: authListener } = supabase.auth.onAuthStateChange(() => {
      loadProfile();
    });
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const handleSaveName = async () => {
    setSavingName(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;
      await supabase
        .from("members")
        .update({ full_name: fullName })
        .eq("user_id", uid);
    } finally {
      setSavingName(false);
    }
  };

  const tier = getTier(rawTier);
  const tierLabel = tier.label;
  const isFreeTier = tier.key === "explore";
  const workItemsLimit = tier.workItemsPerMonth;
  const workItemsRemaining = Math.max(workItemsLimit - workItemsUsed, 0);
  const isOverLimit = !isFreeTier && workItemsUsed >= workItemsLimit;

  return (
    <DashboardShell title="My Account">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#1F1810] mb-1">My Account</h2>
        <p className="text-sm text-[#6B5B4E]">
          Manage your profile, subscription, and preferences
        </p>
      </div>

      <div className="space-y-6 max-w-2xl">
        {/* Profile */}
        <div className="bg-white border border-[#1F1810]/8 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-5 h-5 text-[#C17832]" />
            <h3 className="text-lg font-semibold text-[#1F1810]">Profile</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#6B5B4E] mb-1.5">
                Email Address
              </label>
              <p className="text-sm text-[#1F1810] bg-[#F5F0EB] px-4 py-2.5 rounded-lg">
                {email || "Loading..."}
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B5B4E] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-2.5 bg-white border border-[#1F1810]/8 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
              />
            </div>
            <button
              onClick={handleSaveName}
              disabled={savingName}
              className="px-4 py-2 bg-[#1F1810] text-white rounded-lg text-sm font-medium hover:bg-[#C17832] transition-all disabled:opacity-50"
            >
              {savingName ? "Saving…" : "Save Changes"}
            </button>
          </div>
        </div>

        {/* Subscription */}
        <div className="bg-white border border-[#1F1810]/8 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-5 h-5 text-[#C17832]" />
            <h3 className="text-lg font-semibold text-[#1F1810]">
              Subscription
            </h3>
          </div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-medium text-[#1F1810]">
                Current Plan:{" "}
                <span className="text-[#C17832] font-bold">{tierLabel}</span>
              </p>
              <p className="text-xs text-[#6B5B4E] mt-1 capitalize">
                Status: {subStatus}
              </p>
            </div>
            <Link
              href="/#pricing"
              className="text-sm text-[#C17832] font-medium hover:text-[#A8621F] transition-colors"
            >
              Change Plan
            </Link>
          </div>

          {/* Usage this period */}
          <div
            className={`mb-4 rounded-lg border p-4 ${
              isOverLimit
                ? "border-[#C17832]/40 bg-[#C17832]/5"
                : "border-[#1F1810]/8 bg-[#F5F0EB]/50"
            }`}
          >
            <div className="flex items-baseline justify-between">
              <p className="text-xs font-medium text-[#6B5B4E]">
                Attorney Work This Month
              </p>
              {!isFreeTier && (
                <p className="text-[10px] text-[#A89279]">
                  Resets monthly
                </p>
              )}
            </div>
            {isFreeTier ? (
              <>
                <p className="mt-2 text-2xl font-bold text-[#A89279]">—</p>
                <p className="text-xs text-[#6B5B4E] mt-1">
                  Upgrade to Build, Grow, or Lead to unlock attorney reviews
                  and consultations.
                </p>
              </>
            ) : (
              <>
                <p className="mt-2 text-2xl font-bold text-[#1F1810]">
                  {workItemsUsed}
                  <span className="text-base text-[#A89279]">
                    {" "}
                    / {workItemsLimit} used
                  </span>
                </p>
                <p className="text-xs text-[#6B5B4E] mt-1">
                  {isOverLimit
                    ? `You've used your allotment. Additional reviews bill at $${OVERAGE_PRICE_PER_PAGE_USD}/page.`
                    : `${workItemsRemaining} remaining. A work item is any matter review or 30-min consultation.`}
                </p>
              </>
            )}
          </div>

          <a
            href="https://billing.stripe.com/p/login/test_yourportallink"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-[#6B5B4E] hover:text-[#1F1810] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            Manage billing on Stripe
          </a>
        </div>

        {/* Security */}
        <div className="bg-white border border-[#1F1810]/8 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-[#C17832]" />
            <h3 className="text-lg font-semibold text-[#1F1810]">Security</h3>
          </div>
          <p className="text-sm text-[#6B5B4E] mb-4">
            Your account uses passwordless magic link authentication. A secure
            link is sent to your email each time you sign in.
          </p>
          <p className="text-xs text-[#A89279]">
            Last sign-in: Today
          </p>
        </div>
      </div>
    </DashboardShell>
  );
}
