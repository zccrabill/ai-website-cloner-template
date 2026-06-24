"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useEngagementRef } from "@/lib/useEngagementRef";
import { Download, Copy, Check, ShieldCheck, Sparkles, Lock } from "lucide-react";

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
  const [copied, setCopied] = useState(false);
  const [printError, setPrintError] = useState("");

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

  const embedSnippet = cert
    ? `<a href="${DIRECTORY_URL}" target="_blank" rel="noopener">\n  <img src="${SEAL_URL}" alt="FAIIR Certified ${new Date(cert.issued_at).getFullYear()} — ${cert.firm_name}" width="120" height="120" />\n</a>`
    : "";

  const copyEmbed = async () => {
    try {
      await navigator.clipboard.writeText(embedSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const printCertificate = () => {
    if (!cert) return;
    setPrintError("");
    const w = window.open("", "_blank");
    if (!w) {
      setPrintError(
        "Your browser blocked the certificate window. Allow pop-ups for availablelaw.com, then try again."
      );
      return;
    }
    w.document.write(`<!doctype html><html><head><meta charset="utf-8" />
<title>${cert.certificate_number}</title>
<style>
  @page { size: letter landscape; margin: 0; }
  body { margin: 0; font-family: Georgia, 'Times New Roman', serif; color: #1F1810; }
  .sheet { width: 11in; height: 8.5in; box-sizing: border-box; padding: 0.7in; display: flex; }
  .frame { flex: 1; border: 2px solid #C17832; border-radius: 8px; padding: 0.5in 0.7in;
           display: flex; flex-direction: column; align-items: center; text-align: center;
           background: #FAF8F5; }
  img { width: 260px; height: 260px; }
  .kicker { letter-spacing: .35em; text-transform: uppercase; font-size: 11px; color: #C17832; margin: 10px 0 4px; }
  h1 { font-size: 30px; margin: 4px 0 14px; }
  .firm { font-size: 26px; font-weight: bold; margin: 6px 0; }
  .body { font-size: 14px; color: #4a4036; max-width: 7in; line-height: 1.6; }
  .meta { margin-top: auto; display: flex; justify-content: space-between; width: 100%; font-size: 12px; color: #6B5B4E; }
  .sig { text-align: left; } .num { text-align: right; }
  .sig .name { font-weight: bold; color: #1F1810; }
</style></head>
<body onload="window.print()">
  <div class="sheet"><div class="frame">
    <img src="${SEAL_URL}" alt="FAIIR" />
    <div class="kicker">Foundation of AI Integrity &amp; Regulation</div>
    <h1>Certificate of Completion</h1>
    <div class="body">This certifies that</div>
    <div class="firm">${cert.firm_name}</div>
    <div class="body">has completed the <strong>${cert.tier}</strong>, an independent review of the firm&rsquo;s
      artificial-intelligence governance, data handling, and use practices, conducted by Available Law.</div>
    <div class="meta">
      <div class="sig">
        <div class="name">Zachariah Crabill, JD</div>
        <div>Attorney &amp; Founder, Available Law &middot; Colorado Bar #56783</div>
      </div>
      <div class="num">
        <div>${cert.certificate_number}</div>
        <div>Issued ${longDate(cert.issued_at)} &middot; Valid through ${longDate(cert.expires_at)}</div>
      </div>
    </div>
  </div></div>
</body></html>`);
    w.document.close();
    w.focus();
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
  const year = new Date(cert.issued_at).getFullYear();
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
          onClick={printCertificate}
          className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-[#1F1810] text-white rounded-lg text-sm font-semibold hover:bg-[#C17832] transition-colors"
        >
          <Download className="w-4 h-4" />
          Download your certificate
        </button>
        {printError && <p className="text-xs text-red-600 mt-3">{printError}</p>}
      </div>

      {/* Marketing kit */}
      <h3 className="text-lg font-semibold text-[#1F1810] mb-4">Share your certification</h3>

      <div className="space-y-4">
        {/* Embed the seal */}
        <div className="bg-white border border-[#1F1810]/10 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-5">
          <div className="flex items-center justify-between gap-3 mb-2">
            <p className="text-sm font-semibold text-[#1F1810]">Add the seal to your website</p>
            <button
              type="button"
              onClick={copyEmbed}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#C17832] hover:text-[#A8621F] transition-colors"
            >
              {copied ? <><Check className="w-3.5 h-3.5" />Copied</> : <><Copy className="w-3.5 h-3.5" />Copy code</>}
            </button>
          </div>
          <p className="text-xs text-[#6B5B4E] mb-3">
            Paste this where you want the seal to appear — it links visitors back to your FAIIR listing.
          </p>
          <pre className="text-[11px] bg-[#F5F0EB] border border-[#1F1810]/8 rounded-lg p-3 overflow-x-auto text-[#4a4036] whitespace-pre-wrap break-all">
            {embedSnippet}
          </pre>
        </div>

        {/* Approved language */}
        <div className="bg-white border border-[#1F1810]/10 rounded-lg shadow-[0_2px_8px_rgb(31_24_16/0.06)] p-5">
          <p className="text-sm font-semibold text-[#1F1810] mb-3">Approved language</p>
          <ul className="space-y-2 text-sm text-[#1F1810]">
            <Approved>{`FAIIR Certified — ${year}`}</Approved>
            <Approved>Completed an independent AI governance assessment by Available Law</Approved>
            <Approved>Reviewed for AI integrity, data handling, and regulation readiness</Approved>
          </ul>
        </div>

        {/* The honest boundaries */}
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
