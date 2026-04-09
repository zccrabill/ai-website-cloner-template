export default function FeaturedInSection() {
  const companies = [
    "TechStartup Co.",
    "Alpine Digital",
    "RockyMtn AI",
    "FrontRange SaaS",
    "Pikes Peak Labs",
  ];

  return (
    <section id="featured" className="w-full bg-[#FAF8F5] border-y border-[#1F1810]/8 flex flex-col items-center justify-center py-[60px] px-8">
      <p className="text-[#A89279] text-xs tracking-widest uppercase mb-12">
        Trusted by Colorado businesses
      </p>
      <div className="flex flex-row items-center justify-center gap-8 flex-wrap max-w-[1200px]">
        {companies.map((company) => (
          <div
            key={company}
            className="font-semibold text-lg text-[#D9CCBC] hover:text-[#A89279] transition-colors duration-200"
          >
            {company}
          </div>
        ))}
      </div>
    </section>
  );
}
