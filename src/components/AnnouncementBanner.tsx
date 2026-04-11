"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { X } from "lucide-react";

/**
 * Slim site-wide announcement banner for the Colorado AI Act Readiness Checker.
 *
 * Renders inside the Header so it sticks-to-top as part of the sticky chrome.
 * Dismissal is stored in localStorage under DISMISS_KEY — bump the version
 * suffix when the banner copy changes to re-show it to everyone.
 *
 * Uses useSyncExternalStore to read localStorage without cascading renders
 * from setState-in-effect (React 19 rule: react-hooks/set-state-in-effect).
 */

const DISMISS_KEY = "al-announcement-dismissed-v1";
const DISMISS_EVENT = "al-announcement-dismissed";

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(DISMISS_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(DISMISS_EVENT, callback);
  };
}

function getSnapshot(): boolean {
  try {
    return window.localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

// On the server we render as dismissed (banner hidden) to avoid a hydration
// mismatch; the client store will flip to the real value on mount.
function getServerSnapshot(): boolean {
  return true;
}

export default function AnnouncementBanner() {
  const dismissed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const dismiss = () => {
    try {
      window.localStorage.setItem(DISMISS_KEY, "1");
      window.dispatchEvent(new Event(DISMISS_EVENT));
    } catch {
      // ignore
    }
  };

  if (dismissed) return null;

  return (
    <div className="bg-[#1F1810] text-[#FAF8F5] border-b border-[#C17832]/40">
      <div className="relative px-12 py-2">
        <p className="text-[13px] md:text-sm leading-snug text-center">
          <span className="hidden sm:inline font-semibold text-[#F2B870] mr-2">
            Colorado AI Act →
          </span>
          <span className="sm:hidden font-semibold text-[#F2B870] mr-1">
            CO AI Act →
          </span>
          Is your business ready for 2026?{" "}
          <Link
            href="/ai-act-checker"
            className="underline decoration-[#C17832]/60 hover:decoration-[#F2B870] font-medium whitespace-nowrap"
          >
            Take the free 2-min assessment
          </Link>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss announcement"
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
