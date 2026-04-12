import type { Metadata } from "next";
import type { ReactNode } from "react";
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
import ColoradoAiAct2026Article from "@/content/blog/colorado-ai-act-2026";
import AiVendorContractClausesArticle from "@/content/blog/5-ai-vendor-contract-clauses";
import DocumentAiDecisionMakingArticle from "@/content/blog/document-ai-decision-making";
import AiEmployeeTrainingRequirementsArticle from "@/content/blog/ai-employee-training-requirements";
import WhatIsFaiirFrameworkArticle from "@/content/blog/what-is-faiir-framework";
import AiLiabilityInsuranceCoverageArticle from "@/content/blog/ai-liability-insurance-coverage";
import WhenSmallBusinessNeedsLawyerArticle from "@/content/blog/when-small-business-needs-lawyer";
import ColoradoLlcOperatingAgreementArticle from "@/content/blog/colorado-llc-operating-agreement";
import HowToChooseBusinessAttorneyColoradoArticle from "@/content/blog/how-to-choose-business-attorney-colorado";

interface PostMeta {
  title: string;
  date: string; // human-readable display date
  isoDate: string; // ISO 8601 for schema + metadata
  author: string;
  excerpt: string;
}

// Slug → rendered article body. Each component is a collection of typography
// primitives (H2, P, UL, etc.) exported as a default component from
// src/content/blog/*.tsx. Keeping the mapping centralized here means adding a
// new post is: (1) create the .tsx file under src/content/blog, (2) register
// metadata above, (3) register the component here, (4) add to sitemap.ts.
const postContent: Record<string, ReactNode> = {
  "colorado-ai-act-2026": <ColoradoAiAct2026Article />,
  "5-ai-vendor-contract-clauses": <AiVendorContractClausesArticle />,
  "document-ai-decision-making": <DocumentAiDecisionMakingArticle />,
  "ai-employee-training-requirements": <AiEmployeeTrainingRequirementsArticle />,
  "what-is-faiir-framework": <WhatIsFaiirFrameworkArticle />,
  "ai-liability-insurance-coverage": <AiLiabilityInsuranceCoverageArticle />,
  "when-small-business-needs-lawyer": <WhenSmallBusinessNeedsLawyerArticle />,
  "colorado-llc-operating-agreement": <ColoradoLlcOperatingAgreementArticle />,
  "how-to-choose-business-attorney-colorado": <HowToChooseBusinessAttorneyColoradoArticle />,
};

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
  "ai-employee-training-requirements": {
    title: "AI Employee Training Requirements Under the Colorado AI Act",
    date: "April 11, 2026",
    isoDate: "2026-04-11",
    author: "Zachariah Crabill, JD",
    excerpt:
      "The Colorado AI Act requires businesses to train employees who interact with high-risk AI systems. Here's what the law actually requires and how to build a compliant training program.",
  },
  "what-is-faiir-framework": {
    title: "What Is the FAIIR Framework? AI Compliance for Colorado Businesses",
    date: "April 11, 2026",
    isoDate: "2026-04-11",
    author: "Zachariah Crabill, JD",
    excerpt:
      "FAIIR stands for Fairness, Accountability, Impact assessment, Informed consent, and Risk management. It's the compliance framework we built to help Colorado businesses meet the Colorado AI Act.",
  },
  "ai-liability-insurance-coverage": {
    title: "Does Your Business Insurance Cover AI Liability?",
    date: "April 11, 2026",
    isoDate: "2026-04-11",
    author: "Zachariah Crabill, JD",
    excerpt:
      "Most business insurance policies weren't written for AI risk. Here's a policy-by-policy breakdown of what's covered, what's not, and what to do about the gaps.",
  },
  "when-small-business-needs-lawyer": {
    title: "When Does Your Small Business Actually Need a Lawyer?",
    date: "April 10, 2026",
    isoDate: "2026-04-10",
    author: "Zachariah Crabill, JD",
    excerpt:
      "Most small business owners avoid lawyers until something goes wrong. Here are the specific moments where getting legal help early saves you money — and the ones where DIY is fine.",
  },
  "colorado-llc-operating-agreement": {
    title: "Colorado LLC Operating Agreements: What You Need and Why",
    date: "April 9, 2026",
    isoDate: "2026-04-09",
    author: "Zachariah Crabill, JD",
    excerpt:
      "Colorado doesn't require a written operating agreement for LLCs. That's exactly why you need one. Here's what to include and what happens when you skip it.",
  },
  "how-to-choose-business-attorney-colorado": {
    title: "How to Choose a Business Attorney in Colorado",
    date: "April 8, 2026",
    isoDate: "2026-04-08",
    author: "Zachariah Crabill, JD",
    excerpt:
      "Finding a business attorney isn't hard. Finding the right one — someone who understands your industry, charges fairly, and communicates clearly — is a different problem.",
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

            {/* Article body */}
            <div className="max-w-none mb-16">{postContent[slug]}</div>

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
