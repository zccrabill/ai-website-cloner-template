"use client";

/**
 * FaiirIntakeForm — modal form for FAIIR landing visitors who want to
 * connect before booking a discovery call.
 *
 * Inserts into public.faiir_intakes (schema: 20260514_faiir_intakes.sql)
 * and fires a faiir.intake_received notification to the firm via the
 * notify-event Edge Function. Both calls are fail-open from the user's
 * perspective: insert errors surface in the UI, but the notification is
 * fire-and-forget so a Resend hiccup doesn't degrade the submission UX.
 *
 * Visual language matches the lighter Available Law palette (cream + brown
 * + #C17832 orange) rather than the darker FAIIR brand modal — the form
 * is task-oriented and benefits from higher legibility.
 */

import { useEffect, useState } from "react";
import { X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface FaiirIntakeFormProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Service categories. Keep the list short — long checkboxes inflate form
 * abandonment. Free-text intent goes in the notes field.
 */
const SERVICE_OPTIONS: { value: string; label: string }[] = [
  { value: "faiir_certification", label: "FAIIR Certification" },
  { value: "ai_act_compliance", label: "Colorado AI Act compliance" },
  { value: "fractional_ai_gc", label: "Fractional AI General Counsel" },
  { value: "vendor_contract_review", label: "AI vendor contract review" },
  { value: "other", label: "Something else" },
];

export default function FaiirIntakeForm({ isOpen, onClose }: FaiirIntakeFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [title, setTitle] = useState("");
  const [industry, setIndustry] = useState("");
  const [services, setServices] = useState<string[]>([]);
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

  // Reset form state when the modal is closed so the next open is clean.
  // We delay until the transition has likely finished so the user doesn't
  // see fields blanking out mid-close.
  useEffect(() => {
    if (isOpen) return;
    const t = setTimeout(() => {
      setFullName("");
      setEmail("");
      setPhone("");
      setCompany("");
      setTitle("");
      setIndustry("");
      setServices([]);
      setNotes("");
      setError(null);
      setSubmitted(false);
    }, 300);
    return () => clearTimeout(t);
  }, [isOpen]);

  const toggleService = (value: string) => {
    setServices((prev) =>
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
      title: title.trim() || null,
      industry: industry.trim() || null,
      services,
      notes: notes.trim() || null,
    };

    // Do NOT chain .select() here. faiir_intakes SELECT is admin-only, so a
    // read-back would trip the SELECT RLS policy and make the whole insert
    // fail for anonymous visitors (Postgres 42501 → HTTP 401). A bare insert
    // uses Prefer: return=minimal and needs only the anon-allowed INSERT
    // policy. (We don't need the new row's id — notify-event doesn't use it.)
    const { error: insertErr } = await supabase
      .from("faiir_intakes")
      .insert(payload);

    if (insertErr) {
      setError(
        "We couldn't save your intake just now. Try again, or email zachariah@availablelaw.com directly.",
      );
      console.error("[faiir-intake] insert failed", insertErr);
      setSubmitting(false);
      return;
    }

    // Fire admin notification. Don't await — the user is done as soon as
    // the row is durably saved, and notify-event is configured fail-open
    // so a Resend outage won't reach the UI.
    void supabase.functions
      .invoke("notify-event", {
        body: {
          event_type: "faiir.intake_received",
          member_email: payload.email,
          data: payload,
        },
      })
      .catch((err: unknown) => {
        console.error("[faiir-intake] notify-event invoke failed", err);
      });

    setSubmitted(true);
    setSubmitting(false);
  };

  if (!isOpen) return null;

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
        aria-labelledby="faiir-intake-title"
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
                  id="faiir-intake-title"
                  className="text-2xl font-bold text-[#1F1810] mb-2"
                  style={{ fontFamily: "var(--font-heading), serif" }}
                >
                  Got it — talk soon.
                </h2>
                <p className="text-sm text-[#6B5B4E] max-w-sm mx-auto leading-relaxed">
                  Your intake is in. Zachariah will reach out personally,
                  usually within one business day.
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
                  Tell us what you need
                </p>
                <h2
                  id="faiir-intake-title"
                  className="text-2xl font-bold text-[#1F1810] mb-2"
                  style={{ fontFamily: "var(--font-heading), serif" }}
                >
                  Request a callback
                </h2>
                <p className="text-sm text-[#6B5B4E] mb-6 leading-relaxed">
                  Tell us a little about your situation and we&apos;ll reach
                  out with the right next step — no obligation, no sales pitch.
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
                    <label
                      htmlFor="faiir-fullname"
                      className="block text-xs font-medium text-[#6B5B4E] mb-1.5"
                    >
                      Full name <span className="text-[#C17832]">*</span>
                    </label>
                    <input
                      id="faiir-fullname"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      autoComplete="name"
                      placeholder="Your name"
                      className="w-full px-4 py-2.5 bg-white border border-[#1F1810]/10 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="faiir-email"
                      className="block text-xs font-medium text-[#6B5B4E] mb-1.5"
                    >
                      Email <span className="text-[#C17832]">*</span>
                    </label>
                    <input
                      id="faiir-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      autoComplete="email"
                      placeholder="you@yourcompany.com"
                      className="w-full px-4 py-2.5 bg-white border border-[#1F1810]/10 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
                    />
                  </div>

                  {/* Optional: phone + company side by side */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="faiir-phone"
                        className="block text-xs font-medium text-[#6B5B4E] mb-1.5"
                      >
                        Phone
                      </label>
                      <input
                        id="faiir-phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        autoComplete="tel"
                        placeholder="(optional)"
                        className="w-full px-4 py-2.5 bg-white border border-[#1F1810]/10 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="faiir-company"
                        className="block text-xs font-medium text-[#6B5B4E] mb-1.5"
                      >
                        Company
                      </label>
                      <input
                        id="faiir-company"
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        autoComplete="organization"
                        placeholder="(optional)"
                        className="w-full px-4 py-2.5 bg-white border border-[#1F1810]/10 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Optional: title + industry */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="faiir-title"
                        className="block text-xs font-medium text-[#6B5B4E] mb-1.5"
                      >
                        Title
                      </label>
                      <input
                        id="faiir-title"
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        autoComplete="organization-title"
                        placeholder="e.g. Founder, GC"
                        className="w-full px-4 py-2.5 bg-white border border-[#1F1810]/10 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="faiir-industry"
                        className="block text-xs font-medium text-[#6B5B4E] mb-1.5"
                      >
                        Industry
                      </label>
                      <input
                        id="faiir-industry"
                        type="text"
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        placeholder="e.g. SaaS, healthcare"
                        className="w-full px-4 py-2.5 bg-white border border-[#1F1810]/10 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Services interest chips */}
                  <div>
                    <span className="block text-xs font-medium text-[#6B5B4E] mb-2">
                      What are you looking into?{" "}
                      <span className="text-[#A89279]">(pick any)</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {SERVICE_OPTIONS.map((opt) => {
                        const selected = services.includes(opt.value);
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => toggleService(opt.value)}
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

                  {/* Notes */}
                  <div>
                    <label
                      htmlFor="faiir-notes"
                      className="block text-xs font-medium text-[#6B5B4E] mb-1.5"
                    >
                      Anything to add?
                    </label>
                    <textarea
                      id="faiir-notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={3}
                      placeholder="What's prompting the outreach? Any deadline pressure?"
                      className="w-full px-4 py-2.5 bg-white border border-[#1F1810]/10 rounded-lg text-sm text-[#1F1810] placeholder-[#A89279] focus:outline-none focus:border-[#C17832]/50 focus:ring-1 focus:ring-[#C17832]/20 transition-all resize-y"
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
                      "Send intake"
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-[#A89279] text-center mt-5 leading-relaxed">
                  Submitting doesn&apos;t create an attorney-client relationship.
                  We&apos;ll only use this info to follow up on your inquiry.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
