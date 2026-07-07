import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { CITIES } from "@/content/city/cityData";

// Required by Next 16 when next.config.js uses `output: "export"`.
// Without this, `next build` refuses to statically generate /sitemap.xml.
export const dynamic = "force-static";

/**
 * Blog post slugs + ISO dates. Kept here instead of importing from the blog
 * route file because Next's sitemap generation runs at build time and can't
 * easily round-trip a server component's internal state. When you add a post,
 * add it here too.
 */
// Each entry tracks both publish date and last modification. `lastMod` is what
// we hand to Google's sitemap; it should equal the later of the two so crawlers
// know when to recrawl.
const BLOG_POSTS: Array<{ slug: string; isoDate: string; lastMod?: string }> = [
  { slug: "can-a-minor-start-a-business-in-colorado", isoDate: "2026-07-07" },
  { slug: "colorado-ai-act-in-effect-2026", isoDate: "2026-07-01" },
  { slug: "colorado-ai-rules-public-comment-2026", isoDate: "2026-07-01" },
  { slug: "ai-hiring-tools-colorado-law", isoDate: "2026-07-01" },
  { slug: "colorado-chatbot-law-hb26-1263", isoDate: "2026-07-01" },
  { slug: "subscription-legal-services-small-business", isoDate: "2026-06-25" },
  { slug: "ai-business-consulting-vs-legal-counsel", isoDate: "2026-06-25" },
  { slug: "small-business-lawyer-cost-colorado", isoDate: "2026-06-25" },
  { slug: "ai-small-business-legal-checklist-2026", isoDate: "2026-06-25" },
  { slug: "colorado-ai-act-rewrite-2026-smb-impact", isoDate: "2026-05-22", lastMod: "2026-06-10" },
  { slug: "what-is-faiir-framework", isoDate: "2026-04-11", lastMod: "2026-06-10" },
  { slug: "ai-liability-insurance-coverage", isoDate: "2026-04-11" },
  { slug: "when-small-business-needs-lawyer", isoDate: "2026-04-10" },
  { slug: "colorado-llc-operating-agreement", isoDate: "2026-04-09" },
  { slug: "how-to-choose-business-attorney-colorado", isoDate: "2026-04-08" },
  { slug: "5-ai-vendor-contract-clauses", isoDate: "2026-04-07" },
  { slug: "colorado-ai-act-2026", isoDate: "2026-04-02", lastMod: "2026-06-10" },
  { slug: "document-ai-decision-making", isoDate: "2026-03-28" },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/faiir`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/ai-act-checker`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/ylab`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/sidebar`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/about/zachariah-crabill`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/colorado`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const cityRoutes: MetadataRoute.Sitemap = CITIES.map((c) => ({
    url: `${SITE_URL}/colorado/${c.slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.lastMod ?? post.isoDate,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...cityRoutes, ...blogRoutes];
}
