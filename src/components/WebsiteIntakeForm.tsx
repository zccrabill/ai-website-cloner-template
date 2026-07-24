"use client";

/**
 * WebsiteIntakeForm — modal project brief for Sitecraft (website design &
 * build) landing visitors.
 *
 * Inserts into public.website_intakes (schema:
 * supabase/migrations/…_website_intakes.sql) and fires a
 * website.intake_received notification to the firm via the notify-event Edge
 * Function. Both calls are fail-open from the user's perspective: insert
 * errors surface in the UI, but the notification is fire-and-forget so a
 * Resend hiccup doesn't degrade the submission UX.
 *
 * This mirrors FaiirIntakeForm's structure and RLS handling on purpose — the
 * bare insert (no .select() chain) relies on an anon-allowed INSERT policy,
 * and SELECT is admin-only. Visual language matches the lighter Available
 * Law palette (cream + brown + #C17832 orange).
 *
 * All option lists (project types, industries, budget, timeline) come from
 * src/lib/sitecraft.ts so this component never needs editing to change them.
 */

import { useEffect, useState } from "react";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import {
  PROJECT_TYPE_OPTIONS,
  INDUSTRY_OPTIONS,
  BUDGET_OPTIONS,
  TIMELINE_OPTIONS,
} from "@/lib/sitecraft";

interface WebsiteIntakeFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WebsiteIntakeForm({
  isOpen,
  onClose,
}: WebsiteIntakeFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [industry, setIndustry] = useState("");
  const [projectTypes, setProjectTypes] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [timeline, setTimeline] = useState("");
  const [notes, setNotes] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Close on ESC + lock background scroll when open.
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  // Reset form state after the modal closes so the next open is clean.
  useEffect(() => {
    if (isOpen) return;
    const t = setTimeout(() => {
      setFullName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setWebsiteUrl("");
      setIndustry("");
      setProjectTypes([]);
      setBudget("");
      setTimeline("");
      setNotes("");
      setError(null);
      setSubmitted(false);
    }, 300);
    return () => clearTimeout(t);
  }, [isOpen]);

  const toggleProjectType = (value: string) => {
    setProjectTypes((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value],
    );
  };

  const canSubmit = fullName.trim().length > 0 && email.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;

    setSubmitting(true);
    setError(null);

    const payload = {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || null,
      company: company.trim() || null,
      website_url: websiteUrl.trim() || null,
      industry: industry || null,
      project_types: projectTypes,
      budget: budget || null,
      timeline: timeline || null,
      notes: notes.trim() || null,
    };

    // Bare insert — do NOT chain .select(). website_intakes SELECT is
    // admin-only, so a read-back would trip the SELECT RLS policy and fail
    // the whole insert for anonymous visitors. A bare insert uses
    // Prefer: return=minimal and needs only the anon INSERT policy.
    const { error: insertErr } = await supabase
      .from("website_intakes")
      .insert(payload);

    if (insertErr) {
      setError(
        "We couldn't save your project brief just now. Try again, or email zachariah@availablelaw.com directly.",
      );
      console.error("[website-intake] insert failed", insertErr);
      setSubmitting(false);
      return;
    }

    // Fire admin notification. Don't await — the user is done as soon as the
    // row is durably saved, and notify-event is configured fail-open.
    void supabase.functions
      .invoke("notify-event", {
        body: {
          event_type: "website.intake_received",
          member_email: payload.email,
          data: payload,
        },
      })
      .catch((err: unknown) => {
        console.error("[website-intake] notify-event invoke failed", err);
      });

    setSubmitted(true);
    setSubmitting(false);
  };

  if (!isOpen) return null;

  const inputClass =
    "w-full px-4 py-2.5 bg-white border border-[#1F1810]/10 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all";
  const labelClass = "block text-xs font-medium text-[#6B5B4E] mb-1.5";

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-[#1F1810]/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Modal */}
      <div
        className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby="website-intake-title"
      >
        <div
          className="relative w-full max-w-xl my-8 bg-[#FAF8F5] rounded-2xl shadow-2xl pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#6B5B4E] hover:text-[#1F1810] hover:bg-[#1F1810]/5 rounded-lg transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="p-8">
            {submitted ? (
              <div className="text-center py-6">
                <div className="w-14 h-14 bg-[#7A8B6F]/15 rounded-full flex items-center justify-center mx-auto mb-5">
                  <CheckCircle2 className="w-7 h-7 text-[#7A8B6F]" />
                </div>
                <h2
                  id="website-intake-title"
                  className="text-2xl font-bold text-[#1F1810] mb-2"
                  style={{ fontFamily: "var(--font-heading), serif" }}
                >
                  Got it — let&apos;s build something great.
                </h2>
                <p className="text-sm text-[#6B5B4E] max-w-sm mx-auto leading-relaxed">
                  Your project brief is in. Zachariah will reach out personally,
                  usually within one business day, with next steps.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-7 inline-flex items-center justify-center px-6 py-2.5 bg-[#1F1810] text-white rounded-lg text-sm font-medium hover:bg-[#C17832] transition-all"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <p className="text-xs font-semibold text-[#C17832] uppercase tracking-widest mb-2">
                  Start your website
                </p>
                <h2
                  id="website-intake-title"
                  className="text-2xl font-bold text-[#1F1810] mb-2"
                  style={{ fontFamily: "var(--font-heading), serif" }}
                >
                  Tell us about your project
                </h2>
                <p className="text-sm text-[#6B5B4E] mb-6 leading-relaxed">
                  A few quick details and we&apos;ll come back with the right
                  next step — no obligation, no jargon, no pressure.
                </p>

                {error && (
                  <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2 text-sm text-red-700">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Required: name + email */}
                  <div>
                    <label htmlFor="wi-fullname" className={labelClass}>
                      Full name <span className="text-[#C17832]">*</span>
                    </label>
                    <input
                      id="wi-fullname"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoComplete="name"
                      placeholder="Your name"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="wi-email" className={labelClass}>
                      Email <span className="text-[#C17832]">*</span>
                    </label>
                    <input
                      id="wi-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      placeholder="you@yourbusiness.com"
                      className={inputClass}
                    />
                  </div>

                  {/* Optional: phone + company */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="wi-phone" className={labelClass}>
                        Phone
                      </label>
                      <input
                        id="wi-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                        placeholder="(optional)"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="wi-company" className={labelClass}>
                        Business name
                      </label>
                      <input
                        id="wi-company"
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        autoComplete="organization"
                        placeholder="(optional)"
                        className={inputClass}
                      />
                    </div>
                  </div>

                  {/* Optional: current website + industry */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="wi-website" className={labelClass}>
                        Current website
                      </label>
                      <input
                        id="wi-website"
                        type="text"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        autoComplete="url"
                        placeholder="yoursite.com (if any)"
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label htmlFor="wi-industry" className={labelClass}>
                        Industry
                      </label>
                      <select
                        id="wi-industry"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Select one…</option>
                        {INDUSTRY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Project type chips */}
                  <div>
                    <span className="block text-xs font-medium text-[#6B5B4E] mb-2">
                      What do you need?{" "}
                      <span className="text-[#A89279]">(pick any)</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {PROJECT_TYPE_OPTIONS.map((opt) => {
                        const selected = projectTypes.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => toggleProjectType(opt.value)}
                            aria-pressed={selected}
                            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                              selected
                                ? "bg-[#C17832] text-white border-[#C17832]"
                                : "bg-white text-[#6B5B4E] border-[#1F1810]/15 hover:border-[#C17832]/40 hover:text-[#1F1810]"
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Budget + timeline */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="wi-budget" className={labelClass}>
                        Rough budget
                      </label>
                      <select
                        id="wi-budget"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Select one…</option>
                        {BUDGET_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="wi-timeline" className={labelClass}>
                        Timeline
                      </label>
                      <select
                        id="wi-timeline"
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        className={inputClass}
                      >
                        <option value="">Select one…</option>
                        {TIMELINE_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="wi-notes" className={labelClass}>
                      Tell us about your business
                    </label>
                    <textarea
                      id="wi-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="What do you do, who are your customers, and what should the site help you accomplish?"
                      className={`${inputClass} resize-y`}
                    />
                  </div>
                </div>

                {/* Submit */}
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={submitting}
                    className="px-4 py-2.5 text-sm text-[#6B5B4E] hover:text-[#1F1810] font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!canSubmit || submitting}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1F1810] text-white rounded-lg text-sm font-medium hover:bg-[#C17832] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Sending…
                      </>
                    ) : (
                      "Send project brief"
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-[#A89279] text-center mt-5 leading-relaxed">
                  We&apos;ll only use this info to follow up on your website
                  project. No spam, ever.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
