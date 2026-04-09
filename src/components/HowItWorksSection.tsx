export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Choose Your Plan",
      description:
        "Start free or pick the membership tier that matches your needs. All plans include Allora AI access and can be changed anytime.",
    },
    {
      number: "02",
      title: "Connect with Allora",
      description:
        "Access your AI legal assistant through your member dashboard. Ask questions, upload contracts, and get instant guidance.",
    },
    {
      number: "03",
      title: "Attorney When You Need One",
      description:
        "Every AI output is reviewed by a licensed Colorado attorney. Upgrade for dedicated consultation time as your needs grow.",
    },
  ];

  return (
    <section className="relative w-full bg-[#1F1810] py-[120px] px-8 overflow-hidden">
      {/* Subtle radial gradient orb */}
      <div
        className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full opacity-[0.08]"
        style={{
          background:
            "radial-gradient(circle, #C17832 0%, transparent 70%)",
          transform: "translate(200px, -200px)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1200px]">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="text-sm font-medium tracking-wide text-[#C17832] mb-3">
            How It Works
          </p>
          <h2 className="font-heading text-4xl md:text-5xl text-white mb-4">
            Three steps to smarter legal support
          </h2>
          <p className="text-white/60 text-base md:text-lg max-w-2xl mx-auto">
            Get started with Allora in minutes and access legal guidance whenever you need it.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="group relative rounded-[20px] bg-white/4 border border-white/8 backdrop-blur-md p-8 transition-all duration-300 hover:bg-white/6 hover:border-[#C17832]/30 hover:-translate-y-1"
            >
              {/* Step Number */}
              <div className="font-heading text-6xl text-[#C17832]/60 mb-6 font-light">
                {step.number}
              </div>

              {/* Title */}
              <h3 className="text-xl font-semibold text-white mb-3">
                {step.title}
              </h3>

              {/* Description */}
              <p className="text-white/50 text-base leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
