export default function TestimonialsSection() {
  return (
    <section
      id="testimonials"
      className="w-full bg-[#F5F0EB] py-[120px] px-6"
    >
      <div className="mx-auto max-w-[800px] flex flex-col items-center">
        {/* Label */}
        <p className="text-sm font-semibold text-[#C17832] uppercase tracking-wide mb-6">
          What Clients Say
        </p>

        {/* Decorative quote mark */}
        <div className="text-[120px] text-[#C17832] opacity-15 leading-none mb-6 font-heading">
          "
        </div>

        {/* Main quote */}
        <blockquote className="text-center mb-12">
          <p className="text-3xl md:text-4xl font-heading text-[#1F1810] leading-tight">
            Zachariah doesn't just understand AI law — he builds with it. That practical experience makes all the difference when you're a startup trying to move fast without breaking things.
          </p>
        </blockquote>

        {/* Author */}
        <div className="text-center">
          <p className="text-lg font-bold text-[#1F1810] mb-1">
            Jordan Mitchell
          </p>
          <p className="text-sm text-[#A89279]">
            CEO, Alpine Digital Solutions
          </p>
        </div>
      </div>
    </section>
  );
}
