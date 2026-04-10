"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { TIERS, TierKey, OVERAGE_PRICE_PER_PAGE_USD } from "@/lib/tiers";

/**
 * Tier-card presentation metadata that lives alongside but not inside
 * src/lib/tiers.ts. tiers.ts is the source of truth for LIMITS and PRICING
 * used across the product; this map holds marketing-only details (Stripe
 * payment link URLs, CTA copy, featured badge, and the display-as-monthly
 * price for the annual plan).
 *
 * Annual price rework is tracked separately — for now annualDisplayMonthly
 * is the effective monthly price a customer sees when they choose annual
 * billing (matches the Stripe prices behind annualLink).
 */
interface TierDisplay {
  cta: string;
  badge?: string;
  featured?: boolean;
  monthlyLink?: string;
  annualLink?: string;
  /** Effective per-month price when billed annually. 0 for free tier. */
  annualDisplayMonthly: number;
}

const TIER_DISPLAY: Record<TierKey, TierDisplay> = {
  explore: {
    cta: "Join Free",
    annualDisplayMonthly: 0,
  },
  build: {
    cta: "Start Building",
    annualDisplayMonthly: 25,
    monthlyLink: "https://buy.stripe.com/5kQ7sLe8IdFjbiPbnKcMM08",
    annualLink: "https://buy.stripe.com/7sY4gz8Oobxb4UrfE0cMM09",
  },
  grow: {
    cta: "Start Growing",
    badge: "Most Popular",
    featured: true,
    annualDisplayMonthly: 100,
    monthlyLink: "https://buy.stripe.com/7sY6oH4y8dFj3Qn63qcMM0a",
    annualLink: "https://buy.stripe.com/7sY3cv2q00Sx1If77ucMM0b",
  },
  lead: {
    cta: "Start Leading",
    annualDisplayMonthly: 300,
    monthlyLink: "https://buy.stripe.com/eVqcN5ggQ0Sx5YvbnKcMM04",
    annualLink: "https://buy.stripe.com/3cIbJ18Oo6cRcmTfE0cMM0c",
  },
};

const TIER_ORDER: TierKey[] = ["explore", "build", "grow", "lead"];

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setUserId(data.session?.user?.id ?? null);
      setUserEmail(data.session?.user?.email ?? null);
    });
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUserId(session?.user?.id ?? null);
        setUserEmail(session?.user?.email ?? null);
      }
    );
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  // Append client_reference_id + prefilled_email so the Stripe webhook can
  // match the completed checkout back to the Supabase user record. Falls back
  // to the bare URL when the visitor is not signed in — the webhook will then
  // use the customer email as a secondary match key.
  const buildCheckoutUrl = (baseUrl: string): string => {
    if (!userId && !userEmail) return baseUrl;
    const url = new URL(baseUrl);
    if (userId) url.searchParams.set("client_reference_id", userId);
    if (userEmail) url.searchParams.set("prefilled_email", userEmail);
    return url.toString();
  };

  return (
    <section
      id="pricing"
      className="w-full bg-[#FAF8F5] flex flex-col items-center justify-center py-24 px-6"
    >
      {/* Header */}
      <div className="max-w-[900px] text-center mb-12">
        <p className="text-sm font-semibold text-[#C17832] uppercase tracking-wide mb-4">
          Membership Plans
        </p>
        <h2
          className="text-5xl font-heading text-[#1F1810] mb-6 leading-tight"
        >
          Invest in legal clarity, not legal bills
        </h2>
        <p className="text-lg text-[#6B5B4E] leading-relaxed">
          Choose the membership that fits your legal needs
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-16">
        <button
          onClick={() => setIsAnnual(true)}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            isAnnual
              ? "bg-[#C17832] text-white"
              : "bg-[#EDE5DB] text-[#6B5B4E] hover:bg-[#D9CCBC]"
          }`}
        >
          Annual
        </button>
        <button
          onClick={() => setIsAnnual(false)}
          className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
            !isAnnual
              ? "bg-[#C17832] text-white"
              : "bg-[#EDE5DB] text-[#6B5B4E] hover:bg-[#D9CCBC]"
          }`}
        >
          Monthly
        </button>
        {isAnnual && (
          <span className="ml-4 text-sm font-semibold text-[#C17832]">
            Save up to 50%
          </span>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="w-full max-w-[1280px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        {TIER_ORDER.map((key) => {
          const tier = TIERS[key];
          const display = TIER_DISPLAY[key];
          const price = isAnnual
            ? display.annualDisplayMonthly
            : tier.monthlyPriceUsd;
          const billingNote =
            price === 0
              ? ""
              : isAnnual
              ? "billed annually"
              : "billed monthly";

          return (
            <div
              key={key}
              className={`relative rounded-[20px] p-8 border transition-all duration-300 ${
                display.featured
                  ? "border-[#C17832] bg-white shadow-[0_20px_40px_rgba(193,120,50,0.15)]"
                  : "border-[#D9CCBC] bg-white hover:border-[#C17832] hover:shadow-md"
              }`}
            >
              {/* Badge */}
              {display.badge && (
                <div className="absolute -top-4 left-8 bg-[#C17832] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {display.badge}
                </div>
              )}

              {/* Tier Name */}
              <h3 className="text-2xl font-heading text-[#1F1810] mb-3">
                {tier.label}
              </h3>

              {/* Price */}
              <div className="mb-6">
                {price === 0 ? (
                  <div className="text-[#1F1810]">
                    <span className="text-4xl font-bold">Free</span>
                  </div>
                ) : (
                  <div className="text-[#1F1810]">
                    <span className="text-5xl font-bold">${price}</span>
                    <span className="text-lg text-[#6B5B4E]">/mo</span>
                    {billingNote && (
                      <div className="text-xs text-[#A89279] mt-2">
                        {billingNote}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tagline */}
              <p className="text-sm text-[#6B5B4E] mb-6 leading-relaxed">
                {tier.tagline}
              </p>

              {/* Work-item headline: concrete, consistent language across tiers */}
              <div
                className={`mb-6 rounded-lg px-4 py-3 text-xs ${
                  tier.workItemsPerMonth === 0
                    ? "bg-[#F5F0EB] text-[#6B5B4E]"
                    : "bg-[#7A8B6F]/10 text-[#1F1810]"
                }`}
              >
                {tier.workItemsPerMonth === 0 ? (
                  <>
                    <span className="font-semibold">No attorney work</span>{" "}
                    included. Upgrade any time to unlock matter reviews and
                    consultations.
                  </>
                ) : (
                  <>
                    <span className="font-semibold">
                      {tier.workItemsPerMonth} attorney work item
                      {tier.workItemsPerMonth === 1 ? "" : "s"} / month.
                    </span>{" "}
                    Use {tier.workItemsPerMonth === 1 ? "it" : "them"} for
                    matter reviews or 30-min consultations — your choice.
                  </>
                )}
              </div>

              {/* CTA Button */}
              {display.monthlyLink ? (
                <a
                  href={buildCheckoutUrl(
                    isAnnual && display.annualLink
                      ? display.annualLink
                      : display.monthlyLink
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all mb-6 text-center ${
                    display.featured
                      ? "bg-[#1F1810] text-white hover:bg-[#C17832]"
                      : "bg-transparent border border-[#C17832] text-[#C17832] hover:bg-[#FAF8F5]"
                  }`}
                >
                  {display.cta}
                </a>
              ) : (
                <Link
                  href="/login"
                  className={`block w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all mb-6 text-center ${
                    display.featured
                      ? "bg-[#1F1810] text-white hover:bg-[#C17832]"
                      : "bg-transparent border border-[#C17832] text-[#C17832] hover:bg-[#FAF8F5]"
                  }`}
                >
                  {display.cta}
                </Link>
              )}

              {/* Features */}
              <div className="space-y-3">
                {tier.features.map((feature, featureIdx) => (
                  <div key={featureIdx} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-[#7A8B6F] flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-[#6B5B4E]">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Overage footnote */}
      <p className="text-xs text-[#A89279] text-center max-w-2xl">
        Need more than your monthly allotment? Additional matter reviews bill
        at ${OVERAGE_PRICE_PER_PAGE_USD}/page on paid plans. Additional
        consultations require upgrading your plan.
      </p>
    </section>
  );
}
