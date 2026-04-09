export default function SolutionsSection() {
  const solutions = [
    {
      icon: "📋",
      title: "AI Contract Review",
      description: "Intelligent analysis of contracts with key risk identification and attorney verification.",
      iconBg: "#C17832",
    },
    {
      icon: "🔍",
      title: "AI Liability Audits",
      description: "Comprehensive audits of your legal exposure with actionable recommendations.",
      iconBg: "#7A8B6F",
    },
    {
      icon: "🔐",
      title: "Data Privacy Assessments",
      description: "Ensure compliance with privacy regulations and protect customer data.",
      iconBg: "#FAF8F5",
      iconColor: "#1F1810",
    },
    {
      icon: "⚖️",
      title: "Fractional AI General Counsel",
      description: "On-demand legal strategy and guidance integrated with AI insights.",
      iconBg: "#C17832",
    },
    {
      icon: "📄",
      title: "Transactional Legal Work",
      description: "Efficient handling of contracts, agreements, and legal documentation.",
      iconBg: "#7A8B6F",
    },
    {
      icon: "💬",
      title: "Allora AI Assistant",
      description: "Conversational AI that answers legal questions and provides guidance.",
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
              className="group bg-white rounded-[20px] p-8 border border-[#F5F0EB] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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
                href="#"
                className="inline-flex items-center gap-2 text-[#C17832] font-medium transition-all duration-200 group-hover:gap-3"
              >
                Learn more
                <span>→</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
