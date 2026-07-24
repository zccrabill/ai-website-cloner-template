/**
 * AvaHeroDemo — auto-playing chat demo on the homepage hero, rendered
 * inside a CSS iPhone chassis to showcase the Available Law App Store app.
 * The phone is pure presentation; the scripted chat state machine below is
 * unchanged and portable.
 *
 * A three-act narrative cycles on loop:
 *   1. Lease intake    — client brings a lease question; Ava triages
 *                         and promises to route to an attorney.
 *   2. Lease delivery  — attorney has finished; Ava returns the
 *                         redlined work product. An "Attorney-verified"
 *                         badge with a pulsing green dot gently floats
 *                         above the chat card ONLY during this scene.
 *   3. Colorado AI Act — second practice area, demonstrating breadth.
 *
 * Each scenario runs through five phases:
 *   typing-user → thinking → typing-ava → hold → fade-out
 *
 * Timing is tuned to feel real rather than fast:
 *   - User types at ~40 WPM (40ms/char)
 *   - Ava replies at ~80 WPM (20ms/char)
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
import Image from "next/image";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import AvaMark from "@/components/AvaMark";
import { APP_STORE_URL } from "@/components/Footer";

// ----------------------------------------------------------------------------
// Scenarios — keep these tight. The hero shouldn't feel like an essay.
// ----------------------------------------------------------------------------

interface Message {
  role: "user" | "ava";
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
  /** Optional document attachment rendered inside Ava's reply bubble.
   *  Clicking opens a preview modal with a stylized redlined lease page. */
  chip?: DocumentChip;
}

/**
 * Three-act scripted demo. Every exchange is patterned after a real matter
 * Zachariah has run through the Ava pipeline — but they are fully
 * fictional client prompts with no identifiable details.
 *
 *   1. Lease intake     — client surfaces a clause concern, Ava describes
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
        role: "ava",
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
        role: "ava",
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
        role: "ava",
        text: "Resume screening counts as a \"consequential decision\" under Colorado SB 26-189 — which triggers a clear pre-use notice, a 30-day adverse-outcome notice when someone is turned down, and a meaningful-human-review path, all live by the January 2027 effective date. Send over the tool and your hiring flow and I'll have an attorney map out your specific compliance plan.",
      },
    ],
  },
];

// ----------------------------------------------------------------------------
// Timing constants
// ----------------------------------------------------------------------------

const USER_CHAR_MS = 40;         // ~40 WPM typing
const AVA_CHAR_MS = 20;       // ~80 WPM streaming
const THINKING_DELAY_MS = 1100;  // "thinking..." dots
const SCENARIO_HOLD_MS = 2400;   // pause after reply lands
const FADE_MS = 450;             // cross-scenario fade

type Phase =
  | "typing-user"
  | "thinking"
  | "typing-ava"
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
        style={{ animation: "avaDot 1.2s ease-in-out infinite" }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full bg-[#A89279]"
        style={{ animation: "avaDot 1.2s ease-in-out 0.2s infinite" }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full bg-[#A89279]"
        style={{ animation: "avaDot 1.2s ease-in-out 0.4s infinite" }}
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
              style={{ animation: "avaCursor 1s steps(2) infinite" }}
              aria-hidden
            />
          )}
        </p>
      </div>
    </div>
  );
}

function AvaBubble({
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
  // The chip appears only after Ava has finished "typing" — so it reads as
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
              style={{ animation: "avaCursor 1s steps(2) infinite" }}
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
// AvaHeroDemo
// ----------------------------------------------------------------------------

export default function AvaHeroDemo() {
  const prefersReduced = usePrefersReducedMotion();
  // Snapshot the PRM value at first render so initial state matches.
  // useState's lazy initializer runs exactly once on mount; we ignore the
  // setter because we don't want this snapshot to drift over the component's
  // lifetime — runtime PRM toggles are handled below via queueMicrotask.
  const [initialPRM] = useState(() => prefersReduced);

  const [scenarioIdx, setScenarioIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>(
    initialPRM ? "hold" : "typing-user",
  );
  const [userProgress, setUserProgress] = useState(
    initialPRM ? SCENARIOS[0].messages[0].text.length : 0,
  );
  const [avaProgress, setAvaProgress] = useState(
    initialPRM ? SCENARIOS[0].messages[1].text.length : 0,
  );

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

  const scenario = SCENARIOS[scenarioIdx];
  const userText = scenario.messages[0].text;
  const avaText = scenario.messages[1].text;

  // State machine. Each phase schedules the next transition; progress updates
  // re-run the effect so each char-tick schedules itself.
  useEffect(() => {
    if (prefersReduced) {
      // PRM toggled on at runtime (initial mount handled by lazy init above).
      // Snap to the completed-scenario state via a microtask so the setStates
      // aren't synchronous inside the effect (React 19 lint rule). React's
      // identity bail-out skips re-render when values are unchanged, so
      // re-firing this on every dep change is cheap.
      queueMicrotask(() => {
        setUserProgress(SCENARIOS[0].messages[0].text.length);
        setAvaProgress(SCENARIOS[0].messages[1].text.length);
        setPhase("hold");
      });
      return;
    }

    // Pause while the visitor is exploring the doc chip / preview modal.
    if (isPaused) return;

    let timer: number;

    if (phase === "typing-user") {
      if (userProgress >= userText.length) {
        // Phase transition. Deferred to a microtask so React commits the
        // final char-render before re-entering the state machine — required
        // to satisfy react-hooks/set-state-in-effect.
        queueMicrotask(() => setPhase("thinking"));
        return;
      }
      timer = window.setTimeout(
        () => setUserProgress((p) => p + 1),
        USER_CHAR_MS,
      );
      return () => window.clearTimeout(timer);
    }

    if (phase === "thinking") {
      timer = window.setTimeout(() => setPhase("typing-ava"), THINKING_DELAY_MS);
      return () => window.clearTimeout(timer);
    }

    if (phase === "typing-ava") {
      if (avaProgress >= avaText.length) {
        // Same deferral pattern as the typing-user → thinking transition.
        queueMicrotask(() => setPhase("hold"));
        return;
      }
      timer = window.setTimeout(
        () => setAvaProgress((p) => p + 1),
        AVA_CHAR_MS,
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
        setAvaProgress(0);
        setPhase("typing-user");
      }, FADE_MS);
      return () => window.clearTimeout(timer);
    }
  }, [
    phase,
    userProgress,
    avaProgress,
    scenarioIdx,
    userText,
    avaText,
    prefersReduced,
    isPaused,
  ]);

  // Auto-scroll transcript to bottom as new content appears.
  useEffect(() => {
    const el = transcriptRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [userProgress, avaProgress, phase]);

  const showUserCursor = phase === "typing-user" && userProgress < userText.length;
  const showAvaCursor =
    phase === "typing-ava" && avaProgress < avaText.length;
  const visibleUser = userText.slice(0, userProgress);
  const visibleAva = avaText.slice(0, avaProgress);

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
      {/* iPhone chassis — the demo IS the App Store app, so it plays inside
          a phone. Chassis is pure CSS (bezel + screen + Dynamic Island +
          status bar + home indicator); the chat inside is unchanged. */}
      <div className="relative mx-auto w-[320px] sm:w-[344px]">
        <div className="relative bg-[#1F1810] rounded-[52px] p-[10px] shadow-[0_30px_80px_rgba(31,24,16,0.28)]">
          {/* Side buttons (cosmetic) */}
          <span className="absolute -left-[2px] top-24 w-[3px] h-8 rounded-l bg-[#1F1810]" aria-hidden />
          <span className="absolute -left-[2px] top-36 w-[3px] h-12 rounded-l bg-[#1F1810]" aria-hidden />
          <span className="absolute -right-[2px] top-28 w-[3px] h-16 rounded-r bg-[#1F1810]" aria-hidden />

          <div className="relative bg-white rounded-[42px] overflow-hidden">
            {/* Status bar + Dynamic Island */}
            <div className="relative flex items-center justify-between px-8 pt-3.5 pb-1.5 bg-white">
              <span className="text-[12px] font-semibold text-[#1F1810] tracking-tight">
                9:41
              </span>
              <span
                className="absolute left-1/2 -translate-x-1/2 top-2.5 w-[88px] h-[24px] bg-[#1F1810] rounded-full"
                aria-hidden
              />
              <span className="flex items-center gap-1.5 text-[#1F1810]" aria-hidden>
                {/* Signal */}
                <svg className="w-4 h-3" viewBox="0 0 16 12" fill="currentColor">
                  <rect x="0" y="8" width="3" height="4" rx="0.8" />
                  <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.8" />
                  <rect x="9" y="3" width="3" height="9" rx="0.8" />
                  <rect x="13" y="0.5" width="3" height="11.5" rx="0.8" opacity="0.35" />
                </svg>
                {/* Battery */}
                <svg className="w-6 h-3" viewBox="0 0 25 12" fill="none">
                  <rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke="currentColor" opacity="0.4" />
                  <rect x="2" y="2" width="15" height="8" rx="1.6" fill="currentColor" />
                  <path d="M23 4v4c1.1-.3 1.8-1.1 1.8-2S24.1 4.3 23 4z" fill="currentColor" opacity="0.4" />
                </svg>
              </span>
            </div>

            {/* App header — Ava's identity is the {ai} monogram, never a
                human face (we sell AI disclosure; our own AI stays visibly
                an AI). Personality lives in the copy. */}
            <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-[#1F1810]/6 bg-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <AvaMark size={34} presence />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#1F1810] leading-tight">
                    Ava
                  </p>
                  <p className="text-[10px] text-[#A89279] leading-tight truncate">
                    The <span className="text-[#C17832]">{"{"}</span>ai
                    <span className="text-[#C17832]">{"}"}</span>
                    {" in Available Law"}
                  </p>
                </div>
              </div>
              <div
                className="flex-shrink-0 max-w-[45%] px-2.5 py-1 rounded-full bg-[#F5F0EB] text-[9px] font-semibold text-[#8a5022] uppercase tracking-wider truncate"
                aria-live="polite"
              >
                {scenario.topic}
              </div>
            </div>

            {/* Transcript */}
            <div
              ref={transcriptRef}
              className="px-4 py-5 h-[400px] overflow-y-auto flex flex-col gap-3 bg-gradient-to-b from-[#FAF8F5] to-[#F5F0EB]/40"
              aria-live="polite"
              aria-atomic="false"
            >
              {/* Date divider (cosmetic) */}
              <div className="flex justify-center">
                <span className="text-[10px] text-[#A89279] uppercase tracking-widest">
                  Today
                </span>
              </div>

              {/* Ava's standing greeting — static across scenarios. Her one
                  line of personality: warm, plainspoken, and honest that
                  she's the AI in the brand name. */}
              <div className="flex justify-start">
                <div className="max-w-[90%] px-4 py-3 bg-white border border-[#1F1810]/8 rounded-2xl rounded-bl-sm shadow-sm">
                  <p className="text-sm leading-relaxed text-[#1F1810]">
                    Hey — I&apos;m Ava, the{" "}
                    <span className="text-[#C17832] font-semibold">{"{"}ai{"}"}</span>{" "}
                    in Available Law. What&apos;s going on in your business?
                  </p>
                </div>
              </div>

          {/* User message — always shown (typing or complete) */}
          {userProgress > 0 && (
            <UserBubble text={visibleUser} showCursor={showUserCursor} />
          )}

          {/* Thinking dots */}
          {phase === "thinking" && <ThinkingDots />}

          {/* Ava message — shown during typing-ava / hold / fade-out */}
          {(phase === "typing-ava" ||
            phase === "hold" ||
            phase === "fade-out") && (
            <AvaBubble
              text={visibleAva || " "}
              showCursor={showAvaCursor}
              chip={scenario.chip}
              onChipClick={() => setModalOpen(true)}
              onChipHoverChange={setChipHovered}
            />
          )}
        </div>

            {/* Footer / composer */}
            <div className="px-4 py-3 border-t border-[#1F1810]/6 bg-white flex items-center gap-2.5">
              <div className="flex-1 px-4 py-2.5 rounded-full bg-[#F5F0EB] text-xs text-[#A89279] truncate">
                Ask Ava anything about your business...
              </div>
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#D4893F] flex items-center justify-center text-white shadow-sm">
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

            {/* Home indicator */}
            <div className="flex justify-center pt-1 pb-2.5 bg-white">
              <span className="w-28 h-1 rounded-full bg-[#1F1810]/80" aria-hidden />
            </div>
          </div>
        </div>

        {/* Floating Attorney-verified badge — appears only during the
            delivery scenario, fades in/out with the scenario transition,
            and gently floats to keep the hero feeling alive. Lives inside
            the phone-width wrapper so it hugs the device's upper-right
            edge like an iOS notification, at every viewport width. */}
        <div
          className={`absolute top-24 -right-4 z-20 flex bg-white px-3.5 py-2.5 rounded-xl shadow-[0_10px_30px_rgba(31,24,16,0.12)] border border-[#F5F0EB] items-center gap-2 transition-opacity duration-500 ${
            scenario.kind === "delivery" && phase !== "fade-out"
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
          style={{
            animation:
              scenario.kind === "delivery" && !prefersReduced
                ? "avaFloat 3.6s ease-in-out infinite"
                : "none",
          }}
          aria-hidden={scenario.kind !== "delivery"}
        >
          <span className="relative flex items-center justify-center">
            <span
              className="absolute w-3.5 h-3.5 rounded-full bg-[#7A8B6F]/35"
              style={{
                animation: !prefersReduced ? "avaPulse 1.8s ease-in-out infinite" : "none",
              }}
              aria-hidden
            />
            <span className="relative w-2 h-2 rounded-full bg-[#7A8B6F] shadow-[0_0_8px_rgba(122,139,111,0.7)]" />
          </span>
          <span className="text-xs font-semibold text-[#1F1810]">
            Attorney-verified
          </span>
        </div>
      </div>

      {/* Scenario progress dots */}
      <div className="flex items-center justify-center gap-2 mt-5">
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

      {/* App Store proof line — the demo above is the actual app experience,
          and the app is live. Badge links to the listing. */}
      <div className="flex items-center justify-center gap-3 mt-4">
        <a
          href={APP_STORE_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 transition-opacity hover:opacity-80"
          aria-label="Download the Available Law app on the App Store"
        >
          <Image
            src="/images/app-store-badge.svg"
            alt="Download on the App Store"
            width={108}
            height={36}
          />
        </a>
        <p className="text-xs text-[#6B5B4E] leading-snug max-w-[190px]">
          This isn&apos;t a mockup — Ava is live in the{" "}
          <span className="font-semibold text-[#1F1810]">Available Law app</span>.
        </p>
      </div>

      {/* Component-scoped keyframes. Live here (not globals.css) so this demo
          is fully portable — drop the file in, everything works. */}
      <style jsx>{`
        @keyframes avaDot {
          0%, 80%, 100% {
            opacity: 0.25;
            transform: translateY(0);
          }
          40% {
            opacity: 1;
            transform: translateY(-3px);
          }
        }
        @keyframes avaCursor {
          0%, 50% {
            opacity: 1;
          }
          50.01%, 100% {
            opacity: 0;
          }
        }
        @keyframes avaFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }
        @keyframes avaPulse {
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

    {/* Redlined-lease preview modal. Opened from the document chip in Ava's
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
// inside Ava, not to render a real lease PDF.
// ----------------------------------------------------------------------------

function PreviewModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#1F1810]/60 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ava-preview-title"
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
                id="ava-preview-title"
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
            Demo preview. In Ava, attorney-verified deliverables land
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
