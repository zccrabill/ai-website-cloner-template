"use client";

import { useEffect, useState } from "react";

/**
 * FooterTerminal — a thin terminal-style row in the footer that types
 * out short legal aphorisms one at a time, holds, deletes, and moves to
 * the next. Pure aesthetic detail meant to signal craft to anyone who
 * scrolls all the way down.
 *
 * No animation libraries — just setState + setTimeout. Cycles through
 * the APHORISMS array indefinitely.
 */
const APHORISMS = [
  "Boilerplate is where deals quietly die.",
  "Read every clause your future self has to live with.",
  "Risk is just a contract you did not read.",
  "Good law is mostly good documentation.",
  "The fastest path through compliance is the documented one.",
  "Most disputes start where the contract was vague.",
  "AI does not change the law. The law changes how AI is deployed.",
  "The contract you sign at 11pm is the one that bites at 9am.",
  "Every signature is a forecast.",
];

type Phase = "typing" | "holding" | "deleting";

export default function FooterTerminal() {
  const [aphorismIndex, setAphorismIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [phase, setPhase] = useState<Phase>("typing");

  useEffect(() => {
    const target = APHORISMS[aphorismIndex];

    if (phase === "typing") {
      if (displayedText.length < target.length) {
        const t = setTimeout(
          () => setDisplayedText(target.slice(0, displayedText.length + 1)),
          35
        );
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("holding"), 3500);
      return () => clearTimeout(t);
    }

    if (phase === "holding") {
      const t = setTimeout(() => setPhase("deleting"), 800);
      return () => clearTimeout(t);
    }

    if (phase === "deleting") {
      if (displayedText.length > 0) {
        const t = setTimeout(
          () => setDisplayedText(displayedText.slice(0, -1)),
          18
        );
        return () => clearTimeout(t);
      }
      // Empty-text transition: schedule the move to the next aphorism via a
      // setTimeout so React commits the empty-text render before we restart
      // the typing phase. Avoids the React 19 set-state-in-effect warning
      // and adds a barely-perceptible breath between aphorisms.
      const t = setTimeout(() => {
        setAphorismIndex((i) => (i + 1) % APHORISMS.length);
        setPhase("typing");
      }, 120);
      return () => clearTimeout(t);
    }
  }, [phase, displayedText, aphorismIndex]);

  return (
    <div className="border-t border-[#1F1810]/8">
      <div className="max-w-[1200px] mx-auto px-8 py-3 flex items-center gap-3 text-xs text-[#6B5B4E] font-mono">
        <span className="text-[#C17832] select-none">$</span>
        <span className="min-h-[1em]" aria-live="off">
          {displayedText}
          <span className="inline-block w-[2px] h-[12px] bg-[#C17832] ml-0.5 align-middle animate-pulse" />
        </span>
      </div>
    </div>
  );
}
