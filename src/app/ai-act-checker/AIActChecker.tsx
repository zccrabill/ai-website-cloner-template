"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  QUESTIONS,
  scoreAssessment,
  type AnswerKey,
  type AssessmentResult,
} from "@/lib/ai-act-assessment";
import { supabase } from "@/lib/supabase";

type Stage = "intro" | "question" | "teaser" | "results";

interface LeadInfo {
  name: string;
  email: string;
  company: string;
  role: string;
}

const EMPTY_LEAD: LeadInfo = { name: "", email: "", company: "", role: "" };

export default function AIActChecker() {
  const [stage, setStage] = useState<Stage>("intro");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [responses, setResponses] = useState<Record<string, AnswerKey>>({});
  const [lead, setLead] = useState<LeadInfo>(EMPTY_LEAD);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const result = useMemo<AssessmentResult | null>(() => {
    if (Object.keys(responses).length !== QUESTIONS.length) return null;
    return scoreAssessment(responses);
  }, [responses]);

  const currentQuestion = QUESTIONS[currentIdx];
  const currentAnswer = responses[currentQuestion?.id];
  const progressPct = Math.round((currentIdx / QUESTIONS.length) * 100);

  const selectAnswer = (questionId: string, answer: AnswerKey) => {
    setResponses((prev) => ({ ...prev, [questionId]: answer }));
  };

  const goNext = () => {
    if (currentIdx < QUESTIONS.length - 1) {
      setCurrentIdx((i) => i + 1);
    } else {
      setStage("teaser");
    }
  };

  const goBack = () => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
    } else {
      setStage("intro");
    }
  };

  const startAssessment = () => {
    setStage("question");
    setCurrentIdx(0);
  };

  const submitLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!result) return;

    const emailOk = /.+@.+\..+/.test(lead.email.trim());
    if (!emailOk || !lead.name.trim()) {
      setSubmitError(
        "Please provide at least your name and a valid email address.",
      );
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const { error } = await supabase.from("ai_act_assessments").insert({
        email: lead.email.trim(),
        name: lead.name.trim(),
        company: lead.company.trim() || null,
        role: lead.role.trim() || null,
        answers: responses,
        score: result.score,
        rag_status: result.rag,
        source: "ai-act-checker",
        user_agent:
          typeof navigator !== "undefined" ? navigator.userAgent : null,
        referrer:
          typeof document !== "undefined" && document.referrer
            ? document.referrer
            : null,
      });

      if (error) {
        // Table may not exist yet in dev — still show results on client so the
        // UX works end-to-end. Log for visibility.
        console.warn("ai_act_assessments insert failed:", error.message);
      }

      setStage("results");
    } catch (err) {
      console.warn("ai_act_assessments submission error:", err);
      setStage("results"); // fail-open: still show the report
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Render -------------------------------------------------------------

  return (
    <div className="w-full">
      {stage === "intro" && <IntroScreen onStart={startAssessment} />}

      {stage === "question" && currentQuestion && (
        <QuestionScreen
          questionIdx={currentIdx}
          total={QUESTIONS.length}
          progressPct={progressPct}
          selected={currentAnswer}
          onSelect={(k) => selectAnswer(currentQuestion.id, k)}
          onNext={goNext}
          onBack={goBack}
          isLast={currentIdx === QUESTIONS.length - 1}
        />
      )}

      {stage === "teaser" && result && (
        <TeaserScreen
          result={result}
          lead={lead}
          setLead={setLead}
          onSubmit={submitLead}
          submitting={submitting}
          error={submitError}
          onBack={() => setStage("question")}
        />
      )}

      {stage === "results" && result && (
        <ResultsScreen result={result} name={lead.name || undefined} />
      )}
    </div>
  );
}

// =========================================================================
// Intro
// =========================================================================

function IntroScreen({ onStart }: { onStart: () => void }) {
  return (
    <section className="max-w-[820px] mx-auto px-6 md:px-8 pt-16 md:pt-24 pb-20 md:pb-28">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C17832]/10 border border-[#C17832]/30 mb-6">
        <Sparkles className="w-3.5 h-3.5 text-[#C17832]" />
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8F5522]">
          Free Tool · No Signup to Start
        </span>
      </div>
      <h1
        className="font-heading text-4xl md:text-5xl leading-[1.1] text-[#1F1810] mb-5"
        style={{ fontWeight: 400 }}
      >
        Is your business ready for the{" "}
        <span className="italic">Colorado AI Act</span>?
      </h1>
      <p className="text-lg md:text-xl text-[#6B5B4E] leading-relaxed mb-8">
        Colorado Senate Bill 24-205 takes effect in 2026 and creates new duties
        for any business that uses AI to make consequential decisions about
        people. This 10-question assessment — built by a Colorado attorney —
        will show you exactly where you stand and what to fix first.
      </p>

      <div className="grid md:grid-cols-3 gap-4 mb-10">
        <InfoCard
          title="10 questions"
          body="Plain-language, business-focused. No legal jargon."
        />
        <InfoCard
          title="~2 minutes"
          body="See a teaser score as soon as you finish."
        />
        <InfoCard
          title="Personalized report"
          body="Gap analysis mapped to the statute, delivered to your inbox."
        />
      </div>

      <button
        type="button"
        onClick={onStart}
        className="inline-flex items-center gap-2 px-8 py-4 bg-[#1F1810] text-white rounded-full text-base font-medium hover:bg-[#C17832] transition-colors shadow-sm"
      >
        Start the assessment
        <ArrowRight className="w-4 h-4" />
      </button>

      <p className="mt-6 text-xs text-[#8B7D70] max-w-[560px] leading-relaxed">
        This tool is educational and does not constitute legal advice or create
        an attorney-client relationship. For an enforceable compliance opinion,
        schedule a FAIIR assessment with Available Law.
      </p>
    </section>
  );
}

function InfoCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-[#1F1810]/10 bg-white p-5">
      <p className="font-heading text-lg text-[#1F1810] mb-1" style={{ fontWeight: 400 }}>
        {title}
      </p>
      <p className="text-sm text-[#6B5B4E] leading-relaxed">{body}</p>
    </div>
  );
}

// =========================================================================
// Question
// =========================================================================

interface QuestionScreenProps {
  questionIdx: number;
  total: number;
  progressPct: number;
  selected: AnswerKey | undefined;
  onSelect: (k: AnswerKey) => void;
  onNext: () => void;
  onBack: () => void;
  isLast: boolean;
}

function QuestionScreen({
  questionIdx,
  total,
  progressPct,
  selected,
  onSelect,
  onNext,
  onBack,
  isLast,
}: QuestionScreenProps) {
  const question = QUESTIONS[questionIdx];
  if (!question) return null;

  return (
    <section className="max-w-[760px] mx-auto px-6 md:px-8 pt-14 md:pt-20 pb-24">
      {/* Progress */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-2 text-xs font-medium uppercase tracking-wider text-[#8B7D70]">
          <span>
            Question {questionIdx + 1} of {total}
          </span>
          <span>{question.category}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-[#1F1810]/10 overflow-hidden">
          <div
            className="h-full bg-[#C17832] transition-all duration-300"
            style={{ width: `${Math.max(progressPct, 5)}%` }}
          />
        </div>
      </div>

      {/* Prompt */}
      <h2
        className="font-heading text-2xl md:text-[32px] leading-tight text-[#1F1810] mb-3"
        style={{ fontWeight: 400 }}
      >
        {question.prompt}
      </h2>
      {question.helpText && (
        <p className="text-[15px] text-[#6B5B4E] leading-relaxed mb-7">
          {question.helpText}
        </p>
      )}

      {/* Answers */}
      <div className="space-y-3 mb-10">
        {question.answers.map((a) => {
          const isSelected = selected === a.key;
          return (
            <button
              key={a.key}
              type="button"
              onClick={() => onSelect(a.key)}
              className={`w-full text-left rounded-2xl border-2 px-5 py-4 transition-all ${
                isSelected
                  ? "border-[#C17832] bg-[#C17832]/5"
                  : "border-[#1F1810]/10 bg-white hover:border-[#1F1810]/25"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? "border-[#C17832] bg-[#C17832]"
                      : "border-[#1F1810]/25"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-[15px] text-[#1F1810] leading-snug">
                  {a.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm text-[#6B5B4E] hover:text-[#1F1810] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selected}
          className="inline-flex items-center gap-2 px-7 py-3 bg-[#1F1810] text-white rounded-full text-sm font-medium transition-colors disabled:bg-[#1F1810]/30 disabled:cursor-not-allowed hover:bg-[#C17832]"
        >
          {isLast ? "See my score" : "Next"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}

// =========================================================================
// Teaser + Email gate
// =========================================================================

interface TeaserScreenProps {
  result: AssessmentResult;
  lead: LeadInfo;
  setLead: (updater: (prev: LeadInfo) => LeadInfo) => void;
  onSubmit: (e: React.FormEvent) => void;
  submitting: boolean;
  error: string | null;
  onBack: () => void;
}

function TeaserScreen({
  result,
  lead,
  setLead,
  onSubmit,
  submitting,
  error,
  onBack,
}: TeaserScreenProps) {
  // Show up to 3 gaps in the preview, but dedupe by category so the user
  // sees distinct problem areas (e.g. Scope + Governance + Disclosure)
  // instead of two Scope gaps stacked together. If there's headroom left
  // after the category pass, fill with additional gaps.
  const gapsPreview = (() => {
    const seen = new Set<string>();
    const picks: typeof result.gaps = [];
    for (const g of result.gaps) {
      if (!seen.has(g.category)) {
        seen.add(g.category);
        picks.push(g);
        if (picks.length === 3) return picks;
      }
    }
    for (const g of result.gaps) {
      if (picks.length === 3) break;
      if (!picks.includes(g)) picks.push(g);
    }
    return picks;
  })();
  const hiddenCount = Math.max(0, result.gaps.length - gapsPreview.length);

  return (
    <section className="max-w-[780px] mx-auto px-6 md:px-8 pt-14 md:pt-20 pb-24">
      <div className="text-center mb-10">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#C17832] mb-3">
          Your teaser score
        </p>
        <div className="inline-block">
          <div
            className={`font-heading text-7xl md:text-8xl leading-none ${ragTextClass(result.rag)}`}
            style={{ fontWeight: 400 }}
          >
            {result.score}
            <span className="text-3xl text-[#8B7D70]"> / {result.maxScore}</span>
          </div>
        </div>
        <p
          className={`mt-4 text-sm font-semibold uppercase tracking-wider ${ragTextClass(result.rag)}`}
        >
          {ragLabel(result.rag)}
        </p>
      </div>

      <div className="rounded-3xl border border-[#1F1810]/10 bg-white p-6 md:p-8 mb-8">
        <p className="text-[15px] text-[#6B5B4E] leading-relaxed mb-5">
          {`We found ${result.gaps.length} specific compliance gap${result.gaps.length === 1 ? "" : "s"} in your responses. Here's a preview of the first ${gapsPreview.length}:`}
        </p>
        <ul className="space-y-3 mb-4">
          {gapsPreview.map((g, i) => (
            <li key={i} className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#C17832]/15 border border-[#C17832]/40 flex items-center justify-center mt-0.5">
                <span className="text-[11px] font-semibold text-[#8F5522]">
                  {i + 1}
                </span>
              </div>
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8F5522] mb-0.5">
                  {g.category}
                </p>
                <p className="text-[14px] text-[#1F1810] leading-snug">
                  {firstSentence(g.gap)}
                </p>
              </div>
            </li>
          ))}
        </ul>
        {hiddenCount > 0 && (
          <p className="text-sm text-[#8B7D70] italic">
            + {hiddenCount} more gap{hiddenCount === 1 ? "" : "s"} in your full
            report ↓
          </p>
        )}
      </div>

      {/* Email gate */}
      <div className="rounded-3xl border-2 border-[#C17832]/30 bg-gradient-to-br from-[#FAF8F5] to-[#F2E7D6]/40 p-6 md:p-8">
        <h3
          className="font-heading text-2xl text-[#1F1810] mb-2"
          style={{ fontWeight: 400 }}
        >
          Get your full AI Act readiness report
        </h3>
        <p className="text-sm text-[#6B5B4E] leading-relaxed mb-6">
          Your personalized report includes every gap we identified, the
          statutory citation for each, a prioritized list of what to fix first,
          and a direct path to a FAIIR assessment if you want help.
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <TextField
              label="Your name*"
              value={lead.name}
              onChange={(v) => setLead((p) => ({ ...p, name: v }))}
              placeholder="Jordan Alvarez"
              required
            />
            <TextField
              label="Work email*"
              type="email"
              value={lead.email}
              onChange={(v) => setLead((p) => ({ ...p, email: v }))}
              placeholder="jordan@company.com"
              required
            />
            <TextField
              label="Company"
              value={lead.company}
              onChange={(v) => setLead((p) => ({ ...p, company: v }))}
              placeholder="Acme Holdings, LLC"
            />
            <TextField
              label="Your role"
              value={lead.role}
              onChange={(v) => setLead((p) => ({ ...p, role: v }))}
              placeholder="General Counsel"
            />
          </div>

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="inline-flex items-center gap-2 text-sm text-[#6B5B4E] hover:text-[#1F1810]"
            >
              <ArrowLeft className="w-4 h-4" />
              Edit answers
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-7 py-3 bg-[#1F1810] text-white rounded-full text-sm font-medium hover:bg-[#C17832] transition-colors disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating report…
                </>
              ) : (
                <>
                  See my full report
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <p className="text-[11px] text-[#8B7D70] pt-2">
            By submitting, you agree to receive your report and occasional
            follow-up emails from Available Law. We never sell your data. You
            can unsubscribe at any time.
          </p>
        </form>
      </div>
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[12px] font-medium uppercase tracking-wider text-[#8B7D70] block mb-1.5">
        {label}
      </span>
      <input
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2.5 rounded-xl border border-[#1F1810]/15 bg-white text-[15px] text-[#1F1810] placeholder:text-[#B0A499] focus:outline-none focus:border-[#C17832] focus:ring-2 focus:ring-[#C17832]/15 transition"
      />
    </label>
  );
}

// =========================================================================
// Results
// =========================================================================

function ResultsScreen({
  result,
  name,
}: {
  result: AssessmentResult;
  name?: string;
}) {
  return (
    <section className="max-w-[820px] mx-auto px-6 md:px-8 pt-14 md:pt-20 pb-24">
      {/* Hero */}
      <div className="text-center mb-10">
        <RagIcon rag={result.rag} />
        <h1
          className="font-heading text-3xl md:text-5xl leading-tight text-[#1F1810] mt-5 mb-3"
          style={{ fontWeight: 400 }}
        >
          {name ? `${name}, your ` : "Your "}Readiness Score: {result.score}
          <span className="text-2xl text-[#8B7D70]"> / {result.maxScore}</span>
        </h1>
        <p
          className={`text-sm font-semibold uppercase tracking-wider ${ragTextClass(result.rag)}`}
        >
          {result.headline}
        </p>
      </div>

      {/* Summary */}
      <div className="rounded-3xl border border-[#1F1810]/10 bg-white p-6 md:p-8 mb-8">
        <p className="text-[15px] md:text-base text-[#3A2F23] leading-relaxed">
          {result.summary}
        </p>
      </div>

      {/* Gaps */}
      {result.gaps.length > 0 && (
        <div className="mb-10">
          <h2
            className="font-heading text-2xl text-[#1F1810] mb-5"
            style={{ fontWeight: 400 }}
          >
            Gaps we identified
          </h2>
          <ul className="space-y-4">
            {result.gaps.map((g, i) => (
              <li
                key={i}
                className="rounded-2xl border border-[#1F1810]/10 bg-white p-5"
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[#8F5522] mb-1.5">
                  {g.category}
                </p>
                <p className="text-[14px] text-[#1F1810] leading-relaxed">
                  {g.gap}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result.gaps.length === 0 && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 mb-10 flex gap-3">
          <Check className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-emerald-900 leading-relaxed">
            No material gaps identified from your responses. Your next step is
            a formal FAIIR certification so you have a defensible, written
            record of compliance.
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="rounded-3xl bg-[#1F1810] text-white p-8 md:p-10 text-center">
        <h3
          className="font-heading text-2xl md:text-3xl mb-3"
          style={{ fontWeight: 400 }}
        >
          Want help closing these gaps?
        </h3>
        <p className="text-[15px] text-[#E5DCD1] leading-relaxed mb-6 max-w-[520px] mx-auto">
          A FAIIR assessment from Available Law turns this report into a
          written, attorney-led compliance program — typically in 4–6 weeks.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/#faiir"
            className="inline-flex items-center gap-2 px-7 py-3 bg-[#C17832] text-white rounded-full text-sm font-medium hover:bg-[#D4893F] transition-colors"
          >
            {result.ctaText}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="mailto:zachariah@availablelaw.com?subject=FAIIR%20Assessment%20Inquiry"
            className="inline-flex items-center gap-2 px-7 py-3 border border-white/30 text-white rounded-full text-sm font-medium hover:bg-white/10 transition-colors"
          >
            Email Zachariah directly
          </a>
        </div>
      </div>
    </section>
  );
}

// =========================================================================
// Helpers
// =========================================================================

function ragLabel(rag: AssessmentResult["rag"]): string {
  switch (rag) {
    case "green":
      return "Low Risk · Maintain";
    case "amber":
      return "Moderate Risk · Close Gaps";
    case "red":
      return "High Risk · Act Now";
  }
}

function ragTextClass(rag: AssessmentResult["rag"]): string {
  switch (rag) {
    case "green":
      return "text-emerald-700";
    case "amber":
      return "text-[#C17832]";
    case "red":
      return "text-red-700";
  }
}

function RagIcon({ rag }: { rag: AssessmentResult["rag"] }) {
  const base =
    "inline-flex items-center justify-center w-16 h-16 rounded-full border-2";
  if (rag === "green") {
    return (
      <div className={`${base} border-emerald-300 bg-emerald-50`}>
        <ShieldCheck className="w-8 h-8 text-emerald-700" />
      </div>
    );
  }
  if (rag === "amber") {
    return (
      <div className={`${base} border-[#C17832]/40 bg-[#C17832]/10`}>
        <AlertTriangle className="w-8 h-8 text-[#C17832]" />
      </div>
    );
  }
  return (
    <div className={`${base} border-red-300 bg-red-50`}>
      <AlertOctagon className="w-8 h-8 text-red-700" />
    </div>
  );
}

function firstSentence(text: string): string {
  const match = text.match(/^[^.!?]+[.!?]/);
  return match ? match[0] : text;
}
