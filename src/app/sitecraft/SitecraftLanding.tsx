"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  Plus,
  Minus,
  Sparkles,
  Wand2,
  Rocket,
  KeyRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AvaFloatingWidget from "@/components/AvaFloatingWidget";
import WebsiteIntakeForm from "@/components/WebsiteIntakeForm";
import {
  SITECRAFT_HERO,
  SITECRAFT_VALUE_PROPS,
  SITECRAFT_PROCESS,
  SITECRAFT_PACKAGES,
  SITECRAFT_CARE_PLAN,
  SITECRAFT_FAQS,
  SITECRAFT_FULL_NAME,
} from "@/lib/sitecraft";

// One icon per value prop, in order. Kept here (not in the config) because
// icons are a presentation detail of this page, not offering content.
const VALUE_PROP_ICONS: LucideIcon[] = [Sparkles, Wand2, Rocket, KeyRound];

export default function SitecraftLanding() {
  const [intakeOpen, setIntakeOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const openIntake = () => setIntakeOpen(true);

  return (
    <>
      <Header />
      <main className="bg-[#FAF8F5] text-[#1F1810]">
        {/* ---------------------------------------------------------------- */}
        {/* Hero                                                             */}
        {/* ---------------------------------------------------------------- */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "radial-gradient(900px 400px at 50% -10%, rgba(193,120,50,0.14), transparent 70%)",
            }}
          />
          <div className="max-w-[920px] mx-auto px-6 pt-20 pb-16 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C17832]/30 bg-white/60 px-4 py-1.5 mb-7">
              <Sparkles className="w-4 h-4 text-[#C17832]" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B5B4E]">
                {SITECRAFT_HERO.eyebrow}
              </span>
            </div>

            <h1 className="font-heading text-4xl md:text-6xl leading-[1.05] mb-6 whitespace-pre-line">
              {SITECRAFT_HERO.headline}
            </h1>

            <p className="text-lg text-[#6B5B4E] max-w-2xl mx-auto leading-relaxed mb-9">
              {SITECRAFT_HERO.subhead}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={openIntake}
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-[#1F1810] text-white rounded-full text-sm font-medium hover:bg-[#C17832] transition-all"
              >
                {SITECRAFT_HERO.primaryCta}
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <a
                href="#how"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white border border-[#1F1810]/10 text-[#1F1810] rounded-full text-sm font-medium hover:border-[#C17832]/40 transition-all"
              >
                {SITECRAFT_HERO.secondaryCta}
              </a>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Value props                                                      */}
        {/* ---------------------------------------------------------------- */}
        <section className="w-full py-20 lg:py-28 border-t border-[#1F1810]/8">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-14 text-center lg:text-left">
              <p className="text-sm font-medium text-[#C17832] tracking-widest uppercase mb-3">
                Why Sitecraft
              </p>
              <h2 className="font-heading text-4xl lg:text-5xl text-[#1F1810] mb-4 leading-tight">
                A great website, without the agency headache
              </h2>
              <p className="text-lg text-[#6B5B4E] max-w-2xl">
                The heavy lifting is done by AI. The taste, the strategy, and
                the finishing touches are done by a real builder. You get the
                best of both.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {SITECRAFT_VALUE_PROPS.map((prop, i) => {
                const Icon = VALUE_PROP_ICONS[i % VALUE_PROP_ICONS.length];
                return (
                  <div
                    key={prop.title}
                    className="bg-white border border-[#EDE5DB] rounded-[20px] p-8 hover:border-[#D9CCBC] hover:shadow-[0_20px_40px_rgba(31,24,16,0.08)] transition-all duration-300"
                  >
                    <Icon
                      className="w-8 h-8 text-[#1F1810] mb-6"
                      strokeWidth={1.5}
                      aria-hidden="true"
                    />
                    <h3 className="font-heading text-[24px] text-[#1F1810] mb-3 leading-tight">
                      {prop.title}
                    </h3>
                    <p className="text-[15px] text-[#6B5B4E] leading-relaxed">
                      {prop.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Process                                                          */}
        {/* ---------------------------------------------------------------- */}
        <section
          id="how"
          className="w-full py-20 lg:py-28 bg-gradient-to-b from-[#FAF8F5] to-[#F5F0EB] border-y border-[#1F1810]/8 scroll-mt-20"
        >
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-14 text-center">
              <p className="text-sm font-medium text-[#C17832] tracking-widest uppercase mb-3">
                How it works
              </p>
              <h2 className="font-heading text-4xl lg:text-5xl text-[#1F1810] mb-4 leading-tight">
                From idea to launched in four steps
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SITECRAFT_PROCESS.map((step) => (
                <div
                  key={step.number}
                  className="bg-white border border-[#EDE5DB] rounded-2xl p-7"
                >
                  <span className="inline-block text-xs font-semibold text-[#C17832] tracking-[0.15em] mb-4">
                    {step.number}
                  </span>
                  <h3 className="font-heading text-xl text-[#1F1810] mb-2 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#6B5B4E] leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Packages / pricing                                               */}
        {/* ---------------------------------------------------------------- */}
        <section id="packages" className="w-full py-20 lg:py-28 scroll-mt-20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-14 text-center">
              <p className="text-sm font-medium text-[#C17832] tracking-widest uppercase mb-3">
                Packages
              </p>
              <h2 className="font-heading text-4xl lg:text-5xl text-[#1F1810] mb-4 leading-tight">
                Simple, upfront pricing
              </h2>
              <p className="text-lg text-[#6B5B4E] max-w-2xl mx-auto">
                Pick a starting point — we&apos;ll confirm the exact scope and
                price on a quick call before any work begins.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
              {SITECRAFT_PACKAGES.map((pkg) => (
                <div
                  key={pkg.key}
                  className={`relative flex flex-col rounded-[20px] p-8 border transition-all duration-300 ${
                    pkg.featured
                      ? "bg-[#1F1810] border-[#1F1810] shadow-[0_24px_50px_rgba(31,24,16,0.18)]"
                      : "bg-white border-[#EDE5DB] hover:border-[#D9CCBC]"
                  }`}
                >
                  {pkg.featured && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[#C17832] text-white text-[11px] font-semibold uppercase tracking-widest rounded-full">
                      Most popular
                    </span>
                  )}
                  <h3
                    className={`font-heading text-2xl mb-1 ${
                      pkg.featured ? "text-white" : "text-[#1F1810]"
                    }`}
                  >
                    {pkg.name}
                  </h3>
                  <p
                    className={`text-sm mb-5 leading-relaxed ${
                      pkg.featured ? "text-white/60" : "text-[#6B5B4E]"
                    }`}
                  >
                    {pkg.blurb}
                  </p>
                  <div className="mb-6">
                    <span
                      className={`font-heading text-4xl ${
                        pkg.featured ? "text-white" : "text-[#1F1810]"
                      }`}
                    >
                      {pkg.price}
                    </span>
                    <span
                      className={`ml-2 text-xs ${
                        pkg.featured ? "text-white/50" : "text-[#A89279]"
                      }`}
                    >
                      {pkg.priceNote}
                    </span>
                  </div>
                  <ul className="flex flex-col gap-3 mb-8 flex-grow">
                    {pkg.features.map((feature) => (
                      <li
                        key={feature}
                        className={`flex items-start gap-2.5 text-sm ${
                          pkg.featured ? "text-white/80" : "text-[#6B5B4E]"
                        }`}
                      >
                        <Check
                          className={`w-4 h-4 flex-shrink-0 mt-0.5 ${
                            pkg.featured ? "text-[#F2B870]" : "text-[#C17832]"
                          }`}
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={openIntake}
                    className={`mt-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-all ${
                      pkg.featured
                        ? "bg-[#C17832] text-white hover:bg-white hover:text-[#1F1810]"
                        : "bg-[#1F1810] text-white hover:bg-[#C17832]"
                    }`}
                  >
                    Start your project
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {SITECRAFT_CARE_PLAN && (
              <p className="text-center text-sm text-[#6B5B4E] mt-8 max-w-2xl mx-auto">
                <span className="font-semibold text-[#1F1810]">
                  {SITECRAFT_CARE_PLAN.price}
                </span>{" "}
                — {SITECRAFT_CARE_PLAN.description}
              </p>
            )}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* FAQ                                                              */}
        {/* ---------------------------------------------------------------- */}
        <section className="w-full py-20 lg:py-28 bg-gradient-to-b from-[#FAF8F5] to-[#F5F0EB] border-y border-[#1F1810]/8">
          <div className="max-w-3xl mx-auto px-6">
            <div className="mb-12 text-center">
              <p className="text-sm font-medium text-[#C17832] tracking-widest uppercase mb-3">
                Questions
              </p>
              <h2 className="font-heading text-4xl lg:text-5xl text-[#1F1810] leading-tight">
                Good to know
              </h2>
            </div>

            <div className="flex flex-col gap-3">
              {SITECRAFT_FAQS.map((faq, i) => {
                const open = openFaq === i;
                return (
                  <div
                    key={faq.question}
                    className="bg-white border border-[#EDE5DB] rounded-2xl overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(open ? null : i)}
                      className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
                      aria-expanded={open}
                    >
                      <span className="font-heading text-lg text-[#1F1810]">
                        {faq.question}
                      </span>
                      {open ? (
                        <Minus className="w-5 h-5 text-[#C17832] flex-shrink-0" />
                      ) : (
                        <Plus className="w-5 h-5 text-[#C17832] flex-shrink-0" />
                      )}
                    </button>
                    {open && (
                      <div className="px-6 pb-6 -mt-1">
                        <p className="text-[15px] text-[#6B5B4E] leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Closing CTA                                                      */}
        {/* ---------------------------------------------------------------- */}
        <section className="w-full py-20 lg:py-28">
          <div className="max-w-5xl mx-auto px-6">
            <div className="bg-[#1F1810] rounded-3xl p-10 md:p-16 text-center">
              <h2 className="font-heading text-3xl md:text-5xl text-white mb-5 leading-tight">
                Ready for a website you&apos;re proud to share?
              </h2>
              <p className="text-lg text-white/70 max-w-2xl mx-auto mb-9 leading-relaxed">
                Tell us about your business and we&apos;ll take it from there.
                No obligation — just a clear next step.
              </p>
              <button
                type="button"
                onClick={openIntake}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-[#C17832] text-white rounded-full text-sm font-medium hover:bg-white hover:text-[#1F1810] transition-all"
              >
                Start your project
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <AvaFloatingWidget />

      {/* Screen-reader-only brand name anchor for context; visually the
          header already carries the Available Law identity. */}
      <span className="sr-only">{SITECRAFT_FULL_NAME}</span>

      <WebsiteIntakeForm isOpen={intakeOpen} onClose={() => setIntakeOpen(false)} />
    </>
  );
}
