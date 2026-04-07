import { Check } from "lucide-react";

const plans = [
  {
    price: "$150",
    period: "/mo",
    name: "Startup",
    description: "For early-stage companies getting legal basics in order.",
    features: [
      "Custom AI Agent for your business",
      "Monthly legal newsletter",
      "2 attorney consultations/month",
      "Legal templates & guides library",
    ],
    featured: false,
  },
  {
    price: "$300",
    period: "/mo",
    name: "Scale",
    description: "For growing companies with active legal needs.",
    features: [
      "Everything in Startup, plus:",
      "Document drafting with attorney review",
      "Legal research on business questions",
      "5 attorney consultations/month",
    ],
    featured: true,
  },
  {
    price: "$750",
    period: "/mo",
    name: "Sustain",
    description: "For companies needing ongoing strategic legal counsel.",
    features: [
      "Everything in Scale, plus:",
      "Unlimited attorney consultations",
      "Executive business strategy",
    ],
    featured: false,
  },
];

export default function PricingSection() {
  return (
    <section className="w-full py-28" style={{ backgroundColor: "#0f0f14" }}>
      <div className="max-w-[1200px] mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex justify-center mb-4">
            <div className="section-divider mx-auto" style={{ width: "48px" }} />
          </div>
          <p className="text-[13px] font-medium text-[#f59e0b] tracking-widest uppercase mb-4">
            Business Solutions
          </p>
          <h2
            className="font-heading mb-4"
            style={{
              fontSize: "clamp(38px, 5vw, 62px)",
              color: "#fafafa",
              fontWeight: 400,
              letterSpacing: "-0.02em",
            }}
          >
            Subscription-Based Plans
          </h2>
          <p
            style={{
              fontSize: "17px",
              color: "#a1a1aa",
              fontFamily: "var(--font-body), 'Inter', sans-serif",
              maxWidth: "480px",
              margin: "0 auto",
            }}
          >
            Predictable pricing that streamlines your legal needs.
            No surprise bills, no minimum hours.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col p-8 ${
                plan.featured ? "card-featured" : "card-gradient-border"
              }`}
            >
              {/* Featured badge */}
              {plan.featured && (
                <div className="inline-flex self-start mb-4">
                  <span className="px-2.5 py-1 rounded-full bg-[#f59e0b]/20 border border-[#f59e0b]/30 text-[#f59e0b] text-[11px] font-semibold tracking-wide uppercase">
                    Most Popular
                  </span>
                </div>
              )}

              {/* Price */}
              <div className="mb-1 flex items-end gap-1">
                <span
                  className="font-heading"
                  style={{
                    fontSize: "clamp(36px, 4vw, 52px)",
                    color: plan.featured ? "#f59e0b" : "#fafafa",
                    fontWeight: 400,
                    lineHeight: 1,
                  }}
                >
                  {plan.price}
                </span>
                <span className="text-[#71717a] text-[15px] mb-1.5">{plan.period}</span>
              </div>

              {/* Plan name */}
              <h3
                className="font-heading mb-2"
                style={{ fontSize: "22px", color: "#fafafa", fontWeight: 500 }}
              >
                {plan.name}
              </h3>

              {/* Description */}
              <p className="text-[14px] text-[#71717a] mb-7 leading-relaxed">
                {plan.description}
              </p>

              {/* Divider */}
              <div className="w-full h-px bg-white/[0.06] mb-7" />

              {/* Features */}
              <ul className="flex flex-col gap-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check
                      size={15}
                      className="flex-shrink-0 mt-0.5"
                      style={{ color: plan.featured ? "#f59e0b" : "#52525b" }}
                    />
                    <span
                      style={{
                        fontSize: "14px",
                        color: "#a1a1aa",
                        lineHeight: 1.6,
                        fontFamily: "var(--font-body), 'Inter', sans-serif",
                      }}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="#"
                className={`btn-al text-center text-[14px] ${
                  plan.featured ? "btn-al-primary" : "btn-al-dark"
                }`}
              >
                Get Started
              </a>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <p className="text-center text-[13px] text-[#52525b] mt-8">
          All plans include a free onboarding call. Cancel anytime.
        </p>
      </div>
    </section>
  );
}
