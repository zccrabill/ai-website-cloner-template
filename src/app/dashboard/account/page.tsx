"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabase";
import { getActiveOrgSeat } from "@/lib/engagement";
import { getTier, OVERAGE_PRICE_PER_PAGE_USD } from "@/lib/tiers";
import { Briefcase, CreditCard, Mail, Shield, ExternalLink } from "lucide-react";

// Stripe Billing Portal entry URL. Set in Netlify env vars at build time
// (NEXT_PUBLIC_* is inlined). Leave unset on test deploys to suppress the
// link entirely rather than showing the placeholder test URL.
//
// Get this from: Stripe Dashboard → Settings → Billing → Customer portal →
// "Login link" (login.stripe.com/.../login/...). Stripe will email the
// customer a one-time code to authenticate into the portal.
//
// For a smoother UX (no email confirmation step), implement a
// create-billing-portal-session edge function that calls stripe.billingPortal
// .sessions.create({ customer: stripeCustomerId, return_url }) for the
// logged-in member and returns the session url. Wire it here and you can
// drop the static link entirely.
const BILLING_PORTAL_URL =
  process.env.NEXT_PUBLIC_STRIPE_BILLING_PORTAL_URL ?? "";

// Engagement summary shown to FAIIR clients in place of the SMB subscription
// card — their relationship is a fixed-fee engagement, not a membership tier.
interface EngagementSummary {
  orgName: string;
  title: string;
  status: string;
  feeCents: number | null;
}

const ENGAGEMENT_STATUS_LABEL: Record<string, string> = {
  draft: "Preparing kickoff",
  invited: "Getting started",
  active: "In motion",
  closed: "Complete",
};

export default function AccountPage() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [rawTier, setRawTier] = useState<string>("explore");
  const [subStatus, setSubStatus] = useState<string>("inactive");
  const [workItemsUsed, setWorkItemsUsed] = useState(0);
  const [engagement, setEngagement] = useState<EngagementSummary | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwNotice, setPwNotice] = useState("");

  const loadProfile = useCallback(async () => {
    const { data: sess } = await supabase.auth.getSession();
    const session = sess.session;
    if (!session) {
      setEmail("");
      setFullName("");
      setRawTier("explore");
      setSubStatus("inactive");
      setWorkItemsUsed(0);
      setEngagement(null);
      return;
    }

    setEmail(session.user.email ?? "");

    // FAIIR engagement clients see their engagement, not subscription tiers.
    const orgId = await getActiveOrgSeat(session.user.id);
    if (orgId) {
      const [orgRes, engRes, memberRes] = await Promise.all([
        supabase.from("orgs").select("name").eq("id", orgId).maybeSingle(),
        supabase
          .from("engagements")
          .select("title, status, fee_cents")
          .eq("org_id", orgId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("members")
          .select("full_name")
          .eq("user_id", session.user.id)
          .maybeSingle(),
      ]);
      setFullName(memberRes.data?.full_name ?? "");
      setEngagement({
        orgName: orgRes.data?.name ?? "",
        title: engRes.data?.title ?? "FAIIR Engagement",
        status: engRes.data?.status ?? "active",
        feeCents: engRes.data?.fee_cents ?? null,
      });
      return;
    }

    setEngagement(null);
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
      const userEmail = sess.session?.user.email;
      if (!uid || !userEmail) return;
      // Upsert, not update: FAIIR engagement clients have no members row
      // (they never go through the SMB onboarding wizard), so an update
      // would silently match zero rows.
      await supabase
        .from("members")
        .upsert(
          { user_id: uid, email: userEmail, full_name: fullName },
          { onConflict: "user_id" }
        );
    } finally {
      setSavingName(false);
    }
  };

  const handleChangePassword = async () => {
    setPwError("");
    setPwNotice("");
    if (newPassword.length < 8) {
      setPwError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError("Passwords don't match.");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      setPwError(error.message);
      return;
    }
    setNewPassword("");
    setConfirmPassword("");
    setPwNotice("Password updated.");
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
          {engagement
            ? "Manage your profile and preferences"
            : "Manage your profile, subscription, and preferences"}
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

        {/* FAIIR engagement clients: engagement summary instead of tiers */}
        {engagement && (
          <div className="bg-white border border-[#1F1810]/8 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Briefcase className="w-5 h-5 text-[#C17832]" />
              <h3 className="text-lg font-semibold text-[#1F1810]">
                Your Engagement
              </h3>
            </div>
            <p className="text-sm font-medium text-[#1F1810]">
              {engagement.title}
            </p>
            <p className="text-xs text-[#6B5B4E] mt-1">
              {engagement.orgName}
              {" · "}
              <span className="text-[#C17832]">
                {ENGAGEMENT_STATUS_LABEL[engagement.status] ?? engagement.status}
              </span>
              {engagement.feeCents !== null && (
                <>
                  {" · "}${(engagement.feeCents / 100).toLocaleString()} fixed
                  fee
                </>
              )}
            </p>
            <a
              href="mailto:zachariah@availablelaw.com?subject=Engagement%20question"
              className="mt-4 inline-flex items-center gap-2 text-sm text-[#6B5B4E] hover:text-[#1F1810] transition-colors"
            >
              <Mail className="w-4 h-4" />
              Questions about your engagement or billing? Email Zachariah
            </a>
          </div>
        )}

        {/* Subscription (SMB members only) */}
        {!engagement && (
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
                    : `${workItemsRemaining} remaining. An attorney task is any reviewed document or 30-min consult.`}
                </p>
              </>
            )}
          </div>

          {BILLING_PORTAL_URL ? (
            <a
              href={BILLING_PORTAL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-[#6B5B4E] hover:text-[#1F1810] transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Manage billing on Stripe
            </a>
          ) : (
            <a
              href="mailto:zachariah@availablelaw.com?subject=Billing%20change%20request"
              className="inline-flex items-center gap-2 text-sm text-[#6B5B4E] hover:text-[#1F1810] transition-colors"
            >
              <Mail className="w-4 h-4" />
              Email us for billing changes
            </a>
          )}
        </div>
        )}

        {/* Security — change password */}
        <div className="bg-white border border-[#1F1810]/8 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-5 h-5 text-[#C17832]" />
            <h3 className="text-lg font-semibold text-[#1F1810]">Security</h3>
          </div>
          <p className="text-sm text-[#6B5B4E] mb-4">
            Update the password you use to sign in.
          </p>
          {pwNotice && (
            <div className="mb-4 p-3 bg-[#7A8B6F]/10 border border-[#7A8B6F]/30 rounded-lg">
              <p className="text-sm text-[#5A6B53]">{pwNotice}</p>
            </div>
          )}
          {pwError && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-500">{pwError}</p>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#6B5B4E] mb-1.5">
                New Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full px-4 py-2.5 bg-white border border-[#1F1810]/8 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#6B5B4E] mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className="w-full px-4 py-2.5 bg-white border border-[#1F1810]/8 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={savingPassword || !newPassword || !confirmPassword}
              className="px-4 py-2 bg-[#1F1810] text-white rounded-lg text-sm font-medium hover:bg-[#C17832] transition-all disabled:opacity-50"
            >
              {savingPassword ? "Updating…" : "Update Password"}
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
