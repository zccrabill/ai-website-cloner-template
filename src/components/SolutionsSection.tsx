export default function SolutionsSection() {
  const solutions = [
    {
      icon: "📋",
      title: "AI Contract Review",
      description: "Our AI analyzes your contracts for risk, flags problematic clauses, and suggests revisions — all reviewed by a licensed attorney.",
      iconBg: "#C17832",
    },
    {
      icon: "🔍",
      title: "AI Liability Audits",
      description: "Identify legal exposure in your AI systems before regulators do. Our team delivers comprehensive audits of your AI tools and data practices.",
      iconBg: "#7A8B6F",
    },
    {
      icon: "🔐",
      title: "Data Privacy Assessments",
      description: "We ensure your data collection, storage, and processing meets Colorado Privacy Act requirements and industry best practices.",
      iconBg: "#FAF8F5",
      iconColor: "#1F1810",
    },
    {
      icon: "⚖️",
      title: "Fractional AI General Counsel",
      description: "Ongoing legal support without the full-time cost. Our attorneys provide strategic guidance on AI governance, compliance, and business decisions.",
      iconBg: "#C17832",
    },
    {
      icon: "📄",
      title: "Transactional Legal Work",
      description: "Business formation, contract drafting, and deal structuring with AI-assisted efficiency and attorney oversight.",
      iconBg: "#7A8B6F",
    },
    {
      icon: "💬",
      title: "Allora AI Assistant",
      description: "Your always-on legal assistant. Ask questions, get guidance, and access resources — with attorney escalation built in.",
      iconBg: "#FAF8F5",
      iconColor: "#1F1810",
    },
  ];

  return (
    <section className="w-full py-20 lg:py-32 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="mb-16 text-center lg:text-left">
          <p className="text-sm font-medium text-[#C17832] tracking-widest uppercase mb-3">
            Solutions
          </p>
          <h2 className="font-heading text-5xl lg:text-6xl text-[#1F1810] mb-4 leading-tight">
            Comprehensive Legal Services
          </h2>
          <p className="text-lg text-[#6B5B4E] max-w-2xl">
            From contract review to ongoing counsel, we offer a full suite of legal solutions powered by AI and delivered by experienced attorneys.
          </p>
        </div>

        {/* Solutions grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {solutions.map((solution, idx) => (
            <div
              key={idx}
              className="group relative bg-white rounded-[20px] p-8 border border-[#F5F0EB] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl overflow-hidden"
            >
              {/* Accent top line on hover */}
              <div
                className="absolute top-0 left-0 right-0 h-1 bg-[#C17832] rounded-t-[20px] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"
                style={{ width: "100%" }}
              />

              {/* Icon */}
              <div
                className="w-16 h-16 rounded-xl flex items-center justify-center text-3xl mb-6 transition-all duration-300"
                style={{
                  backgroundColor: solution.iconBg,
                  color: solution.iconColor || "#F5F0EB",
                }}
              >
                {solution.icon}
              </div>

              {/* Title */}
              <h3 className="font-heading text-2xl text-[#1F1810] mb-3">
                {solution.title}
              </h3>

              {/* Description */}
              <p className="text-[#6B5B4E] leading-relaxed mb-6">
                {solution.description}
              </p>

              {/* Learn more link */}
              <a
                href="/#pricing"
                className="inline-flex items-center gap-2 text-[#C17832] font-medium transition-all duration-200 group-hover:gap-3"
              >
                Get started
                <span>→</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
