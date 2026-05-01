"use client";

import { useEffect } from "react";

/**
 * KonamiCode — global keyboard listener for the classic
 * Up Up Down Down Left Right Left Right B A sequence. On match,
 * dispatches the same allora:open custom event the Pricing band and
 * {ai} logo egg use, so the floating widget pops with a fun seed prompt.
 *
 * Skips keystrokes typed inside inputs/textareas/contenteditable so the
 * Allora chat input itself doesnt accidentally trigger it.
 */
const KONAMI_CODE = [
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight",
  "ArrowLeft", "ArrowRight",
  "b", "a",
];

export default function KonamiCode() {
  useEffect(() => {
    let buffer: string[] = [];

    function handleKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      buffer.push(key);
      if (buffer.length > KONAMI_CODE.length) {
        buffer = buffer.slice(-KONAMI_CODE.length);
      }

      if (
        buffer.length === KONAMI_CODE.length &&
        buffer.every((k, i) => k === KONAMI_CODE[i])
      ) {
        window.dispatchEvent(
          new CustomEvent("allora:open", {
            detail: {
              seed:
                "Wait — you actually did the Konami code? That is 30+ years of muscle memory in motion. So... what is the legal question?",
            },
          })
        );
        buffer = [];
      }
    }

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  return null;
}
