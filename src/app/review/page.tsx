"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Star,
  ArrowLeft,
  ArrowRight,
  PenLine,
  Sparkles,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

/* -------------------------------------------------------------------------- */
/* Options — keep in sync with supabase/functions/client-review/index.ts      */
/* -------------------------------------------------------------------------- */

const CHIP_OPTIONS = [
  "Fast responses",
  "Explained things clearly",
  "Fair pricing",
  "No surprise bills",
  "Made it easy",
  "Knew their stuff",
  "Would recommend",
];

const PRACTICE_AREAS = [
  "Estate Planning",
  "Business Succession",
  "Real Estate",
  "Business/LLC",
  "Other",
];

type ConsentLevel = "full" | "first_initial" | "anonymous" | "private";

const CONSENT_OPTIONS: { value: ConsentLevel; label: string; detail: string }[] = [
  {
    value: "full",
    label: "Publish with my full name and business",
    detail: "Shown like: Jamie Rivera, Rivera Roofing LLC",
  },
  {
    value: "first_initial",
    label: "Publish with my first name and last initial",
    detail: "Shown like: Jamie R.",
  },
  {
    value: "anonymous",
    label: "Publish anonymously",
    detail: 'Shown as: "Verified client"',
  },
  {
    value: "private",
    label: "Don't publish — feedback for Zach only",
    detail: "Never shown on the website",
  },
];

// Mirrors the server's display-name logic so the confirm screen shows the
// client exactly what will be published. The server recomputes and stores its
// own copy; this one is presentation only.
function displayNameFor(
  level: ConsentLevel,
  firstName: string,
  lastName: string,
  businessName: string,
): string {
  switch (level) {
    case "full":
      return businessName
        ? `${firstName} ${lastName}, ${businessName}`
        : `${firstName} ${lastName}`;
    case "first_initial":
      return `${firstName} ${lastName.charAt(0).toUpperCase()}.`;
    case "anonymous":
      return "Verified client";
    case "private":
      return "Private feedback";
  }
}

// Mirrors the server's attestation text — what the client checks the box
// against is exactly what gets stored as the consent record.
function consentTextFor(level: ConsentLevel, displayName: string): string {
  const base =
    "This review reflects my honest experience as a client of Available Law.";
  switch (level) {
    case "full":
      return `${base} I authorize Available Law to publish it with my full name and business, shown as "${displayName}".`;
    case "first_initial":
      return `${base} I authorize Available Law to publish it with my first name and last initial, shown as "${displayName}".`;
    case "anonymous":
      return `${base} I authorize Available Law to publish it anonymously, shown as "${displayName}".`;
    case "private":
      return `${base} I do not authorize publication — this feedback is for Zachariah only.`;
  }
}

const RATING_LABELS: Record<number, string> = {
  1: "Not good",
  2: "Could've been better",
  3: "It was okay",
  4: "Really good",
  5: "Excellent",
};

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

type Step = 1 | 2 | 3 | 4 | 5 | 6;

export default function ReviewPage() {
  const [step, setStep] = useState<Step>(1);

  // Step 1–2
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [chips, setChips] = useState<string[]>([]);
  const [practiceArea, setPracticeArea] = useState<string | null>(null);

  // Step 3. showPaths controls the "Write my own / Draft it for me" chooser;
  // once a path is picked the textarea takes over (and stays if they go back).
  const [showPaths, setShowPaths] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [aiDraft, setAiDraft] = useState<string | null>(null);
  const [drafting, setDrafting] = useState(false);
  const [draftError, setDraftError] = useState<string | null>(null);

  // Step 4
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [consentLevel, setConsentLevel] = useState<ConsentLevel | null>(null);

  // Step 5
  const [attested, setAttested] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleChip = (chip: string) =>
    setChips((prev) =>
      prev.includes(chip) ? prev.filter((c) => c !== chip) : [...prev, chip],
    );

  const requestDraft = async () => {
    setShowPaths(false);
    setDrafting(true);
    setDraftError(null);
    try {
      const { data, error } = await supabase.functions.invoke("client-review", {
        body: {
          action: "draft",
          rating,
          chips,
          practice_area: practiceArea,
        },
      });
      if (error || !data?.draft) {
        throw new Error(data?.error ?? "Draft generation failed");
      }
      setAiDraft(data.draft);
      setReviewText(data.draft);
    } catch (e) {
      console.error(e);
      setDraftError(
        "We couldn't generate a draft just now — no problem. Your own words work great; just write a sentence or two below.",
      );
    } finally {
      setDrafting(false);
    }
  };

  const submit = async () => {
    if (!consentLevel) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const { data, error } = await supabase.functions.invoke("client-review", {
        body: {
          action: "submit",
          rating,
          chips,
          practice_area: practiceArea,
          review_text: reviewText.trim(),
          ai_drafting_used: aiDraft !== null,
          ai_draft_text: aiDraft,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          business_name: businessName.trim() || null,
          consent_level: consentLevel,
          attested: true,
        },
      });
      if (error || !data?.ok) {
        throw new Error(data?.error ?? "Submission failed");
      }
      setStep(6);
    } catch (e) {
      console.error(e);
      setSubmitError(
        "Something went wrong sending your review. Please try again — nothing was lost.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const displayName =
    consentLevel !== null
      ? displayNameFor(consentLevel, firstName.trim(), lastName.trim(), businessName.trim())
      : "";
  const attestation =
    consentLevel !== null ? consentTextFor(consentLevel, displayName) : "";

  const stepValid: Record<number, boolean> = {
    1: rating >= 1,
    2: true, // chips + practice area are optional
    3: reviewText.trim().length >= 5,
    4: firstName.trim().length > 0 && lastName.trim().length > 0 && consentLevel !== null,
    5: attested,
  };

  return (
    <main className="min-h-screen bg-[#FAF8F5] flex flex-col">
      {/* Minimal header — this page opens from a text message; no site chrome */}
      <header className="px-6 pt-8 pb-2 flex justify-center">
        <p className="text-xs font-semibold text-[#C17832] uppercase tracking-[0.2em]">
          Available Law
        </p>
      </header>

      <div className="flex-1 w-full max-w-[560px] mx-auto px-5 pb-16">
        {/* Progress dots (hidden on thank-you screen) */}
        {step <= 5 && (
          <div className="flex justify-center gap-1.5 py-5" aria-hidden="true">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  s === step
                    ? "w-6 bg-[#C17832]"
                    : s < step
                      ? "w-1.5 bg-[#C17832]/50"
                      : "w-1.5 bg-[#1F1810]/15"
                }`}
              />
            ))}
          </div>
        )}

        {/* ------------------------------------------------ Step 1 — Stars */}
        {step === 1 && (
          <section aria-label="Rate your experience">
            <h1 className="text-3xl font-heading text-[#1F1810] text-center mt-4 mb-2">
              How was your experience?
            </h1>
            <p className="text-[#6B5B4E] text-center mb-10">
              Thanks for working with us — this takes about a minute.
            </p>
            <div
              className="flex justify-center gap-2 mb-3"
              role="radiogroup"
              aria-label="Star rating"
            >
              {[1, 2, 3, 4, 5].map((s) => {
                const filled = s <= (hoverRating || rating);
                return (
                  <button
                    key={s}
                    type="button"
                    role="radio"
                    aria-checked={rating === s}
                    aria-label={`${s} star${s > 1 ? "s" : ""}`}
                    onClick={() => setRating(s)}
                    onMouseEnter={() => setHoverRating(s)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1.5 rounded-lg transition-transform active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C17832]"
                  >
                    <Star
                      className={`w-11 h-11 transition-colors ${
                        filled
                          ? "fill-[#C17832] text-[#C17832]"
                          : "text-[#1F1810]/20"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p
              className="text-center text-sm font-semibold text-[#1F1810] h-5 mb-10"
              aria-live="polite"
            >
              {rating > 0 ? RATING_LABELS[rating] : " "}
            </p>
          </section>
        )}

        {/* ------------------------------------------------ Step 2 — Chips */}
        {step === 2 && (
          <section aria-label="What stood out">
            <h1 className="text-3xl font-heading text-[#1F1810] text-center mt-4 mb-2">
              What stood out?
            </h1>
            <p className="text-[#6B5B4E] text-center mb-8">
              Tap any that fit — or skip ahead.
            </p>
            <div className="flex flex-wrap justify-center gap-2.5 mb-10">
              {CHIP_OPTIONS.map((chip) => {
                const selected = chips.includes(chip);
                return (
                  <button
                    key={chip}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => toggleChip(chip)}
                    className={`px-4 py-2.5 rounded-full text-sm font-medium border transition-all active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C17832] ${
                      selected
                        ? "bg-[#C17832] border-[#C17832] text-white shadow-sm"
                        : "bg-white border-[#1F1810]/15 text-[#1F1810] hover:border-[#C17832]/60"
                    }`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
            <fieldset className="mb-10">
              <legend className="text-sm font-semibold text-[#1F1810] mb-3 text-center w-full">
                What did we help you with?{" "}
                <span className="font-normal text-[#A89279]">(optional)</span>
              </legend>
              <div className="flex flex-wrap justify-center gap-2">
                {PRACTICE_AREAS.map((area) => {
                  const selected = practiceArea === area;
                  return (
                    <button
                      key={area}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => setPracticeArea(selected ? null : area)}
                      className={`px-3.5 py-2 rounded-lg text-sm border transition-all active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C17832] ${
                        selected
                          ? "bg-[#1F1810] border-[#1F1810] text-white"
                          : "bg-white border-[#1F1810]/15 text-[#6B5B4E] hover:border-[#1F1810]/40"
                      }`}
                    >
                      {area}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </section>
        )}

        {/* ------------------------------------------- Step 3 — Your words */}
        {step === 3 && (
          <section aria-label="Write your review">
            <h1 className="text-3xl font-heading text-[#1F1810] text-center mt-4 mb-2">
              In your own words
            </h1>
            <p className="text-[#6B5B4E] text-center mb-8">
              Write it yourself, or let us draft a starting point from your
              answers — you can change every word.
            </p>

            {showPaths && !drafting && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowPaths(false);
                    setDraftError(null);
                  }}
                  className="flex flex-col items-center gap-2 bg-white border border-[#1F1810]/15 rounded-2xl p-5 hover:border-[#C17832]/60 transition-all active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C17832]"
                >
                  <PenLine className="w-6 h-6 text-[#C17832]" />
                  <span className="font-semibold text-[#1F1810]">Write my own</span>
                  <span className="text-xs text-[#A89279]">
                    A sentence or two is plenty
                  </span>
                </button>
                <button
                  type="button"
                  onClick={requestDraft}
                  className="flex flex-col items-center gap-2 bg-white border border-[#1F1810]/15 rounded-2xl p-5 hover:border-[#C17832]/60 transition-all active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C17832]"
                >
                  <Sparkles className="w-6 h-6 text-[#C17832]" />
                  <span className="font-semibold text-[#1F1810]">Draft it for me</span>
                  <span className="text-xs text-[#A89279]">
                    A starting point in your voice
                  </span>
                </button>
              </div>
            )}

            {drafting && (
              <div className="flex items-center justify-center gap-2 text-[#6B5B4E] text-sm py-6">
                <Loader2 className="w-4 h-4 animate-spin" />
                Drafting from your answers…
              </div>
            )}

            {draftError && (
              <div className="flex items-start gap-2 bg-white border border-[#C17832]/30 rounded-xl p-4 mb-4 text-sm text-[#6B5B4E]">
                <AlertCircle className="w-4 h-4 text-[#C17832] mt-0.5 shrink-0" />
                <p>{draftError}</p>
              </div>
            )}

            {!drafting && !showPaths && (
              <>
                {aiDraft !== null && (
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-[#A89279]">
                      Here&apos;s a starting point — the final words are yours.
                      Edit anything.
                    </p>
                    <button
                      type="button"
                      onClick={requestDraft}
                      className="flex items-center gap-1 text-xs font-semibold text-[#C17832] hover:underline shrink-0 ml-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C17832] rounded"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Try another
                    </button>
                  </div>
                )}
                <label htmlFor="review-text" className="sr-only">
                  Your review
                </label>
                <textarea
                  id="review-text"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={6}
                  maxLength={2000}
                  placeholder="What was working with Available Law like?"
                  autoFocus
                  className="w-full bg-white border border-[#1F1810]/15 rounded-2xl p-4 text-[#1F1810] text-base leading-relaxed placeholder:text-[#A89279] focus:border-[#C17832] focus:outline-none focus:ring-2 focus:ring-[#C17832]/20 mb-10"
                />
              </>
            )}
          </section>
        )}

        {/* --------------------------------------- Step 4 — Name & consent */}
        {step === 4 && (
          <section aria-label="Your name and publishing preference">
            <h1 className="text-3xl font-heading text-[#1F1810] text-center mt-4 mb-2">
              Almost done
            </h1>
            <p className="text-[#6B5B4E] text-center mb-8">
              Your name stays private unless you choose to publish it.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label
                  htmlFor="first-name"
                  className="block text-xs font-semibold text-[#6B5B4E] uppercase tracking-wider mb-1.5"
                >
                  First name
                </label>
                <input
                  id="first-name"
                  type="text"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  maxLength={100}
                  className="w-full bg-white border border-[#1F1810]/15 rounded-xl px-4 py-3 text-[#1F1810] focus:border-[#C17832] focus:outline-none focus:ring-2 focus:ring-[#C17832]/20"
                />
              </div>
              <div>
                <label
                  htmlFor="last-name"
                  className="block text-xs font-semibold text-[#6B5B4E] uppercase tracking-wider mb-1.5"
                >
                  Last name
                </label>
                <input
                  id="last-name"
                  type="text"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  maxLength={100}
                  className="w-full bg-white border border-[#1F1810]/15 rounded-xl px-4 py-3 text-[#1F1810] focus:border-[#C17832] focus:outline-none focus:ring-2 focus:ring-[#C17832]/20"
                />
              </div>
            </div>
            <div className="mb-8">
              <label
                htmlFor="business-name"
                className="block text-xs font-semibold text-[#6B5B4E] uppercase tracking-wider mb-1.5"
              >
                Business name{" "}
                <span className="normal-case font-normal text-[#A89279]">(optional)</span>
              </label>
              <input
                id="business-name"
                type="text"
                autoComplete="organization"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                maxLength={200}
                className="w-full bg-white border border-[#1F1810]/15 rounded-xl px-4 py-3 text-[#1F1810] focus:border-[#C17832] focus:outline-none focus:ring-2 focus:ring-[#C17832]/20"
              />
            </div>

            <fieldset className="mb-10">
              <legend className="text-sm font-semibold text-[#1F1810] mb-3">
                How should we share your review?
              </legend>
              <div className="space-y-2.5" role="radiogroup">
                {CONSENT_OPTIONS.map((opt) => {
                  const selected = consentLevel === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setConsentLevel(opt.value)}
                      className={`w-full text-left bg-white border rounded-xl p-4 transition-all active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C17832] ${
                        selected
                          ? "border-[#C17832] ring-2 ring-[#C17832]/20"
                          : "border-[#1F1810]/15 hover:border-[#1F1810]/35"
                      }`}
                    >
                      <span className="flex items-start gap-3">
                        <span
                          aria-hidden="true"
                          className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                            selected ? "border-[#C17832]" : "border-[#1F1810]/25"
                          }`}
                        >
                          {selected && (
                            <span className="w-2 h-2 rounded-full bg-[#C17832]" />
                          )}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-[#1F1810]">
                            {opt.label}
                          </span>
                          <span className="block text-xs text-[#A89279] mt-0.5">
                            {opt.detail}
                          </span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </section>
        )}

        {/* -------------------------------------- Step 5 — Confirm & submit */}
        {step === 5 && consentLevel !== null && (
          <section aria-label="Confirm and submit">
            <h1 className="text-3xl font-heading text-[#1F1810] text-center mt-4 mb-2">
              {consentLevel === "private"
                ? "Confirm your feedback"
                : "Here's how it will appear"}
            </h1>
            <p className="text-[#6B5B4E] text-center mb-8">
              {consentLevel === "private"
                ? "This goes straight to Zach — it won't be published."
                : "Exactly as it will show on availablelaw.com, once Zach approves it."}
            </p>

            {/* Preview card — same visual language as the site's testimonials */}
            <div className="bg-white rounded-2xl border border-[#1F1810]/8 shadow-sm p-6 mb-6">
              <div className="flex gap-1 mb-4">
                {Array.from({ length: rating }, (_, i) => (
                  <Star key={i} className="w-4 h-4 fill-[#C17832] text-[#C17832]" />
                ))}
              </div>
              <blockquote className="text-lg font-heading text-[#1F1810] leading-snug mb-4">
                {reviewText.trim()}
              </blockquote>
              <p className="text-sm font-semibold text-[#1F1810]">{displayName}</p>
              {practiceArea && (
                <p className="text-xs text-[#A89279] uppercase tracking-wider mt-1">
                  {practiceArea}
                </p>
              )}
            </div>

            <label className="flex items-start gap-3 bg-white border border-[#1F1810]/15 rounded-xl p-4 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={attested}
                onChange={(e) => setAttested(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-[#C17832] shrink-0"
              />
              <span className="text-sm text-[#6B5B4E] leading-relaxed">{attestation}</span>
            </label>

            {submitError && (
              <div className="flex items-start gap-2 bg-white border border-red-300 rounded-xl p-4 mb-4 text-sm text-[#6B5B4E]">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                <p>{submitError}</p>
              </div>
            )}
          </section>
        )}

        {/* ------------------------------------------- Step 6 — Thank you */}
        {step === 6 && (
          <section aria-label="Thank you" className="text-center pt-10">
            <CheckCircle2 className="w-12 h-12 text-[#C17832] mx-auto mb-5" />
            <h1 className="text-3xl font-heading text-[#1F1810] mb-3">
              Thank you{firstName.trim() ? `, ${firstName.trim()}` : ""}.
            </h1>
            <p className="text-[#6B5B4E] leading-relaxed max-w-[400px] mx-auto mb-2">
              {consentLevel === "private"
                ? "Your feedback went straight to Zach — he reads every word."
                : "Zach reviews every submission personally before it goes on the site. It genuinely helps other Colorado businesses find us."}
            </p>
            <p className="text-[#6B5B4E] leading-relaxed max-w-[400px] mx-auto mb-10">
              It means a lot that you took the time.
            </p>
            <Link
              href="/"
              className="text-sm text-[#A89279] hover:text-[#C17832] transition-colors underline underline-offset-4"
            >
              availablelaw.com
            </Link>
          </section>
        )}

        {/* ------------------------------------------------- Nav buttons */}
        {step <= 5 && (
          <div className="flex items-center justify-between gap-3 mt-2">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as Step)}
                className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-semibold text-[#6B5B4E] hover:text-[#1F1810] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C17832]"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <span />
            )}

            {step < 5 && (
              <button
                type="button"
                disabled={!stepValid[step]}
                onClick={() => setStep((s) => (s + 1) as Step)}
                className="flex items-center gap-1.5 px-6 py-3 rounded-xl text-sm font-semibold bg-[#1F1810] text-white transition-all enabled:hover:bg-[#C17832] enabled:active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#C17832]"
              >
                {step === 2 && chips.length === 0 && !practiceArea ? "Skip" : "Next"}
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 5 && (
              <button
                type="button"
                disabled={!attested || submitting}
                onClick={submit}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[#C17832] text-white transition-all enabled:hover:bg-[#1F1810] enabled:active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1F1810]"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending…
                  </>
                ) : consentLevel === "private" ? (
                  "Send to Zach"
                ) : (
                  "Submit my review"
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
