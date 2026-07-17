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
  Mail,
} from "lucide-react";
import FaiirIntakeForm from "@/components/FaiirIntakeForm";
import FaiirSocialProof from "./FaiirSocialProof";

interface Faq {
  question: string;
  answer: string;
}

interface FaiirLandingProps {
  faqs: Faq[];
}

// Single source of truth for discovery call + Stripe Payment Links.
// Update in one place if any change.
const DISCOVERY_CALL_URL =
  "https://calendly.com/availablelaw/free-faiir-discovery-call";

// Stripe Payment Links for the Standard membership tier (existing, live).
// Higher tiers (Plus, Enterprise) route to the discovery call until new
// Stripe Payment Links are created — see TODOs below.
const STANDARD_MEMBERSHIP_URL_MONTHLY =
  "https://buy.stripe.com/6oU3cvggQ30Ffz50J6cMM0d";
const STANDARD_MEMBERSHIP_URL_ANNUAL =
  "https://buy.stripe.com/bJe9ATaWw6cRev12RecMM0e";

// TODO: Create Stripe Payment Links for Plus monthly + annual and drop them
// here. Until then, Plus tier CTAs route to the discovery call so the page
// doesn't ship broken URLs.
const PLUS_MEMBERSHIP_URL_MONTHLY = DISCOVERY_CALL_URL;
const PLUS_MEMBERSHIP_URL_ANNUAL = DISCOVERY_CALL_URL;

type MembershipCycle = "monthly" | "annual";

/* ------------------------------------------------------------------ */
/* Pricing data — single source of truth for every card on the page   */
/* ------------------------------------------------------------------ */

interface AssessmentTier {
  key: "starter" | "professional" | "enterprise";
  name: string;
  tagline: string;
  /** Null = custom / "From $X". */
  priceUsd: number | null;
  priceLabel: string; // e.g. "$2,500", "From $15,000"
  priceSuffix: string; // e.g. "one-time"
  footnote: string;
  badge?: string;
  featured?: boolean;
  features: string[];
  ctaLabel: string;
  ctaUrl: string;
}

interface MembershipTier {
  key: "standard" | "plus" | "enterprise";
  name: string;
  tagline: string;
  /** Null = custom pricing (Enterprise). */
  monthlyUsd: number | null;
  /** Null = custom pricing (Enterprise). */
  annualUsd: number | null;
  featured?: boolean;
  features: string[];
  /** URLs per billing cycle. For Enterprise, both point to discovery call. */
  monthlyUrl: string;
  annualUrl: string;
}

const ASSESSMENT_TIERS: AssessmentTier[] = [
  {
    key: "starter",
    name: "Starter",
    tagline: "For SMBs with one or two AI systems making consequential decisions.",
    priceUsd: 2500,
    priceLabel: "$2,500",
    priceSuffix: "one-time",
    footnote:
      "Fixed fee for 1–2 in-scope ADMT systems, single business unit. Scoped on a free 30-min discovery call.",
    badge: "Start here",
    features: [
      "Attorney-led ADMT inventory and covered-ADMT classification (up to 2 systems)",
      "Written system review (1 per covered ADMT)",
      "Gap analysis mapped to SB 26-189 duties",
      "Draft pre-use notice and 30-day adverse-outcome notice templates",
      "Vendor contract review (up to 5 agreements)",
      "Meaningful human-review process documentation",
      "Final report with prioritized remediation roadmap",
      "FAIIR certification letter on completion",
      "Typical delivery: 3 weeks",
    ],
    ctaLabel: "Book a free discovery call",
    ctaUrl: DISCOVERY_CALL_URL,
  },
  {
    key: "professional",
    name: "Professional",
    tagline: "For growing teams running multiple AI-driven workflows.",
    priceUsd: 5000,
    priceLabel: "$5,000",
    priceSuffix: "one-time",
    footnote:
      "Fixed fee for 3–5 high-risk systems. Includes bias-audit methodology and a board-ready executive summary.",
    badge: "Most popular",
    featured: true,
    features: [
      "Everything in Starter, plus:",
      "Up to 5 written ADMT system reviews",
      "Vendor contract review (up to 10 agreements)",
      "Disparate-impact monitoring methodology + first pass",
      "Board-ready executive summary + risk register",
      "Stakeholder workshop (1 hour, virtual)",
      "Priority delivery: 2–3 weeks",
    ],
    ctaLabel: "Book a free discovery call",
    ctaUrl: DISCOVERY_CALL_URL,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    tagline: "For multi-BU operators and regulated-industry deployers.",
    priceUsd: null,
    priceLabel: "From $15,000",
    priceSuffix: "one-time",
    footnote:
      "Custom scope for 6+ covered ADMT systems, multiple business units, or regulated industries (healthcare, finance, insurance, education, housing, or essential government services).",
    features: [
      "Everything in Professional, plus:",
      "Unlimited ADMT system reviews and vendor reviews",
      "Multi-business-unit scoping and notice rollout",
      "Dedicated engagement attorney",
      "Custom disparate-impact working sessions with your data team",
      "Expert-witness-quality documentation",
      "White-glove delivery: 4–6 weeks",
      "Quarterly partner debriefs through Year 1",
    ],
    ctaLabel: "Talk to us",
    ctaUrl: DISCOVERY_CALL_URL,
  },
];

const MEMBERSHIP_TIERS: MembershipTier[] = [
  {
    key: "standard",
    name: "Standard",
    tagline: "Stay certified. Light-touch monitoring for 1–2 AI systems.",
    monthlyUsd: 49,
    annualUsd: 490,
    features: [
      "Coverage for 1–2 covered ADMT systems",
      "Quarterly notice + process refresh + re-certification review",
      "Regulatory update briefings when SB 26-189 guidance issues",
      "Email attorney Q&A — 1 business day response",
      "Recordkeeping templates and decision-log guidance",
      "5 vendor contract spot-checks per year",
      "Ava AI legal assistant access",
      "Cancel anytime",
    ],
    monthlyUrl: STANDARD_MEMBERSHIP_URL_MONTHLY,
    annualUrl: STANDARD_MEMBERSHIP_URL_ANNUAL,
  },
  {
    key: "plus",
    name: "Plus",
    tagline: "For teams running multiple systems who want faster turnarounds.",
    monthlyUsd: 149,
    annualUsd: 1490,
    featured: true,
    features: [
      "Coverage for up to 5 covered ADMT systems",
      "Monthly notice + process refresh, ad-hoc updates when guidance issues",
      "Email + chat attorney Q&A — same-day response",
      "15 vendor contract spot-checks per year",
      "Consumer complaint / AG inquiry coordination — same-day engagement",
      "Quarterly virtual business review with your attorney",
      "Priority Ava queue",
      "Annual re-certification audit included (a $1,250 value)",
      "Cancel anytime",
    ],
    monthlyUrl: PLUS_MEMBERSHIP_URL_MONTHLY,
    annualUrl: PLUS_MEMBERSHIP_URL_ANNUAL,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    tagline:
      "Unlimited coverage, dedicated attorney, custom SLA. Talk to us.",
    monthlyUsd: null,
    annualUsd: null,
    features: [
      "Unlimited systems covered across all business units",
      "Continuous monitoring + proactive regulatory briefings",
      "Dedicated attorney with custom SLA (same-day standard)",
      "Unlimited vendor contract reviews",
      "24/7 incident response hotline",
      "Quarterly on-site or virtual partner reviews",
      "Custom board reporting and compliance dashboards",
      "Annual re-certification audit included",
      "Annual contract",
    ],
    monthlyUrl: DISCOVERY_CALL_URL,
    annualUrl: DISCOVERY_CALL_URL,
  },
];

// Re-certification audit — distinct product, priced separately.
// Mirrors ISO / SOC-2 surveillance audit convention.
const RECERT_FEE_USD = 1250;

// Membership savings math helpers. Always derive from the tier objects so
// nothing ever drifts out of sync.
function annualMonthlyEquivalent(tier: MembershipTier): number | null {
  return tier.annualUsd == null ? null : Math.round(tier.annualUsd / 12);
}
function annualSavingsUsd(tier: MembershipTier): number | null {
  if (tier.monthlyUsd == null || tier.annualUsd == null) return null;
  return tier.monthlyUsd * 12 - tier.annualUsd;
}
function annualPercentOff(tier: MembershipTier): number | null {
  if (tier.monthlyUsd == null || tier.annualUsd == null) return null;
  const save = tier.monthlyUsd * 12 - tier.annualUsd;
  return Math.round((save / (tier.monthlyUsd * 12)) * 100);
}
// Max percent-off across paid tiers — used in the toggle's "Save up to X%"
// chip so we never advertise a number the math can't back up.
const MAX_MEMBERSHIP_PERCENT_OFF = Math.max(
  0,
  ...MEMBERSHIP_TIERS.map((t) => annualPercentOff(t) ?? 0),
);

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
      {/* Consent-gated: renders nothing until a client has opted in via the
          portal's "Share the win" card (and, for the firm strip, holds an
          active certification). */}
      <FaiirSocialProof />
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
          <Link
            href="/faiir/framework"
            className="hidden md:inline text-[#6B5B4E] hover:text-[#1F1810] transition-colors"
          >
            The framework
          </Link>
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
  const [intakeOpen, setIntakeOpen] = useState(false);
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-[#F5F0EB] via-[#FAF8F5] to-[#FAF8F5]" />
      <div className="relative max-w-[1200px] mx-auto px-6 pt-20 pb-24 md:pt-28 md:pb-32">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#C17832]/10 border border-[#C17832]/30 text-[#C17832] text-xs font-semibold uppercase tracking-widest mb-6">
            <ShieldCheck className="w-3.5 h-3.5" />
            Colorado AI Act · SB 26-189
          </div>
          <h1
            className="text-[44px] md:text-[64px] leading-[1.05] text-[#1F1810] mb-6"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Colorado&rsquo;s new AI Act is here.
            <br />
            <span className="italic text-[#C17832]">Prove your business is ready.</span>
          </h1>
          <p className="text-lg md:text-xl text-[#6B5B4E] leading-relaxed mb-10 max-w-2xl mx-auto">
            FAIIR is the attorney-led compliance certification for businesses
            deploying covered ADMT in Colorado. One assessment, one written
            report, ongoing monitoring — built around the disclosure and
            human-review duties in Senate Bill 26-189.
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
          {/* Secondary path for visitors who aren't ready to book a call —
              opens the FaiirIntakeForm modal and writes to faiir_intakes. */}
          <button
            type="button"
            onClick={() => setIntakeOpen(true)}
            className="mt-4 inline-flex items-center gap-1.5 text-sm text-[#6B5B4E] hover:text-[#C17832] underline underline-offset-4 decoration-[#A89279]/40 hover:decoration-[#C17832] transition-colors"
          >
            <Mail className="w-3.5 h-3.5" />
            Not ready for a call? Send us a message instead
          </button>
          <p className="mt-6 text-xs text-[#A89279] uppercase tracking-widest">
            Free 30-min scoping call · Fixed-fee engagement · Colorado-licensed attorney
          </p>
        </div>
      </div>
      <FaiirIntakeForm
        isOpen={intakeOpen}
        onClose={() => setIntakeOpen(false)}
      />
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
      headline: "Enforcement starts January 1, 2027",
      body: "Colorado's Attorney General has exclusive authority to enforce SB 26-189 against developers and deployers of covered ADMT. A 60-day cure period applies until 2030 — and disappears after that.",
    },
    {
      icon: Scale,
      headline: "The law applies broadly",
      body: "Any business using ADMT to materially influence consequential decisions about education, employment, residential real estate, lending, insurance, healthcare, or government services is a deployer under the statute.",
    },
    {
      icon: FileSearch,
      headline: "Most businesses have no plan",
      body: "Pre-use notices, 30-day adverse-outcome notices, meaningful human review, developer documentation, and 3-year recordkeeping are all required. Most Colorado businesses do not yet have any of these in writing.",
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
            Colorado&rsquo;s 2026 rewrite of its AI law is the most far-reaching state AI law in the U.S.
          </h2>
          <p className="text-[#6B5B4E] leading-relaxed">
            It imposes affirmative duties on the deployers of covered ADMT —
            not just the developers. If your business uses AI to decide who
            gets hired, approved, admitted, insured, or served, SB 26-189
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
          Foundation of AI Integrity &amp; Regulation
        </div>
        <h2
          className="text-4xl md:text-5xl leading-tight mb-6"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
        >
          FAIIR is an attorney-led compliance certification{" "}
          <span className="italic text-[#F2B870]">built for Colorado businesses</span>.
        </h2>
        <p className="text-lg text-white/70 leading-relaxed max-w-2xl mx-auto mb-5">
          FAIIR organizes responsible AI use into five pillars — Fitness for
          purpose, Accountability, Integrity of data, Informed use, and Risk
          management — with 41 documented pass/fail controls underneath. A
          FAIIR-certified business has been assessed against that standard by
          a licensed attorney, mapped to the specific duties SB 26-189
          imposes, and maintains it through ongoing monitoring. The work
          product is legal analysis, not a generic audit checklist.
        </p>
        <Link
          href="/faiir/framework"
          className="inline-flex items-center gap-2 text-[#F2B870] hover:text-white text-sm font-medium underline underline-offset-4 decoration-[#F2B870]/50 hover:decoration-white transition-colors"
        >
          Read the full framework — the five pillars, in plain language
          <ArrowRight className="w-4 h-4" />
        </Link>
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
      icon: ClipboardCheck,
      title: "Fitness for purpose",
      question: "Is this AI actually suited to the task you're using it for?",
      body: "A register of every AI system in use, what each is authorized for, and what it must never be used for. Under SB 26-189, this is where covered-ADMT classification and plain-language system reviews live.",
    },
    {
      icon: Scale,
      title: "Accountability",
      question:
        "When something goes wrong, who owns it — and was that decided in advance?",
      body: "A named AI officer, a decision log, and vendor contracts reviewed against the statute's developer-documentation duties — so you know who indemnifies you before you need them to.",
    },
    {
      icon: FileSearch,
      title: "Integrity of data",
      question:
        "What goes into the AI, where does it go, and how long does it live there?",
      body: "Written rules on what data may enter which tool, training-data opt-outs configured, and retention terms documented. The pillar most businesses fail first.",
    },
    {
      icon: Users,
      title: "Informed use",
      question:
        "Do your employees and customers actually know what's going on?",
      body: "An acknowledged AI use policy, documented training, and the disclosures SB 26-189 makes mandatory: pre-use notices and templated 30-day adverse-outcome notices, backed by meaningful human review.",
    },
    {
      icon: ShieldCheck,
      title: "Risk management",
      question:
        "If it goes wrong, will you know, contain it, and be able to prove what you did?",
      body: "A risk register, an incident playbook, and a 3-year recordkeeping framework that survives an AG cure notice. This is where carriers and regulators actually look.",
    },
  ];

  return (
    <section className="py-24 md:py-28 bg-[#FAF8F5] border-t border-[#1F1810]/8">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center mb-14">
          <p className="text-xs font-semibold text-[#C17832] uppercase tracking-widest mb-3">
            The Framework
          </p>
          <h2
            className="text-3xl md:text-4xl text-[#1F1810] leading-tight mb-4"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            The five pillars of FAIIR.
          </h2>
          <p className="text-[#6B5B4E] leading-relaxed">
            F-A-I-I-R: every assessment scores your business against the same
            five pillars, mapped to the specific duties Colorado&rsquo;s AI
            Act imposes.
          </p>
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
                  className="text-xl text-[#1F1810] mb-2"
                  style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
                >
                  {pillar.title}
                </h3>
                <p className="text-[13px] font-medium text-[#C17832] italic mb-3">
                  &ldquo;{pillar.question}&rdquo;
                </p>
                <p className="text-sm text-[#6B5B4E] leading-relaxed">
                  {pillar.body}
                </p>
              </div>
            );
          })}
          {/* Sixth cell links to the full framework so the 5-card grid
              stays balanced on two columns. */}
          <Link
            href="/faiir/framework"
            className="group bg-[#1F1810] rounded-2xl p-7 flex flex-col justify-between hover:bg-[#2A2015] transition-all"
          >
            <div>
              <p className="text-xs font-semibold text-[#F2B870] uppercase tracking-widest mb-3">
                Go deeper
              </p>
              <h3
                className="text-xl text-white mb-2"
                style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
              >
                Read the full framework.
              </h3>
              <p className="text-sm text-white/60 leading-relaxed">
                All five pillars in plain language — the 41 pass/fail
                controls, what a certification letter does (and
                doesn&rsquo;t) mean, and what FAIIR is benchmarked against.
              </p>
            </div>
            <span className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#F2B870] group-hover:text-white transition-colors">
              Explore the standard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pricing                                                             */
/* ------------------------------------------------------------------ */

function PricingSection() {
  // One billing cycle for the entire membership row — toggling once flips
  // all three cards together, so the comparison stays apples-to-apples.
  // Default annual to anchor on the discount.
  const [membershipCycle, setMembershipCycle] =
    useState<MembershipCycle>("annual");

  return (
    <section id="pricing" className="py-24 md:py-28 bg-[#F5F0EB] border-t border-[#1F1810]/8">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section header */}
        <div className="max-w-2xl mx-auto text-center mb-10">
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
            Start with a one-time, fixed-fee attorney audit. Stay certified
            with an ongoing membership. Three sizes of each — pick what fits
            the AI you actually run.
          </p>
        </div>

        {/* Assessment row */}
        <div className="mt-16 mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-[#C17832] uppercase tracking-widest mb-2">
              Step 1 · One-time assessment
            </p>
            <h3
              className="text-2xl md:text-3xl text-[#1F1810] leading-tight"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
            >
              Pick the assessment that fits your footprint.
            </h3>
          </div>
          <p className="text-xs text-[#6B5B4E] max-w-sm md:text-right">
            All tiers fixed-fee. Final scope confirmed on a free 30-minute
            discovery call before any engagement letter is signed.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {ASSESSMENT_TIERS.map((tier) => (
            <AssessmentCard key={tier.key} tier={tier} />
          ))}
        </div>

        {/* Membership row */}
        <div className="mt-20 mb-6 flex items-end justify-between gap-4 flex-wrap">
          <div>
            <p className="text-xs font-semibold text-[#C17832] uppercase tracking-widest mb-2">
              Step 2 · Ongoing membership
            </p>
            <h3
              className="text-2xl md:text-3xl text-[#1F1810] leading-tight"
              style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
            >
              Stay certified as the rules — and your AI — keep changing.
            </h3>
          </div>

          {/* Billing cycle toggle, mirrored from the previous design.
              Drives all three membership cards in the row below. */}
          <div
            role="tablist"
            aria-label="Membership billing cycle"
            className="relative inline-flex items-center gap-1 rounded-full border border-[#1F1810]/15 bg-white p-1"
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
              {MAX_MEMBERSHIP_PERCENT_OFF > 0 && (
                <span
                  className="absolute -top-2 -right-2 bg-[#7A8B6F] text-white text-[9px] font-bold tracking-wide px-1.5 py-0.5 rounded-full shadow-sm"
                  aria-label={`Save up to ${MAX_MEMBERSHIP_PERCENT_OFF} percent`}
                >
                  SAVE {MAX_MEMBERSHIP_PERCENT_OFF}%
                </span>
              )}
            </button>
          </div>
        </div>

        <div id="membership" className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {MEMBERSHIP_TIERS.map((tier) => (
            <MembershipCard
              key={tier.key}
              tier={tier}
              cycle={membershipCycle}
            />
          ))}
        </div>

        {/* Re-certification audit — distinct from membership.
            Mirrors ISO/SOC convention; bundled free for Plus/Enterprise. */}
        <RecertCallout />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Pricing sub-components                                              */
/* ------------------------------------------------------------------ */

function AssessmentCard({ tier }: { tier: AssessmentTier }) {
  const featured = tier.featured;
  return (
    <div
      className={`relative bg-white rounded-3xl p-7 md:p-8 flex flex-col ${
        featured
          ? "border-2 border-[#1F1810] shadow-[0_20px_40px_rgba(31,24,16,0.12)]"
          : "border border-[#1F1810]/10"
      }`}
    >
      {tier.badge && (
        <div
          className={`absolute -top-3 left-6 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest rounded-full ${
            featured
              ? "bg-[#C17832] text-white"
              : "bg-[#1F1810] text-[#F2B870]"
          }`}
        >
          {tier.badge}
        </div>
      )}

      <div className="mb-5">
        <h4
          className="text-xl text-[#1F1810] mb-1.5"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
        >
          FAIIR Assessment — {tier.name}
        </h4>
        <p className="text-xs text-[#6B5B4E] leading-relaxed">{tier.tagline}</p>
      </div>

      <div className="mb-5 pb-5 border-b border-[#1F1810]/10">
        <div className="flex items-baseline gap-2">
          <span
            className="text-4xl md:text-[42px] text-[#1F1810]"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            {tier.priceLabel}
          </span>
          <span className="text-xs text-[#A89279]">{tier.priceSuffix}</span>
        </div>
        <p className="text-[11px] text-[#6B5B4E] mt-2 leading-relaxed">
          {tier.footnote}
        </p>
      </div>

      <ul className="space-y-2.5 mb-7 flex-1">
        {tier.features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2.5 text-[13px] text-[#1F1810]"
          >
            <Check className="w-3.5 h-3.5 text-[#C17832] flex-shrink-0 mt-1" />
            <span className="leading-snug">{f}</span>
          </li>
        ))}
      </ul>

      <a
        href={tier.ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`group w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all ${
          featured
            ? "bg-[#1F1810] text-white hover:bg-[#C17832]"
            : "border border-[#1F1810] text-[#1F1810] hover:bg-[#1F1810] hover:text-white"
        }`}
      >
        <Calendar className="w-4 h-4" />
        {tier.ctaLabel}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </a>
    </div>
  );
}

function MembershipCard({
  tier,
  cycle,
}: {
  tier: MembershipTier;
  cycle: MembershipCycle;
}) {
  const featured = tier.featured;
  const isCustom = tier.monthlyUsd == null || tier.annualUsd == null;
  const monthlyEq = annualMonthlyEquivalent(tier);
  const savings = annualSavingsUsd(tier);
  const percentOff = annualPercentOff(tier);

  // Render price block — handles custom (Enterprise) vs. fixed pricing,
  // and monthly vs. annual cycles.
  let priceLarge: string;
  let priceSuffix: string;
  let subline: string;
  let ctaUrl: string;
  let ctaLabel: string;

  if (isCustom) {
    priceLarge = "Custom";
    priceSuffix = "from $499/mo";
    subline = "Annual contract. Pricing scoped to your AI footprint.";
    ctaUrl = tier.monthlyUrl; // both URLs point to discovery call
    ctaLabel = "Talk to us";
  } else if (cycle === "annual") {
    priceLarge = `$${monthlyEq}`;
    priceSuffix = "per month, billed yearly";
    subline =
      savings != null && savings > 0 && percentOff != null
        ? `$${tier.annualUsd!.toLocaleString()}/year · save $${savings} (${percentOff}% off) vs. monthly`
        : `$${tier.annualUsd!.toLocaleString()}/year · cancel anytime`;
    ctaUrl = tier.annualUrl;
    ctaLabel = `Start membership — $${tier.annualUsd!.toLocaleString()}/yr`;
  } else {
    priceLarge = `$${tier.monthlyUsd}`;
    priceSuffix = "per month";
    subline = "Billed monthly. Cancel anytime.";
    ctaUrl = tier.monthlyUrl;
    ctaLabel = `Start membership — $${tier.monthlyUsd}/mo`;
  }

  return (
    <div
      className={`relative bg-white rounded-3xl p-7 md:p-8 flex flex-col ${
        featured
          ? "border-2 border-[#1F1810] shadow-[0_20px_40px_rgba(31,24,16,0.12)]"
          : "border border-[#1F1810]/10"
      }`}
    >
      {featured && (
        <div className="absolute -top-3 left-6 px-3 py-1 bg-[#C17832] text-white text-[10px] font-semibold uppercase tracking-widest rounded-full">
          Most popular
        </div>
      )}

      <div className="mb-5">
        <h4
          className="text-xl text-[#1F1810] mb-1.5"
          style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
        >
          FAIIR Membership — {tier.name}
        </h4>
        <p className="text-xs text-[#6B5B4E] leading-relaxed">{tier.tagline}</p>
      </div>

      <div className="mb-5 pb-5 border-b border-[#1F1810]/10">
        <div className="flex items-baseline gap-2">
          <span
            className="text-4xl md:text-[42px] text-[#1F1810]"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            {priceLarge}
          </span>
          <span className="text-xs text-[#A89279]">{priceSuffix}</span>
        </div>
        <p className="text-[11px] text-[#6B5B4E] mt-2 leading-relaxed">
          {subline}
        </p>
      </div>

      <ul className="space-y-2.5 mb-7 flex-1">
        {tier.features.map((f) => (
          <li
            key={f}
            className="flex items-start gap-2.5 text-[13px] text-[#1F1810]"
          >
            <Check className="w-3.5 h-3.5 text-[#C17832] flex-shrink-0 mt-1" />
            <span className="leading-snug">{f}</span>
          </li>
        ))}
      </ul>

      <a
        href={ctaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`group w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all ${
          featured
            ? "bg-[#1F1810] text-white hover:bg-[#C17832]"
            : "border border-[#1F1810] text-[#1F1810] hover:bg-[#1F1810] hover:text-white"
        }`}
      >
        <CreditCard className="w-4 h-4" />
        {ctaLabel}
        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
      </a>
    </div>
  );
}

function RecertCallout() {
  return (
    <div className="mt-10 rounded-2xl border border-[#1F1810]/10 bg-white p-6 md:p-7 flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
      <div className="flex-shrink-0 w-11 h-11 rounded-xl bg-[#C17832]/10 flex items-center justify-center">
        <ShieldCheck className="w-5 h-5 text-[#C17832]" />
      </div>
      <div className="flex-1">
        <p className="text-xs font-semibold text-[#C17832] uppercase tracking-widest mb-1.5">
          Annual re-certification
        </p>
        <p className="text-[15px] text-[#1F1810] leading-relaxed">
          <span className="font-semibold">${RECERT_FEE_USD.toLocaleString()}/year</span>{" "}
          attorney-led review to keep your FAIIR letter current after Year 1.
          Lighter touch than the full assessment, focused on what changed.
          <span className="text-[#6B5B4E]">
            {" "}
            Bundled free into Plus and Enterprise membership.
          </span>
        </p>
      </div>
      <a
        href={DISCOVERY_CALL_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 inline-flex items-center gap-2 px-5 py-2.5 border border-[#1F1810] text-[#1F1810] rounded-full text-sm font-medium hover:bg-[#1F1810] hover:text-white transition-colors"
      >
        Ask about re-cert
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
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
      body: "30-minute video call to identify the AI systems your business deploys, confirm which qualify as covered ADMT under SB 26-189, and scope the assessment. No obligation.",
    },
    {
      n: "02",
      title: "Fixed-fee engagement",
      body: "You receive a written engagement letter with a fixed fee within one business day. Payment via Stripe, LawPay, or wire. Work begins once the engagement is signed.",
    },
    {
      n: "03",
      title: "Document review &amp; interviews",
      body: "Share existing vendor contracts, privacy policies, ADMT inventories, and any prior consumer-notice language. Short interviews with your team leads covering how AI is used and overseen day-to-day.",
    },
    {
      n: "04",
      title: "Gap analysis &amp; remediation",
      body: "Structured gap analysis against every SB 26-189 duty. Prioritized remediation roadmap. Draft pre-use notice, adverse-outcome notice template, and meaningful human-review workflow.",
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
            Ten questions mapped to Colorado SB 26-189. Get a personalized
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
          width={216}
          height={216}
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
          covered ADMT systems, walk through the SB 26-189 duties that
          apply, and scope a fixed-fee FAIIR assessment for your business.
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
            href="#pricing"
            className="inline-flex items-center gap-2 px-8 py-4 border border-white/30 text-white rounded-full text-base font-medium hover:bg-white hover:text-[#1F1810] transition-all"
          >
            <CreditCard className="w-5 h-5" />
            Compare membership tiers
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
          FAIIR — Foundation of AI Integrity &amp; Regulation, a standard
          maintained by FAIIR, LLC. Legal services delivered by{" "}
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
            href="/faiir/framework"
            className="hover:text-[#1F1810] transition-colors"
          >
            The framework
          </Link>
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
