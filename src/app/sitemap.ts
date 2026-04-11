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
 *
 * NOTE (2026-04-10): The three existing posts are placeholders and are currently
 * noindexed in their metadata. They're excluded from the sitemap until real
 * article content ships — then re-enable by moving entries back into BLOG_POSTS
 * and removing `robots: { index: false }` from `blog/[slug]/page.tsx`.
 */
const BLOG_POSTS: Array<{ slug: string; isoDate: string }> = [];

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
