"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { supabase } from "@/lib/supabase";
import { useEngagementRef } from "@/lib/useEngagementRef";
import { fetchPendingAgreement, type EngagementAgreement } from "@/lib/engagementAgreement";
import { ShieldCheck, Lock, Check, PenLine } from "lucide-react";

// Focused, full-screen engagement-agreement signing gate. A FAIIR client who
// has just set a password lands here: they read their firm-specific agreement,
// type their name to adopt it as an electronic signature, and enter their
// workspace. Replaces the offline countersigned-PDF flow. The signature record
// (identity, typed name, agreement version + SHA-256, timestamp, UA) is written
// server-side by accept_engagement_agreement().

// Render agreement markdown with the portal's type treatment — no dependency on
// a typography plugin; each element is styled explicitly.
const MD: Components = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-[#1F1810] mt-2 mb-3">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-base font-bold text-[#1F1810] mt-6 mb-2 pb-1 border-b border-[#1F1810]/8">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold text-[#1F1810] mt-4 mb-1">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="text-[13.5px] leading-relaxed text-[#4a4036] mb-3">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 mb-3 space-y-1.5 text-[13.5px] text-[#4a4036]">{children}</ul>
  ),
  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
  strong: ({ children }) => <strong className="font-semibold text-[#1F1810]">{children}</strong>,
  hr: () => <hr className="my-5 border-[#1F1810]/10" />,
  a: ({ children, href }) => (
    <a href={href} className="text-[#C17832] underline">
      {children}
    </a>
  ),
};

// Presentational view — pure, so it can be rendered from real data (the gate
// container) or from a fixture (a dev preview) without a session.
export function AgreementView({
  agreement,
  orgName,
  typedName,
  onTypedName,
  typedTitle,
  onTypedTitle,
  agreed,
  onAgreed,
  submitting,
  error,
  canSign,
  onSign,
  onSignOut,
}: {
  agreement: EngagementAgreement;
  orgName: string;
  typedName: string;
  onTypedName: (v: string) => void;
  typedTitle: string;
  onTypedTitle: (v: string) => void;
  agreed: boolean;
  onAgreed: (v: boolean) => void;
  submitting: boolean;
  error: string;
  canSign: boolean;
  onSign: () => void;
  onSignOut: () => void;
}) {
  return (
    <div className="min-h-screen bg-[#FAF8F5]">
      {/* Header */}
      <header className="border-b border-[#1F1810]/8 bg-white">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image src="/images/faiir-logo.png" alt="FAIIR" width={36} height={36} className="object-contain" />
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C17832]">
                FAIIR · AI Governance
              </p>
              <p className="text-sm font-semibold text-[#1F1810] leading-tight">{orgName || "Your firm"}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onSignOut}
            className="text-xs font-medium text-[#6B5B4E] hover:text-[#1F1810] transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Intro */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#1F1810] mb-1">One quick step before we begin</h1>
          <p className="text-[#6B5B4E] text-sm">
            Please review and sign your engagement agreement below. It takes a moment — no printing, no
            email, no PDF to send back.
          </p>
        </div>

        {/* Trust strip */}
        <div className="mb-5 flex items-center gap-2.5 text-xs text-[#6B5B4E] bg-[#7A8B6F]/8 border border-[#7A8B6F]/25 rounded-lg px-3.5 py-2.5">
          <ShieldCheck className="w-4 h-4 text-[#7A8B6F] shrink-0" />
          <span>
            Your signature is recorded securely with the date, time, and a fingerprint of this exact
            document — a valid electronic signature under the ESIGN Act and Colorado&apos;s UETA.
          </span>
        </div>

        {/* Agreement body */}
        <div className="bg-white border border-[#1F1810]/10 rounded-xl shadow-[0_2px_8px_rgb(31_24_16/0.06)]">
          <div className="max-h-[52vh] overflow-y-auto px-6 py-5">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MD}>
              {agreement.body_md}
            </ReactMarkdown>
          </div>
        </div>

        {/* Sign panel */}
        <div className="mt-5 bg-white border border-[#C17832]/30 rounded-xl shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-6">
          <p className="text-sm font-semibold text-[#1F1810] flex items-center gap-2 mb-4">
            <PenLine className="w-4 h-4 text-[#C17832]" />
            Sign your agreement
          </p>

          <label className="flex items-start gap-3 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => onAgreed(e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-[#C17832] shrink-0"
            />
            <span className="text-[13px] text-[#4a4036] leading-relaxed">
              I have read and agree to this Engagement Agreement, including the Artificial Intelligence
              Disclosure (Section 7) and Exhibit A, and I have authority to bind{" "}
              <span className="font-semibold text-[#1F1810]">{orgName || "my firm"}</span>. By typing my
              name below I adopt it as my electronic signature.
            </span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-[11px] font-medium text-[#6B5B4E] mb-1">Type your full name</label>
              <input
                type="text"
                value={typedName}
                onChange={(e) => onTypedName(e.target.value)}
                placeholder={agreement.signatory_name ?? "Your full name"}
                autoComplete="name"
                className="w-full px-3 py-2.5 border border-[#1F1810]/15 rounded-lg text-sm text-[#1F1810] focus:outline-none focus:border-[#C17832] focus:ring-1 focus:ring-[#C17832]/30"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-[#6B5B4E] mb-1">Your title</label>
              <input
                type="text"
                value={typedTitle}
                onChange={(e) => onTypedTitle(e.target.value)}
                placeholder="e.g. Partner"
                className="w-full px-3 py-2.5 border border-[#1F1810]/15 rounded-lg text-sm text-[#1F1810] focus:outline-none focus:border-[#C17832] focus:ring-1 focus:ring-[#C17832]/30"
              />
            </div>
          </div>

          {typedName.trim() && (
            <div className="mb-4 px-4 py-3 bg-[#FAF8F5] border border-[#1F1810]/8 rounded-lg">
              <p className="text-[10px] uppercase tracking-widest text-[#A89279] mb-1">Signature preview</p>
              <p
                className="text-2xl text-[#1F1810]"
                style={{ fontFamily: "'Segoe Script','Snell Roundhand','Brush Script MT',cursive" }}
              >
                {typedName.trim()}
              </p>
            </div>
          )}

          {error && <p className="text-xs text-red-600 mb-3">{error}</p>}

          <button
            type="button"
            onClick={onSign}
            disabled={!canSign}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#1F1810] text-white rounded-lg text-sm font-semibold hover:bg-[#C17832] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Recording your signature…
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Agree &amp; continue to your workspace
              </>
            )}
          </button>

          <p className="mt-3 text-[11px] text-[#A89279] flex items-center gap-1.5 justify-center">
            <Lock className="w-3 h-3" />
            {agreement.fee_text ? `Flat fee ${agreement.fee_text} · ` : ""}
            Available Law, LLC countersigns on acceptance.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function EngagementAgreementGate() {
  const router = useRouter();
  // Resolve the seat/engagement WITHOUT the agreement redirect — this page is
  // the destination of that redirect, so enforcing it here would loop.
  const { ref, loading: refLoading } = useEngagementRef({ enforceAgreement: false });

  const [agreement, setAgreement] = useState<EngagementAgreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [typedName, setTypedName] = useState("");
  const [typedTitle, setTypedTitle] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const engagementId = ref?.engagementId;

  const load = useCallback(async () => {
    if (!engagementId) return;
    const pending = await fetchPendingAgreement(engagementId);
    if (!pending) {
      // Already signed, or nothing to sign — send them into the workspace.
      router.replace("/dashboard");
      return;
    }
    setAgreement(pending);
    setTypedTitle(pending.signatory_title ?? "");
    setLoading(false);
  }, [engagementId, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const canSign = useMemo(
    () => agreed && typedName.trim().length >= 2 && !submitting,
    [agreed, typedName, submitting]
  );

  const handleSign = async () => {
    if (!agreement || !canSign) return;
    setSubmitting(true);
    setError("");
    const { error: rpcError } = await supabase.rpc("accept_engagement_agreement", {
      p_agreement_id: agreement.id,
      p_signer_name: typedName.trim(),
      p_signer_title: typedTitle.trim() || null,
      p_user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
    if (rpcError) {
      setError(
        "We couldn't record your signature just now. Please try again, or email zachariah@availablelaw.com."
      );
      setSubmitting(false);
      return;
    }
    router.replace("/dashboard");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (refLoading || loading || !agreement) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#C17832]/20 border-t-[#C17832] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#6B5B4E]">Opening your agreement…</p>
        </div>
      </div>
    );
  }

  return (
    <AgreementView
      agreement={agreement}
      orgName={ref?.orgName ?? ""}
      typedName={typedName}
      onTypedName={setTypedName}
      typedTitle={typedTitle}
      onTypedTitle={setTypedTitle}
      agreed={agreed}
      onAgreed={setAgreed}
      submitting={submitting}
      error={error}
      canSign={canSign}
      onSign={handleSign}
      onSignOut={handleSignOut}
    />
  );
}
