"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  TIERS,
  TierKey,
  annualSavingsUsd,
} from "@/lib/tiers";
import {
  getCheckoutLink,
  attachUserParams,
  type BillingCycle,
} from "@/lib/checkout";

/**
 * Paid-tier whitelist. Must stay in sync with CHECKOUT_TIERS in page.tsx —
 * keeping it here too means the client code can guard rails without a round
 * trip to the server component.
 */
const CHECKOUT_TIERS: TierKey[] = ["build", "grow", "lead"];

interface CheckoutClientProps {
  initialTier: TierKey;
}

export default function CheckoutClient({ initialTier }: CheckoutClientProps) {
  const router = useRouter();

  // Tier + billing cycle state. Billing cycle defaults to annual (nudges
  // users toward the higher-LTV plan) unless the URL says otherwise. The
  // ?billing= query param is how the homepage PricingSection hands over
  // the user's current toggle state.
  //
  // We intentionally DO NOT use next/navigation's useSearchParams() here —
  // in Next 16's `output: "export"` static export mode, useSearchParams
  // requires a Suspense boundary AND still trips the prerender in some
  // situations. Reading window.location.search in a useEffect runs only
  // after hydration, so the static build is unaffected and the URL value
  // still takes effect on the very next render post-mount.
  const [tierKey, setTierKey] = useState<TierKey>(initialTier);
  const [cycle, setCycle] = useState<BillingCycle>("annual");

  // Supabase session for prefilling the Stripe customer record.
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [redirecting, setRedirecting] = useState(false);

  // Hydration-time: read the ?billing= query param from window.location.
  // Runs once on mount, never during prerender, so static export is safe.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const billingParam = params.get("billing");
    if (billingParam === "monthly") {
      setCycle("monthly");
    } else if (billingParam === "annual") {
      setCycle("annual");
    }
  }, []);

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
      },
    );
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const tier = TIERS[tierKey];

  // Derived pricing. All math runs off tiers.ts (single source of truth) so
  // if the Stripe prices change we only update one place.
  const pricing = useMemo(() => {
    const monthly = tier.monthlyPriceUsd;
    const annual = tier.annualPriceUsd;
    const annualMonthlyEquivalent = annual / 12;
    const yearlySavings = annualSavingsUsd(tier);
    const percentOff =
      monthly > 0
        ? Math.round(((monthly * 12 - annual) / (monthly * 12)) * 100)
        : 0;
    return {
      monthly,
      annual,
      annualMonthlyEquivalent,
      yearlySavings,
      percentOff,
    };
  }, [tier]);

  const selectedPrice = cycle === "annual" ? pricing.annual : pricing.monthly;
  const billingLabel = cycle === "annual" ? "Billed yearly" : "Billed monthly";

  const handleTierChange = (next: TierKey) => {
    setTierKey(next);
    // Keep the URL in sync so shareable deep links land on the right tier.
    // Read the live window.location instead of a useSearchParams hook (see
    // the comment above the billing-cycle effect for why).
    const params =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : new URLSearchParams();
    if (cycle === "monthly") {
      params.set("billing", "monthly");
    } else {
      params.delete("billing");
    }
    const query = params.toString();
    router.replace(`/checkout/${next}${query ? `?${query}` : ""}`);
  };

  const handleContinue = () => {
    const baseUrl = getCheckoutLink(tierKey, cycle);
    if (!baseUrl) return;
    setRedirecting(true);
    const finalUrl = attachUserParams(baseUrl, { userId, userEmail });
    window.location.href = finalUrl;
  };

  return (
    <div className="max-w-[1180px] mx-auto px-6 md:px-8 py-12 lg:py-16">
      {/* Breadcrumb / back link */}
      <div className="mb-8">
        <Link
          href="/#pricing"
          className="text-[#C17832] hover:text-[#D4893F] text-[14px] font-medium"
        >
          &larr; Back to plans
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-10 lg:gap-12">
        {/* ------------------------------------------------------------------ */}
        {/* LEFT COLUMN — tier picker, billing cycle, trust markers             */}
        {/* ------------------------------------------------------------------ */}
        <div className="space-y-10">
          <div>
            <h1 className="font-heading text-4xl md:text-5xl text-[#1F1810] leading-tight mb-3">
              Review your membership
            </h1>
            <p className="text-[#6B5B4E] text-[15px] leading-relaxed max-w-xl">
              Available Law memberships are month-to-month or annual. Cancel
              any time from your dashboard. You&rsquo;ll be handed off to
              Stripe to finish payment after you confirm.
            </p>
          </div>

          {/* Step 1 — choose plan */}
          <section>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#1F1810] text-white text-sm font-semibold">
                1
              </span>
              <h2 className="font-heading text-2xl text-[#1F1810]">
                Choose your plan
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {CHECKOUT_TIERS.map((key) => {
                const t = TIERS[key];
                const isSelected = key === tierKey;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => handleTierChange(key)}
                    className={`text-left rounded-xl border-2 p-4 transition-all ${
                      isSelected
                        ? "border-[#C17832] bg-white shadow-[0_12px_24px_rgba(193,120,50,0.12)]"
                        : "border-[#D9CCBC] bg-white hover:border-[#C17832]/60"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-heading text-lg text-[#1F1810]">
                        {t.label}
                      </span>
                      {isSelected && (
                        <span
                          className="w-5 h-5 rounded-full bg-[#C17832] flex items-center justify-center"
                          aria-hidden
                        >
                          <svg
                            className="w-3 h-3 text-white"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-[#6B5B4E] mb-2">
                      {t.workItemsPerMonth} attorney work item
                      {t.workItemsPerMonth === 1 ? "" : "s"} / month
                    </div>
                    <div className="text-[#1F1810] font-semibold">
                      ${t.monthlyPriceUsd}
                      <span className="text-sm font-normal text-[#6B5B4E]">
                        {" "}
                        /month
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 2 — billing cycle */}
          <section>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#1F1810] text-white text-sm font-semibold">
                2
              </span>
              <h2 className="font-heading text-2xl text-[#1F1810]">
                Choose billing cycle
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <BillingCycleCard
                label="Monthly"
                price={`$${pricing.monthly}`}
                priceSuffix="/month"
                sublabel="Billed every month"
                selected={cycle === "monthly"}
                onSelect={() => setCycle("monthly")}
              />
              <BillingCycleCard
                label="Yearly"
                price={`$${pricing.annual.toLocaleString()}`}
                priceSuffix="/year"
                sublabel={`$${pricing.annualMonthlyEquivalent.toFixed(
                  0,
                )}/month, billed yearly`}
                savingsBadge={
                  pricing.yearlySavings > 0
                    ? `Save $${pricing.yearlySavings}`
                    : undefined
                }
                selected={cycle === "annual"}
                onSelect={() => setCycle("annual")}
              />
            </div>
          </section>

          {/* Step 3 — what's included */}
          <section>
            <div className="flex items-baseline gap-3 mb-4">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-[#1F1810] text-white text-sm font-semibold">
                3
              </span>
              <h2 className="font-heading text-2xl text-[#1F1810]">
                What&rsquo;s included
              </h2>
            </div>
            <div className="rounded-xl border border-[#D9CCBC] bg-white p-6">
              <p className="text-sm text-[#6B5B4E] mb-4 leading-relaxed">
                {tier.tagline}
              </p>
              <ul className="space-y-3">
                {tier.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
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
                    <span className="text-sm text-[#1F1810]">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* RIGHT COLUMN — sticky order summary                                  */}
        {/* ------------------------------------------------------------------ */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-[#D9CCBC] bg-white p-6 shadow-[0_12px_32px_rgba(31,24,16,0.06)]">
            <h2 className="font-heading text-xl text-[#1F1810] mb-5">
              Order summary
            </h2>

            <div className="space-y-4 pb-5 border-b border-[#EDE5DB]">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="font-semibold text-[#1F1810]">
                    Available Law · {tier.label}
                  </div>
                  <div className="text-xs text-[#A89279] mt-0.5">
                    {billingLabel}
                  </div>
                </div>
                <div className="text-right font-semibold text-[#1F1810]">
                  ${selectedPrice.toLocaleString()}
                </div>
              </div>

              {cycle === "annual" && pricing.yearlySavings > 0 && (
                <div className="flex items-start justify-between gap-4 text-[#7A8B6F]">
                  <span className="text-sm">Yearly discount</span>
                  <span className="text-sm font-semibold">
                    &minus;${pricing.yearlySavings}
                    {pricing.percentOff > 0 && (
                      <span className="ml-1 text-xs text-[#A89279] font-normal">
                        ({pricing.percentOff}% off)
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-baseline justify-between pt-5 mb-6">
              <span className="text-[#1F1810] font-semibold">Total today</span>
              <span className="font-heading text-2xl text-[#1F1810]">
                ${selectedPrice.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              disabled={redirecting}
              className="block w-full text-center py-3.5 px-4 rounded-lg text-sm font-semibold bg-[#1F1810] text-white hover:bg-[#C17832] transition-colors disabled:opacity-60 disabled:cursor-wait"
            >
              {redirecting ? "Redirecting to Stripe…" : "Continue to payment"}
            </button>

            <p className="text-[11px] text-[#A89279] text-center mt-3 leading-relaxed">
              Payment is processed securely by Stripe. You&rsquo;ll be
              redirected to finish checkout.
            </p>

            <div className="mt-5 pt-5 border-t border-[#EDE5DB] space-y-2.5">
              <TrustRow text="Cancel or change plans any time" />
              <TrustRow text="Colorado-licensed attorneys only" />
              <TrustRow text="No billable hours, ever" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sub-components                                                              */
/* -------------------------------------------------------------------------- */

interface BillingCycleCardProps {
  label: string;
  price: string;
  priceSuffix: string;
  sublabel: string;
  savingsBadge?: string;
  selected: boolean;
  onSelect: () => void;
}

function BillingCycleCard({
  label,
  price,
  priceSuffix,
  sublabel,
  savingsBadge,
  selected,
  onSelect,
}: BillingCycleCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative text-left rounded-xl border-2 p-5 transition-all ${
        selected
          ? "border-[#C17832] bg-white shadow-[0_12px_24px_rgba(193,120,50,0.12)]"
          : "border-[#D9CCBC] bg-white hover:border-[#C17832]/60"
      }`}
    >
      {savingsBadge && (
        <span className="absolute -top-2.5 right-4 bg-[#7A8B6F] text-white text-[11px] font-bold tracking-wide px-2.5 py-1 rounded-full">
          {savingsBadge}
        </span>
      )}
      <div className="flex items-center gap-2 mb-2">
        <span
          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
            selected ? "border-[#C17832]" : "border-[#D9CCBC]"
          }`}
          aria-hidden
        >
          {selected && (
            <span className="w-2 h-2 rounded-full bg-[#C17832]" />
          )}
        </span>
        <span className="font-heading text-lg text-[#1F1810]">{label}</span>
      </div>
      <div className="text-[#1F1810]">
        <span className="text-2xl font-bold">{price}</span>
        <span className="text-sm text-[#6B5B4E]">{priceSuffix}</span>
      </div>
      <div className="text-xs text-[#A89279] mt-1">{sublabel}</div>
    </button>
  );
}

function TrustRow({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-xs text-[#6B5B4E]">
      <svg
        className="w-4 h-4 text-[#7A8B6F] flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
        />
      </svg>
      <span>{text}</span>
    </div>
  );
}
