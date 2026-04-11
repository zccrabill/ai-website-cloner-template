import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import {
  SITE_URL,
  blogPostingSchema,
  breadcrumbSchema,
  DEFAULT_OG_IMAGE,
} from "@/lib/seo";

interface PostMeta {
  title: string;
  date: string; // human-readable display date
  isoDate: string; // ISO 8601 for schema + metadata
  author: string;
  excerpt: string;
}

const postMetadata: Record<string, PostMeta> = {
  "5-ai-vendor-contract-clauses": {
    title: "5 AI Vendor Contract Clauses Your Company Is Missing",
    date: "April 7, 2026",
    isoDate: "2026-04-07",
    author: "Zachariah Crabill, JD",
    excerpt:
      "Most companies don't protect themselves adequately when contracting with AI vendors. Learn the critical clauses you need to include in your vendor agreements.",
  },
  "colorado-ai-act-2026": {
    title: "Colorado's AI Act: What Businesses Need to Know in 2026",
    date: "April 2, 2026",
    isoDate: "2026-04-02",
    author: "Zachariah Crabill, JD",
    excerpt:
      "Colorado's new AI legislation sets a precedent for responsible AI use.",
  },
  "document-ai-decision-making": {
    title: "How to Document AI Decision-Making for Compliance",
    date: "March 28, 2026",
    isoDate: "2026-03-28",
    author: "Zachariah Crabill, JD",
    excerpt:
      "Documentation is critical for AI compliance. This guide walks you through building a practical system for tracking AI decisions.",
  },
};

export function generateStaticParams() {
  return Object.keys(postMetadata).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = postMetadata[slug];
  if (!post) {
    return { title: "Post not found" };
  }
  const url = `${SITE_URL}/blog/${slug}`;
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    // Placeholder content — excluded from search indexing until the full article is published.
    // Remove `robots` once real content ships and re-add the slug to sitemap.ts.
    robots: {
      index: false,
      follow: true,
      googleBot: {
        index: false,
        follow: true,
      },
    },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.excerpt,
      publishedTime: post.isoDate,
      authors: [post.author],
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = postMetadata[slug];

  if (!post) {
    return (
      <>
        <Header />
        <main className="bg-[#FAF8F5] min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-3xl text-[#1F1810] mb-4">
              Post not found
            </h1>
            <Link
              href="/blog"
              className="text-[#C17832] hover:text-[#D4893F]"
            >
              Back to blog
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <JsonLd
        data={[
          blogPostingSchema({
            slug,
            title: post.title,
            description: post.excerpt,
            datePublished: post.isoDate,
            authorName: post.author,
          }),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Blog", url: "/blog" },
            { name: post.title, url: `/blog/${slug}` },
          ]),
        ]}
      />
      <Header />
      <main className="bg-[#FAF8F5] min-h-screen">
        {/* Back link */}
        <div className="w-full bg-[#FAF8F5] border-b border-[#1F1810]/8">
          <div className="max-w-[800px] mx-auto px-6 md:px-8 py-6">
            <Link
              href="/blog"
              className="text-[#C17832] hover:text-[#D4893F] text-[14px] font-medium"
            >
              &larr; Back to blog
            </Link>
          </div>
        </div>

        {/* Article header */}
        <article className="w-full">
          <div className="max-w-[800px] mx-auto px-6 md:px-8 py-16 md:py-24">
            {/* Meta */}
            <div className="mb-8">
              <p className="text-[#C17832] text-[12px] font-semibold tracking-widest uppercase mb-3">
                AI Legal
              </p>
              <h1
                className="font-heading text-4xl md:text-5xl text-[#1F1810] mb-4 leading-tight"
                style={{ fontWeight: 400 }}
              >
                {post.title}
              </h1>
              <div className="flex items-center gap-4 pt-4 border-t border-[#1F1810]/8">
                <p className="text-[#6B5B4E] text-[14px]">
                  <span className="text-[#1F1810] font-medium">
                    {post.author}
                  </span>
                </p>
                <span className="text-[#A89279]">&bull;</span>
                <p className="text-[#6B5B4E] text-[14px]">{post.date}</p>
              </div>
            </div>

            {/* Article excerpt */}
            <div className="bg-[#F5F0EB] border border-[#1F1810]/8 rounded-lg p-6 md:p-8 mb-12">
              <p className="text-[#6B5B4E] text-lg leading-relaxed">
                {post.excerpt}
              </p>
            </div>

            {/* Article content placeholder */}
            <div className="prose prose-light max-w-none mb-16">
              <div className="text-[#6B5B4E] leading-relaxed space-y-6 text-[15px]">
                <p>
                  Article content will be loaded from markdown files. The slug
                  &ldquo;
                  <code className="text-[#C17832] bg-[#F5F0EB] px-2 py-1 rounded">
                    {slug}
                  </code>
                  &rdquo; maps to the corresponding markdown file in{" "}
                  <code className="text-[#C17832] bg-[#F5F0EB] px-2 py-1 rounded">
                    /content/blog/
                  </code>
                  .
                </p>

                <div className="bg-[#F5F0EB] border border-[#1F1810]/8 rounded-lg p-6 mt-8">
                  <h3
                    className="font-heading text-[#1F1810] text-xl mb-3"
                    style={{ fontWeight: 400 }}
                  >
                    Coming Soon
                  </h3>
                  <p className="text-[#6B5B4E] text-[14px]">
                    The full article content for &ldquo;{post.title}&rdquo; will
                    be displayed here.
                  </p>
                </div>
              </div>
            </div>

            {/* CTA section */}
            <div className="bg-gradient-to-r from-[#F5F0EB] to-[#FFFFFF] border border-[#1F1810]/8 rounded-lg p-8 md:p-12 text-center">
              <h3
                className="font-heading text-2xl text-[#1F1810] mb-3"
                style={{ fontWeight: 400 }}
              >
                Need AI Legal Guidance?
              </h3>
              <p className="text-[#6B5B4E] mb-6 leading-relaxed">
                Get personalized advice on AI compliance, contracts, and risk
                management from Zachariah Crabill, JD.
              </p>
              <Link
                href="/#pricing"
                className="btn-al btn-al-primary text-[13px] px-6 py-3 inline-block"
              >
                Schedule a Consultation
              </Link>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
