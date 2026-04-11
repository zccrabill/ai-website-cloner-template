"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  BookOpen,
  Users,
  Award,
  ArrowRight,
} from "lucide-react";

export default function FaiirSection() {
  const pillars = [
    {
      icon: ShieldCheck,
      title: "Verified AI Competence",
      description:
        "Certified attorneys demonstrate working knowledge of large language models, prompt engineering, hallucination mitigation, and AI risk frameworks.",
    },
    {
      icon: BookOpen,
      title: "Ongoing Education",
      description:
        "Continuing AI education requirements ensure FAIIR-certified practitioners stay current with evolving AI law, ethics opinions, and best practices.",
    },
    {
      icon: Users,
      title: "Human Oversight",
      description:
        "Every AI-assisted deliverable is reviewed by a licensed attorney. Clients always know when AI was used and how human judgment was applied.",
    },
    {
      icon: Award,
      title: "Ethical Standards",
      description:
        "FAIIR practitioners commit to transparent AI disclosure, client confidentiality safeguards, and the highest standards of professional responsibility.",
    },
  ];

  return (
    <section
      id="faiir"
      className="w-full bg-gradient-to-b from-[#FAF8F5] to-[#F5F0EB] py-[120px] px-6 border-y border-[#1F1810]/8"
    >
      <div className="max-w-[1200px] mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-[#C17832]/20 rounded-full blur-2xl scale-150" />
            <Image
              src="/images/faiir-logo.png"
              alt="FAIIR Certified"
              width={120}
              height={120}
              className="relative object-contain drop-shadow-lg"
            />
          </div>
          <p className="text-sm font-semibold text-[#C17832] uppercase tracking-widest mb-4">
            The Standard for AI-Powered Law
          </p>
          <h2 className="text-4xl md:text-5xl font-heading text-[#1F1810] mb-6 max-w-3xl leading-tight">
            FAIIR Certified — the seal of approval for AI in legal practice
          </h2>
          <p className="text-lg text-[#6B5B4E] max-w-2xl leading-relaxed">
            FAIIR — the{" "}
            <span className="font-semibold text-[#1F1810]">
              Foundation for AI Integrity &amp; Regulation
            </span>{" "}
            — is the certification standard for attorneys who responsibly
            integrate artificial intelligence into client work. Available Law is
            proudly FAIIR Certified.
          </p>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bg-white border border-[#1F1810]/8 rounded-2xl p-8 hover:border-[#C17832]/40 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#C17832]/10 rounded-xl flex items-center justify-center mb-5">
                  <Icon className="w-6 h-6 text-[#C17832]" />
                </div>
                <h3 className="text-xl font-heading text-[#1F1810] mb-3">
                  {pillar.title}
                </h3>
                <p className="text-sm text-[#6B5B4E] leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CTA strip */}
        <div className="bg-[#1F1810] rounded-2xl p-10 md:p-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex-1">
            <p className="text-xs font-semibold text-[#C17832] uppercase tracking-widest mb-2">
              Why It Matters
            </p>
            <h3 className="text-2xl md:text-3xl font-heading text-white mb-2">
              Not all AI lawyers are created equal.
            </h3>
            <p className="text-sm text-white/70 max-w-xl leading-relaxed">
              Choosing a FAIIR-certified attorney means choosing transparency,
              competence, and accountability. When AI touches your legal work,
              you deserve to know it&apos;s done right.
            </p>
          </div>
          <Link
            href="/faiir"
            className="group px-6 py-3 bg-[#C17832] text-white rounded-full text-sm font-medium hover:bg-white hover:text-[#1F1810] transition-all whitespace-nowrap flex-shrink-0 inline-flex items-center gap-2"
          >
            Explore FAIIR Certification
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
