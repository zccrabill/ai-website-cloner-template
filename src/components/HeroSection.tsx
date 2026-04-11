"use client";

import Link from "next/link";

export default function HeroSection() {
  // Animations start immediately on mount. There's no server/client divergence
  // because CSS keyframes are the same in both environments — the effect-based
  // pattern that used to flip this from false to true was a React anti-pattern
  // and also triggered react-hooks/set-state-in-effect.
  const isAnimating = true;

  return (
    <section className="relative w-full min-h-screen bg-[#FAF8F5] overflow-hidden">
      {/* Animated gradient orbs background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Accent orb */}
        <div
          className={`absolute w-96 h-96 rounded-full opacity-20 pointer-events-none mix-blend-multiply blur-3xl ${
            isAnimating ? "animate-float" : ""
          }`}
          style={{
            background: "#C17832",
            top: "10%",
            right: "5%",
            animation: isAnimating ? "float 6s ease-in-out infinite" : "none",
          }}
        />
        {/* Sage orb */}
        <div
          className={`absolute w-80 h-80 rounded-full opacity-15 pointer-events-none mix-blend-multiply blur-3xl ${
            isAnimating ? "animate-float" : ""
          }`}
          style={{
            background: "#7A8B6F",
            bottom: "15%",
            left: "10%",
            animation: isAnimating ? "float 8s ease-in-out infinite 1s" : "none",
          }}
        />
      </div>

      {/* Content grid: text left, card right */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Text content */}
          <div
            className={`space-y-8 ${
              isAnimating
                ? "animate-fadeUp"
                : "opacity-0"
            }`}
            style={{
              animationDelay: isAnimating ? "0.1s" : undefined,
              animation: isAnimating ? "fadeUp 0.8s ease-out forwards" : "none",
            }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#C17832]/20 bg-white/60 backdrop-blur-sm w-fit">
              <span className="w-2 h-2 rounded-full bg-[#C17832] animate-pulse" />
              <span className="text-sm font-medium text-[#1F1810] tracking-wide">
                Colorado-licensed · AI-powered
              </span>
            </div>

            {/* Main heading */}
            <h1
              className="font-heading text-5xl lg:text-6xl leading-tight text-[#1F1810]"
              style={{ letterSpacing: "-0.02em" }}
            >
              Colorado&rsquo;s subscription law firm{" "}
              <em className="not-italic text-[#C17832]">for</em> small business
            </h1>

            {/* Subtitle */}
            <p className="text-lg text-[#6B5B4E] max-w-md leading-relaxed">
              Available Law is a Colorado-licensed, FAIIR-certified virtual law firm serving small businesses on a flat monthly subscription. Contracts, employment, AI vendor review, and Colorado AI Act (SB24-205) compliance &mdash; on a subscription, not a stopwatch.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                href="/#pricing"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#1F1810] text-white rounded-lg font-medium transition-all duration-200 hover:bg-[#C17832] group"
              >
                Explore Plans
                <span className="transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link
                href="/#solutions"
                className="inline-flex items-center justify-center px-6 py-3 border-2 border-[#1F1810] text-[#1F1810] rounded-lg font-medium transition-all duration-200 hover:border-[#C17832] hover:text-[#C17832]"
              >
                See Solutions
              </Link>
            </div>
          </div>

          {/* Right: Card showcase */}
          <div
            className={`relative ${
              isAnimating
                ? "animate-fadeUp"
                : "opacity-0"
            }`}
            style={{
              animationDelay: isAnimating ? "0.3s" : undefined,
              animation: isAnimating ? "fadeUp 0.8s ease-out forwards" : "none",
            }}
          >
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-[#F5F0EB]">
              {/* Card header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-heading text-2xl text-[#1F1810] mb-2">AI Contract Review</h3>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {["Liability Cap", "IP Assignment", "Indemnity"].map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs font-medium rounded-full bg-[#F5F0EB] text-[#6B5B4E]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[#F0F9F6]">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span className="text-sm font-medium text-[#059669]">
                  Review complete — attorney verified
                </span>
              </div>
            </div>

            {/* Floating badges */}
            <div
              className="absolute -bottom-6 -left-8 bg-white px-4 py-3 rounded-xl shadow-lg border border-[#F5F0EB] flex items-center gap-2 animate-pulse"
              style={{
                animation: isAnimating ? "float 5s ease-in-out infinite 0.5s" : "none",
              }}
            >
              <span className="text-xl">⏱️</span>
              <span className="text-sm font-medium text-[#1F1810]">24hr turnaround</span>
            </div>

            <div
              className="absolute -top-6 -right-8 bg-white px-4 py-3 rounded-xl shadow-lg border border-[#F5F0EB] flex items-center gap-2 animate-pulse"
              style={{
                animation: isAnimating ? "float 5s ease-in-out infinite 1s" : "none",
              }}
            >
              <span className="text-xl">✓</span>
              <span className="text-sm font-medium text-[#1F1810]">Attorney verified</span>
            </div>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
