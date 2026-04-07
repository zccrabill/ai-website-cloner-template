import { DollarSign, MessageSquare, Users } from "lucide-react";

const perks = [
  {
    Icon: DollarSign,
    heading: "Tired of Sky-High Legal Fees?",
    body: "We leverage AI to streamline processes, reducing overhead and passing savings directly to you. Experience top-tier legal services without breaking the bank.",
  },
  {
    Icon: MessageSquare,
    heading: "Frustrated with Lack of Communication?",
    body: "Our AI-driven automation handles routine tasks, freeing our attorneys to engage with you regularly. Stay connected with open dialogues and real-time updates.",
  },
  {
    Icon: Users,
    heading: "Feeling Overlooked and Undervalued?",
    body: "With AI managing mundane processes, our attorneys focus on understanding your unique needs. Experience personalized care that puts you first.",
  },
];

export default function PerksSection() {
  return (
    <section className="w-full py-28 bg-[#0f0f14]">
      <div className="max-w-[1200px] mx-auto px-8">
        {/* Section label */}
        <div className="mb-4">
          <div className="section-divider" />
          <p className="text-[13px] font-medium text-[#f59e0b] tracking-widest uppercase mb-3">
            Why Available Law
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left: sticky heading */}
          <div className="lg:sticky lg:top-24">
            <h2
              className="font-heading mb-6"
              style={{
                fontSize: "clamp(42px, 5vw, 72px)",
                fontWeight: 400,
                color: "#f0f0f5",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
              }}
            >
              Av
              <span style={{ color: "#f59e0b" }}>{"{"}</span>
              ai
              <span style={{ color: "#f59e0b" }}>{"}"}</span>
              lable<br />Perks
            </h2>
            <p className="text-[#a1a1aa] text-[16px] leading-relaxed max-w-[400px]">
              Legal services built for the way businesses actually work today —
              with AI doing the heavy lifting so your attorney can focus on you.
            </p>
          </div>

          {/* Right: perk cards */}
          <div className="flex flex-col gap-4">
            {perks.map(({ Icon, heading, body }, i) => (
              <div
                key={heading}
                className="card-gradient-border p-6 flex gap-5 items-start group hover:bg-[#111113] transition-colors"
              >
                {/* Number + icon badge */}
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <span className="text-[11px] font-medium text-[#52525b] tabular-nums">
                    0{i + 1}
                  </span>
                  <div className="icon-badge">
                    <Icon size={18} className="text-[#f59e0b]" />
                  </div>
                </div>

                <div>
                  <h3
                    className="mb-2 text-[#fafafa] font-semibold"
                    style={{
                      fontSize: "17px",
                      lineHeight: 1.4,
                      fontFamily: "var(--font-body), 'Inter', sans-serif",
                    }}
                  >
                    {heading}
                  </h3>
                  <p
                    style={{
                      fontSize: "15px",
                      color: "#a1a1aa",
                      lineHeight: 1.7,
                      fontFamily: "var(--font-body), 'Inter', sans-serif",
                    }}
                  >
                    {body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
