/**
 * AlloraHeroDemo — auto-playing chat demo that replaces the static card
 * showcase on the homepage hero.
 *
 * A three-act narrative cycles on loop:
 *   1. Lease intake    — client brings a lease question; Allora triages
 *                         and promises to route to an attorney.
 *   2. Lease delivery  — attorney has finished; Allora returns the
 *                         redlined work product. An "Attorney-verified"
 *                         badge with a pulsing green dot gently floats
 *                         above the chat card ONLY during this scene.
 *   3. Colorado AI Act — second practice area, demonstrating breadth.
 *
 * Each scenario runs through five phases:
 *   typing-user → thinking → typing-allora → hold → fade-out
 *
 * Timing is tuned to feel real rather than fast:
 *   - User types at ~40 WPM (40ms/char)
 *   - Allora replies at ~80 WPM (20ms/char)
 *   - A brief "thinking" dot animation bridges the two
 *   - ~2.4s hold after the reply lands so a scanning visitor can read it
 *
 * Accessibility:
 *   - prefers-reduced-motion → jump straight to the first scenario rendered
 *     in full, no typing animation, no auto-advance.
 *   - Chat bubbles are plain text, not hidden behind motion.
 *   - aria-live on the transcript so AT users get the running content.
 */

"use client";

import { useEffect, useRef, useState } from "react";

// ----------------------------------------------------------------------------
// Scenarios — keep these tight. The hero shouldn't feel like an essay.
// ----------------------------------------------------------------------------

interface Message {
  role: "user" | "allora";
  text: string;
}

interface DocumentChip {
  /** File name shown on the chip, e.g. "Redlined_Lease.pdf". */
  filename: string;
  /** Secondary line on the chip, e.g. "3 clauses flagged · Attorney-verified". */
  meta: string;
}

interface Scenario {
  /** Badge text shown at the top of the chat frame. */
  topic: string;
  /** 'intake' is triage/routing; 'delivery' returns attorney work product. */
  kind: "intake" | "delivery";
  messages: Message[];
  /** Optional document attachment rendered inside Allora's reply bubble.
   *  Clicking opens a preview modal with a stylized redlined lease page. */
  chip?: DocumentChip;
}

/**
 * Three-act scripted demo. Every exchange is patterned after a real matter
 * Zachariah has run through the Allora pipeline — but they are fully
 * fictional client prompts with no identifiable details.
 *
 *   1. Lease intake     — client surfaces a clause concern, Allora describes
 *                          patterns and routes the work to an attorney.
 *   2. Lease delivery   — same matter, next stage: attorney-reviewed work
 *                          product returned to the client. Floating
 *                          Attorney-verified badge appears only here.
 *   3. Colorado AI Act  — second practice area (hiring-tool compliance),
 *                          demonstrating breadth beyond contract work.
 */
const SCENARIOS: Scenario[] = [
  {
    topic: "Commercial lease — intake",
    kind: "intake",
    messages: [
      {
        role: "user",
        text: "New landlord wants me on the hook for all structural repairs. 3-year lease. Is that normal?",
      },
      {
        role: "allora",
        text: "That's a clause we see pushed on small tenants a lot — and it's usually negotiable. On short-term holds, landlords typically keep structural, roof, and foundation; tenants take non-structural interior. Drop the lease in and I'll have an attorney review it and let you know what's worth pushing back on.",
      },
    ],
  },
  {
    topic: "Attorney review complete",
    kind: "delivery",
    messages: [
      {
        role: "user",
        text: "Any update on the lease review?",
      },
      {
        role: "allora",
        text: "Just back from our attorney. Three clauses redlined — structural repairs, CAM caps, and the default/cure window. Attorney-verified and ready to send to the landlord whenever you are.",
      },
    ],
    chip: {
      filename: "Redlined_Lease.pdf",
      meta: "3 clauses flagged · Attorney-verified",
    },
  },
  {
    topic: "Colorado AI Act",
    kind: "intake",
    messages: [
      {
        role: "user",
        text: "Using an AI tool to screen resumes. Any issue under the Colorado AI Act?",
      },
      {
        role: "allora",
        text: "Resume screening falls under SB24-205's \"consequential decision\" bucket — which typically triggers pre-decision notice, AI-involvement disclosure, annual impact assessment, and a right-to-appeal process, all live by the June 2026 effective date. Send over the tool and your hiring flow and I'll have an attorney map out your specific compliance plan.",
      },
    ],
  },
];

// ----------------------------------------------------------------------------
// Timing constants
// ----------------------------------------------------------------------------

const USER_CHAR_MS = 40;         // ~40 WPM typing
const ALLORA_CHAR_MS = 20;       // ~80 WPM streaming
const THINKING_DELAY_MS = 1100;  // "thinking..." dots
const SCENARIO_HOLD_MS = 2400;   // pause after reply lands
const FADE_MS = 450;             // cross-scenario fade

type Phase =
  | "typing-user"
  | "thinking"
  | "typing-allora"
  | "hold"
  | "fade-out";

// ----------------------------------------------------------------------------
// Atoms
// ----------------------------------------------------------------------------

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5 px-4 py-3 bg-white rounded-2xl rounded-bl-sm border border-[#1F1810]/8 w-fit">
      <span
        className="w-1.5 h-1.5 rounded-full bg-[#A89279]"
        style={{ animation: "alloraDot 1.2s ease-in-out infinite" }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full bg-[#A89279]"
        style={{ animation: "alloraDot 1.2s ease-in-out 0.2s infinite" }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full bg-[#A89279]"
        style={{ animation: "alloraDot 1.2s ease-in-out 0.4s infinite" }}
      />
    </div>
  );
}

function UserBubble({
  text,
  showCursor,
}: {
  text: string;
  showCursor: boolean;
}) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[85%] px-4 py-3 bg-[#D4893F] text-white rounded-2xl rounded-br-sm shadow-sm">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">
          {text}
          {showCursor && (
            <span
              className="inline-block w-[2px] h-[14px] bg-white/80 ml-0.5 align-middle"
              style={{ animation: "alloraCursor 1s steps(2) infinite" }}
              aria-hidden
            />
          )}
        </p>
      </div>
    </div>
  );
}

function AlloraBubble({
  text,
  showCursor,
  chip,
  onChipClick,
  onChipHoverChange,
}: {
  text: string;
  showCursor: boolean;
  chip?: DocumentChip;
  onChipClick?: () => void;
  onChipHoverChange?: (hovered: boolean) => void;
}) {
  // The chip appears only after Allora has finished "typing" — so it reads as
  // an attachment the attorney just delivered, not something auto-generated.
  const chipVisible = chip && !showCursor;

  return (
    <div className="flex justify-start">
      <div className="max-w-[90%] px-4 py-3 bg-white border border-[#1F1810]/8 rounded-2xl rounded-bl-sm shadow-sm">
        <p className="text-sm leading-relaxed text-[#1F1810] whitespace-pre-wrap">
          {text}
          {showCursor && (
            <span
              className="inline-block w-[2px] h-[14px] bg-[#C17832] ml-0.5 align-middle"
              style={{ animation: "alloraCursor 1s steps(2) infinite" }}
              aria-hidden
            />
          )}
        </p>
        {chipVisible && (
          <button
            type="button"
            onClick={onChipClick}
            onMouseEnter={() => onChipHoverChange?.(true)}
            onMouseLeave={() => onChipHoverChange?.(false)}
            onFocus={() => onChipHoverChange?.(true)}
            onBlur={() => onChipHoverChange?.(false)}
            className="group mt-3 flex items-center gap-3 w-full text-left bg-[#FAF8F5] hover:bg-[#F5F0EB] border border-[#1F1810]/8 hover:border-[#C17832]/40 rounded-xl px-3 py-2.5 transition-all focus:outline-none focus:ring-2 focus:ring-[#C17832]/40"
            aria-label={`Open ${chip!.filename} preview`}
          >
            <span className="relative flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-[#7A8B6F] to-[#5a6b4f] flex items-center justify-center text-white shadow-sm">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#7A8B6F] border-2 border-white shadow-[0_0_6px_rgba(122,139,111,0.7)]"
                aria-hidden
              />
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-xs font-semibold text-[#1F1810] truncate">
                {chip!.filename}
              </span>
              <span className="block text-[11px] text-[#A89279] truncate">
                {chip!.meta}
              </span>
            </span>
            <svg
              className="w-4 h-4 text-[#A89279] group-hover:text-[#C17832] transition-transform group-hover:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// AlloraHeroDemo
// ----------------------------------------------------------------------------

export default function AlloraHeroDemo() {
  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>("typing-user");
  const [userProgress, setUserProgress] = useState(0);
  const [alloraProgress, setAlloraProgress] = useState(0);
  const [prefersReduced, setPrefersReduced] = useState(false);

  // Modal + hover state. When either is active, we pause the autoplay loop so
  // the visitor has time to click the document chip and read the preview.
  const [modalOpen, setModalOpen] = useState(false);
  const [chipHovered, setChipHovered] = useState(false);
  const isPaused = modalOpen || chipHovered;

  const transcriptRef = useRef<HTMLDivElement>(null);

  // ESC closes the preview modal.
  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [modalOpen]);

  // Detect prefers-reduced-motion once on mount. If set, we render the first
  // scenario in its final state and skip all timers.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const scenario = SCENARIOS[scenarioIdx];
  const userText = scenario.messages[0].text;
  const alloraText = scenario.messages[1].text;

  // State machine. Each phase schedules the next transition; progress updates
  // re-run the effect so each char-tick schedules itself.
  useEffect(() => {
    if (prefersReduced) {
      // Static state: full first scenario, no auto-advance.
      setUserProgress(SCENARIOS[0].messages[0].text.length);
      setAlloraProgress(SCENARIOS[0].messages[1].text.length);
      setPhase("hold");
      return;
    }

    // Pause while the visitor is exploring the doc chip / preview modal.
    if (isPaused) return;

    let timer: number;

    if (phase === "typing-user") {
      if (userProgress >= userText.length) {
        setPhase("thinking");
        return;
      }
      timer = window.setTimeout(
        () => setUserProgress((p) => p + 1),
        USER_CHAR_MS,
      );
      return () => window.clearTimeout(timer);
    }

    if (phase === "thinking") {
      timer = window.setTimeout(() => setPhase("typing-allora"), THINKING_DELAY_MS);
      return () => window.clearTimeout(timer);
    }

    if (phase === "typing-allora") {
      if (alloraProgress >= alloraText.length) {
        setPhase("hold");
        return;
      }
      timer = window.setTimeout(
        () => setAlloraProgress((p) => p + 1),
        ALLORA_CHAR_MS,
      );
      return () => window.clearTimeout(timer);
    }

    if (phase === "hold") {
      timer = window.setTimeout(() => setPhase("fade-out"), SCENARIO_HOLD_MS);
      return () => window.clearTimeout(timer);
    }

    if (phase === "fade-out") {
      timer = window.setTimeout(() => {
        setScenarioIdx((i) => (i + 1) % SCENARIOS.length);
        setUserProgress(0);
        setAlloraProgress(0);
        setPhase("typing-user");
      }, FADE_MS);
      return () => window.clearTimeout(timer);
    }
  }, [
    phase,
    userProgress,
    alloraProgress,
    scenarioIdx,
    userText,
    alloraText,
    prefersReduced,
    isPaused,
  ]);

  // Auto-scroll transcript to bottom as new content appears.
  useEffect(() => {
    const el = transcriptRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [userProgress, alloraProgress, phase]);

  const showUserCursor = phase === "typing-user" && userProgress < userText.length;
  const showAlloraCursor =
    phase === "typing-allora" && alloraProgress < alloraText.length;
  const visibleUser = userText.slice(0, userProgress);
  const visibleAllora = alloraText.slice(0, alloraProgress);

  // Progress dots indicate which of 3 scenarios is currently playing.
  return (
    <>
    <div
      className="relative transition-opacity"
      style={{
        transitionDuration: `${FADE_MS}ms`,
        opacity: phase === "fade-out" ? 0 : 1,
      }}
    >
      {/* Chat frame */}
      <div className="bg-[#FAF8F5] rounded-[28px] border border-[#1F1810]/8 shadow-[0_20px_50px_rgba(31,24,16,0.08)] overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F1810]/6 bg-white">
          <div className="flex items-center gap-3">
            <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[#D4893F] to-[#C17832] flex items-center justify-center">
              <span className="text-white text-xs font-heading font-bold">A</span>
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#7A8B6F] border-2 border-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#1F1810] leading-tight">
                Allora
              </p>
              <p className="text-[11px] text-[#A89279] leading-tight">
                Your legal intake assistant
              </p>
            </div>
          </div>
          <div
            className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#F5F0EB] text-[10px] font-semibold text-[#8a5022] uppercase tracking-wider"
            aria-live="polite"
          >
            {scenario.topic}
          </div>
        </div>

        {/* Transcript */}
        <div
          ref={transcriptRef}
          className="px-5 py-6 h-[340px] overflow-y-auto flex flex-col gap-3 bg-gradient-to-b from-[#FAF8F5] to-[#F5F0EB]/40"
          aria-live="polite"
          aria-atomic="false"
        >
          {/* Date divider (cosmetic) */}
          <div className="flex justify-center">
            <span className="text-[10px] text-[#A89279] uppercase tracking-widest">
              Today
            </span>
          </div>

          {/* User message — always shown (typing or complete) */}
          {userProgress > 0 && (
            <UserBubble text={visibleUser} showCursor={showUserCursor} />
          )}

          {/* Thinking dots */}
          {phase === "thinking" && <ThinkingDots />}

          {/* Allora message — shown during typing-allora / hold / fade-out */}
          {(phase === "typing-allora" ||
            phase === "hold" ||
            phase === "fade-out") && (
            <AlloraBubble
              text={visibleAllora || " "}
              showCursor={showAlloraCursor}
              chip={scenario.chip}
              onChipClick={() => setModalOpen(true)}
              onChipHoverChange={setChipHovered}
            />
          )}
        </div>

        {/* Footer / composer */}
        <div className="px-5 py-4 border-t border-[#1F1810]/6 bg-white flex items-center gap-3">
          <div className="flex-1 px-4 py-2.5 rounded-full bg-[#F5F0EB] text-xs text-[#A89279]">
            Ask Allora anything about your business...
          </div>
          <div className="w-9 h-9 rounded-full bg-[#D4893F] flex items-center justify-center text-white shadow-sm">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 12h14M13 6l6 6-6 6"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Scenario progress dots */}
      <div className="flex items-center justify-center gap-2 mt-6">
        {SCENARIOS.map((_, i) => (
          <span
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i === scenarioIdx
                ? "w-8 bg-[#D4893F]"
                : "w-1.5 bg-[#1F1810]/15"
            }`}
            aria-hidden
          />
        ))}
      </div>

      {/* Floating Attorney-verified badge — appears only during the delivery
          scenario, fades in/out with the scenario transition, and gently
          floats up and down to keep the hero feeling alive.
          Anchored to the bottom-right of the wrapper (below the chat card,
          at the progress-dots row) so it doesn't occlude the chat header's
          topic pill or any transcript content. The progress dots are
          center-aligned, leaving the right side empty for the badge. */}
      <div
        className={`absolute bottom-0 right-4 z-20 flex bg-white px-3.5 py-2.5 rounded-xl shadow-[0_10px_30px_rgba(31,24,16,0.12)] border border-[#F5F0EB] items-center gap-2 transition-opacity duration-500 ${
          scenario.kind === "delivery" && phase !== "fade-out"
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }`}
        style={{
          animation:
            scenario.kind === "delivery" && !prefersReduced
              ? "alloraFloat 3.6s ease-in-out infinite"
              : "none",
        }}
        aria-hidden={scenario.kind !== "delivery"}
      >
        <span className="relative flex items-center justify-center">
          <span
            className="absolute w-3.5 h-3.5 rounded-full bg-[#7A8B6F]/35"
            style={{
              animation: !prefersReduced ? "alloraPulse 1.8s ease-in-out infinite" : "none",
            }}
            aria-hidden
          />
          <span className="relative w-2 h-2 rounded-full bg-[#7A8B6F] shadow-[0_0_8px_rgba(122,139,111,0.7)]" />
        </span>
        <span className="text-xs font-semibold text-[#1F1810]">
          Attorney-verified
        </span>
      </div>

      {/* Component-scoped keyframes. Live here (not globals.css) so this demo
          is fully portable — drop the file in, everything works. */}
      <style jsx>{`
        @keyframes alloraDot {
          0%, 80%, 100% {
            opacity: 0.25;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
            transform: translateY(-3px);
          }
        }
        @keyframes alloraCursor {
          0%, 50% {
            opacity: 1;
          }
          50.01%, 100% {
            opacity: 0;
          }
        }
        @keyframes alloraFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes alloraPulse {
          0%, 100% {
            opacity: 0.55;
            transform: scale(1);
          }
          50% {
            opacity: 0;
            transform: scale(1.8);
          }
        }
      `}</style>
    </div>

    {/* Redlined-lease preview modal. Opened from the document chip in Allora's
        delivery bubble. Rendered as a sibling of the demo wrapper (not a
        child) so the backdrop can cover the whole viewport without inheriting
        the wrapper's fade-out opacity. */}
    {modalOpen && <PreviewModal onClose={() => setModalOpen(false)} />}
    </>
  );
}

// ----------------------------------------------------------------------------
// PreviewModal — stylized "redlined lease" page that opens when the visitor
// clicks the document chip. Fully client-side mock content; the visual goal
// is to let prospects feel what attorney-verified work product looks like
// inside Allora, not to render a real lease PDF.
// ----------------------------------------------------------------------------

function PreviewModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1F1810]/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="allora-preview-title"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-[0_30px_80px_rgba(0,0,0,0.35)] w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-[#1F1810]/8 bg-white">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#7A8B6F] to-[#5a6b4f] flex items-center justify-center text-white shadow-sm">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span
                className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#7A8B6F] border-2 border-white shadow-[0_0_6px_rgba(122,139,111,0.8)]"
                aria-hidden
              />
            </div>
            <div className="min-w-0">
              <p
                id="allora-preview-title"
                className="text-sm font-semibold text-[#1F1810] truncate"
              >
                Redlined_Lease.pdf
              </p>
              <p className="text-[11px] text-[#A89279] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7A8B6F]" />
                Attorney-verified · 3 clauses flagged
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex-shrink-0 w-9 h-9 rounded-lg hover:bg-[#F5F0EB] flex items-center justify-center text-[#A89279] hover:text-[#1F1810] transition focus:outline-none focus:ring-2 focus:ring-[#C17832]/40"
            aria-label="Close preview"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Body — stylized "lease page" with three redlined clauses. */}
        <div className="flex-1 overflow-y-auto bg-[#F5F0EB]/40 p-4 sm:p-6">
          <div
            className="bg-white shadow-sm border border-[#1F1810]/8 rounded-lg p-6 sm:p-8"
            style={{ fontFamily: "ui-serif, Georgia, 'Times New Roman', serif" }}
          >
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] uppercase tracking-widest text-[#A89279]">
                Commercial Lease · Page 7 of 24
              </p>
              <p className="text-[10px] uppercase tracking-widest text-[#A89279]">
                Reviewed 04/22/2026
              </p>
            </div>
            <h3 className="text-base font-semibold text-[#1F1810] mb-5">
              Section 12. Repairs and Maintenance
            </h3>

            {/* Clause 12.1 — structural repairs */}
            <div className="mb-6">
              <p className="text-sm leading-relaxed text-[#1F1810]/85">
                12.1 Tenant shall, at Tenant&rsquo;s sole cost and expense,
                maintain, repair, and replace all{" "}
                <span className="line-through decoration-[#C17832] decoration-[2px]">
                  structural and
                </span>{" "}
                non-structural portions of the Premises, including but not
                limited to the roof, foundation, load-bearing walls, and
                building systems.
              </p>
              <div className="mt-2 flex items-start gap-2 bg-[#C17832]/5 border-l-2 border-[#C17832] pl-3 pr-2 py-2 rounded-r">
                <span
                  className="text-[10px] font-bold tracking-widest text-[#C17832] mt-0.5"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  ZC
                </span>
                <p
                  className="text-[12px] leading-snug text-[#1F1810]"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  Landlord should retain structural, roof, and foundation — CO
                  commercial market standard. Tenant takes non-structural
                  interior only.
                </p>
              </div>
            </div>

            {/* Clause 12.2 — CAM caps */}
            <div className="mb-6">
              <p className="text-sm leading-relaxed text-[#1F1810]/85">
                12.2 Common Area Maintenance (&ldquo;CAM&rdquo;) charges shall
                be assessed annually and may increase{" "}
                <span className="line-through decoration-[#C17832] decoration-[2px]">
                  without limitation
                </span>{" "}
                based on actual costs incurred by Landlord.
              </p>
              <div className="mt-2 flex items-start gap-2 bg-[#C17832]/5 border-l-2 border-[#C17832] pl-3 pr-2 py-2 rounded-r">
                <span
                  className="text-[10px] font-bold tracking-widest text-[#C17832] mt-0.5"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  ZC
                </span>
                <p
                  className="text-[12px] leading-snug text-[#1F1810]"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  Cap CAM at 3% annual increase; add audit rights on
                  pass-throughs with a 60-day objection window.
                </p>
              </div>
            </div>

            {/* Clause 12.3 — default/cure window */}
            <div>
              <p className="text-sm leading-relaxed text-[#1F1810]/85">
                12.3 Tenant shall cure any default within{" "}
                <span className="line-through decoration-[#C17832] decoration-[2px]">
                  ten (10)
                </span>{" "}
                days following Landlord&rsquo;s written notice, or Landlord
                may terminate this Lease.
              </p>
              <div className="mt-2 flex items-start gap-2 bg-[#C17832]/5 border-l-2 border-[#C17832] pl-3 pr-2 py-2 rounded-r">
                <span
                  className="text-[10px] font-bold tracking-widest text-[#C17832] mt-0.5"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  ZC
                </span>
                <p
                  className="text-[12px] leading-snug text-[#1F1810]"
                  style={{ fontFamily: "system-ui, sans-serif" }}
                >
                  Thirty (30) day cure for non-monetary defaults; monetary
                  stays at 10 days with a structured-cure option.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#1F1810]/8 bg-white flex items-center justify-between gap-4 flex-wrap">
          <p className="text-[11px] text-[#A89279] max-w-xs leading-snug">
            Demo preview. In Allora, attorney-verified deliverables land
            directly in your matter — ready to send, download, or discuss.
          </p>
          <a
            href="#book"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#C17832] hover:bg-[#8a5022] text-white text-sm font-semibold rounded-lg transition shadow-sm"
          >
            See it live
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
