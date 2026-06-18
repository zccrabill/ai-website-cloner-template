"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FlaskConical,
  Mic,
  Scale,
  Rocket,
  Users,
  Lightbulb,
  ArrowRight,
  Check,
  Plus,
  Minus,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AvaFloatingWidget from "@/components/AvaFloatingWidget";
import {
  YLAB_TIERS,
  YLabTierKey,
  annualSavingsUsd,
  ATTORNEY_TASK_DEFINITION,
} from "@/lib/tiers";
import { getCheckoutLink } from "@/lib/checkout";

interface Faq {
  question: string;
  answer: string;
}

interface YLabLandingProps {
  faqs: Faq[];
}

const YLAB_TIER_ORDER: YLabTierKey[] = ["ylab_build", "ylab_grow"];

/** Open Ava with a Y Lab–specific seed prompt — used for every waitlist CTA
 *  while live teen checkout is still being wired (Stripe products pending). */
function openYLabWaitlist(seed: string) {
  window.dispatchEvent(new CustomEvent("ava:open", { detail: { seed } }));
}

const WAITLIST_SEED =
  "I'm interested in Y Lab for a teen entrepreneur. Can you tell me how to get on the founding-member waitlist and what a parent/guardian needs to do?";

export default function YLabLanding({ faqs }: YLabLandingProps) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

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
              <FlaskConical className="w-4 h-4 text-[#C17832]" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6B5B4E]">
                Y Lab · Youth Leadership &amp; Business
              </span>
            </div>

            <h1 className="font-heading text-4xl md:text-6xl leading-[1.05] mb-6">
              The next generation of founders
              <br className="hidden md:block" /> shouldn&apos;t have to wait until 18.
            </h1>

            <p className="text-base md:text-xl text-[#6B5B4E] leading-relaxed max-w-[680px] mx-auto mb-9">
              Y Lab is a youth-led legal and business lab for teen entrepreneurs.
              You bring the problems worth solving. We help you build the
              solution, give you real legal backup, and organize to change the
              law that&apos;s holding your generation back — guided by an attorney
              who started young himself.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => openYLabWaitlist(WAITLIST_SEED)}
                className="btn-al btn-al-primary text-sm px-7 py-3"
              >
                Join the founding waitlist
              </button>
              <a
                href="#podcast"
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#1F1810] border border-[#C17832] rounded-full px-7 py-3 hover:bg-[#C17832] hover:text-white transition-colors"
              >
                <Mic className="w-4 h-4" /> The podcast
              </a>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* The lab ethos                                                    */}
        {/* ---------------------------------------------------------------- */}
        <section className="max-w-[1080px] mx-auto px-6 py-14">
          <div className="text-center max-w-[720px] mx-auto mb-12">
            <p className="text-sm font-semibold text-[#C17832] uppercase tracking-wide mb-3">
              Why we call it a lab
            </p>
            <h2 className="font-heading text-3xl md:text-4xl leading-tight mb-4">
              It&apos;s an experiment, and you&apos;re the scientists.
            </h2>
            <p className="text-base md:text-lg text-[#6B5B4E] leading-relaxed">
              A lab isn&apos;t a classroom. Nobody hands you the answer. You spot
              a problem, test an idea, and figure out what actually works — only
              here, you&apos;ve got a licensed attorney in the room when the legal
              questions come up. Y Lab is youth-led on purpose: the teens set the
              agenda, and the grown-ups are the guides, not the bosses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: Lightbulb,
                title: "You pick the problems",
                body: "Bring whatever you actually want to solve — a product, a side hustle, a problem in your school or town. The agenda starts with you.",
              },
              {
                icon: Scale,
                title: "Real legal backup",
                body: "Form-an-LLC questions, contracts, brand and IP, working with customers — get answers from an attorney, not a search engine.",
              },
              {
                icon: Rocket,
                title: "Build it for real",
                body: "We help you turn the idea into something that exists — set up the right way, with the legal foundation a real business needs.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-2xl border border-[#D9CCBC] bg-white p-6"
              >
                <div className="w-11 h-11 rounded-xl bg-[#C17832]/10 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-[#C17832]" />
                </div>
                <h3 className="font-heading text-xl mb-2">{title}</h3>
                <p className="text-sm text-[#6B5B4E] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* The mission — change the law                                     */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-6 py-4">
          <div className="max-w-[1080px] mx-auto rounded-3xl bg-[#1F1810] text-[#FAF8F5] px-7 py-12 md:px-14 md:py-16">
            <div className="max-w-[760px]">
              <p className="text-sm font-semibold text-[#E0A567] uppercase tracking-wide mb-4">
                The mission
              </p>
              <h2 className="font-heading text-3xl md:text-[2.6rem] leading-[1.1] mb-6">
                Change the law so teens can actually start companies.
              </h2>
              <p className="text-base md:text-lg text-[#D9CCBC] leading-relaxed mb-5">
                Here&apos;s the catch nobody tells you: in Colorado today, a
                minor generally can&apos;t form an LLC on their own, and the
                contracts a minor signs are <em>voidable</em>. So the moment a
                teen founder tries to do something real — open a business bank
                account, sign with a customer, bring on a co-founder — the law
                treats them like they don&apos;t count yet.
              </p>
              <p className="text-base md:text-lg text-[#D9CCBC] leading-relaxed mb-8">
                Y Lab&apos;s north star is to change that — a youth-led push to
                update Colorado law so under-18 entrepreneurs can form LLCs and
                enter enforceable contracts. The teens lead it. The attorney
                guides it. And the podcast and the membership are how we build
                the movement to get there.
              </p>
              <div className="flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
                  <Check className="w-4 h-4 text-[#E0A567]" /> Form an LLC before 18
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
                  <Check className="w-4 h-4 text-[#E0A567]" /> Sign enforceable contracts
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
                  <Check className="w-4 h-4 text-[#E0A567]" /> Youth-led, attorney-guided
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Podcast                                                          */}
        {/* ---------------------------------------------------------------- */}
        <section id="podcast" className="max-w-[1080px] mx-auto px-6 py-16">
          <div className="rounded-3xl border border-[#D9CCBC] bg-white p-7 md:p-12 flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0 rounded-3xl bg-[#C17832]/10 flex items-center justify-center">
              <Mic className="w-11 h-11 text-[#C17832]" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm font-semibold text-[#C17832] uppercase tracking-wide mb-2">
                The Y Lab Podcast
              </p>
              <h2 className="font-heading text-3xl md:text-4xl mb-3">
                Conversations with the next generation of founders.
              </h2>
              <p className="text-base text-[#6B5B4E] leading-relaxed mb-6">
                Real talk with teen entrepreneurs, the people who back them, and
                the lawmakers who can open the door — building the case for
                youth entrepreneurship one episode at a time.{" "}
                <span className="font-semibold text-[#1F1810]">
                  Launching soon.
                </span>
              </p>
              <button
                type="button"
                onClick={() =>
                  openYLabWaitlist(
                    "I want to be notified when the Y Lab podcast launches — and I might want to be a guest.",
                  )
                }
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#C17832] hover:text-[#1F1810] transition-colors"
              >
                Get notified when episode 1 drops <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Membership                                                       */}
        {/* ---------------------------------------------------------------- */}
        <section id="membership" className="bg-white border-y border-[#D9CCBC]">
          <div className="max-w-[1080px] mx-auto px-6 py-16">
            <div className="text-center max-w-[720px] mx-auto mb-10">
              <p className="text-sm font-semibold text-[#C17832] uppercase tracking-wide mb-3">
                Legal backup for teen founders
              </p>
              <h2 className="font-heading text-3xl md:text-4xl leading-tight mb-4">
                The same membership our businesses run on — 20% off for teens.
              </h2>
              <p className="text-base text-[#6B5B4E] leading-relaxed mb-6">
                A real attorney and an AI legal assistant in your corner, on a
                flat monthly rate built for a teen budget.
              </p>

              <div className="flex items-center justify-center gap-3 flex-wrap">
                <div
                  className="inline-flex items-center rounded-full p-1 bg-[#F5F0EB] text-xs font-medium"
                  role="group"
                  aria-label="Billing period"
                >
                  <button
                    type="button"
                    onClick={() => setIsAnnual(true)}
                    aria-pressed={isAnnual}
                    className={`px-3 py-1 rounded-full transition-all ${
                      isAnnual
                        ? "bg-white shadow-sm text-[#1F1810]"
                        : "text-[#A89279] hover:text-[#6B5B4E]"
                    }`}
                  >
                    Annual
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAnnual(false)}
                    aria-pressed={!isAnnual}
                    className={`px-3 py-1 rounded-full transition-all ${
                      !isAnnual
                        ? "bg-white shadow-sm text-[#1F1810]"
                        : "text-[#A89279] hover:text-[#6B5B4E]"
                    }`}
                  >
                    Monthly
                  </button>
                </div>
                <span className="text-[11px] font-semibold text-[#7A8B6F] uppercase tracking-wider">
                  20% youth discount
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-[760px] mx-auto items-stretch">
              {YLAB_TIER_ORDER.map((key) => {
                const tier = YLAB_TIERS[key];
                const featured = key === "ylab_grow";
                const annualMonthly =
                  tier.annualPriceUsd > 0
                    ? Math.round(tier.annualPriceUsd / 12)
                    : 0;
                const price = isAnnual ? annualMonthly : tier.monthlyPriceUsd;
                const yearlySavings = annualSavingsUsd(tier);
                const cycle = isAnnual ? "annual" : "monthly";
                // When the Stripe teen products exist, getCheckoutLink returns
                // a URL and the CTA routes to the pre-checkout page; until then
                // it's null and we fall back to the waitlist (no broken button).
                const checkoutReady = !!getCheckoutLink(key, cycle);

                return (
                  <div
                    key={key}
                    className={`relative rounded-[18px] p-6 pt-7 border bg-white flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                      featured
                        ? "border-[#C17832] shadow-[0_20px_40px_rgba(193,120,50,0.15)]"
                        : "border-[#D9CCBC] hover:border-[#C17832] hover:shadow-md"
                    }`}
                  >
                    {featured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C17832] text-white text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full whitespace-nowrap">
                        Most Popular
                      </div>
                    )}

                    <h3 className="text-xl font-heading mb-3">{tier.label}</h3>

                    <div className="mb-4 min-h-[64px]">
                      <span className="text-5xl font-bold">${price}</span>
                      <span className="text-base text-[#6B5B4E] ml-1">/mo</span>
                      <div className="text-xs text-[#A89279] mt-1.5">
                        {isAnnual ? "billed annually" : "billed monthly"}
                        {isAnnual && yearlySavings > 0 && (
                          <span className="ml-1 text-[#7A8B6F] font-semibold">
                            · save ${yearlySavings}/yr
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-sm text-[#6B5B4E] mb-4 leading-snug min-h-[40px]">
                      {tier.tagline}
                    </p>

                    <div className="mb-4 rounded-lg px-3 py-2.5 text-xs leading-relaxed bg-[#7A8B6F]/10 text-[#1F1810]">
                      <span className="font-semibold">
                        {tier.workItemsPerMonth}{" "}
                        {tier.workItemsPerMonth === 1
                          ? "attorney task"
                          : "attorney tasks"}{" "}
                        / month.
                      </span>{" "}
                      A reviewed document or a 30-min consult — your call.
                    </div>

                    <div className="flex-grow flex flex-col space-y-2.5 mb-5">
                      {tier.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <Check className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#C17832]" />
                          <span className="text-sm leading-relaxed text-[#1F1810]">
                            {f}
                          </span>
                        </div>
                      ))}
                    </div>

                    {checkoutReady ? (
                      <Link
                        href={`/checkout/${key}${isAnnual ? "" : "?billing=monthly"}`}
                        className={`mt-auto block w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all text-center ${
                          featured
                            ? "bg-[#1F1810] text-white hover:bg-[#C17832]"
                            : "bg-transparent border border-[#C17832] text-[#C17832] hover:bg-[#C17832] hover:text-white"
                        }`}
                      >
                        Reserve your spot
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => openYLabWaitlist(WAITLIST_SEED)}
                        className={`mt-auto block w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all text-center ${
                          featured
                            ? "bg-[#1F1810] text-white hover:bg-[#C17832]"
                            : "bg-transparent border border-[#C17832] text-[#C17832] hover:bg-[#C17832] hover:text-white"
                        }`}
                      >
                        Join the waitlist
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Parent / guardian note — the minor-contract guard, framed as
                part of the mission. */}
            <div className="mt-8 max-w-[760px] mx-auto rounded-2xl bg-[#F5F0EB] border border-[#D9CCBC] px-6 py-5 flex items-start gap-3">
              <Users className="w-5 h-5 text-[#C17832] flex-shrink-0 mt-0.5" />
              <p className="text-sm text-[#6B5B4E] leading-relaxed">
                <span className="font-semibold text-[#1F1810]">
                  A parent or guardian signs up and holds the account
                </span>{" "}
                — because under current Colorado law a minor&apos;s contract
                isn&apos;t fully enforceable. The teen is the founder who works
                with Ava and the attorney day-to-day. (And yes — needing a
                grown-up to sign is exactly the law Y Lab is out to change.)
              </p>
            </div>

            <p className="text-xs text-[#A89279] mt-6 max-w-[620px] mx-auto text-center leading-relaxed">
              {ATTORNEY_TASK_DEFINITION}
            </p>
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* FAQ                                                              */}
        {/* ---------------------------------------------------------------- */}
        <section className="max-w-[760px] mx-auto px-6 py-16">
          <h2 className="font-heading text-3xl md:text-4xl text-center mb-10">
            Questions, answered
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={i}
                  className="rounded-2xl border border-[#D9CCBC] bg-white overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left"
                    aria-expanded={open}
                  >
                    <span className="font-semibold text-[#1F1810] text-[15px]">
                      {faq.question}
                    </span>
                    {open ? (
                      <Minus className="w-4 h-4 text-[#C17832] flex-shrink-0" />
                    ) : (
                      <Plus className="w-4 h-4 text-[#C17832] flex-shrink-0" />
                    )}
                  </button>
                  {open && (
                    <p className="px-5 pb-5 -mt-1 text-sm text-[#6B5B4E] leading-relaxed">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Final CTA                                                        */}
        {/* ---------------------------------------------------------------- */}
        <section className="px-6 pb-20">
          <div className="max-w-[1080px] mx-auto rounded-3xl border border-[#C17832]/30 bg-[radial-gradient(700px_300px_at_50%_0%,rgba(193,120,50,0.12),transparent)] px-7 py-14 text-center">
            <h2 className="font-heading text-3xl md:text-4xl mb-4">
              Are you a teen founder — or the parent of one?
            </h2>
            <p className="text-base md:text-lg text-[#6B5B4E] leading-relaxed max-w-[620px] mx-auto mb-8">
              Get on the founding-member waitlist. We&apos;ll reach out as Y Lab
              opens its first cohort, the podcast launches, and the law-change
              campaign kicks off.
            </p>
            <button
              type="button"
              onClick={() => openYLabWaitlist(WAITLIST_SEED)}
              className="btn-al btn-al-primary text-sm px-8 py-3"
            >
              Join the founding waitlist
            </button>
          </div>
        </section>
      </main>
      <Footer />
      <AvaFloatingWidget />
    </>
  );
}
