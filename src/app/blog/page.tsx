import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";
import JsonLd from "@/components/JsonLd";
import { breadcrumbSchema } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Colorado AI Act & Small Business Legal Blog",
  description:
    "Plain-language analysis of the Colorado AI Act (SB 26-189), AI vendor contracts, FAIIR compliance, and small-business legal questions — written by Zachariah Crabill, JD, founder of Available Law.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: "Colorado AI Act & Small Business Legal Blog | Available Law",
    description:
      "Plain-language analysis of the Colorado AI Act, AI vendor contracts, FAIIR compliance, and small-business legal questions, written by a Colorado attorney.",
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
    slug: "subscription-legal-services-small-business",
    title: "Subscription Legal Services for Small Business: How Flat-Rate Legal Plans Actually Work",
    date: "June 25, 2026",
    excerpt:
      "Subscription legal services replace the unpredictable hourly bill with a flat monthly fee for the legal work a small business actually uses. How the model works, what it costs, and whether it fits your business.",
  },
  {
    slug: "ai-business-consulting-vs-legal-counsel",
    title: "AI Business Consulting vs. AI Legal Counsel: What Your Small Business Actually Needs",
    date: "June 25, 2026",
    excerpt:
      "An AI consultant helps you adopt AI; an AI lawyer keeps it legal. Where consulting ends, where legal counsel begins, and how to cover both without two enterprise retainers.",
  },
  {
    slug: "small-business-lawyer-cost-colorado",
    title: "How Much Does a Small Business Lawyer Cost in 2026?",
    date: "June 25, 2026",
    excerpt:
      "A plain breakdown of the four ways lawyers charge — hourly, flat-fee, retainer, and subscription — what each actually costs, and how to estimate your annual legal spend before you commit.",
  },
  {
    slug: "ai-small-business-legal-checklist-2026",
    title: "Using AI in Your Small Business: A 2026 Legal Checklist",
    date: "June 25, 2026",
    excerpt:
      "Adopting AI is easy; staying on the right side of the law is the part most businesses skip. An eight-step checklist — vendor contracts, data privacy, AI policy, and the Colorado AI Act.",
  },
  {
    slug: "colorado-ai-act-rewrite-2026-smb-impact",
    title: "Colorado Just Rewrote Its AI Law — What It Means for Your Small Business",
    date: "May 22, 2026 (Updated June 10, 2026)",
    excerpt:
      "Governor Polis signed SB 26-189 on May 14, 2026, replacing the Colorado AI Act with a lighter framework effective January 1, 2027. But the original act — legal services and all — still takes effect June 30, 2026, with enforcement paused. Here's what actually changed and what Colorado SMBs should do this week.",
  },
  {
    slug: "what-is-faiir-framework",
    title: "What Is the FAIIR Framework? AI Compliance for Colorado Businesses",
    date: "April 11, 2026",
    excerpt:
      "FAIIR is the Foundation for AI Integrity & Regulation — five pillars (Fitness for Purpose, Accountability, Integrity of Data, Informed Use, Risk Management) built to help Colorado businesses meet the Colorado AI Act and the wider AI-regulation patchwork.",
  },
  {
    slug: "ai-liability-insurance-coverage",
    title: "Does Your Business Insurance Cover AI Liability?",
    date: "April 11, 2026",
    excerpt:
      "Most business insurance policies weren't written for AI risk. Here's a policy-by-policy breakdown of what's covered, what's not, and what to do about the gaps.",
  },
  {
    slug: "when-small-business-needs-lawyer",
    title: "When Does Your Small Business Actually Need a Lawyer?",
    date: "April 10, 2026",
    excerpt:
      "Most small business owners avoid lawyers until something goes wrong. Here are the specific moments where getting legal help early saves you money.",
  },
  {
    slug: "colorado-llc-operating-agreement",
    title: "Colorado LLC Operating Agreements: What You Need and Why",
    date: "April 9, 2026",
    excerpt:
      "Colorado doesn't require a written operating agreement for LLCs. That's exactly why you need one. Here's what to include and what happens when you skip it.",
  },
  {
    slug: "how-to-choose-business-attorney-colorado",
    title: "How to Choose a Small Business Attorney in Colorado",
    date: "April 8, 2026",
    excerpt:
      "Choosing a Colorado small-business attorney is more than checking credentials. Seven criteria — pricing model, response time, industry fit, and more — that predict whether an attorney will actually be useful.",
  },
  {
    slug: "5-ai-vendor-contract-clauses",
    title: "5 AI Vendor Contract Clauses Your Company Is Missing",
    date: "April 7, 2026",
    excerpt:
      "Most AI vendor contracts leave the deployer holding the bag on training-data liability, IP ownership, bias audits, and Colorado AI Act compliance. Five clauses to add before you sign.",
  },
  {
    slug: "colorado-ai-act-2026",
    title: "Colorado AI Act 2026: The Plain-Language Guide for Businesses",
    date: "Updated June 10, 2026",
    excerpt:
      "SB 26-189 — the repeal-and-replace of the original Colorado AI Act — was signed May 14, 2026 and takes effect January 1, 2027, while the original act still takes effect June 30, 2026 with enforcement paused. What your business actually owes, and what governs the rest of 2026.",
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
