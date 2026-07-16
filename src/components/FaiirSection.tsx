"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  FileSearch,
  ClipboardCheck,
  Users,
  Scale,
  ArrowRight,
} from "lucide-react";

export default function FaiirSection() {
  const pillars = [
    {
      icon: ClipboardCheck,
      title: "Fitness for Purpose",
      description:
        "Is each AI tool actually suited to the task it's used for — and where does a human review before an output is acted on?",
    },
    {
      icon: Scale,
      title: "Accountability",
      description:
        "Who owns AI at the business, and can you prove that was decided before something went wrong — including what each vendor owes you when their model fails?",
    },
    {
      icon: FileSearch,
      title: "Integrity of Data",
      description:
        "What goes into the AI, where does it go, and how long does it live there? The pillar most businesses fail first.",
    },
    {
      icon: Users,
      title: "Informed Use",
      description:
        "Do employees and customers actually know what's going on? Written policy, documented training, plain-language disclosure.",
    },
    {
      icon: ShieldCheck,
      title: "Risk Management",
      description:
        "If it goes wrong, will you know, contain it, and be able to prove what you did? The audit trail carriers and regulators actually look at.",
    },
  ];

  return (
    <section
      id="faiir"
      className="w-full bg-gradient-to-b from-[#FAF8F5] to-[#F5F0EB] py-[120px] px-6 border-y border-[#1F1810]/8"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-[#C17832]/20 rounded-full blur-2xl scale-150" />
            <Image
              src="/images/faiir-logo.png"
              alt="FAIIR — Foundation for AI Integrity & Regulation"
              width={120}
              height={120}
              className="relative object-contain drop-shadow-lg"
            />
          </div>
          <p className="text-sm font-semibold text-[#C17832] uppercase tracking-widest mb-4">
            The Standard We Wrote — and Hold Ourselves To
          </p>
          <h2 className="text-4xl md:text-5xl font-heading text-[#1F1810] mb-6 max-w-3xl leading-tight">
            FAIIR — proof your business uses AI responsibly
          </h2>
          <p className="text-lg text-[#6B5B4E] max-w-2xl leading-relaxed">
            FAIIR — the{" "}
            <span className="font-semibold text-[#1F1810]">
              Foundation for AI Integrity &amp; Regulation
            </span>{" "}
            — is the AI compliance standard Available Law developed and
            maintains: five pillars, 41 documented pass/fail controls,
            assessed by a licensed attorney. We run our own practice on the
            same standard we certify clients under.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-white border border-[#1F1810]/8 rounded-2xl p-8 hover:border-[#C17832]/40 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#C17832]/10 rounded-xl flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-[#C17832]" />
                </div>
                <h3 className="text-xl font-heading text-[#1F1810] mb-3">
                  {pillar.title}
                </h3>
                <p className="text-sm text-[#6B5B4E] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
          {/* Sixth cell: link to the full framework keeps the grid balanced */}
          <Link
            href="/faiir/framework"
            className="group bg-[#1F1810] rounded-2xl p-8 flex flex-col justify-between hover:bg-[#2A2015] transition-all duration-300"
          >
            <div>
              <p className="text-xs font-semibold text-[#F2B870] uppercase tracking-widest mb-3">
                The Full Framework
              </p>
              <h3 className="text-xl font-heading text-white mb-3">
                Five pillars, 41 controls, in plain language.
              </h3>
              <p className="text-sm text-white/60 leading-relaxed">
                What each pillar requires, what a certification letter
                actually means, and what FAIIR is benchmarked against —
                NIST&rsquo;s AI Risk Management Framework, Colorado&rsquo;s
                AI Act, and the EU AI Act.
              </p>
            </div>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#F2B870] group-hover:text-white transition-colors">
              Read the framework
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </div>

        {/* CTA strip */}
        <div className="bg-[#1F1810] rounded-2xl p-10 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <p className="text-xs font-semibold text-[#C17832] uppercase tracking-widest mb-2">
              Why It Matters
            </p>
            <h3 className="text-2xl md:text-3xl font-heading text-white mb-2">
              Carriers, clients, and regulators are all asking the same
              question.
            </h3>
            <p className="text-sm text-white/70 max-w-xl leading-relaxed">
              &ldquo;Show me how you use AI — and the paper that proves
              you&rsquo;re doing it responsibly.&rdquo; A FAIIR certification
              is a structured, attorney-led way to answer it once, in
              writing, instead of scrambling at every renewal and
              questionnaire.
            </p>
          </div>
          <Link
            href="/faiir"
            className="group px-6 py-3 bg-[#C17832] text-white rounded-full text-sm font-medium hover:bg-white hover:text-[#1F1810] transition-all whitespace-nowrap flex-shrink-0 inline-flex items-center gap-2"
          >
            Explore FAIIR Certification
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
