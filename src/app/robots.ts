import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

/**
 * robots.txt for availablelaw.com.
 *
 * Allows all major crawlers — including AI crawlers (GPTBot, ClaudeBot,
 * PerplexityBot, Google-Extended) — because the whole point of this site
 * is to be discoverable by people searching for AI legal services, and
 * modern AI search surfaces are a significant traffic source.
 *
 * Dashboard and auth pages are excluded from indexing.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/login", "/onboarding", "/auth/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
