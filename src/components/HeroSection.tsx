import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-[92vh] flex flex-col items-center justify-center overflow-hidden bg-[#0f0f14] bg-grid">
      {/* Radial amber glow */}
      <div className="hero-glow" />

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none z-10"
        style={{ background: "linear-gradient(to top, #0f0f14, transparent)" }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-6 py-24 max-w-[900px] mx-auto">
        {/* Eyebrow chip */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#f59e0b]/30 bg-[#f59e0b]/10 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse" />
          <span className="text-[13px] text-[#f59e0b] font-medium tracking-wide">
            AI Legal Risk Consulting · Colorado
          </span>
        </div>

        {/* Main heading */}
        <h1
          className="font-heading mb-6"
          style={{
            fontSize: "clamp(52px, 7.5vw, 104px)",
            lineHeight: 1.08,
            fontWeight: 400,
            color: "#f0f0f5",
            letterSpacing: "-0.02em",
          }}
        >
          Av
          <span style={{ color: "#f59e0b", textShadow: "0 0 36px rgba(245,158,11,0.35)" }}>{"{"}</span>
          ai
          <span style={{ color: "#f59e0b", textShadow: "0 0 36px rgba(245,158,11,0.35)" }}>{"}"}</span>
          lable Law
        </h1>

        {/* Subtitle */}
        <p
          className="mb-10 max-w-[560px]"
          style={{
            fontSize: "clamp(17px, 2vw, 21px)",
            color: "#a1a1aa",
            lineHeight: 1.7,
            fontFamily: "var(--font-body), 'Inter', sans-serif",
          }}
        >
          AI-powered legal solutions for Colorado businesses.
          Practical advice from an attorney who actually builds with AI.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link href="/#solutions" className="btn-al btn-al-primary px-6 py-3 text-[15px]">
            Explore Solutions
          </Link>
          <Link href="/#pricing" className="btn-al btn-al-outline px-6 py-3 text-[15px]">
            Free Consultation
          </Link>
        </div>

        {/* Trust indicators */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {[
            "AI Contract Review",
            "Liability Audits",
            "Colorado-Based",
            "Fractional AI GC",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2 text-[13px] text-[#52525b]">
              <span className="text-[#f59e0b]">✦</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
