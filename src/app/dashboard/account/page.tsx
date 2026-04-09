"use client";

import { useState, useEffect } from "react";
import DashboardShell from "@/components/DashboardShell";
import { supabase } from "@/lib/supabase";
import { CreditCard, Mail, Shield, ExternalLink } from "lucide-react";

export default function AccountPage() {
  const [email, setEmail] = useState("");

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setEmail(session.user.email);
      }
    };
    getUser();
  }, []);

  const userTier = "Grow"; // Placeholder

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
                placeholder="Enter your full name"
                className="w-full px-4 py-2.5 bg-white border border-[#1F1810]/8 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
              />
            </div>
            <button className="px-4 py-2 bg-[#1F1810] text-white rounded-lg text-sm font-medium hover:bg-[#C17832] transition-all">
              Save Changes
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
                <span className="text-[#C17832] font-bold">{userTier}</span>
              </p>
              <p className="text-xs text-[#6B5B4E] mt-1">
                Next billing date: May 9, 2026
              </p>
            </div>
            <a
              href="/#pricing"
              className="text-sm text-[#C17832] font-medium hover:text-[#A8621F] transition-colors"
            >
              Change Plan
            </a>
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
