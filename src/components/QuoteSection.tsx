export default function QuoteSection() {
  return (
    <section
      className="w-full flex items-center justify-center px-8 py-24 relative overflow-hidden"
      style={{ backgroundColor: "#0d0d10" }}
    >
      {/* Decorative border */}
      <div
        className="absolute left-0 top-0 bottom-0 w-px"
        style={{ background: "linear-gradient(to bottom, transparent, rgba(245,158,11,0.3), transparent)" }}
      />

      <div className="max-w-[800px] text-center">
        {/* Quote mark */}
        <div
          className="font-heading mb-6 select-none"
          style={{ fontSize: "80px", color: "rgba(245,158,11,0.15)", lineHeight: 0.8 }}
        >
          &ldquo;
        </div>

        <blockquote
          className="font-heading"
          style={{
            fontSize: "clamp(22px, 3vw, 38px)",
            fontWeight: 400,
            color: "#d4d4d8",
            lineHeight: 1.5,
            fontStyle: "italic",
          }}
        >
          I feel that our society today has come to recognize, on a far broader basis than
          ever before, the desirability and necessity of providing adequate legal remedies
          to all our citizens.
        </blockquote>
        <div className="flex items-center justify-center gap-3 mt-8">
          <div className="w-8 h-px bg-[#f59e0b]/40" />
          <p
            style={{
              fontSize: "14px",
              color: "#71717a",
              fontFamily: "var(--font-body), 'Inter', sans-serif",
              letterSpacing: "0.05em",
            }}
          >
            Senator Taft J., 1974
          </p>
          <div className="w-8 h-px bg-[#f59e0b]/40" />
        </div>
      </div>
    </section>
  );
}
