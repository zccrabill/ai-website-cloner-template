"use client";

import { useState } from "react";
import Image from "next/image";
import {
  ShieldCheck,
  BookOpen,
  Users,
  Award,
  ArrowRight,
  Check,
  CheckCircle2,
  X,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

const SERVICE_OPTIONS = [
  "Contract Review & Drafting",
  "Business Formation",
  "Employment & HR",
  "Compliance & Privacy (GDPR/CCPA/CPA)",
  "Intellectual Property",
  "Trademark & Copyright",
  "Real Estate",
  "Litigation Support",
  "Mergers & Acquisitions",
  "AI Governance & Policy",
  "General Counsel / Outside Counsel",
];

const INDUSTRY_OPTIONS = [
  "Technology / SaaS",
  "Professional Services",
  "Real Estate / Construction",
  "Healthcare",
  "Finance / Fintech",
  "Retail / E-commerce",
  "Manufacturing",
  "Hospitality / Food & Beverage",
  "Nonprofit",
  "Other",
];

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

  const [formOpen, setFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    company: "",
    title: "",
    industry: "",
    services: [] as string[],
    notes: "",
  });

  const toggleService = (service: string) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.fullName || !form.email) {
      setError("Please provide your name and email.");
      return;
    }
    if (form.services.length === 0) {
      setError("Please select at least one service.");
      return;
    }

    setSubmitting(true);
    try {
      const { error: insertError } = await supabase
        .from("faiir_intakes")
        .insert({
          full_name: form.fullName,
          email: form.email,
          phone: form.phone || null,
          company: form.company || null,
          title: form.title || null,
          industry: form.industry || null,
          services: form.services,
          notes: form.notes || null,
        });

      if (insertError) {
        // Graceful fallback: open mailto so the lead is never lost
        const subject = encodeURIComponent(
          `FAIIR intake — ${form.fullName} (${form.company || "Independent"})`
        );
        const body = encodeURIComponent(
          [
            `Name: ${form.fullName}`,
            `Email: ${form.email}`,
            `Phone: ${form.phone}`,
            `Company: ${form.company}`,
            `Title: ${form.title}`,
            `Industry: ${form.industry}`,
            `Services: ${form.services.join(", ")}`,
            "",
            `Notes: ${form.notes}`,
          ].join("\n")
        );
        window.location.href = `mailto:zachariah@availablelaw.com?subject=${subject}&body=${body}`;
      }

      setSubmitted(true);
    } catch {
      setError(
        "Something went wrong. Please try again or email zachariah@availablelaw.com."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setFormOpen(false);
    // Reset after a beat so the success state doesn't flicker on close
    setTimeout(() => {
      setSubmitted(false);
      setError(null);
    }, 300);
  };

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
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="px-6 py-3 bg-[#C17832] text-white rounded-full text-sm font-medium hover:bg-white hover:text-[#1F1810] transition-all whitespace-nowrap flex-shrink-0 inline-flex items-center gap-2"
          >
            Work with FAIIR <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Intake Modal */}
      {formOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1F1810]/60 backdrop-blur-sm overflow-y-auto"
          onClick={closeModal}
        >
          <div
            className="relative bg-[#FAF8F5] rounded-2xl shadow-2xl w-full max-w-2xl my-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-[#1F1810]/5 hover:bg-[#1F1810]/10 flex items-center justify-center text-[#1F1810] transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            {submitted ? (
              <div className="p-12 text-center">
                <div className="w-16 h-16 mx-auto rounded-full bg-[#7A8B6F]/15 flex items-center justify-center mb-5">
                  <CheckCircle2 className="w-8 h-8 text-[#7A8B6F]" />
                </div>
                <h3 className="text-2xl font-heading text-[#1F1810] mb-3">
                  Thanks — we&apos;ve got it.
                </h3>
                <p className="text-[#6B5B4E] max-w-md mx-auto">
                  A FAIIR-certified attorney will reach out within one business
                  day to talk through your needs.
                </p>
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-8 px-6 py-3 bg-[#1F1810] text-white rounded-full text-sm font-medium hover:bg-[#C17832] transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 md:p-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#C17832]/10 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-[#C17832]" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-heading text-[#1F1810]">
                      Work with FAIIR
                    </h3>
                    <p className="text-xs text-[#A89279] uppercase tracking-widest">
                      Tell us a bit about your needs
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Field
                    label="Full Name *"
                    value={form.fullName}
                    onChange={(v) => setForm({ ...form, fullName: v })}
                    placeholder="Jane Doe"
                  />
                  <Field
                    label="Email *"
                    type="email"
                    value={form.email}
                    onChange={(v) => setForm({ ...form, email: v })}
                    placeholder="jane@company.com"
                  />
                  <Field
                    label="Phone"
                    type="tel"
                    value={form.phone}
                    onChange={(v) => setForm({ ...form, phone: v })}
                    placeholder="(555) 123-4567"
                  />
                  <Field
                    label="Company"
                    value={form.company}
                    onChange={(v) => setForm({ ...form, company: v })}
                    placeholder="Acme Inc."
                  />
                  <Field
                    label="Title / Role"
                    value={form.title}
                    onChange={(v) => setForm({ ...form, title: v })}
                    placeholder="Founder, GC, Director…"
                  />
                  <div>
                    <label className="block text-xs font-semibold text-[#1F1810] uppercase tracking-wider mb-2">
                      Industry
                    </label>
                    <select
                      value={form.industry}
                      onChange={(e) =>
                        setForm({ ...form, industry: e.target.value })
                      }
                      className="w-full px-4 py-2.5 bg-white border border-[#1F1810]/10 rounded-lg text-sm text-[#1F1810] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20"
                    >
                      <option value="">Select industry…</option>
                      {INDUSTRY_OPTIONS.map((i) => (
                        <option key={i} value={i}>
                          {i}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-xs font-semibold text-[#1F1810] uppercase tracking-wider mb-2">
                    Services Sought (select all that apply) *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-3 bg-white border border-[#1F1810]/10 rounded-lg">
                    {SERVICE_OPTIONS.map((svc) => {
                      const active = form.services.includes(svc);
                      return (
                        <button
                          key={svc}
                          type="button"
                          onClick={() => toggleService(svc)}
                          className={`flex items-center gap-2 text-left px-3 py-2 rounded-md text-sm transition-all ${
                            active
                              ? "bg-[#C17832]/10 text-[#1F1810]"
                              : "hover:bg-[#F5F0EB] text-[#6B5B4E]"
                          }`}
                        >
                          <span
                            className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                              active
                                ? "bg-[#C17832] border-[#C17832]"
                                : "border-[#1F1810]/30"
                            }`}
                          >
                            {active && (
                              <Check className="w-3 h-3 text-white" />
                            )}
                          </span>
                          <span>{svc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-xs font-semibold text-[#1F1810] uppercase tracking-wider mb-2">
                    Anything else we should know?
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) =>
                      setForm({ ...form, notes: e.target.value })
                    }
                    rows={3}
                    placeholder="Optional context, timing, budget…"
                    className="w-full px-4 py-2.5 bg-white border border-[#1F1810]/10 rounded-lg text-sm text-[#1F1810] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 resize-none"
                  />
                </div>

                {error && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex items-center justify-between gap-4 pt-2 border-t border-[#1F1810]/8">
                  <p className="text-xs text-[#A89279]">
                    We&apos;ll respond within one business day.
                  </p>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 bg-[#1F1810] text-white rounded-full text-sm font-medium hover:bg-[#C17832] transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    {submitting ? "Sending…" : "Submit"}
                    {!submitting && <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-[#1F1810] uppercase tracking-wider mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2.5 bg-white border border-[#1F1810]/10 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20"
      />
    </div>
  );
}
