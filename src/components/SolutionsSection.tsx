import Image from "next/image";

export default function SolutionsSection() {
  return (
    <section className="w-full py-28 bg-[#0f0f14]">
      <div className="max-w-[1200px] mx-auto px-8">
        {/* Section label */}
        <div className="mb-4">
          <div className="section-divider" />
          <p className="text-[13px] font-medium text-[#f59e0b] tracking-widest uppercase mb-10">
            Our Approach
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <h2
              className="font-heading mb-8"
              style={{
                fontSize: "clamp(42px, 5.5vw, 80px)",
                color: "#f0f0f5",
                fontWeight: 400,
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              Av
              <span style={{ color: "#f59e0b" }}>{"{"}</span>
              ai
              <span style={{ color: "#f59e0b" }}>{"}"}</span>
              lable<br />Solutions
            </h2>

            <div
              style={{
                fontFamily: "var(--font-body), 'Inter', sans-serif",
                fontSize: "16px",
                color: "#a1a1aa",
                lineHeight: 1.8,
                maxWidth: "540px",
              }}
            >
              <p className="mb-5">
                With nearly 500,000 active law firms in America responsible for delivering
                justice at a valuation of approximately $375 billion annually, why are so
                many businesses and individuals without quality legal solutions? The answer:
                legal is outmoded &amp; unnecessarily expensive.
              </p>
              <p className="mb-5">
                We exist to change that by offering a broad range of services on flexible
                billing models. We leverage the latest tech from a virtual platform and pass
                the cost savings directly to our clients.
              </p>
              <p className="mb-10">
                Whether you run into a problem as an individual or a business, we have
                tailored solutions at an affordable cost — reach out to learn more.
              </p>
            </div>

            <a
              href="#"
              className="btn-al btn-al-primary text-[14px] px-6 py-3"
            >
              Free Consultation
            </a>
          </div>

          {/* Image */}
          <div
            className="relative overflow-hidden"
            style={{ minHeight: "480px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" }}
          >
            <Image
              src="/images/billing-bg.jpg"
              alt="Available Law Solutions"
              fill
              className="object-cover opacity-80"
            />
            {/* Gradient overlay */}
            <div
              className="absolute inset-0"
              style={{
                background: "linear-gradient(135deg, rgba(245,158,11,0.08) 0%, transparent 60%)",
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
