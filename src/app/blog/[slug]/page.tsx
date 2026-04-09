"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  // Map slug to post metadata (in production, this would come from a CMS or database)
  const postMetadata: Record<string, { title: string; date: string; author: string; excerpt: string }> = {
    "5-ai-vendor-contract-clauses": {
      title: "5 AI Vendor Contract Clauses Your Company Is Missing",
      date: "April 7, 2026",
      author: "Zachariah Crabill, JD",
      excerpt:
        "Most companies don't protect themselves adequately when contracting with AI vendors. Learn the critical clauses you need to include in your vendor agreements.",
    },
    "colorado-ai-act-2026": {
      title: "Colorado's AI Act: What Businesses Need to Know in 2026",
      date: "April 2, 2026",
      author: "Zachariah Crabill, JD",
      excerpt: "Colorado's new AI legislation sets a precedent for responsible AI use.",
    },
    "document-ai-decision-making": {
      title: "How to Document AI Decision-Making for Compliance",
      date: "March 28, 2026",
      author: "Zachariah Crabill, JD",
      excerpt:
        "Documentation is critical for AI compliance. This guide walks you through building a practical system for tracking AI decisions.",
    },
  };

  const post = postMetadata[params.slug];

  if (!post) {
    return (
      <>
        <Header />
        <main className="bg-[#0f0f14] min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-3xl text-[#f0f0f5] mb-4">Post not found</h1>
            <Link href="/blog" className="text-[#f59e0b] hover:text-[#fbbf24]">
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
      <Header />
      <main className="bg-[#0f0f14] min-h-screen">
        {/* Back link */}
        <div className="w-full bg-[#0f0f14] border-b border-white/[0.06]">
          <div className="max-w-[800px] mx-auto px-6 md:px-8 py-6">
            <Link href="/blog" className="text-[#f59e0b] hover:text-[#fbbf24] text-[14px] font-medium">
              ← Back to blog
            </Link>
          </div>
        </div>

        {/* Article header */}
        <article className="w-full">
          <div className="max-w-[800px] mx-auto px-6 md:px-8 py-16 md:py-24">
            {/* Meta */}
            <div className="mb-8">
              <p className="text-[#f59e0b] text-[12px] font-semibold tracking-widest uppercase mb-3">
                AI Legal
              </p>
              <h1
                className="font-heading text-4xl md:text-5xl text-[#f0f0f5] mb-4 leading-tight"
                style={{ fontWeight: 400 }}
              >
                {post.title}
              </h1>
              <div className="flex items-center gap-4 pt-4 border-t border-white/[0.06]">
                <p className="text-[#9898a8] text-[14px]">
                  <span className="text-[#f0f0f5] font-medium">{post.author}</span>
                </p>
                <span className="text-[#52525b]">•</span>
                <p className="text-[#9898a8] text-[14px]">{post.date}</p>
              </div>
            </div>

            {/* Article excerpt */}
            <div className="bg-[#17171e] border border-white/[0.06] rounded-lg p-6 md:p-8 mb-12">
              <p className="text-[#a1a1aa] text-lg leading-relaxed">{post.excerpt}</p>
            </div>

            {/* Article content placeholder */}
            <div className="prose prose-invert max-w-none mb-16">
              <div className="text-[#9898a8] leading-relaxed space-y-6 text-[15px]">
                <p>
                  Article content will be loaded from markdown files. The slug "<code className="text-[#f59e0b] bg-[#17171e] px-2 py-1 rounded">{params.slug}</code>" maps to the corresponding markdown file in <code className="text-[#f59e0b] bg-[#17171e] px-2 py-1 rounded">/content/blog/</code>.
                </p>

                <div className="bg-[#17171e] border border-white/[0.08] rounded-lg p-6 mt-8">
                  <h3 className="font-heading text-[#f0f0f5] text-xl mb-3" style={{ fontWeight: 400 }}>
                    Coming Soon
                  </h3>
                  <p className="text-[#a1a1aa] text-[14px]">
                    The full article content for "{post.title}" will be displayed here. In a production environment, this page would:
                  </p>
                  <ul className="list-disc list-inside text-[#a1a1aa] text-[14px] mt-3 space-y-2">
                    <li>Load markdown from <code className="text-[#f59e0b] bg-black/30 px-1">/content/blog/{params.slug}.md</code></li>
                    <li>Parse frontmatter metadata (title, date, author, etc.)</li>
                    <li>Render markdown content with proper styling</li>
                    <li>Include suggested posts at the end</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* CTA section */}
            <div className="bg-gradient-to-r from-[#17171e] to-[#1f1f28] border border-white/[0.06] rounded-lg p-8 md:p-12 text-center">
              <h3 className="font-heading text-2xl text-[#f0f0f5] mb-3" style={{ fontWeight: 400 }}>
                Need AI Legal Guidance?
              </h3>
              <p className="text-[#9898a8] mb-6 leading-relaxed">
                Get personalized advice on AI compliance, contracts, and risk management from Zachariah Crabill, JD.
              </p>
              <button
                className="btn-al btn-al-primary text-[13px] px-6 py-3"
              >
                Schedule a Consultation
              </button>
            </div>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
