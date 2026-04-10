export default function FeaturedInSection() {
  const companies = [
    "Warren Law Group",
    "Twin Leak Kitchens",
    "Legend Motor Works",
    "YLab",
    "Links.",
  ];

  return (
    <section
      id="featured"
      className="w-full bg-[#FAF8F5] border-y border-[#1F1810]/8 flex flex-col items-center justify-center py-[72px] px-8"
    >
      <p className="text-[#A89279] text-xs tracking-widest uppercase mb-10">
        Trusted by Colorado businesses
      </p>
      <div className="flex flex-row items-center justify-center gap-x-12 gap-y-6 flex-wrap max-w-[1200px]">
        {companies.map((company) => (
          <div
            key={company}
            className="font-heading text-xl md:text-2xl text-[#1F1810]/30 hover:text-[#C17832] transition-colors duration-300 whitespace-nowrap"
          >
            {company}
          </div>
        ))}
      </div>
    </section>
  );
}
