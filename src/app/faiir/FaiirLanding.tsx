"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  FileSearch,
  ClipboardCheck,
  Users,
  AlertTriangle,
  Scale,
  ArrowRight,
  Check,
  Calendar,
  CreditCard,
  Plus,
  Minus,
} from "lucide-react";

interface Faq {
  question: string;
  answer: string;
}

interface FaiirLandingProps {
  faqs: Faq[];
}

// Single source of truth for the membership buy links and discovery-call
// scheduler. Update in one place if any change.
//
// FAIIR membership billing:
//   - Monthly: $49/mo
//   - Annual:  $490/yr  (= 2 months free = ~17% off)
// Matches the Available Law subscription convention so the savings story is
// consistent across both products.
const MEMBERSHIP_CHECKOUT_URL_MONTHLY =
  "https://buy.stripe.com/6oU3cvggQ30Ffz50J6cMM0d";
const MEMBERSHIP_CHECKOUT_URL_ANNUAL =
  "https://buy.stripe.com/bJe9ATaWw6cRev12RecMM0e";
const DISCOVERY_CALL_URL =
  "https://calendly.com/availablelaw/free-faiir-discovery-call";

// Membership pricing math — keep in lock-step with the Stripe prices above.
const MEMBERSHIP_MONTHLY_USD = 49;
const MEMBERSHIP_ANNUAL_USD = 490;
const MEMBERSHIP_ANNUAL_MONTHLY_EQUIVALENT = Math.round(
  MEMBERSHIP_ANNUAL_USD / 12,
); // shown as "$41/mo, billed yearly"
const MEMBERSHIP_ANNUAL_SAVINGS_USD =
  MEMBERSHIP_MONTHLY_USD * 12 - MEMBERSHIP_ANNUAL_USD; // $98
const MEMBERSHIP_ANNUAL_PERCENT_OFF = Math.round(
  (MEMBERSHIP_ANNUAL_SAVINGS_USD / (MEMBERSHIP_MONTHLY_USD * 12)) * 100,
); // 17

type MembershipCycle = "monthly" | "annual";

export default function FaiirLanding({ faqs }: FaiirLandingProps) {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1F1810]">
      <FaiirHeader />
      <CheckerBand />
      <Hero />
      <ProblemSection />
      <WhatIsFaiir />
      <PillarsSection />
      <PricingSection />
      <ProcessSection />
      <MidCheckerCta />
      <FaqSection faqs={faqs} />
      <FinalCta />
      <FaiirFooter />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Branded header — deliberately different from the main site Header  */
/* ------------------------------------------------------------------ */

function FaiirHeader() {
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
          <a
            href="#pricing"
            className="hidden md:inline text-[#6B5B4E] hover:text-[#1F1810] transition-colors"
          >
            Pricing
          </a>
          <a
            href="#process"
            className="hidden md:inline text-[#6B5B4E] hover:text-[#1F1810] transition-colors"
          >
            How it works
          </a>
          <a
            href="#faq"
            className="hidden md:inline text-[#6B5B4E] hover:text-[#1F1810] transition-colors"
          >
            FAQ
          </a>
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

/* ------------------------------------------------------------------ */
/* Hero                                                                */
/* ------------------------------------------------------------------ */

function CheckerBand() {
  return (
    <div className="bg-[#1F1810] text-[#FAF8F5]">
      <div className="max-w-[1200px] mx-auto px-6 py-2.5 text-center text-[13px] md:text-sm">
        <span className="font-semibold text-[#F2B870] mr-2">
          Not ready for the full assessment?
        </span>
        <Link
          href="/ai-act-checker"
          className="underline decoration-[#C17832]/60 hover:decoration-[#F2B870] font-medium"
        >
          Take the free 2-minute Colorado AI Act readiness check →
        </Link>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#F5F0EB] via-[#FAF8F5] to-[#FAF8F5]" />
      <div className="relative max-w-[1200px] mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C17832]/10 border border-[#C17832]/30 text-[#C17832] text-xs font-semibold uppercase tracking-widest mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Colorado AI Act · SB24-205
          </div>
          <h1
            className="text-[44px] md:text-[64px] leading-[1.05] text-[#1F1810] mb-6"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Colorado&rsquo;s AI Act is here.
            <br />
            <span className="italic text-[#C17832]">Prove your business is ready.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#6B5B4E] leading-relaxed mb-10 max-w-2xl mx-auto">
            FAIIR is the attorney-led compliance certification for businesses
            deploying high-risk AI in Colorado. One assessment, one written
            report, ongoing monitoring — built around the statutory duties in
            Senate Bill 24-205.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={DISCOVERY_CALL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2 px-7 py-4 bg-[#1F1810] text-white rounded-full text-base font-medium hover:bg-[#C17832] transition-all shadow-lg shadow-[#1F1810]/10"
            >
              <Calendar className="w-5 h-5" />
              Book a free discovery call
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
            <a
              href="#pricing"
              className="inline-flex items-center gap-2 px-7 py-4 border border-[#1F1810]/20 text-[#1F1810] rounded-full text-base font-medium hover:border-[#1F1810]/40 hover:bg-white transition-all"
            >
              See pricing
            </a>
          </div>
          <p className="mt-6 text-xs text-[#A89279] uppercase tracking-widest">
            Free 30-min scoping call · Fixed-fee engagement · Colorado-licensed attorney
          </p>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Problem                                                             */
/* ------------------------------------------------------------------ */

function ProblemSection() {
  const facts = [
    {
      icon: AlertTriangle,
      headline: "Enforcement starts in 2026",
      body: "Colorado's Attorney General has exclusive authority to enforce SB24-205 against deployers of high-risk AI systems. Violations can carry civil penalties of up to $20,000 per violation.",
    },
    {
      icon: Scale,
      headline: "The law applies broadly",
      body: "Any business using AI to make — or substantially assist in making — consequential decisions about hiring, lending, insurance, housing, education, or healthcare is a deployer under the statute.",
    },
    {
      icon: FileSearch,
      headline: "Most businesses have no plan",
      body: "Risk management programs, impact assessments, consumer disclosures, bias audits, and incident response plans are all required. Most Colorado businesses do not yet have any of these in writing.",
    },
  ];

  return (
    <section className="py-24 md:py-28 bg-[#FAF8F5] border-t border-[#1F1810]/8">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold text-[#C17832] uppercase tracking-widest mb-3">
            The Stakes
          </p>
          <h2
            className="text-3xl md:text-4xl text-[#1F1810] leading-tight mb-4"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            The Colorado AI Act is the first comprehensive state AI law in the U.S.
          </h2>
          <p className="text-[#6B5B4E] leading-relaxed">
            It imposes affirmative duties on the deployers of high-risk AI —
            not just the developers. If your business uses AI to decide who
            gets hired, approved, admitted, insured, or served, SB24-205
            reaches you.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {facts.map((fact) => {
            const Icon = fact.icon;
            return (
              <div
                key={fact.headline}
                className="bg-white border border-[#1F1810]/8 rounded-2xl p-6"
              >
                <div className="w-10 h-10 rounded-lg bg-[#C17832]/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#C17832]" />
                </div>
                <h3 className="text-lg text-[#1F1810] mb-2 font-semibold">
                  {fact.headline}
                </h3>
                <p className="text-sm text-[#6B5B4E] leading-relaxed">
                  {fact.body}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* What is FAIIR                                                       */
/* ------------------------------------------------------------------ */

function WhatIsFaiir() {
  return (
    <section className="py-24 md:py-28 bg-[#1F1810] text-[#FAF8F5]">
      <div className="max-w-[1000px] mx-auto px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C17832]/15 border border-[#C17832]/30 text-[#F2B870] text-xs font-semibold uppercase tracking-widest mb-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          Foundation for AI Integrity &amp; Regulation
        </div>
        <h2
          className="text-4xl md:text-5xl leading-tight mb-6"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
        >
          FAIIR is an attorney-led compliance certification{" "}
          <span className="italic text-[#F2B870]">built for Colorado businesses</span>.
        </h2>
        <p className="text-lg text-white/70 leading-relaxed max-w-2xl mx-auto">
          A FAIIR-certified business has completed a structured audit of its
          AI governance, impact assessments, human-review processes, vendor
          contracts, and incident response plans — and maintains those
          standards through ongoing monitoring. Certification is delivered
          by a Colorado-licensed attorney, so the work product is legal
          analysis, not a generic audit checklist.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pillars                                                             */
/* ------------------------------------------------------------------ */

function PillarsSection() {
  const pillars = [
    {
      icon: FileSearch,
      title: "Risk management program",
      body: "A documented, iterative process for identifying and mitigating risks of algorithmic discrimination in every high-risk AI system your business deploys.",
    },
    {
      icon: ClipboardCheck,
      title: "Impact assessments",
      body: "Written impact assessments for every high-risk AI system, refreshed whenever the system materially changes. Covers purpose, data inputs, known limitations, and mitigations.",
    },
    {
      icon: Users,
      title: "Human review &amp; disclosure",
      body: "Consumer-facing disclosures about AI use, a documented right of appeal to a human reviewer, and clear escalation paths when an AI-driven decision is challenged.",
    },
    {
      icon: ShieldCheck,
      title: "Vendor &amp; incident response",
      body: "AI vendor contracts reviewed against SB24-205's developer-disclosure duties, plus a written incident response plan for algorithmic discrimination events.",
    },
  ];

  return (
    <section className="py-24 md:py-28 bg-[#FAF8F5] border-t border-[#1F1810]/8">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-xs font-semibold text-[#C17832] uppercase tracking-widest mb-3">
            What the Assessment Covers
          </p>
          <h2
            className="text-3xl md:text-4xl text-[#1F1810] leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Four pillars of FAIIR compliance.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-white border border-[#1F1810]/8 rounded-2xl p-7 hover:border-[#C17832]/40 hover:shadow-lg transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-[#C17832]/10 flex items-center justify-center mb-5">
                  <Icon className="w-5 h-5 text-[#C17832]" />
                </div>
                <h3
                  className="text-xl text-[#1F1810] mb-3"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
                  dangerouslySetInnerHTML={{ __html: pillar.title }}
                />
                <p
                  className="text-sm text-[#6B5B4E] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: pillar.body }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pricing                                                             */
/* ------------------------------------------------------------------ */

function PricingSection() {
  // Billing cycle state for the membership card. Defaults to annual to nudge
  // higher-LTV selection and surface the "save $X" badge immediately — same
  // convention as the Available Law /checkout/[tier] page.
  const [membershipCycle, setMembershipCycle] =
    useState<MembershipCycle>("annual");

  const membershipPriceLarge =
    membershipCycle === "annual"
      ? `$${MEMBERSHIP_ANNUAL_MONTHLY_EQUIVALENT}`
      : `$${MEMBERSHIP_MONTHLY_USD}`;
  const membershipPriceSuffix =
    membershipCycle === "annual" ? "per month, billed yearly" : "per month";
  const membershipSubline =
    membershipCycle === "annual"
      ? `$${MEMBERSHIP_ANNUAL_USD}/year · save $${MEMBERSHIP_ANNUAL_SAVINGS_USD} (${MEMBERSHIP_ANNUAL_PERCENT_OFF}% off) vs. monthly`
      : "Billed monthly. Cancel anytime. Assessment recommended but not required before starting membership.";
  const membershipCtaUrl =
    membershipCycle === "annual"
      ? MEMBERSHIP_CHECKOUT_URL_ANNUAL
      : MEMBERSHIP_CHECKOUT_URL_MONTHLY;
  const membershipCtaLabel =
    membershipCycle === "annual"
      ? `Start membership — $${MEMBERSHIP_ANNUAL_USD}/yr`
      : `Start membership — $${MEMBERSHIP_MONTHLY_USD}/mo`;

  const assessmentFeatures = [
    "Attorney-led AI inventory and high-risk classification",
    "Written impact assessments for each high-risk system",
    "Gap analysis mapped to SB24-205 duties",
    "Draft AI governance policy and consumer disclosure language",
    "Vendor contract review (up to 5 AI vendor agreements)",
    "Written incident response plan template",
    "Final report with prioritized remediation roadmap",
    "FAIIR certification letter on completion",
  ];

  const membershipFeatures = [
    "Quarterly policy refresh and re-certification review",
    "Regulatory update briefings when SB24-205 guidance issues",
    "On-call attorney Q&A (email, 1 business day response)",
    "Audit-trail templates and logging guidance",
    "Incident response coordination if an event occurs",
    "Access to Allora, the Available Law AI legal assistant",
    "Priority scheduling for follow-up consultations",
    "Cancel anytime",
  ];

  return (
    <section id="pricing" className="py-24 md:py-28 bg-[#F5F0EB] border-t border-[#1F1810]/8">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-xs font-semibold text-[#C17832] uppercase tracking-widest mb-3">
            Pricing
          </p>
          <h2
            className="text-3xl md:text-4xl text-[#1F1810] leading-tight mb-4"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            One assessment. Ongoing peace of mind.
          </h2>
          <p className="text-[#6B5B4E] leading-relaxed">
            Start with the attorney-led readiness assessment. Stay compliant
            with an ongoing membership. Both priced to be accessible to
            small and mid-sized businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Assessment card */}
          <div className="bg-white rounded-3xl border-2 border-[#1F1810] p-8 md:p-10 relative flex flex-col">
            <div className="absolute -top-3 left-8 px-3 py-1 bg-[#1F1810] text-[#F2B870] text-[10px] font-semibold uppercase tracking-widest rounded-full">
              Start here
            </div>
            <div className="mb-6">
              <h3
                className="text-2xl text-[#1F1810] mb-2"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
              >
                FAIIR Readiness Assessment
              </h3>
              <p className="text-sm text-[#6B5B4E]">
                One-time, fixed-fee, attorney-led audit against every duty
                SB24-205 imposes on deployers.
              </p>
            </div>
            <div className="mb-6 pb-6 border-b border-[#1F1810]/10">
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-[#A89279] uppercase tracking-widest">
                  Starting at
                </span>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span
                  className="text-5xl text-[#1F1810]"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
                >
                  $2,500
                </span>
                <span className="text-sm text-[#A89279]">one-time</span>
              </div>
              <p className="text-xs text-[#6B5B4E] mt-2 leading-relaxed">
                Final fee quoted after a free 30-minute scoping call. Scales
                with the number of high-risk AI systems and the depth of
                remediation required. Typical range: $2,500–$5,000.
              </p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {assessmentFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-[#1F1810]">
                  <Check className="w-4 h-4 text-[#C17832] flex-shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a
              href={DISCOVERY_CALL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-[#1F1810] text-white rounded-full text-sm font-medium hover:bg-[#C17832] transition-all"
            >
              <Calendar className="w-4 h-4" />
              Book a free discovery call
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>

          {/* Membership card */}
          <div
            id="membership"
            className="bg-white rounded-3xl border border-[#1F1810]/15 p-8 md:p-10 flex flex-col"
          >
            <div className="mb-6">
              <h3
                className="text-2xl text-[#1F1810] mb-2"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
              >
                FAIIR Compliance Membership
              </h3>
              <p className="text-sm text-[#6B5B4E]">
                Ongoing monitoring and attorney access to keep your FAIIR
                certification current between full assessments.
              </p>
            </div>

            {/*
             * Billing cycle toggle. Two pills inside a rounded container —
             * selected state uses the dark brand colour for strong contrast,
             * and the annual pill carries a green "save X%" badge. Defaulting
             * to annual is intentional: the first thing a visitor sees is
             * the discounted price, which anchors the decision.
             */}
            <div
              role="tablist"
              aria-label="Billing cycle"
              className="relative mb-6 inline-flex items-center gap-1 rounded-full border border-[#1F1810]/15 bg-[#FAF8F5] p-1 self-start"
            >
              <button
                type="button"
                role="tab"
                aria-selected={membershipCycle === "monthly"}
                onClick={() => setMembershipCycle("monthly")}
                className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                  membershipCycle === "monthly"
                    ? "bg-[#1F1810] text-white"
                    : "text-[#6B5B4E] hover:text-[#1F1810]"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={membershipCycle === "annual"}
                onClick={() => setMembershipCycle("annual")}
                className={`relative px-4 py-1.5 text-xs font-semibold rounded-full transition-colors ${
                  membershipCycle === "annual"
                    ? "bg-[#1F1810] text-white"
                    : "text-[#6B5B4E] hover:text-[#1F1810]"
                }`}
              >
                Annual
                <span
                  className="absolute -top-2 -right-2 bg-[#7A8B6F] text-white text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded-full shadow-sm"
                  aria-label={`Save ${MEMBERSHIP_ANNUAL_PERCENT_OFF} percent`}
                >
                  SAVE {MEMBERSHIP_ANNUAL_PERCENT_OFF}%
                </span>
              </button>
            </div>

            <div className="mb-6 pb-6 border-b border-[#1F1810]/10">
              <div className="flex items-baseline gap-2">
                <span
                  className="text-5xl text-[#1F1810]"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
                >
                  {membershipPriceLarge}
                </span>
                <span className="text-sm text-[#A89279]">
                  {membershipPriceSuffix}
                </span>
              </div>
              <p className="text-xs text-[#6B5B4E] mt-2 leading-relaxed">
                {membershipSubline}
              </p>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {membershipFeatures.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-[#1F1810]">
                  <Check className="w-4 h-4 text-[#C17832] flex-shrink-0 mt-0.5" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <a
              href={membershipCtaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group w-full inline-flex items-center justify-center gap-2 px-6 py-4 border-2 border-[#1F1810] text-[#1F1810] rounded-full text-sm font-medium hover:bg-[#1F1810] hover:text-white transition-all"
            >
              <CreditCard className="w-4 h-4" />
              {membershipCtaLabel}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Process                                                             */
/* ------------------------------------------------------------------ */

function ProcessSection() {
  const steps = [
    {
      n: "01",
      title: "Free discovery call",
      body: "30-minute video call to identify the AI systems your business deploys, confirm which fall under SB24-205's high-risk definition, and scope the assessment. No obligation.",
    },
    {
      n: "02",
      title: "Fixed-fee engagement",
      body: "You receive a written engagement letter with a fixed fee within one business day. Payment via Stripe, LawPay, or wire. Work begins once the engagement is signed.",
    },
    {
      n: "03",
      title: "Document review &amp; interviews",
      body: "Share existing vendor contracts, privacy policies, AI inventories, and incident logs. Short interviews with your team leads covering how AI is used and overseen day-to-day.",
    },
    {
      n: "04",
      title: "Gap analysis &amp; remediation",
      body: "Structured gap analysis against every SB24-205 duty. Prioritized remediation roadmap. Draft governance policy, consumer disclosure language, and incident response plan.",
    },
    {
      n: "05",
      title: "Certification &amp; ongoing monitoring",
      body: "Written FAIIR certification letter and final report. Optional ongoing membership keeps policies current, tracks regulatory changes, and provides on-call attorney access.",
    },
  ];

  return (
    <section id="process" className="py-24 md:py-28 bg-[#FAF8F5] border-t border-[#1F1810]/8">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold text-[#C17832] uppercase tracking-widest mb-3">
            How it works
          </p>
          <h2
            className="text-3xl md:text-4xl text-[#1F1810] leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            From discovery call to certification in three to six weeks.
          </h2>
        </div>
        <div className="space-y-4">
          {steps.map((step) => (
            <div
              key={step.n}
              className="bg-white border border-[#1F1810]/8 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start"
            >
              <div
                className="text-4xl md:text-5xl text-[#C17832] flex-shrink-0 w-20"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
              >
                {step.n}
              </div>
              <div className="flex-1">
                <h3
                  className="text-xl text-[#1F1810] mb-2"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
                  dangerouslySetInnerHTML={{ __html: step.title }}
                />
                <p
                  className="text-sm text-[#6B5B4E] leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: step.body }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Mid-page checker CTA                                                */
/* ------------------------------------------------------------------ */

function MidCheckerCta() {
  return (
    <section className="py-20 bg-[#F5F0EB] border-t border-[#1F1810]/8">
      <div className="max-w-[900px] mx-auto px-6">
        <div className="bg-white border border-[#1F1810]/10 rounded-3xl p-8 md:p-12 text-center">
          <p className="text-xs font-semibold text-[#C17832] uppercase tracking-widest mb-3">
            Not sure if you&rsquo;re ready?
          </p>
          <h3
            className="text-2xl md:text-3xl text-[#1F1810] mb-4 leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Start with the free 2-minute readiness check.
          </h3>
          <p className="text-[#6B5B4E] mb-7 max-w-xl mx-auto leading-relaxed">
            Ten questions mapped to Colorado SB24-205. Get a personalized
            score and gap analysis before deciding whether a full assessment
            is the right fit.
          </p>
          <Link
            href="/ai-act-checker"
            className="inline-flex items-center gap-2 px-7 py-3 border-2 border-[#1F1810] text-[#1F1810] rounded-full text-sm font-medium hover:bg-[#1F1810] hover:text-white transition-all"
          >
            Take the free readiness check
            <ArrowRight className="w-4 h-4" />
          </Link>
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
            Questions Colorado businesses ask before booking.
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
    <section className="py-24 md:py-32 bg-[#1F1810] text-[#FAF8F5]">
      <div className="max-w-[900px] mx-auto px-6 text-center">
        <Image
          src="/images/faiir-logo.png"
          alt="FAIIR"
          width={72}
          height={72}
          className="object-contain mx-auto mb-8"
        />
        <h2
          className="text-4xl md:text-5xl leading-tight mb-6"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
        >
          Your AI is already deployed.
          <br />
          <span className="italic text-[#F2B870]">Your compliance shouldn&rsquo;t be optional.</span>
        </h2>
        <p className="text-lg text-white/70 leading-relaxed mb-10 max-w-2xl mx-auto">
          Book a free 30-minute discovery call. We&rsquo;ll identify your
          high-risk systems, walk through the SB24-205 duties that apply,
          and scope a fixed-fee FAIIR assessment for your business.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href={DISCOVERY_CALL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-[#C17832] text-white rounded-full text-base font-medium hover:bg-[#F2B870] hover:text-[#1F1810] transition-all shadow-lg shadow-black/20"
          >
            <Calendar className="w-5 h-5" />
            Book a free discovery call
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <a
            href={MEMBERSHIP_CHECKOUT_URL_MONTHLY}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-4 border border-white/30 text-white rounded-full text-base font-medium hover:bg-white hover:text-[#1F1810] transition-all"
          >
            <CreditCard className="w-5 h-5" />
            Start membership — ${MEMBERSHIP_MONTHLY_USD}/mo
          </a>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Footer — subtly credits Available Law as the delivery firm          */
/* ------------------------------------------------------------------ */

function FaiirFooter() {
  return (
    <footer className="bg-[#FAF8F5] border-t border-[#1F1810]/10 py-10">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#A89279]">
        <p className="text-center md:text-left leading-relaxed">
          FAIIR — Foundation for AI Integrity &amp; Regulation. Certification
          work delivered by{" "}
          <Link
            href="/"
            className="underline decoration-[#A89279]/50 hover:text-[#1F1810] hover:decoration-[#1F1810] transition-colors"
          >
            Available Law, LLC
          </Link>
          , a Colorado-licensed virtual law firm.
        </p>
        <div className="flex items-center gap-5">
          <Link
            href="/ai-act-checker"
            className="hover:text-[#1F1810] transition-colors"
          >
            Free readiness check
          </Link>
          <a href="#pricing" className="hover:text-[#1F1810] transition-colors">
            Pricing
          </a>
          <a href="#faq" className="hover:text-[#1F1810] transition-colors">
            FAQ
          </a>
        </div>
      </div>
    </footer>
  );
}
