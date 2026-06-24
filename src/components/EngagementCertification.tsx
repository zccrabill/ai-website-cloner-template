"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useEngagementRef } from "@/lib/useEngagementRef";
import { downloadCertificatePdf } from "@/lib/certificatePdf";
import { Download, Copy, Check, ShieldCheck, Sparkles, Lock, Megaphone, Code } from "lucide-react";

interface Certification {
  firm_name: string;
  certificate_number: string;
  tier: string;
  issued_at: string;
  expires_at: string;
  status: string;
}

const SEAL_URL = "https://availablelaw.com/images/faiir-logo.png";
const DIRECTORY_URL = "https://availablelaw.com/faiir";

function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function EngagementCertification() {
  const { ref, loading: refLoading } = useEngagementRef();
  const [cert, setCert] = useState<Certification | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState("");
  const [generating, setGenerating] = useState(false);

  const orgId = ref?.orgId;

  const load = useCallback(async () => {
    if (!orgId) return;
    const { data } = await supabase
      .from("faiir_certifications")
      .select("firm_name, certificate_number, tier, issued_at, expires_at, status")
      .eq("org_id", orgId)
      .eq("status", "active")
      .order("issued_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    setCert((data as Certification) ?? null);
    setLoading(false);
  }, [orgId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const year = cert ? new Date(cert.issued_at).getFullYear() : new Date().getFullYear();

  const linkedinPost = cert
    ? `${cert.firm_name} is now FAIIR Certified. 🛡️\n\nWe completed an independent assessment of how our firm governs and uses AI — data handling, integrity, and responsible-use practices — conducted by Available Law.\n\nFor our clients, it means we hold our AI use to a real standard, and we keep it current through annual review.\n\nLearn what FAIIR certification involves: ${DIRECTORY_URL}\n\n#LegalTech #AIGovernance #FAIIRCertified`
    : "";

  const signatureLine = cert
    ? `${cert.firm_name} · FAIIR Certified ${year} — independently assessed for responsible AI use · ${DIRECTORY_URL}`
    : "";

  const embedSnippet = cert
    ? `<a href="${DIRECTORY_URL}" target="_blank" rel="noopener">\n  <img src="${SEAL_URL}" alt="FAIIR Certified ${year} — ${cert.firm_name}" width="120" height="120" />\n</a>`
    : "";

  const copyText = async (key: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const handleDownloadPdf = async () => {
    if (!cert) return;
    setPdfError("");
    setGenerating(true);
    try {
      await downloadCertificatePdf({
        firm_name: cert.firm_name,
        certificate_number: cert.certificate_number,
        tier: cert.tier,
        issued_at: cert.issued_at,
        expires_at: cert.expires_at,
      });
    } catch {
      setPdfError("We couldn't generate your certificate just now — please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (refLoading || loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-10 h-10 border-4 border-[#C17832]/20 border-t-[#C17832] rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-[#6B5B4E]">Opening your certification…</p>
      </div>
    );
  }

  // ---- Not yet certified: the anticipation state ----
  if (!cert) {
    return (
      <div>
        <div className="mb-8">
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#C17832] mb-2">
            FAIIR Certification
          </p>
          <h2 className="text-3xl font-bold text-[#1F1810] mb-1">Your certification</h2>
          <p className="text-[#6B5B4E]">Earned on completion of your assessment — here is what is waiting.</p>
        </div>

        <div className="bg-white border border-[#1F1810]/10 rounded-2xl shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-10 text-center">
          <div className="relative inline-block mb-5">
            <Image src="/images/faiir-logo.png" alt="FAIIR seal" width={120} height={120} className="object-contain opacity-30 grayscale" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-10 h-10 rounded-full bg-white/80 border border-[#1F1810]/10 flex items-center justify-center">
                <Lock className="w-5 h-5 text-[#A89279]" />
              </div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-[#1F1810]">Certification unlocks at the finish line</h3>
          <p className="text-sm text-[#6B5B4E] mt-2 max-w-md mx-auto">
            When your engagement completes and your attorney issues your certification, this page becomes your
            certificate, your seal, and a kit to share it — all here.
          </p>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-left">
            <Perk icon={ShieldCheck} title="A certificate" body="Firm-specific, dated, attorney-signed." />
            <Perk icon={Sparkles} title="Your seal" body="Display it on your site, linked back to your listing." />
            <Perk icon={Download} title="A share kit" body="Approved language and the honest boundaries." />
          </div>
        </div>
      </div>
    );
  }

  // ---- Certified: the reveal ----
  return (
    <div>
      {/* Celebration */}
      <div className="mb-8 text-center bg-gradient-to-b from-[#C17832]/8 to-transparent rounded-2xl border border-[#C17832]/20 shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-8">
        <Image src="/images/faiir-logo.png" alt="FAIIR Certified seal" width={240} height={240} className="object-contain mx-auto mb-4" />
        <p className="text-[10px] font-semibold tracking-[0.25em] uppercase text-[#C17832] mb-2 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> FAIIR Certified · {year}
        </p>
        <h2 className="text-3xl font-bold text-[#1F1810] mb-1">{cert.firm_name} is FAIIR Certified</h2>
        <p className="text-[#6B5B4E]">
          {cert.tier} · {cert.certificate_number} · Valid through {longDate(cert.expires_at)}
        </p>
        <button
          type="button"
          onClick={handleDownloadPdf}
          disabled={generating}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#1F1810] text-white rounded-lg text-sm font-semibold hover:bg-[#C17832] transition-colors disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          {generating ? "Preparing your certificate…" : "Download your certificate (PDF)"}
        </button>
        {pdfError && <p className="text-xs text-red-600 mt-3">{pdfError}</p>}
      </div>

      {/* Marketing kit */}
      <h3 className="text-lg font-semibold text-[#1F1810] mb-1">Share your certification</h3>
      <p className="text-sm text-[#6B5B4E] mb-4">
        Everything you need to show clients you are FAIIR Certified — no website edits required.
      </p>

      <div className="space-y-4">
        {/* 1. Download the seal */}
        <div className="bg-white border border-[#1F1810]/10 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-5">
          <div className="flex items-start gap-4">
            <Image src="/images/faiir-logo.png" alt="FAIIR Certified seal" width={56} height={56} className="object-contain shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[#1F1810]">Download your seal</p>
              <p className="text-xs text-[#6B5B4E] mt-1 mb-3">
                A high-resolution image — use it on your website, email signature, social profiles, or
                proposals. Pair it with the approved language below.
              </p>
              <a
                href="/images/faiir-logo.png"
                download="FAIIR-Certified-Seal.png"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F1810] text-white rounded-lg text-xs font-semibold hover:bg-[#C17832] transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Download seal (PNG)
              </a>
            </div>
          </div>
        </div>

        {/* 2. Announce it — ready-to-post copy */}
        <div className="bg-white border border-[#1F1810]/10 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-5">
          <p className="text-sm font-semibold text-[#1F1810] mb-1 flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-[#C17832]" />
            Announce it
          </p>
          <p className="text-xs text-[#6B5B4E] mb-4">
            Written for you, in plain, honest language. Copy and share — no editing required.
          </p>

          <div className="mb-4">
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-xs font-semibold text-[#1F1810]">LinkedIn / social post</p>
              <button
                type="button"
                onClick={() => copyText("linkedin", linkedinPost)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C17832] hover:text-[#A8621F] transition-colors shrink-0"
              >
                {copiedKey === "linkedin" ? <><Check className="w-3.5 h-3.5" />Copied</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
              </button>
            </div>
            <div className="text-[13px] bg-[#F5F0EB] border border-[#1F1810]/8 rounded-lg p-3 text-[#4a4036] whitespace-pre-wrap leading-relaxed">
              {linkedinPost}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between gap-3 mb-2">
              <p className="text-xs font-semibold text-[#1F1810]">Email signature line</p>
              <button
                type="button"
                onClick={() => copyText("signature", signatureLine)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C17832] hover:text-[#A8621F] transition-colors shrink-0"
              >
                {copiedKey === "signature" ? <><Check className="w-3.5 h-3.5" />Copied</> : <><Copy className="w-3.5 h-3.5" />Copy</>}
              </button>
            </div>
            <div className="text-[13px] bg-[#F5F0EB] border border-[#1F1810]/8 rounded-lg p-3 text-[#4a4036] whitespace-pre-wrap leading-relaxed">
              {signatureLine}
            </div>
          </div>
        </div>

        {/* 3. Approved language */}
        <div className="bg-white border border-[#1F1810]/10 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-5">
          <p className="text-sm font-semibold text-[#1F1810] mb-3">Approved language</p>
          <ul className="space-y-2 text-sm text-[#1F1810]">
            <Approved>{`FAIIR Certified — ${year}`}</Approved>
            <Approved>Completed an independent AI governance assessment by Available Law</Approved>
            <Approved>Reviewed for AI integrity, data handling, and regulation readiness</Approved>
          </ul>
        </div>

        {/* 4. The honest boundaries */}
        <div className="bg-[#7A8B6F]/5 border border-[#7A8B6F]/30 rounded-lg p-5">
          <p className="text-sm font-semibold text-[#1F1810] mb-2 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#7A8B6F]" />
            The honest boundaries
          </p>
          <ul className="space-y-1.5 text-xs text-[#6B5B4E] list-disc pl-5">
            <li>Specific to {cert.firm_name} — it is not transferable to other firms.</li>
            <li>Valid for one year (through {longDate(cert.expires_at)}); renewed through an annual review.</li>
            <li>Reflects a point-in-time assessment of practices — not a guarantee of compliance or outcomes.</li>
            <li>It is an independent professional assessment, not a government or regulatory certification.</li>
          </ul>
        </div>

        {/* 5. For your web team — embed, demoted into a disclosure */}
        <details className="bg-white border border-[#1F1810]/10 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-5">
          <summary className="text-sm font-semibold text-[#1F1810] cursor-pointer flex items-center gap-2">
            <Code className="w-4 h-4 text-[#A89279]" />
            Add the seal to your website
            <span className="text-xs font-normal text-[#A89279]">(for your web person)</span>
          </summary>
          <div className="mt-3">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-xs text-[#6B5B4E]">
                Paste this where you want the seal to appear — it links visitors back to your FAIIR listing.
              </p>
              <button
                type="button"
                onClick={() => copyText("embed", embedSnippet)}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C17832] hover:text-[#A8621F] transition-colors shrink-0"
              >
                {copiedKey === "embed" ? <><Check className="w-3.5 h-3.5" />Copied</> : <><Copy className="w-3.5 h-3.5" />Copy code</>}
              </button>
            </div>
            <pre className="text-[11px] bg-[#F5F0EB] border border-[#1F1810]/8 rounded-lg p-3 overflow-x-auto text-[#4a4036] whitespace-pre-wrap break-all">
              {embedSnippet}
            </pre>
          </div>
        </details>
      </div>
    </div>
  );
}

function Perk({ icon: Icon, title, body }: { icon: typeof ShieldCheck; title: string; body: string }) {
  return (
    <div className="bg-[#FAF8F5] border border-[#1F1810]/8 rounded-lg p-3">
      <Icon className="w-4 h-4 text-[#C17832] mb-1.5" />
      <p className="text-xs font-semibold text-[#1F1810]">{title}</p>
      <p className="text-[11px] text-[#6B5B4E] mt-0.5">{body}</p>
    </div>
  );
}

function Approved({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2">
      <Check className="w-4 h-4 text-[#7A8B6F] shrink-0 mt-0.5" />
      <span>{children}</span>
    </li>
  );
}
