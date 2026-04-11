import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Required by Next 16 when next.config.js uses `output: "export"`.
// Without this, `next build` refuses to statically generate /sitemap.xml.
export const dynamic = "force-static";

/**
 * Blog post slugs + ISO dates. Kept here instead of importing from the blog
 * route file because Next's sitemap generation runs at build time and can't
 * easily round-trip a server component's internal state. When you add a post,
 * add it here too.
 */
const BLOG_POSTS: Array<{ slug: string; isoDate: string }> = [
  { slug: "5-ai-vendor-contract-clauses", isoDate: "2026-04-07" },
  { slug: "colorado-ai-act-2026", isoDate: "2026-04-02" },
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
      url: `${SITE_URL}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  const blogRoutes: MetadataRoute.Sitemap = BLOG_POSTS.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.isoDate,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...blogRoutes];
}
