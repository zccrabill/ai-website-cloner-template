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
  monthlyLink?: string;
  annualLink?: string;
}

const pricingTiers: PricingTier[] = [
  {
    name: "Explore",
    description: "Get a taste of AI-powered legal solutions.",
    annualPrice: 0,
    monthlyPrice: 0,
    features: [
      "Monthly newsletter",
      "Limited dashboard",
      "Educational guides",
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
      "Full Allora AI access",
      "Educational guides & checklists",
      "Usage tracking dashboard",
      "Member-rate consultations",
    ],
    cta: "Start Building",
    monthlyLink: "https://buy.stripe.com/aFa9AT9SseJn9aHfE0cMM02",
    annualLink: "https://buy.stripe.com/5kQeVd1lW9p31IfcrOcMM05",
  },
  {
    name: "Grow",
    description: "Priority legal support with dedicated attorney access.",
    annualPrice: 100,
    monthlyPrice: 150,
    features: [
      "Everything in Build plus:",
      "1 attorney consultation/month",
      "Priority Allora responses",
      "Document review credits",
    ],
    cta: "Start Growing",
    badge: "Most Popular",
    featured: true,
    monthlyLink: "https://buy.stripe.com/8x24gz4y8at7gD9gI4cMM03",
    annualLink: "https://buy.stripe.com/14A7sLfcM1WB2MjdvScMM06",
  },
  {
    name: "Lead",
    description: "Fractional AI General Counsel for established businesses.",
    annualPrice: 300,
    monthlyPrice: 300,
    features: [
      "Everything in Grow plus:",
      "2-3 attorney consultations/mo",
      "Quarterly AI risk reviews",
      "Priority support & all doc reviews",
    ],
    cta: "Start Leading",
    monthlyLink: "https://buy.stripe.com/eVqcN5ggQ0Sx5YvbnKcMM04",
    annualLink: "https://buy.stripe.com/aFafZhc0Aat772zezWcMM07",
  },
];

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(true);

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
        {pricingTiers.map((tier, idx) => {
          const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
          const billingNote = isAnnual
            ? tier.annualPrice === 0
              ? ""
              : "billed annually"
            : "billed monthly";

          return (
            <div
              key={idx}
              className={`relative rounded-[20px] p-8 border transition-all duration-300 ${
                tier.featured
                  ? "border-[#C17832] bg-white shadow-[0_20px_40px_rgba(193,120,50,0.15)]"
                  : "border-[#D9CCBC] bg-white hover:border-[#C17832] hover:shadow-md"
              }`}
            >
              {/* Badge */}
              {tier.badge && (
                <div className="absolute -top-4 left-8 bg-[#C17832] text-white text-xs font-bold px-3 py-1.5 rounded-full">
                  {tier.badge}
                </div>
              )}

              {/* Tier Name */}
              <h3 className="text-2xl font-heading text-[#1F1810] mb-3">
                {tier.name}
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

              {/* Description */}
              <p className="text-sm text-[#6B5B4E] mb-8 leading-relaxed">
                {tier.description}
              </p>

              {/* CTA Button */}
              {tier.monthlyLink ? (
                <a
                  href={isAnnual && tier.annualLink ? tier.annualLink : tier.monthlyLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all mb-8 text-center ${
                    tier.featured
                      ? "bg-[#1F1810] text-white hover:bg-[#C17832]"
                      : "bg-transparent border border-[#C17832] text-[#C17832] hover:bg-[#FAF8F5]"
                  }`}
                >
                  {tier.cta}
                </a>
              ) : (
                <Link
                  href="/login"
                  className={`block w-full py-3 px-4 rounded-lg text-sm font-semibold transition-all mb-8 text-center ${
                    tier.featured
                      ? "bg-[#1F1810] text-white hover:bg-[#C17832]"
                      : "bg-transparent border border-[#C17832] text-[#C17832] hover:bg-[#FAF8F5]"
                  }`}
                >
                  {tier.cta}
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
                    <span className="text-sm text-[#6B5B4E]">
                      {feature}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
