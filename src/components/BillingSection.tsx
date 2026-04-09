export default function BillingSection() {
  return (
    <section
      className="w-full flex flex-col items-center justify-center text-center px-8 py-28 relative overflow-hidden"
      style={{ backgroundColor: "#0f0f14" }}
    >
      {/* Subtle radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(245,158,11,0.07) 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 max-w-[720px]">
        {/* Label */}
        <div className="flex justify-center mb-4">
          <div className="section-divider mx-auto" style={{ width: "48px" }} />
        </div>
        <p className="text-[13px] font-medium text-[#f59e0b] tracking-widest uppercase mb-6">
          Individuals
        </p>

        <h2
          className="font-heading mb-6"
          style={{
            fontSize: "clamp(42px, 6vw, 80px)",
            color: "#fafafa",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          Solution Based<br />Billing
        </h2>
        <p
          className="mb-10 max-w-[520px] mx-auto"
          style={{
            fontSize: "17px",
            color: "#a1a1aa",
            fontFamily: "var(--font-body), 'Inter', sans-serif",
            lineHeight: 1.8,
          }}
        >
          With Solution Based Billing, you only pay if we solve your problem.
          No hourly surprises. No minimum billable hours.
          Book a free consultation to learn more.
        </p>

        <a href="/#pricing" className="btn-al btn-al-primary px-8 py-3.5 text-[15px]">
          Book Free Consultation
        </a>

        {/* Feature chips */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {["No Win, No Fee", "Flat-Rate Options", "Transparent Pricing"].map((tag) => (
            <span
              key={tag}
              className="px-3 py-1.5 rounded-full text-[12px] text-[#71717a] border border-white/[0.06] bg-white/[0.02]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
