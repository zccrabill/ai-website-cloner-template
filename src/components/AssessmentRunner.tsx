"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  scoreAssessment,
  type AnswerValue,
  type AssessmentDefinition,
  type AssessmentResult,
  type TierKey,
} from "@/lib/assessment/types";
import { supabase } from "@/lib/supabase";

type Stage = "intro" | "asking" | "soft_gate" | "detailed";

interface Props {
  definition: AssessmentDefinition;
  /** "inline" = homepage section, "page" = full-page standalone. */
  context?: "inline" | "page";
}

const TIER_CLASSES: Record<
  TierKey,
  { pill: string; dot: string; bar: string; label: string }
> = {
  green: {
    pill: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    dot: "bg-emerald-400",
    bar: "bg-emerald-400",
    label: "Green",
  },
  yellow: {
    pill: "bg-amber-500/10 border-amber-500/30 text-amber-300",
    dot: "bg-amber-400",
    bar: "bg-amber-400",
    label: "Yellow",
  },
  red: {
    pill: "bg-rose-500/10 border-rose-500/30 text-rose-300",
    dot: "bg-rose-400",
    bar: "bg-rose-400",
    label: "Red",
  },
};

export default function AssessmentRunner({
  definition,
  context = "inline",
}: Props) {
  const [stage, setStage] = useState<Stage>("intro");
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [qIndex, setQIndex] = useState(0);
  const [email, setEmail] = useState("");
  const [wantsTips, setWantsTips] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const questions = definition.questions;
  const total = questions.length;
  const currentQ = questions[qIndex];
  const progress = stage === "asking" ? qIndex / total : 1;

  const result: AssessmentResult | null = useMemo(() => {
    if (Object.keys(answers).length < questions.length) return null;
    return scoreAssessment(definition, answers);
  }, [answers, definition, questions.length]);

  const start = () => {
    setStage("asking");
    setQIndex(0);
  };

  const handleAnswer = (value: AnswerValue) => {
    if (!currentQ) return;
    const next = { ...answers, [currentQ.id]: value };
    setAnswers(next);
    if (qIndex + 1 >= total) {
      setStage("soft_gate");
    } else {
      setQIndex(qIndex + 1);
    }
  };

  const goBack = () => {
    if (qIndex === 0) {
      setStage("intro");
      return;
    }
    setQIndex(qIndex - 1);
  };

  const restart = () => {
    setStage("intro");
    setAnswers({});
    setQIndex(0);
    setEmail("");
    setWantsTips(true);
    setSubmitError(null);
  };

  const postResult = async (options: { skippedEmail: boolean }) => {
    if (!result) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Best-effort provenance capture from the browser.
      const referer =
        typeof document !== "undefined" ? document.referrer || null : null;
      const userAgent =
        typeof navigator !== "undefined" ? navigator.userAgent || null : null;

      const row = {
        assessment_id: definition.id,
        email: options.skippedEmail ? null : email.trim() || null,
        wants_tips: options.skippedEmail ? false : wantsTips,
        answers,
        overall_score: result.overallScore,
        overall_max: result.overallMaxScore,
        overall_tier: result.overallTier,
        area_scores: result.areas.map((a) => ({
          id: a.area.id,
          score: a.score,
          max: a.maxScore,
          tier: a.tier,
        })),
        referer,
        user_agent: userAgent,
      };

      const { error } = await supabase
        .from("assessment_responses")
        .insert(row);

      if (error) {
        // Fail open — log for diagnostics but still show the user their results.
        console.error("[assessment] Supabase insert failed", error);
        setSubmitError(
          "Could not save your results, but you can still view them below.",
        );
      }

      setStage("detailed");
    } catch (err) {
      console.error("[assessment] unexpected insert error", err);
      setSubmitError(
        err instanceof Error
          ? err.message
          : "Could not save your results. You can still view them below.",
      );
      // Fail open — we show results anyway so the user isn't blocked on our capture.
      setStage("detailed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    void postResult({ skippedEmail: false });
  };

  /* ---------------------------- RENDER ---------------------------- */

  const wrapPad =
    context === "page" ? "px-6 py-20 md:py-28" : "px-6 py-20 md:py-28";

  return (
    <section
      aria-label={definition.name}
      className={`w-full bg-[#0f0f14] ${wrapPad}`}
    >
      <div className="max-w-[880px] mx-auto">
        {stage === "intro" && <Intro def={definition} onStart={start} />}

        {stage === "asking" && currentQ && (
          <AskingView
            def={definition}
            question={currentQ}
            index={qIndex}
            total={total}
            progress={progress}
            selected={answers[currentQ.id]}
            onAnswer={handleAnswer}
            onBack={goBack}
          />
        )}

        {stage === "soft_gate" && result && (
          <SoftGateView
            def={definition}
            result={result}
            email={email}
            onEmailChange={setEmail}
            wantsTips={wantsTips}
            onWantsTipsChange={setWantsTips}
            submitting={submitting}
            submitError={submitError}
            onSubmit={handleEmailSubmit}
          />
        )}

        {stage === "detailed" && result && (
          <DetailedView
            def={definition}
            result={result}
            onRestart={restart}
          />
        )}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Subviews                                                           */
/* ------------------------------------------------------------------ */

function Intro({
  def,
  onStart,
}: {
  def: AssessmentDefinition;
  onStart: () => void;
}) {
  return (
    <div>
      <div className="section-divider" />
      <p className="text-[13px] font-medium text-[#f59e0b] tracking-widest uppercase mb-6">
        {def.pitch.eyebrow}
      </p>

      <h2
        className="font-heading mb-6 text-[#f0f0f5]"
        style={{
          fontSize: "clamp(36px, 5vw, 64px)",
          fontWeight: 400,
          lineHeight: 1.08,
          letterSpacing: "-0.02em",
        }}
      >
        {def.pitch.heading}
      </h2>

      <p className="text-[#d4d4d8] text-[17px] leading-[1.7] max-w-[620px] mb-10">
        {def.pitch.body}
      </p>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <button
          type="button"
          onClick={onStart}
          className="btn-al btn-al-primary btn-tracer px-6 py-3 text-[15px]"
        >
          {def.pitch.startCta}
        </button>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {def.pitch.meta.map((m) => (
            <span
              key={m}
              className="flex items-center gap-2 text-[13px] text-[#a1a1aa]"
            >
              <span className="text-[#f59e0b]">✦</span>
              {m}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function AskingView({
  def,
  question,
  index,
  total,
  progress,
  selected,
  onAnswer,
  onBack,
}: {
  def: AssessmentDefinition;
  question: AssessmentDefinition["questions"][number];
  index: number;
  total: number;
  progress: number;
  selected?: AnswerValue;
  onAnswer: (v: AnswerValue) => void;
  onBack: () => void;
}) {
  const area = def.areas.find((a) => a.id === question.areaId);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 text-[13px] text-[#a1a1aa]">
          <span className="uppercase tracking-widest text-[#f59e0b]">
            {area?.label ?? def.name}
          </span>
          <span className="text-[#3f3f46]">·</span>
          <span className="tabular-nums">
            {index + 1} / {total}
          </span>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="text-[13px] text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
        >
          ← Back
        </button>
      </div>

      {/* Progress bar */}
      <div
        className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden mb-10"
        role="progressbar"
        aria-valuenow={Math.round(progress * 100)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-[#f59e0b] transition-all duration-300"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      <div className="card-gradient-border p-8 md:p-10">
        <fieldset>
          <legend
            className="font-heading text-[#18181b] mb-4"
            style={{
              fontSize: "clamp(22px, 3vw, 32px)",
              fontWeight: 400,
              lineHeight: 1.25,
              letterSpacing: "-0.01em",
            }}
          >
            {question.prompt}
          </legend>
          {question.helper && (
            <p className="text-[#52525b] text-[14px] leading-[1.7] mb-6">
              {question.helper}
            </p>
          )}

          <div className="flex flex-col gap-3 mt-6">
            {question.options.map((opt) => {
              const isSelected = selected === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => onAnswer(opt.value)}
                  aria-pressed={isSelected}
                  className={`text-left px-5 py-4 rounded-lg border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f59e0b]/60 ${
                    isSelected
                      ? "border-[#f59e0b] bg-[#f59e0b]/10"
                      : "border-[#e4e4e7] bg-white hover:border-[#f59e0b]/60 hover:bg-[#fafafa]"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span
                      className={`w-5 h-5 rounded-full border flex-shrink-0 transition-colors ${
                        isSelected
                          ? "border-[#f59e0b] bg-[#f59e0b]"
                          : "border-[#a1a1aa]"
                      }`}
                      aria-hidden
                    />
                    <div>
                      <div className="text-[#18181b] text-[15px] font-medium">
                        {opt.label}
                      </div>
                      {opt.helper && (
                        <div className="text-[#52525b] text-[13px] mt-1">
                          {opt.helper}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <p className="text-[12px] text-[#a1a1aa] mt-6">
        Your answers are only sent to Available Law if you choose to submit
        your email on the next step.
      </p>
    </div>
  );
}

function SoftGateView({
  def,
  result,
  email,
  onEmailChange,
  wantsTips,
  onWantsTipsChange,
  submitting,
  submitError,
  onSubmit,
}: {
  def: AssessmentDefinition;
  result: AssessmentResult;
  email: string;
  onEmailChange: (v: string) => void;
  wantsTips: boolean;
  onWantsTipsChange: (v: boolean) => void;
  submitting: boolean;
  submitError: string | null;
  onSubmit: (e: React.FormEvent) => void;
}) {
  const tier = TIER_CLASSES[result.overallTier];
  const overall = def.overall[result.overallTier];

  // Preview strategy: show the first 2 area cards in full as proof of value,
  // then tease the remaining areas as tier-badge rows with locked
  // recommendations. Email gate sits below.
  const PREVIEW_COUNT = 2;
  const previewAreas = result.areas.slice(0, PREVIEW_COUNT);
  const lockedAreas = result.areas.slice(PREVIEW_COUNT);

  return (
    <div>
      <div className="section-divider" />
      <p className="text-[13px] font-medium text-[#f59e0b] tracking-widest uppercase mb-6">
        Your result · {def.name}
      </p>

      <div className="card-gradient-border p-8 md:p-10 mb-8">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[13px] font-medium mb-6 ${tier.pill}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${tier.dot}`} />
          {tier.label} · {result.overallScore} / {result.overallMaxScore}
        </div>

        <h3
          className="font-heading text-[#18181b] mb-4"
          style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          {overall.title}
        </h3>
        <p className="text-[#3f3f46] text-[16px] leading-[1.7]">
          {overall.summary}
        </p>
      </div>

      {/* Preview: full area cards for the first N areas */}
      {previewAreas.length > 0 && (
        <div className="mb-8">
          <h4 className="text-[#f0f0f5] text-[18px] font-semibold mb-5">
            Preview · your first {previewAreas.length} areas
          </h4>
          <div className="flex flex-col gap-3">
            {previewAreas.map((a) => {
              const t = TIER_CLASSES[a.tier];
              return (
                <div
                  key={a.area.id}
                  className="card-gradient-border p-6 md:p-7"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <h5 className="text-[#18181b] text-[16px] font-semibold">
                      {a.area.label}
                    </h5>
                    <div
                      className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border text-[12px] font-medium ${t.pill}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
                      {t.label} · {a.score} / {a.maxScore}
                    </div>
                  </div>
                  <p className="text-[#52525b] text-[14px] leading-[1.7] mb-3">
                    {a.area.description}
                  </p>
                  <p className="text-[#18181b] text-[14px] leading-[1.75]">
                    {a.area.recommendations[a.tier]}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Locked: show tier shape for remaining areas without the recommendation */}
      {lockedAreas.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-[#f0f0f5] text-[18px] font-semibold">
              {lockedAreas.length} more{" "}
              {lockedAreas.length === 1 ? "area" : "areas"} — locked
            </h4>
            <span className="text-[12px] text-[#a1a1aa] uppercase tracking-widest">
              Email to unlock
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {lockedAreas.map((a) => {
              const t = TIER_CLASSES[a.tier];
              return (
                <div
                  key={a.area.id}
                  className="card-gradient-border p-5 md:p-6 relative overflow-hidden"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h5 className="text-[#18181b] text-[15px] font-semibold">
                      {a.area.label}
                    </h5>
                    <div
                      className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border text-[12px] font-medium ${t.pill}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
                      {t.label} · {a.score} / {a.maxScore}
                    </div>
                  </div>
                  <div
                    className="mt-3 select-none pointer-events-none"
                    aria-hidden
                  >
                    <p
                      className="text-[#18181b] text-[14px] leading-[1.75]"
                      style={{ filter: "blur(5px)" }}
                    >
                      {a.area.recommendations[a.tier]}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[12px] text-[#52525b]">
                    <svg
                      viewBox="0 0 20 20"
                      className="w-3.5 h-3.5 fill-[#52525b]"
                      aria-hidden
                    >
                      <path d="M10 1.5a4 4 0 0 0-4 4v2H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-1v-2a4 4 0 0 0-4-4Zm-2.5 4a2.5 2.5 0 1 1 5 0v2h-5v-2Z" />
                    </svg>
                    Recommendation locked
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="card-gradient-border p-8 md:p-10">
        <h4 className="text-[#18181b] text-[18px] font-semibold mb-2">
          Unlock the full breakdown
        </h4>
        <p className="text-[#3f3f46] text-[14px] leading-[1.7] mb-6">
          Drop your email and we&rsquo;ll show you the specific recommendation
          for every area — plus email it over so you can come back to it when
          you&rsquo;re ready to close the gaps.
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            placeholder="you@yourcompany.com"
            autoComplete="email"
            className="w-full px-4 py-3 rounded-lg bg-[#fafafa] border border-[#e4e4e7] text-[#18181b] placeholder:text-[#a1a1aa] text-[15px] focus:outline-none focus:border-[#f59e0b] focus:ring-2 focus:ring-[#f59e0b]/20"
          />

          <label className="flex items-start gap-3 text-[13px] text-[#3f3f46] leading-[1.6] cursor-pointer">
            <input
              type="checkbox"
              checked={wantsTips}
              onChange={(e) => onWantsTipsChange(e.target.checked)}
              className="mt-1 accent-[#f59e0b]"
            />
            <span>
              Send me the follow-up — a one-email-per-week series on closing
              the specific gaps this checkup found. Unsubscribe anytime.
            </span>
          </label>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={submitting || !email.trim()}
              className="btn-al btn-al-primary px-6 py-3 text-[15px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "Unlocking…" : "Unlock my full results"}
            </button>
          </div>

          {submitError && (
            <p className="text-[13px] text-rose-600">{submitError}</p>
          )}
        </form>
      </div>

      <p className="text-[12px] text-[#a1a1aa] mt-6 leading-[1.7] max-w-[640px]">
        {def.disclaimer}
      </p>
    </div>
  );
}

function DetailedView({
  def,
  result,
  onRestart,
}: {
  def: AssessmentDefinition;
  result: AssessmentResult;
  onRestart: () => void;
}) {
  const tier = TIER_CLASSES[result.overallTier];
  const overall = def.overall[result.overallTier];
  const next = def.nextStep[result.overallTier];

  return (
    <div>
      <div className="section-divider" />
      <p className="text-[13px] font-medium text-[#f59e0b] tracking-widest uppercase mb-6">
        Your full result · {def.name}
      </p>

      {/* Overall */}
      <div className="card-gradient-border p-8 md:p-10 mb-8">
        <div
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[13px] font-medium mb-6 ${tier.pill}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${tier.dot}`} />
          {tier.label} · {result.overallScore} / {result.overallMaxScore}
        </div>

        <h3
          className="font-heading text-[#18181b] mb-4"
          style={{
            fontSize: "clamp(28px, 4vw, 44px)",
            fontWeight: 400,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
          }}
        >
          {overall.title}
        </h3>
        <p className="text-[#3f3f46] text-[16px] leading-[1.7]">
          {overall.summary}
        </p>
      </div>

      {/* Area breakdown */}
      <div className="mb-10">
        <h4 className="text-[#f0f0f5] text-[18px] font-semibold mb-5">
          Where you stand, by area
        </h4>
        <div className="flex flex-col gap-3">
          {result.areas.map((a) => {
            const t = TIER_CLASSES[a.tier];
            return (
              <div
                key={a.area.id}
                className="card-gradient-border p-6 md:p-7"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <h5 className="text-[#18181b] text-[16px] font-semibold">
                    {a.area.label}
                  </h5>
                  <div
                    className={`inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full border text-[12px] font-medium ${t.pill}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${t.dot}`} />
                    {t.label} · {a.score} / {a.maxScore}
                  </div>
                </div>
                <p className="text-[#52525b] text-[14px] leading-[1.7] mb-3">
                  {a.area.description}
                </p>
                <p className="text-[#18181b] text-[14px] leading-[1.75]">
                  {a.area.recommendations[a.tier]}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next step CTA */}
      <div className="card-featured p-8 md:p-10 mb-6">
        <p className="text-[13px] font-medium text-[#f59e0b] tracking-widest uppercase mb-3">
          Next step
        </p>
        <h4
          className="font-heading text-[#f0f0f5] mb-3"
          style={{
            fontSize: "clamp(22px, 3vw, 32px)",
            fontWeight: 400,
            lineHeight: 1.2,
            letterSpacing: "-0.01em",
          }}
        >
          {next.label}
        </h4>
        <p className="text-[#d4d4d8] text-[15px] leading-[1.7] mb-6">
          {next.summary}
        </p>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Link
            href={next.ctaHref}
            className="btn-al btn-al-primary px-6 py-3 text-[15px]"
          >
            {next.ctaLabel}
          </Link>
          {next.secondary && (
            <Link
              href={next.secondary.ctaHref}
              className="text-[14px] text-[#fafafa] hover:text-[#f59e0b] transition-colors underline underline-offset-4 decoration-white/20 hover:decoration-[#f59e0b]/60"
            >
              {next.secondary.ctaLabel}
            </Link>
          )}
        </div>
        {next.secondary && (
          <p className="text-[13px] text-[#d4d4d8] mt-4 leading-[1.7] max-w-[620px]">
            {next.secondary.summary}
          </p>
        )}
      </div>

      <div className="flex items-center gap-6 pt-2">
        <button
          type="button"
          onClick={onRestart}
          className="text-[13px] text-[#a1a1aa] hover:text-[#fafafa] transition-colors underline underline-offset-4 decoration-dotted"
        >
          Take the checkup again
        </button>
      </div>

      <p className="text-[12px] text-[#a1a1aa] mt-10 leading-[1.7] max-w-[640px]">
        {def.disclaimer}
      </p>
    </div>
  );
}
