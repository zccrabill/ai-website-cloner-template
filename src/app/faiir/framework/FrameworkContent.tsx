"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  FileSearch,
  ClipboardCheck,
  Users,
  Scale,
  ArrowRight,
  Check,
  Calendar,
  Plus,
  Minus,
  X,
} from "lucide-react";

interface Faq {
  question: string;
  answer: string;
}

interface FrameworkContentProps {
  faqs: Faq[];
}

// Same Calendly link as /faiir — update both if it ever changes.
const DISCOVERY_CALL_URL =
  "https://calendly.com/availablelaw/free-faiir-discovery-call";

/* ------------------------------------------------------------------ */
/* Pillar data — condensed from the canonical FAIIR framework doc.     */
/* Control counts must always sum to 41 (F:8, A:7, I:9, U:7, R:10).    */
/* ------------------------------------------------------------------ */

interface Pillar {
  letter: string;
  name: string;
  icon: typeof ShieldCheck;
  controlCount: number;
  question: string;
  why: string;
  sampleControls: string[];
}

const PILLARS: Pillar[] = [
  {
    letter: "F",
    name: "Fitness for Purpose",
    icon: ClipboardCheck,
    controlCount: 8,
    question: "Is this AI actually suited to the task you're using it for?",
    why: "Most AI liability doesn't come from exotic failures. It comes from deploying a general-purpose model in a domain where it was never validated. This pillar asks you to prove you thought about the match.",
    sampleControls: [
      "A written register of every AI system in use and what each is authorized for",
      "Written out-of-scope rules — what each tool must never be used for",
      "A defined human-in-the-loop rule for every high-stakes use case",
      "An annual review that each tool is still fit for its stated purpose",
    ],
  },
  {
    letter: "A",
    name: "Accountability",
    icon: Scale,
    controlCount: 7,
    question:
      "When something goes wrong, who owns it — and can you prove that was decided before it went wrong?",
    why: "Post-hoc accountability is no accountability. The test is whether a responsible human was designated, in writing, before the incident — and what each AI vendor contractually owes you when their model fails.",
    sampleControls: [
      "A named AI officer responsible for AI governance",
      "A log of material AI-involved decisions and who reviewed them",
      "Vendor contracts reviewed — who indemnifies you, and who doesn't",
      "Insurance checked for AI-related claim coverage",
    ],
  },
  {
    letter: "I",
    name: "Integrity of Data",
    icon: FileSearch,
    controlCount: 9,
    question:
      "What goes into the AI, where does it go, and how long does it live there?",
    why: "This is the pillar most businesses fail first — employees pasting customer data and trade secrets into free AI tools every day, with no one tracking it. Integrity of Data is about knowing your data perimeter and enforcing it.",
    sampleControls: [
      "Written rules on which data classes may go into which tool",
      "No PII into third-party AI without a data processing agreement",
      "Training-data opt-outs reviewed and configured for every vendor",
      "Vendor data-retention terms documented — or assumed to be forever",
    ],
  },
  {
    letter: "I",
    name: "Informed Use",
    icon: Users,
    controlCount: 7,
    question:
      "Do the humans involved — employees and customers — actually know what's going on?",
    why: "Most AI liability cases turn on a surprised person: a customer surprised their chatbot was AI, an employee surprised their prompt trained a public model. Informed Use is the pillar that prevents surprise.",
    sampleControls: [
      "A written AI use policy every employee has acknowledged",
      "Documented AI training for everyone who uses the tools, refreshed annually",
      "Plain-language disclosure wherever AI touches the customer experience",
      "AI-generated content labeled per applicable law",
    ],
  },
  {
    letter: "R",
    name: "Risk Management",
    icon: ShieldCheck,
    controlCount: 10,
    question:
      "If this all goes wrong, will you know it happened, contain it, and be able to prove what you did?",
    why: "The audit-trail pillar — it converts “we're being careful” into “here is the evidence we were careful.” This is where insurers, auditors, and plaintiffs actually look.",
    sampleControls: [
      "A risk register reviewed quarterly",
      "A written definition of what counts as an AI incident",
      "A response playbook: who is called, what is logged, who is notified",
      "An annual signed attestation that the organization operates its own framework",
    ],
  },
];

const TOTAL_CONTROLS = PILLARS.reduce((sum, p) => sum + p.controlCount, 0);

/* ------------------------------------------------------------------ */
/* Benchmark data                                                      */
/* ------------------------------------------------------------------ */

const BENCHMARKS = [
  {
    name: "NIST AI Risk Management Framework",
    relation:
      "FAIIR is a practical, SMB-scale operationalization of the same principles — govern, map, measure, manage — sized for a business without a compliance department.",
  },
  {
    name: "Colorado SB 26-189 & the state AI-law patchwork",
    relation:
      "The pillars map directly onto the disclosure, human-review, and recordkeeping duties that Colorado's AI Act — and the widening set of state laws like it — impose on businesses deploying AI in consequential decisions.",
  },
  {
    name: "EU AI Act",
    relation:
      "The Informed Use pillar aligns with the Act's disclosure and content-labeling obligations, including Article 50 transparency requirements.",
  },
  {
    name: "ISO/IEC 42001 & SOC 2",
    relation:
      "FAIIR covers the AI-specific ground these frameworks don't reach, at a weight an SMB can actually carry. An organization can hold SOC 2 and FAIIR in parallel; FAIIR is a lighter-weight path toward ISO 42001-style outcomes.",
  },
];

const NOT_CLAIMS = [
  {
    claim: "Not a law or regulatory approval",
    detail:
      "FAIIR doesn't replace HIPAA, GDPR, the EU AI Act, or state-law obligations — it helps organizations meet them in an organized way.",
  },
  {
    claim: "Not a guarantee against liability",
    detail:
      "Passing FAIIR is evidence of reasonable care — the way a SOC 2 report doesn't mean a system can't be breached, but shows security was taken seriously.",
  },
  {
    claim: "Not a certification of AI models",
    detail:
      "FAIIR certifies an organization's practices around deploying AI, not the models themselves. New model, same framework, applied again.",
  },
  {
    claim: "Not a substitute for legal advice",
    detail:
      "FAIIR is a standard of care, not a ruling on any particular law in your jurisdiction or industry.",
  },
];

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function FrameworkContent({ faqs }: FrameworkContentProps) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F1810]">
      <FrameworkHeader />
      <Hero />
      <WhatFaiirIs />
      <PillarsDetail />
      <HowScoringWorks />
      <WhatCertificationMeans />
      <Benchmarks />
      <FaqSection faqs={faqs} />
      <FinalCta />
      <FrameworkFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chrome — matches the /faiir branded header/footer                   */
/* ------------------------------------------------------------------ */

function FrameworkHeader() {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur border-b border-[#1F1810]/10">
      <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/faiir" className="flex items-center gap-3">
          <Image
            src="/images/faiir-logo.png"
            alt="FAIIR"
            width={36}
            height={36}
            className="object-contain"
            priority
          />
          <div className="flex flex-col leading-tight">
            <span
              className="text-[#1F1810] text-lg"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
            >
              FAIIR
            </span>
            <span className="text-[10px] uppercase tracking-widest text-[#A89279]">
              AI Compliance Standard
            </span>
          </div>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <span className="hidden md:inline text-[#1F1810] font-medium">
            The framework
          </span>
          <Link
            href="/faiir#pricing"
            className="hidden md:inline text-[#6B5B4E] hover:text-[#1F1810] transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/faiir-check"
            className="hidden md:inline text-[#6B5B4E] hover:text-[#1F1810] transition-colors"
          >
            Free self-check
          </Link>
          <a
            href={DISCOVERY_CALL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1F1810] text-white rounded-full text-sm font-medium hover:bg-[#C17832] transition-colors"
          >
            Book a call
            <ArrowRight className="w-4 h-4" />
          </a>
        </nav>
      </div>
    </header>
  );
}

function FrameworkFooter() {
  return (
    <footer className="bg-[#FAF8F5] border-t border-[#1F1810]/10 py-10">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#A89279]">
        <p className="text-center md:text-left leading-relaxed">
          FAIIR — Foundation of AI Integrity &amp; Regulation. A trademark of{" "}
          <Link
            href="/"
            className="underline decoration-[#A89279]/50 hover:text-[#1F1810] hover:decoration-[#1F1810] transition-colors"
          >
            Available Law, LLC
          </Link>
          , a Colorado-licensed virtual law firm. This page is informational
          and not legal advice.
        </p>
        <div className="flex items-center gap-5">
          <Link
            href="/faiir"
            className="hover:text-[#1F1810] transition-colors"
          >
            Certification
          </Link>
          <Link
            href="/faiir-check"
            className="hover:text-[#1F1810] transition-colors"
          >
            Free self-check
          </Link>
          <Link
            href="/faiir#pricing"
            className="hover:text-[#1F1810] transition-colors"
          >
            Pricing
          </Link>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#F5F0EB] via-[#FAF8F5] to-[#FAF8F5]" />
      <div className="relative max-w-[1200px] mx-auto px-6 pt-20 pb-20 md:pt-28 md:pb-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C17832]/10 border border-[#C17832]/30 text-[#C17832] text-xs font-semibold uppercase tracking-widest mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Foundation of AI Integrity &amp; Regulation
          </div>
          <h1
            className="text-[44px] md:text-[60px] leading-[1.05] text-[#1F1810] mb-6"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Five pillars. {TOTAL_CONTROLS} controls.
            <br />
            <span className="italic text-[#C17832]">
              One standard for responsible AI.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-[#6B5B4E] leading-relaxed mb-8 max-w-2xl mx-auto">
            FAIIR is a professional compliance standard for how small and
            midsize businesses use AI — not a philosophy, a checklist your
            business can actually run. This page is the whole framework, in
            plain language.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/faiir-check"
              className="group inline-flex items-center gap-2 px-7 py-4 bg-[#1F1810] text-white rounded-full text-base font-medium hover:bg-[#C17832] transition-all shadow-lg shadow-[#1F1810]/10"
            >
              Score yourself free in 10 minutes
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="/faiir"
              className="inline-flex items-center gap-2 px-7 py-4 border border-[#1F1810]/20 text-[#1F1810] rounded-full text-base font-medium hover:border-[#1F1810]/40 hover:bg-white transition-all"
            >
              Get certified
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* What FAIIR is                                                       */
/* ------------------------------------------------------------------ */

function WhatFaiirIs() {
  return (
    <section className="py-20 md:py-24 bg-[#1F1810] text-[#FAF8F5]">
      <div className="max-w-[1000px] mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2
            className="text-3xl md:text-4xl leading-tight mb-6"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Codifying{" "}
            <span className="italic text-[#F2B870]">
              &ldquo;did you use AI responsibly?&rdquo;
            </span>{" "}
            into a checklist.
          </h2>
          <p className="text-lg text-white/70 leading-relaxed mb-5">
            Your business almost certainly uses AI already. Your insurance
            carrier, your enterprise clients, and a growing list of state laws
            are asking the same question in different words:{" "}
            <span className="text-white">
              show me how you use AI — and show me the paper that proves
              you&rsquo;re doing it responsibly.
            </span>
          </p>
          <p className="text-lg text-white/70 leading-relaxed">
            FAIIR is not a law. It is a professional standard — the way SOC 2
            codified trust for software companies. It was developed and is
            maintained by Available Law, a Colorado-licensed law firm, so
            every certification is attorney-led legal analysis, not a generic
            audit checklist. Five pillars, {TOTAL_CONTROLS} controls, each
            with a pass/fail bar.
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* The five pillars, in detail                                         */
/* ------------------------------------------------------------------ */

function PillarsDetail() {
  return (
    <section id="pillars" className="py-24 md:py-28 bg-[#FAF8F5]">
      <div className="max-w-[1000px] mx-auto px-6">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold text-[#C17832] uppercase tracking-widest mb-3">
            The Five Pillars
          </p>
          <h2
            className="text-3xl md:text-4xl text-[#1F1810] leading-tight mb-4"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Each pillar asks one question a regulator, carrier, or plaintiff
            would ask.
          </h2>
          <p className="text-[#6B5B4E] leading-relaxed">
            F-A-I-I-R: Fitness for purpose, Accountability, Integrity of
            data, Informed use, Risk management. Under each pillar sit
            specific documented controls — {TOTAL_CONTROLS} in total. A
            sample of what they require:
          </p>
        </div>

        <div className="space-y-6">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.name}
                className="bg-white border border-[#1F1810]/8 rounded-2xl p-7 md:p-9 hover:border-[#C17832]/40 hover:shadow-lg transition-all"
              >
                <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                  <div className="flex-shrink-0 flex md:flex-col items-center md:items-start gap-4">
                    <div
                      className="text-5xl md:text-6xl text-[#C17832]/25 leading-none"
                      style={{
                        fontFamily: "'Playfair Display', serif",
                        fontWeight: 400,
                      }}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-[#C17832]/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[#C17832]" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-baseline gap-3 flex-wrap mb-2">
                      <h3
                        className="text-2xl text-[#1F1810]"
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          fontWeight: 400,
                        }}
                      >
                        {pillar.name}
                      </h3>
                      <span className="text-[11px] font-semibold uppercase tracking-widest text-[#A89279]">
                        {pillar.controlCount} controls
                      </span>
                    </div>
                    <p className="text-[15px] font-semibold text-[#C17832] mb-3 italic">
                      &ldquo;{pillar.question}&rdquo;
                    </p>
                    <p className="text-sm text-[#6B5B4E] leading-relaxed mb-5">
                      {pillar.why}
                    </p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5">
                      {pillar.sampleControls.map((control) => (
                        <li
                          key={control}
                          className="flex items-start gap-2.5 text-[13px] text-[#1F1810]"
                        >
                          <Check className="w-3.5 h-3.5 text-[#C17832] flex-shrink-0 mt-0.5" />
                          <span className="leading-snug">{control}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* How scoring works                                                   */
/* ------------------------------------------------------------------ */

function HowScoringWorks() {
  return (
    <section className="py-20 md:py-24 bg-[#F5F0EB] border-t border-[#1F1810]/8">
      <div className="max-w-[1000px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-semibold text-[#C17832] uppercase tracking-widest mb-3">
              How Scoring Works
            </p>
            <h2
              className="text-3xl md:text-4xl text-[#1F1810] leading-tight mb-4"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
            >
              Every control is pass/fail. Every pass needs evidence.
            </h2>
            <p className="text-[#6B5B4E] leading-relaxed">
              There is no partial credit for good intentions. A control
              passes when the documentation exists — a written register, a
              signed policy, a configured setting, a dated review. The
              assessment scope determines how many controls are examined and
              how deeply, which is why certification is scoped on a
              discovery call rather than sold off a shelf.
            </p>
          </div>
          <div className="space-y-4">
            {[
              {
                n: "41",
                label: "pass/fail controls across the five pillars",
              },
              {
                n: "1 yr",
                label:
                  "certification term — renewed annually, never lifetime",
              },
              {
                n: "0",
                label:
                  "controls that pass on intentions instead of documentation",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-white border border-[#1F1810]/8 rounded-2xl p-6 flex items-center gap-5"
              >
                <span
                  className="text-4xl text-[#C17832] flex-shrink-0 w-20 text-center"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontWeight: 400,
                  }}
                >
                  {stat.n}
                </span>
                <span className="text-sm text-[#1F1810] leading-snug">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* What certification means (and doesn't)                              */
/* ------------------------------------------------------------------ */

function WhatCertificationMeans() {
  return (
    <section id="certification" className="py-24 md:py-28 bg-[#FAF8F5]">
      <div className="max-w-[1000px] mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold text-[#C17832] uppercase tracking-widest mb-3">
            What Certification Means
          </p>
          <h2
            className="text-3xl md:text-4xl text-[#1F1810] leading-tight mb-4"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            A certification letter is a specific, limited claim.
          </h2>
          <p className="text-[#6B5B4E] leading-relaxed">
            A FAIIR certification letter reflects an attorney-led assessment
            of your organization&rsquo;s practices against the
            framework&rsquo;s defined controls, based on evidence you submit.
            It is annual and firm-specific — never lifetime, never
            transferable. That precision is the point: a claim this specific
            is one you can hand to an insurance carrier, an enterprise
            procurement team, or a regulator without overselling.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {NOT_CLAIMS.map((item) => (
            <div
              key={item.claim}
              className="bg-white border border-[#1F1810]/8 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-2.5">
                <span className="w-7 h-7 rounded-full bg-[#1F1810]/5 flex items-center justify-center flex-shrink-0">
                  <X className="w-3.5 h-3.5 text-[#6B5B4E]" />
                </span>
                <h3 className="text-base font-semibold text-[#1F1810]">
                  {item.claim}
                </h3>
              </div>
              <p className="text-sm text-[#6B5B4E] leading-relaxed">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Benchmarks                                                          */
/* ------------------------------------------------------------------ */

function Benchmarks() {
  return (
    <section id="benchmarks" className="py-24 md:py-28 bg-[#1F1810] text-[#FAF8F5]">
      <div className="max-w-[1000px] mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold text-[#F2B870] uppercase tracking-widest mb-3">
            What FAIIR Is Benchmarked Against
          </p>
          <h2
            className="text-3xl md:text-4xl leading-tight mb-4"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Complementary to the frameworks — mapped to the laws.
          </h2>
          <p className="text-white/70 leading-relaxed">
            FAIIR doesn&rsquo;t compete with the standards shaping AI
            governance; it makes them runnable at small-business scale. The
            same documented controls answer the questions regulators,
            carriers, and enterprise customers all ask in different forms.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {BENCHMARKS.map((b) => (
            <div
              key={b.name}
              className="border border-white/15 rounded-2xl p-6 bg-white/[0.03]"
            >
              <h3 className="text-lg text-[#F2B870] mb-2 font-semibold">
                {b.name}
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                {b.relation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ                                                                 */
/* ------------------------------------------------------------------ */

function FaqSection({ faqs }: { faqs: Faq[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 md:py-28 bg-[#FAF8F5] border-t border-[#1F1810]/8">
      <div className="max-w-[900px] mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <p className="text-xs font-semibold text-[#C17832] uppercase tracking-widest mb-3">
            Frequently asked
          </p>
          <h2
            className="text-3xl md:text-4xl text-[#1F1810] leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Questions about the framework.
          </h2>
        </div>
        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const open = openIdx === idx;
            return (
              <div
                key={faq.question}
                className="bg-white border border-[#1F1810]/10 rounded-2xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenIdx(open ? null : idx)}
                  className="w-full px-6 md:px-8 py-5 flex items-center justify-between gap-4 text-left hover:bg-[#F5F0EB]/50 transition-colors"
                  aria-expanded={open}
                >
                  <span className="text-[15px] md:text-base font-semibold text-[#1F1810]">
                    {faq.question}
                  </span>
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-[#C17832]/10 flex items-center justify-center text-[#C17832]">
                    {open ? (
                      <Minus className="w-4 h-4" />
                    ) : (
                      <Plus className="w-4 h-4" />
                    )}
                  </span>
                </button>
                {open && (
                  <div className="px-6 md:px-8 pb-6 text-sm text-[#6B5B4E] leading-relaxed">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Final CTA                                                           */
/* ------------------------------------------------------------------ */

function FinalCta() {
  return (
    <section className="py-24 md:py-28 bg-[#F5F0EB] border-t border-[#1F1810]/8">
      <div className="max-w-[900px] mx-auto px-6 text-center">
        <h2
          className="text-3xl md:text-4xl text-[#1F1810] leading-tight mb-5"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
        >
          See where your business stands against the standard.
        </h2>
        <p className="text-[#6B5B4E] mb-8 max-w-xl mx-auto leading-relaxed">
          The free self-check scores you against the five pillars in about
          ten minutes. When you&rsquo;re ready for the real thing, an
          attorney-led assessment starts with a free 30-minute discovery
          call.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/faiir-check"
            className="group inline-flex items-center gap-2 px-7 py-4 bg-[#1F1810] text-white rounded-full text-base font-medium hover:bg-[#C17832] transition-all"
          >
            Take the free self-check
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <a
            href={DISCOVERY_CALL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-7 py-4 border border-[#1F1810]/20 text-[#1F1810] rounded-full text-base font-medium hover:border-[#1F1810]/40 hover:bg-white transition-all"
          >
            <Calendar className="w-5 h-5" />
            Book a free discovery call
          </a>
        </div>
      </div>
    </section>
  );
}
