"use client";

import { useEffect } from "react";
import { regenScrollTo } from "@/lib/regenScroll";

/**
 * Global click interceptor. Mounted once in app/layout.tsx so every
 * in-page anchor click on the site routes through regenScrollTo()
 * instead of the browser default.
 *
 * Matches both "#section" and "/#section" hrefs (the latter only when
 * already on the home page — cross-page navigations stay native so
 * Next.js routing isnt disrupted).
 *
 * Skips clicks with modifier keys (Cmd/Ctrl/Shift/Alt) and non-left
 * buttons so opening links in new tabs etc. still works normally.
 */
export default function RegenScrollGlobalHandler() {
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      const anchor = target.closest("a") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      let hash: string | null = null;
      if (href.startsWith("#")) {
        hash = href.slice(1);
      } else if (href.startsWith("/#") && window.location.pathname === "/") {
        hash = href.slice(2);
      }

      if (!hash) return;

      const el = document.getElementById(hash);
      if (!el) return;

      e.preventDefault();
      window.history.pushState(null, "", "#" + hash);
      regenScrollTo(el);
    }

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return null;
}
