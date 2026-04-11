import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "AI Legal Insights — Blog",
  description:
    "Plain-language analysis of the Colorado AI Act, AI vendor contracts, and compliance documentation from Available Law — a Colorado virtual law firm focused on AI regulation.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: "AI Legal Insights — Available Law Blog",
    description:
      "Plain-language analysis of the Colorado AI Act, AI vendor contracts, and compliance documentation from Available Law.",
  },
};

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

const blogPosts: BlogPost[] = [
  {
    slug: "5-ai-vendor-contract-clauses",
    title: "5 AI Vendor Contract Clauses Your Company Is Missing",
    date: "April 7, 2026",
    excerpt:
      "Most companies don't protect themselves adequately when contracting with AI vendors. Learn the critical clauses you need to include in your vendor agreements.",
  },
  {
    slug: "colorado-ai-act-2026",
    title: "Colorado's AI Act: What Businesses Need to Know in 2026",
    date: "April 2, 2026",
    excerpt:
      "Colorado's new AI legislation sets a precedent for responsible AI use. Discover what compliance means for your business and how to prepare.",
  },
  {
    slug: "document-ai-decision-making",
    title: "How to Document AI Decision-Making for Compliance",
    date: "March 28, 2026",
    excerpt:
      "Documentation is critical for AI compliance. This guide walks you through building a practical system for tracking AI decisions and their outcomes.",
  },
];

export default function BlogPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Blog", url: "/blog" },
        ])}
      />
      <Header />
      <main className="bg-[#FAF8F5] min-h-screen">
        {/* Blog header */}
        <section className="w-full bg-gradient-to-b from-[#FAF8F5] to-[#FAF8F5] border-b border-[#1F1810]/8">
          <div className="max-w-[1200px] mx-auto px-6 md:px-8 py-20 md:py-32">
            <div className="section-divider"></div>
            <h1
              className="font-heading text-4xl md:text-5xl text-[#1F1810] mb-4 leading-tight"
              style={{ fontWeight: 400 }}
            >
              AI Legal Insights
            </h1>
            <p className="text-[#6B5B4E] text-lg max-w-[600px] leading-relaxed">
              Practical guidance on AI compliance, vendor contracts, and building responsible AI
              systems for your business.
            </p>
          </div>
        </section>

        {/* Blog posts grid */}
        <section className="w-full py-16 md:py-24">
          <div className="max-w-[1200px] mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {blogPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blog/${post.slug}`}
                  className="group"
                >
                  <div className="bg-white border border-[#1F1810]/8 rounded-[20px] p-6 md:p-8 h-full flex flex-col justify-between transition-all duration-300 hover:bg-[#F5F0EB] cursor-pointer">
                    {/* Content */}
                    <div className="flex-1">
                      <p className="text-[#C17832] text-[12px] font-semibold tracking-widest uppercase mb-3">
                        AI Legal
                      </p>
                      <h2 className="font-heading text-lg md:text-xl text-[#1F1810] mb-3 leading-snug group-hover:text-[#D4893F] transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-[#6B5B4E] text-[14px] leading-relaxed mb-4">
                        {post.excerpt}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#1F1810]/8">
                      <p className="text-[#A89279] text-[12px]">{post.date}</p>
                      <span className="text-[#C17832] text-[14px] font-medium group-hover:translate-x-1 transition-transform">
                        Read →
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA section */}
        <section className="w-full py-16 md:py-24 border-t border-[#1F1810]/8">
          <div className="max-w-[800px] mx-auto px-6 md:px-8 text-center">
            <h2 className="font-heading text-3xl md:text-4xl text-[#1F1810] mb-4" style={{ fontWeight: 400 }}>
              Need AI Legal Guidance?
            </h2>
            <p className="text-[#6B5B4E] text-lg mb-8 leading-relaxed">
              Get personalized advice on AI compliance, vendor contracts, and risk management from a
              Colorado attorney who specializes in AI law.
            </p>
            <Link
              href="/#pricing"
              className="btn-al btn-al-primary text-[13px] px-6 py-3 inline-block"
            >
              Explore FAIIR Services
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
