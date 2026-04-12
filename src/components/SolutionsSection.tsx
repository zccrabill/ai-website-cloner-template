import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { FileSearch, Compass, FileSignature, Sparkles } from "lucide-react";

/**
 * Solutions grid on the homepage. Editorial treatment: line icons (not
 * filled color blocks), a numbered category eyebrow per card, and brand
 * orange reserved as an accent — not a background fill. This replaces an
 * earlier version that used emojis and repeated two alternating background
 * colors, which felt cheap and visually monotonous.
 *
 * Design rules:
 * - Icons are Lucide line icons at 32px, rendered in dark text color. No
 *   colored backgrounds on the icon itself.
 * - Each card gets a unique numbered eyebrow (01 / Contracts, 02 / Audits,
 *   ...) so no two cards share a category label.
 * - Hover reveals an accent underline on the top edge and shifts the card
 *   up slightly. This is the only place brand orange appears inside the
 *   card body, which keeps the section from turning into a color chart.
 */

interface Solution {
  icon: LucideIcon;
  number: string;
  category: string;
  title: string;
  description: string;
  href: string;
}

// Kept deliberately small (four cards, not six). Colorado AI Act readiness
// and data privacy assessments used to live here but were cut because they
// double up with the FAIIR section below — running both made the homepage
// feel long and repetitive. If you add a fifth card, audit for overlap
// with /faiir before shipping.
const SOLUTIONS: Solution[] = [
  {
    icon: FileSearch,
    number: "01",
    category: "Contracts",
    title: "Contract Review & Drafting",
    description:
      "Every contract you touch — vendor, customer, employment, NDA — drafted and reviewed by a Colorado-licensed attorney, with AI handling the heavy lifting underneath.",
    href: "/#pricing",
  },
  {
    icon: Compass,
    number: "02",
    category: "Advisory",
    title: "Fractional General Counsel",
    description:
      "Ongoing legal strategy without a full-time in-house hire. Founders, operators, and small teams get a dedicated attorney on subscription.",
    href: "/#pricing",
  },
  {
    icon: FileSignature,
    number: "03",
    category: "Deals",
    title: "Business & Transactional Work",
    description:
      "Entity formation, operating agreements, financing documents, and M&amp;A paperwork — structured and reviewed without the billable-hours clock.",
    href: "/#pricing",
  },
  {
    icon: Sparkles,
    number: "04",
    category: "AI Assistant",
    title: "Allora, Your 24/7 Legal Assistant",
    description:
      "Members get always-on access to Allora for general guidance, document drafting, and research — with licensed attorney escalation built in.",
    href: "/#pricing",
  },
];

export default function SolutionsSection() {
  return (
    <section className="w-full py-20 lg:py-32 bg-[#FAF8F5]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="mb-16 text-center lg:text-left">
          <p className="text-sm font-medium text-[#C17832] tracking-widest uppercase mb-3">
            Solutions
          </p>
          <h2 className="font-heading text-5xl lg:text-6xl text-[#1F1810] mb-4 leading-tight">
            Everything a Colorado small business needs
          </h2>
          <p className="text-lg text-[#6B5B4E] max-w-2xl">
            Contracts, compliance, privacy, advisory — delivered on a flat
            monthly subscription instead of a billable-hours clock. Every
            output is reviewed by a Colorado-licensed attorney.
          </p>
        </div>

        {/* Solutions grid — four cards in a 2x2 on desktop. If a fifth
            card is added, bump back to lg:grid-cols-3 and audit for
            overlap with the FAIIR section first. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SOLUTIONS.map((solution) => {
            const Icon = solution.icon;
            return (
              <Link
                key={solution.number}
                href={solution.href}
                className="group relative bg-white rounded-[20px] p-8 border border-[#EDE5DB] transition-all duration-300 hover:-translate-y-1 hover:border-[#D9CCBC] hover:shadow-[0_20px_40px_rgba(31,24,16,0.08)] overflow-hidden flex flex-col"
              >
                {/* Accent top line — reveals on hover */}
                <span className="absolute top-0 left-0 right-0 h-[3px] bg-[#C17832] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />

                {/* Eyebrow row: number + category */}
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-xs font-semibold text-[#C17832] tracking-[0.15em]">
                    {solution.number}
                  </span>
                  <span className="text-[11px] font-medium text-[#A89279] tracking-[0.2em] uppercase">
                    / {solution.category}
                  </span>
                </div>

                {/* Icon — no colored background block, just the line icon
                    in dark on the card surface */}
                <Icon
                  className="w-8 h-8 text-[#1F1810] mb-6 transition-transform duration-300 group-hover:scale-110 group-hover:text-[#C17832]"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />

                {/* Title */}
                <h3 className="font-heading text-[26px] text-[#1F1810] mb-3 leading-tight">
                  {solution.title}
                </h3>

                {/* Description */}
                <p
                  className="text-[15px] text-[#6B5B4E] leading-relaxed mb-6 flex-grow"
                  dangerouslySetInnerHTML={{ __html: solution.description }}
                />

                {/* Learn more link */}
                <span className="inline-flex items-center gap-2 text-[#C17832] font-medium text-sm transition-all duration-200 group-hover:gap-3 mt-auto">
                  Learn more
                  <span aria-hidden="true">&rarr;</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
