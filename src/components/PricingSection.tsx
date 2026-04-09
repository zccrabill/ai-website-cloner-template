"use client";
import { useState } from "react";
import Link from "next/link";

interface PricingTier {
  name: string;
  description: string;
  annualPrice: number;
  monthlyPrice: number;
  features: string[];
  cta: string;
  badge?: string;
  featured?: boolean;
  proUpgrade?: {
    price: number;
    label: string;
  };
}

const pricingTiers: PricingTier[] = [
  {
    name: "Explore",
    description: "Get a taste of AI-powered legal solutions. No commitment required.",
    annualPrice: 0,
    monthlyPrice: 0,
    features: [
      "Monthly legal newsletter",
      "Limited dashboard access",
      "Educational legal guides",
      "Community resources",
    ],
    cta: "Join Free",
  },
  {
    name: "Build",
    description: "Full AI legal assistant access for growing businesses.",
    annualPrice: 25,
    monthlyPrice: 50,
    features: [
      "Full Allora AI assistant access",
      "Educational guides & checklists",
      "Usage tracking dashboard",
      "Member-rate attorney consultations",
    ],
    cta: "Start Building",
  },
  {
    name: "Grow",
    description: "Priority legal support with dedicated attorney access.",
    annualPrice: 100,
    monthlyPrice: 150,
    features: [
      "Everything in Build, plus:",
      "1 attorney consultation/month",
      "Priority Allora responses",
      "Document review credits",
    ],
    cta: "Start Growing",
    badge: "Most Popular",
    featured: true,
    proUpgrade: {
      price: 200,
      label: "Upgrade to Pro ($200/mo) for extra consultations",
    },
  },
  {
    name: "Lead",
    description: "Fractional AI General Counsel for established businesses.",
    annualPrice: 300,
    monthlyPrice: 300,
    features: [
      "Everything in Grow, plus:",
      "2-3 attorney consultations/month",
      "Quarterly AI risk reviews",
      "Priority support & all document reviews",
    ],
    cta: "Start Leading",
  },
];

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <section
      id="pricing"
      className="w-full bg-[#0f0f14] flex flex-col items-center justify-center py-24 px-6"
    >
      {/* Header */}
      <div className="max-w-[900px] text-center mb-16">
        <h2
          className="text-5xl font-bold text-white mb-6"
          style={{ fontFamily: "var(--font-display), 'Playfair Display', serif" }}
        >
          Membership Plans
        </h2>
        <p className="text-[#a1a1aa] text-lg leading-relaxed">
          AI-powered legal solutions at every stage of your business. Start free, scale as you grow.
        </p>
      </div>

      {/* Billing Toggle */}
      <div className="flex items-center justify-center gap-4 mb-16">
        <button
          onClick={() => setIsAnnual(true)}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            isAnnual
              ? "bg-[#f59e0b] text-black"
              : "bg-white/[0.08] text-[#a1a1aa] hover:bg-white/[0.12]"
          }`}
        >
          Annual
        </button>
        <button
          onClick={() => setIsAnnual(false)}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            !isAnnual
              ? "bg-[#f59e0b] text-black"
              : "bg-white/[0.08] text-[#a1a1aa] hover:bg-white/[0.12]"
          }`}
        >
          Monthly
        </button>
        {isAnnual && (
          <span className="ml-4 text-sm text-[#f59e0b]">
            Save up to 50%
          </span>
        )}
      </div>

      {/* Pricing Cards */}
      <div className="w-full max-w-[1280px] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {pricingTiers.map((tier, idx) => {
          const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
          const billingNote = isAnnual
            ? tier.annualPrice === 0
              ? ""
              : "billed annually"
            : "billed monthly";
          const altPrice = isAnnual ? tier.monthlyPrice : tier.annualPrice;

          return (
            <div
              key={idx}
              className={`relative rounded-2xl p-8 border transition-all duration-300 ${
                tier.featured
                  ? "card-featured border-[#f59e0b]/30 bg-gradient-to-br from-[#1a1a1f] to-[#0f0f14]"
                  : "card-gradient-border border-white/[0.12] bg-gradient-to-br from-[#1a1a1f] to-[#0f0f14] hover:border-white/[0.2] hover:shadow-lg hover:shadow-white/[0.05]"
              }`}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute -top-3 left-6 bg-[#f59e0b] text-black text-xs font-bold px-3 py-1 rounded-full">
                  {tier.badge}
                </div>
              )}

              {/* Tier Name */}
              <h3 className="text-2xl font-bold text-white mb-2">
                {tier.name}
              </h3>

              {/* Price */}
              <div className="mb-4">
                {price === 0 ? (
                  <div className="text-white">
                    <span className="text-4xl font-bold">Free</span>
                  </div>
                ) : (
                  <div className="text-white">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-lg text-[#a1a1aa]">/mo</span>
                    {billingNote && (
                      <div className="text-xs text-[#a1a1aa] mt-1">
                        {billingNote}
                      </div>
                    )}
                    {isAnnual && altPrice !== 0 && (
                      <div className="text-xs text-[#a1a1aa] mt-1">
                        ${altPrice}/mo monthly
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-[#a1a1aa] mb-6 leading-relaxed">
                {tier.description}
              </p>

              {/* CTA Button */}
              <Link
                href={tier.annualPrice === 0 ? "/login" : "/login"}
                className={`block w-full py-2.5 px-4 rounded-lg text-sm font-semibold transition-all mb-6 text-center ${
                  tier.featured
                    ? "bg-[#f59e0b] text-black hover:bg-[#fbbf24] shadow-lg shadow-[#f59e0b]/20"
                    : "bg-white/[0.08] text-white border border-white/[0.12] hover:bg-white/[0.12] hover:border-white/[0.2]"
                }`}
              >
                {tier.cta}
              </Link>

              {/* Pro Upgrade Callout */}
              {tier.proUpgrade && (
                <div className="mb-6 p-3 bg-[#f59e0b]/10 border border-[#f59e0b]/20 rounded-lg">
                  <p className="text-xs text-[#f59e0b] text-center">
                    {tier.proUpgrade.label}
                  </p>
                </div>
              )}

              {/* Features */}
              <div className="space-y-3">
                {tier.features.map((feature, featureIdx) => (
                  <div key={featureIdx} className="flex items-start gap-3">
                    <svg
                      className="w-4 h-4 text-[#f59e0b] flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-sm text-[#d4d4d8]">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="max-w-[900px] text-center">
        <p className="text-sm text-[#52525b]">
          All paid plans include a free onboarding call. Cancel anytime. Annual plans save up to 50%.
        </p>
      </div>
    </section>
  );
}
