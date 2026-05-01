"use client";
import Link from "next/link";
import { TIERS, TierKey, annualSavingsUsd } from "@/lib/tiers";
import { useState } from "react";

/**
 * Marketing-only presentation metadata for each tier card. Pricing and
 * feature bullets live in src/lib/tiers.ts (source of truth). Stripe Payment
 * Links live in src/lib/checkout.ts so the homepage cards and the dedicated
 * /checkout/[tier] pre-checkout page always use the same URLs.
 *
 * Card composition (Apple-minimalist, per 2026-04-22 rework):
 *   1. Centered "Most Popular" badge (featured tier only)
 *   2. Tier label
 *   3. Price (large) + billing note ("billed annually · save $X/yr")
 *   4. Tagline (min-height aligned across cards)
 *   5. Work-item callout (tight, one line where possible) — the hero feature
 *      of each paid tier. Strings like "1 work item / month" live here so
 *      they don't duplicate into the feature bullets below.
 *   6. Features (flex-grow):
 *        - "Everything in [prior], plus:" header for non-explore tiers
 *        - New-to-tier features with orange (#C17832) checkmarks
 *        - Inherited features with grey (#A89279) checkmarks
 *      New-vs-inherited is computed by string-match against the prior tier's
 *      feature array. When a feature string changes quantitatively between
 *      tiers (e.g. "Priority response (2 days)" → "Priority response (1
 *      day)"), it correctly classifies as new on the upgraded tier.
 *   7. CTA button — anchored to the bottom via flex-grow on the features
 *      block so CTAs line up horizontally across all four cards.
 *
 * Billing period (monthly / annual): single shared <BillingToggle /> lives
 * in the section header above the grid — one toggle drives all four cards.
 * This was moved out of each card on 2026-04-22 to save vertical space;
 * the previous per-card toggles pushed the grid below the fold on laptops.
 *
 * Note: CTAs no longer jump straight to Stripe. Paid-tier buttons route to
 * /checkout/[tier]?billing=... so the user lands on a Calendly-style order
 * summary screen first. The checkout page then hands off to Stripe on
 * confirmation.
 */
interface TierDisplay {
  cta: string;
  badge?: string;
  featured?: boolean;
  /** Whether this tier has a paid checkout flow at all. */
  hasCheckout: boolean;
}

const TIER_DISPLAY: Record<TierKey, TierDisplay> = {
  explore: { cta: "Join Free", hasCheckout: false },
  build: { cta: "Start Building", hasCheckout: true },
  grow: {
    cta: "Start Growing",
    badge: "Most Popular",
    featured: true,
    hasCheckout: true,
  },
  lead: { cta: "Start Leading", hasCheckout: true },
};

const TIER_ORDER: TierKey[] = ["explore", "build", "grow", "lead"];

/** Each tier inherits everything from its prior tier (plus new items). */
const PRIOR_TIER: Partial<Record<TierKey, TierKey>> = {
  build: "explore",
  grow: "build",
  lead: "grow",
};

// Largest percent-off across paid tiers. Shown as a small chip under each
// card's billing toggle when annual is selected.
const MAX_ANNUAL_PERCENT_OFF = (() => {
  const percents = TIER_ORDER.filter((k) => TIERS[k].monthlyPriceUsd > 0).map(
    (k) => {
      const t = TIERS[k];
      return Math.round(
        ((t.monthlyPriceUsd * 12 - t.annualPriceUsd) /
          (t.monthlyPriceUsd * 12)) *
          100,
      );
    },
  );
  return Math.max(0, ...percents);
})();

/**
 * Small per-card billing toggle. Shares the single `isAnnual` state via
 * props so every card's toggle mirrors every other.
 */
function BillingToggle({
  isAnnual,
  onChange,
}: {
  isAnnual: boolean;
  onChange: (next: boolean) => void;
}) {
  const activePill = "bg-white shadow-sm text-[#1F1810]";
  const inactivePill = "text-[#A89279] hover:text-[#6B5B4E]";

  return (
    <div
      className="inline-flex items-center rounded-full p-1 bg-[#F5F0EB] text-xs font-medium"
      role="group"
      aria-label="Billing period"
    >
      <button
        type="button"
        onClick={() => onChange(true)}
        className={`px-3 py-1 rounded-full transition-all ${
          isAnnual ? activePill : inactivePill
        }`}
        aria-pressed={isAnnual}
      >
        Annual
      </button>
      <button
        type="button"
        onClick={() => onChange(false)}
        className={`px-3 py-1 rounded-full transition-all ${
          !isAnnual ? activePill : inactivePill
        }`}
        aria-pressed={!isAnnual}
      >
        Monthly
      </button>
    </div>
  );
}

/** One feature row — color-coded by whether it's new or inherited. */
function FeatureRow({ text, isNew }: { text: string; isNew: boolean }) {
  const color = isNew ? "text-[#C17832]" : "text-[#A89279]";
  const textColor = isNew ? "text-[#1F1810]" : "text-[#6B5B4E]";
  return (
    <div className="flex items-start gap-3">
      <svg
        className={`w-4 h-4 flex-shrink-0 mt-0.5 ${color}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      <span className={`text-sm leading-relaxed ${textColor}`}>{text}</span>
    </div>
  );
}

export default function PricingSection() {
  // Single source of truth for billing period. Every card's toggle reads
  // and writes this, so they stay perfectly in sync.
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section
      id="pricing"
      className="w-full bg-[#FAF8F5] flex flex-col items-center justify-center py-16 px-6"
    >
      {/* Header — single shared billing toggle sits here, under the subhead,
          instead of being repeated on every card. Saves ~50px of vertical
          height per card × 4 cards, so all four fit on a laptop viewport. */}
      <div className="max-w-[900px] text-center mb-10">
        <p className="text-sm font-semibold text-[#C17832] uppercase tracking-wide mb-3">
          Membership Plans
        </p>
        <h2 className="text-4xl md:text-5xl font-heading text-[#1F1810] mb-4 leading-tight">
          Invest in legal clarity, not legal bills
        </h2>
        <p className="text-base md:text-lg text-[#6B5B4E] leading-relaxed mb-6">
          Choose the membership that fits your legal needs
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <BillingToggle isAnnual={isAnnual} onChange={setIsAnnual} />
          {isAnnual && MAX_ANNUAL_PERCENT_OFF > 0 && (
            <span className="text-[11px] font-semibold text-[#7A8B6F] uppercase tracking-wider">
              Save {MAX_ANNUAL_PERCENT_OFF}% annually
            </span>
          )}
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="w-full max-w-[1280px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {TIER_ORDER.map((key) => {
          const tier = TIERS[key];
          const display = TIER_DISPLAY[key];
          const priorKey = PRIOR_TIER[key];
          const priorTier = priorKey ? TIERS[priorKey] : null;

          // Annual effective monthly = annualPriceUsd / 12, rounded to a
          // whole dollar for display. Computing from tiers.ts means we
          // never drift from the source of truth.
          const annualMonthlyEquivalent =
            tier.annualPriceUsd > 0 ? Math.round(tier.annualPriceUsd / 12) : 0;
          const price = isAnnual
            ? annualMonthlyEquivalent
            : tier.monthlyPriceUsd;
          const billingNote =
            price === 0 ? "" : isAnnual ? "billed annually" : "billed monthly";
          const yearlySavings = annualSavingsUsd(tier);

          const checkoutHref = display.hasCheckout
            ? `/checkout/${key}${isAnnual ? "" : "?billing=monthly"}`
            : "/login";

          // Compute new-to-tier vs. inherited features by string-match
          // against the prior tier. Exact matches are inherited; everything
          // else (including quantitative upgrades like "1 item" → "2 items")
          // is new.
          const priorFeatures = priorTier?.features ?? [];
          const newFeatures = tier.features.filter(
            (f) => !priorFeatures.includes(f),
          );
          const inheritedFeatures = tier.features.filter((f) =>
            priorFeatures.includes(f),
          );

          return (
            <div
              key={key}
              className={`relative rounded-[18px] p-6 pt-7 border transition-all duration-300 flex flex-col hover:-translate-y-1 hover:shadow-2xl ${
                display.featured
                  ? "border-[#C17832] bg-white shadow-[0_20px_40px_rgba(193,120,50,0.15)]"
                  : "border-[#D9CCBC] bg-white hover:border-[#C17832] hover:shadow-md"
              }`}
            >
              {/* Badge — centered above card */}
              {display.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C17832] text-white text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full whitespace-nowrap">
                  {display.badge}
                </div>
              )}

              {/* Tier Name */}
              <h3 className="text-xl font-heading text-[#1F1810] mb-3">
                {tier.label}
              </h3>

              {/* Price — min-h keeps baselines aligned across Free and paid
                  cards (paid has a 2-line billing note, Free is single-line). */}
              <div className="mb-4 min-h-[72px]">
                {price === 0 ? (
                  <div className="text-[#1F1810]">
                    <span className="text-5xl font-bold">Free</span>
                  </div>
                ) : (
                  <div className="text-[#1F1810]">
                    <span className="text-5xl font-bold">${price}</span>
                    <span className="text-base text-[#6B5B4E] ml-1">/mo</span>
                    {billingNote && (
                      <div className="text-xs text-[#A89279] mt-1.5">
                        {billingNote}
                        {isAnnual && yearlySavings > 0 && (
                          <span className="ml-1 text-[#7A8B6F] font-semibold">
                            · save ${yearlySavings}/yr
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tagline — single line where possible; min-height keeps
                  headings aligned across cards. */}
              <p className="text-sm text-[#6B5B4E] mb-4 leading-snug min-h-[36px]">
                {tier.tagline}
              </p>

              {/* Work-item headline — the hero feature of each tier. */}
              <div
                className={`mb-4 rounded-lg px-3 py-2.5 text-xs leading-relaxed ${
                  tier.workItemsPerMonth === 0
                    ? "bg-[#F5F0EB] text-[#6B5B4E]"
                    : "bg-[#7A8B6F]/10 text-[#1F1810]"
                }`}
              >
                {tier.workItemsPerMonth === 0 ? (
                  <>
                    <span className="font-semibold">No attorney work.</span>{" "}
                    Upgrade any time.
                  </>
                ) : (
                  <>
                    <span className="font-semibold">
                      {tier.workItemsPerMonth}{" "}
                      {tier.workItemsPerMonth === 1
                        ? "work item"
                        : "work items"}{" "}
                      / month.
                    </span>{" "}
                    Matter review or consult — your call.
                  </>
                )}
              </div>

              {/* Features — flex-grow pushes the CTA to the bottom */}
              <div className="flex-grow flex flex-col">
                {priorTier && (
                  <p className="text-[11px] text-[#A89279] uppercase tracking-wider mb-3">
                    Everything in {priorTier.label}, plus:
                  </p>
                )}

                {/* New-to-tier features (orange) */}
                {newFeatures.length > 0 && (
                  <div className="space-y-2.5 mb-3">
                    {newFeatures.map((f, i) => (
                      <FeatureRow key={`new-${i}`} text={f} isNew />
                    ))}
                  </div>
                )}

                {/* Inherited features (grey) — subtle, reinforces continuity */}
                {inheritedFeatures.length > 0 && (
                  <div className="space-y-2 pt-2.5 border-t border-[#1F1810]/5">
                    {inheritedFeatures.map((f, i) => (
                      <FeatureRow
                        key={`inh-${i}`}
                        text={f}
                        isNew={false}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* CTA Button — anchored to the bottom of every card so all
                  four CTAs line up horizontally regardless of feature count.
                  Paid tiers route to /checkout/[tier]; free tier → /login. */}
              <Link
                href={checkoutHref}
                className={`mt-5 block w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all text-center ${
                  display.featured
                    ? "bg-[#1F1810] text-white hover:bg-[#C17832]"
                    : "bg-transparent border border-[#C17832] text-[#C17832] hover:bg-[#C17832] hover:text-white"
                }`}
              >
                {display.cta}
              </Link>
            </div>
          );
        })}
      </div>

      {/* Decision-helper band — routes "I'm not sure which plan" prospects
          to Allora instead of into the calendar. Dispatches a window event
          the AlloraFloatingWidget listens for and pre-fills with a seed
          prompt so Allora opens mid-triage, not cold. */}
      <div className="mt-12 max-w-[820px] mx-auto">
        <div className="bg-white border border-[#1F1810]/10 rounded-2xl px-6 py-6 md:px-8 md:py-7 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          <div className="text-center md:text-left">
            <p className="font-heading text-xl md:text-2xl text-[#1F1810] mb-1">
              Not sure which plan fits your business?
            </p>
            <p className="text-[14px] text-[#6B5B4E]">
              Ask Allora — a quick chat usually narrows it down. No calendar to book, no commitment.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(
                new CustomEvent("allora:open", {
                  detail: {
                    seed: "I'm trying to decide between your subscription plans — can you help me figure out which one fits my business?",
                  },
                })
              );
            }}
            className="btn-al btn-al-primary text-[13px] px-6 py-3 whitespace-nowrap"
          >
            Ask Allora &rarr;
          </button>
        </div>
      </div>

    </section>
  );
}
