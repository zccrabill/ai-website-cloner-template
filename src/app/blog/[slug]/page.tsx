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
  faqPageSchema,
  DEFAULT_OG_IMAGE,
} from "@/lib/seo";
import ColoradoAiAct2026Article from "@/content/blog/colorado-ai-act-2026";
import ColoradoAiActRewrite2026SmbImpactArticle from "@/content/blog/colorado-ai-act-rewrite-2026-smb-impact";
import AiVendorContractClausesArticle from "@/content/blog/5-ai-vendor-contract-clauses";
import DocumentAiDecisionMakingArticle from "@/content/blog/document-ai-decision-making";
import WhatIsFaiirFrameworkArticle from "@/content/blog/what-is-faiir-framework";
import AiLiabilityInsuranceCoverageArticle from "@/content/blog/ai-liability-insurance-coverage";
import WhenSmallBusinessNeedsLawyerArticle from "@/content/blog/when-small-business-needs-lawyer";
import ColoradoLlcOperatingAgreementArticle from "@/content/blog/colorado-llc-operating-agreement";
import HowToChooseBusinessAttorneyColoradoArticle from "@/content/blog/how-to-choose-business-attorney-colorado";
import SubscriptionLegalServicesArticle from "@/content/blog/subscription-legal-services-small-business";
import AiBusinessConsultingVsLegalCounselArticle from "@/content/blog/ai-business-consulting-vs-legal-counsel";
import SmallBusinessLawyerCostArticle from "@/content/blog/small-business-lawyer-cost-colorado";
import AiSmallBusinessLegalChecklistArticle from "@/content/blog/ai-small-business-legal-checklist-2026";
import ColoradoAiActInEffect2026Article from "@/content/blog/colorado-ai-act-in-effect-2026";
import ColoradoAiRulesPublicComment2026Article from "@/content/blog/colorado-ai-rules-public-comment-2026";
import AiHiringToolsColoradoLawArticle from "@/content/blog/ai-hiring-tools-colorado-law";
import ColoradoChatbotLawArticle from "@/content/blog/colorado-chatbot-law-hb26-1263";
import CanAMinorStartABusinessInColoradoArticle from "@/content/blog/can-a-minor-start-a-business-in-colorado";

interface PostMeta {
  title: string;
  date: string; // human-readable display date
  isoDate: string; // ISO 8601 for schema + metadata (published)
  isoDateModified?: string; // ISO 8601 last update; falls back to isoDate
  author: string;
  excerpt: string;
  // Optional FAQ pairs. When present, a FAQPage JSON-LD block is emitted so the
  // post is eligible for Google AI Overviews / "People Also Ask" and LLM answer
  // engines. Keep these in sync with the visible FAQ section in the article body.
  faqs?: Array<{ question: string; answer: string }>;
}

// Slug → rendered article body. Each component is a collection of typography
// primitives (H2, P, UL, etc.) exported as a default component from
// src/content/blog/*.tsx. Keeping the mapping centralized here means adding a
// new post is: (1) create the .tsx file under src/content/blog, (2) register
// metadata above, (3) register the component here, (4) add to sitemap.ts.
const postContent: Record<string, ReactNode> = {
  "colorado-ai-act-2026": <ColoradoAiAct2026Article />,
  "colorado-ai-act-rewrite-2026-smb-impact": <ColoradoAiActRewrite2026SmbImpactArticle />,
  "5-ai-vendor-contract-clauses": <AiVendorContractClausesArticle />,
  "document-ai-decision-making": <DocumentAiDecisionMakingArticle />,
  "what-is-faiir-framework": <WhatIsFaiirFrameworkArticle />,
  "ai-liability-insurance-coverage": <AiLiabilityInsuranceCoverageArticle />,
  "when-small-business-needs-lawyer": <WhenSmallBusinessNeedsLawyerArticle />,
  "colorado-llc-operating-agreement": <ColoradoLlcOperatingAgreementArticle />,
  "how-to-choose-business-attorney-colorado": <HowToChooseBusinessAttorneyColoradoArticle />,
  "subscription-legal-services-small-business": <SubscriptionLegalServicesArticle />,
  "ai-business-consulting-vs-legal-counsel": <AiBusinessConsultingVsLegalCounselArticle />,
  "small-business-lawyer-cost-colorado": <SmallBusinessLawyerCostArticle />,
  "ai-small-business-legal-checklist-2026": <AiSmallBusinessLegalChecklistArticle />,
  "colorado-ai-act-in-effect-2026": <ColoradoAiActInEffect2026Article />,
  "colorado-ai-rules-public-comment-2026": <ColoradoAiRulesPublicComment2026Article />,
  "ai-hiring-tools-colorado-law": <AiHiringToolsColoradoLawArticle />,
  "colorado-chatbot-law-hb26-1263": <ColoradoChatbotLawArticle />,
  "can-a-minor-start-a-business-in-colorado": <CanAMinorStartABusinessInColoradoArticle />,
};

const postMetadata: Record<string, PostMeta> = {
  "can-a-minor-start-a-business-in-colorado": {
    title: "Can a Minor Start a Business in Colorado? The Complete Legal Guide",
    date: "July 7, 2026",
    isoDate: "2026-07-07",
    author: "Zachariah Crabill, JD",
    excerpt:
      "Colorado lets minors hustle but not incorporate: LLC organizers must be 18 (C.R.S. § 7-80-203), minors' contracts are voidable, and the occasional-business law (SB19-103) only covers 84 days a year. A Colorado attorney's guide to the walls teen founders hit — and the structures that actually work.",
    faqs: [
      {
        question: "Can a minor own an LLC in Colorado?",
        answer:
          "Yes. Colorado law restricts who may organize an LLC — the organizer must be 18 or older under C.R.S. § 7-80-203 — but nothing prevents a minor from being a member (owner). The standard structure is a parent or guardian acting as organizer with the teen named as a member.",
      },
      {
        question: "Can a teenager sign a binding contract in Colorado?",
        answer:
          "Generally no. Colorado sets the age of competence to contract at 18 (C.R.S. § 13-22-101), and contracts signed by a minor are voidable at the minor's option. In practice counterparties require an adult to sign or co-sign.",
      },
      {
        question: "How old do you have to be to start a business in Colorado?",
        answer:
          "There is no minimum age to operate a business in Colorado, and SB19-103 (2019) bars local governments from requiring a license or permit for a business a minor operates on an occasional basis — no more than 84 days in a calendar year. Forming an LLC or corporation, however, requires an organizer or incorporator who is at least 18.",
      },
      {
        question: "Does a teen have to pay taxes on business income?",
        answer:
          "Yes. Net self-employment earnings of $400 or more in a year generally trigger a federal filing requirement and self-employment tax, regardless of the teen's age or dependent status.",
      },
      {
        question: "What is the most affordable way for a teen entrepreneur to get legal help in Colorado?",
        answer:
          "YLab, Available Law's program for teen founders, offers the firm's attorney-backed subscription at a 20% youth discount — Build is $40/month and Grow is $120/month — with a parent or guardian holding the account. Each month includes attorney work such as a reviewed document or a 30-minute consult.",
      },
    ],
  },
  "colorado-ai-act-in-effect-2026": {
    title: "Is the Colorado AI Act in Effect? The July 2026 Status Check for Businesses",
    date: "July 1, 2026",
    isoDate: "2026-07-01",
    author: "Zachariah Crabill, JD",
    excerpt:
      "As of June 30, 2026, the original Colorado AI Act (SB 24-205) is technically on the books — with enforcement suspended by a federal court order in xAI v. Weiser while the replacement law, SB 26-189, waits for January 1, 2027. Here's what's actually in effect, what's actually enforced, and what Colorado businesses should do with the gap.",
    faqs: [
      {
        question: "Is the Colorado AI Act in effect right now?",
        answer:
          "Technically yes — the original act (SB 24-205) took effect June 30, 2026. But enforcement is suspended by a federal court order in xAI v. Weiser, and the act will be repealed and replaced by SB 26-189 on January 1, 2027.",
      },
      {
        question: "Can my business be fined under the Colorado AI Act in 2026?",
        answer:
          "Not while the enforcement pause holds. The Attorney General — the only party who can enforce the act — has agreed in court not to enforce or investigate while xAI's constitutional challenge is pending, with a 14-day protective buffer after the court rules. There is no private right of action.",
      },
      {
        question: "Should I wait until 2027 to think about Colorado AI Act compliance?",
        answer:
          "No. The SB 26-189 duties — pre-use notice, adverse-outcome notice, human review, data access, and recordkeeping — apply to decisions made on or after January 1, 2027, and they require an inventory, vendor conversations, and process changes that take months, not days.",
      },
      {
        question: "What is the difference between SB 24-205 and SB 26-189?",
        answer:
          "SB 24-205 (2024) was a broad algorithmic-discrimination law with risk-management and impact-assessment duties. SB 26-189 (2026) replaces it with a narrower disclosure-and-human-review framework for automated decision-making technology, drops the legal-services category, and takes effect January 1, 2027.",
      },
    ],
  },
  "colorado-ai-rules-public-comment-2026": {
    title: "Colorado Is Writing Its AI Rules Right Now — How to Weigh In Before July 13",
    date: "July 1, 2026",
    isoDate: "2026-07-01",
    author: "Zachariah Crabill, JD",
    excerpt:
      "On June 23, 2026, the Colorado Attorney General opened public comment on the rules that will implement the new ADMT Act and Chatbot Safety Act — including the definition of 'materially influence' that decides which businesses are covered. Comments close July 13. Here's what's at stake and how to submit a comment that gets used.",
    faqs: [
      {
        question: "What is the deadline to comment on Colorado's AI rules?",
        answer:
          "The current pre-rulemaking comment window, opened June 23, 2026, runs through July 13, 2026, via the Attorney General's online form at coag.gov/ai. Formal rulemaking follows, with additional notice, written comment, and at least one public hearing before rules are finalized by January 1, 2027.",
      },
      {
        question: "What does 'materially influence' mean under SB 26-189?",
        answer:
          "The statute does not fully define it — that is the point of the rulemaking. It is the threshold that decides whether AI involved in a consequential decision makes you a covered deployer. The Attorney General is expected to clarify the definition with presumptions and illustrative examples.",
      },
      {
        question: "Do Colorado's AI rules cover chatbots too?",
        answer:
          "Yes. The same rulemaking covers the Chatbot Safety Act (HB 26-1263), which takes effect January 1, 2027 and imposes disclosure, self-harm protocol, minor-protection, and annual reporting duties on operators of conversational AI services.",
      },
      {
        question: "Do I need a lawyer to submit a rulemaking comment?",
        answer:
          "No. A public comment is a letter, not a legal brief — a specific description of how the rules would land on your real business is exactly what regulators need. An attorney can help frame a sensitive fact pattern or file on your behalf.",
      },
    ],
  },
  "ai-hiring-tools-colorado-law": {
    title: "AI Hiring Tools and Colorado Law: What Businesses Must Do Before January 1, 2027",
    date: "July 1, 2026",
    isoDate: "2026-07-01",
    author: "Zachariah Crabill, JD",
    excerpt:
      "Résumé screeners, applicant ranking, screening chatbots, video-interview scoring — employment is the Colorado AI Act category small businesses trip over most, usually through software features they never chose. What's legal, what changes January 1, 2027, and the four-step playbook to run now.",
    faqs: [
      {
        question: "Is it legal to use AI to screen résumés in Colorado?",
        answer:
          "Yes. But starting January 1, 2027, if the AI materially influences hiring decisions, the Colorado AI Act requires a pre-use notice to candidates, a 30-day notice after adverse outcomes, meaningful human review, data access and correction, and three years of records. Anti-discrimination law applies to AI-driven screening today.",
      },
      {
        question: "Does the Colorado AI Act apply to my applicant tracking system?",
        answer:
          "It depends on whether the ATS's AI features materially influence your hiring decisions — a threshold the Attorney General is defining in rulemaking due by January 1, 2027. When in doubt, inventory the feature and treat it as potentially covered.",
      },
      {
        question: "Do I have to tell candidates I use AI in hiring?",
        answer:
          "From January 1, 2027, yes — covered deployers owe a clear and conspicuous pre-use notice before the AI is used, plus a notice within 30 days when AI contributes to an adverse decision.",
      },
      {
        question: "Can my business be sued if an AI hiring tool is biased?",
        answer:
          "The Colorado AI Act has no private right of action — only the Attorney General enforces it. But a biased hiring outcome can support ordinary discrimination claims under Title VII and the Colorado Anti-Discrimination Act, which individuals can bring. The act preserves that liability and voids indemnity for your own discriminatory conduct.",
      },
    ],
  },
  "colorado-chatbot-law-hb26-1263": {
    title: "Colorado's New AI Chatbot Law: What HB 26-1263 Means for Businesses",
    date: "July 1, 2026",
    isoDate: "2026-07-01",
    author: "Zachariah Crabill, JD",
    excerpt:
      "Colorado just became the first state to regulate AI chatbots. The Chatbot Safety Act (HB 26-1263), signed May 29, 2026 and effective January 1, 2027, requires operators to disclose the AI, protect minors, run self-harm protocols — and never market a bot as the equivalent of a licensed professional. Here's who counts as an 'operator' and what every business with a chatbot should do.",
    faqs: [
      {
        question: "What is Colorado's new chatbot law?",
        answer:
          "HB 26-1263, the Chatbot Safety Act, signed May 29, 2026 and effective January 1, 2027. It requires operators of public conversational AI services to disclose that the AI is AI, run a self-harm response protocol, estimate user age and protect minors, report annually to the Attorney General, and never present the bot as equivalent to a licensed professional.",
      },
      {
        question: "Does the chatbot law apply to the support widget on my website?",
        answer:
          "Probably not directly — the act targets those who develop and make publicly available a conversational AI service. A business embedding a vendor's support bot is likely the operator's customer, not the operator. The boundary will be sharpened in the Attorney General's rulemaking, and you should confirm your vendor complies either way.",
      },
      {
        question: "Can I market my chatbot as an 'AI lawyer' or 'AI doctor'?",
        answer:
          "Colorado's chatbot act prohibits operators from stating that a bot's output is provided by, endorsed by, or equivalent to a licensed or certified professional's services. Even outside the act, that kind of claim risks consumer-protection and unauthorized-practice problems.",
      },
      {
        question: "When do Colorado's chatbot rules take effect?",
        answer:
          "The operator duties apply beginning January 1, 2027 — the same day as Colorado's ADMT Act. The Attorney General's implementing rulemaking is underway now, with a public comment window through July 13, 2026.",
      },
    ],
  },
  "5-ai-vendor-contract-clauses": {
    title: "5 AI Vendor Contract Clauses Your Company Is Missing",
    date: "April 7, 2026",
    isoDate: "2026-04-07",
    author: "Zachariah Crabill, JD",
    excerpt:
      "Most AI vendor contracts leave the deployer holding the bag on training-data liability, IP ownership, bias audits, and Colorado AI Act compliance. Here are the five clauses to add before you sign.",
  },
  "colorado-ai-act-2026": {
    title: "Colorado AI Act 2026: The Plain-Language Guide for Businesses",
    date: "April 2, 2026 (Updated June 10, 2026)",
    isoDate: "2026-04-02",
    isoDateModified: "2026-06-10",
    author: "Zachariah Crabill, JD",
    excerpt:
      "Colorado SB 26-189 — the repeal-and-replace of the original Colorado AI Act — was signed May 14, 2026 and takes effect January 1, 2027, while the original act still takes effect June 30, 2026 with enforcement paused. Here's what businesses actually owe as deployers of covered ADMT, what governs the rest of 2026, and how to build a compliance program that survives an AG cure window.",
  },
  "colorado-ai-act-rewrite-2026-smb-impact": {
    title: "Colorado Just Rewrote Its AI Law — What It Means for Your Small Business",
    date: "May 22, 2026 (Updated June 10, 2026)",
    isoDate: "2026-05-22",
    isoDateModified: "2026-06-10",
    author: "Zachariah Crabill, JD",
    excerpt:
      "Governor Polis signed SB 26-189 on May 14, 2026, replacing the Colorado AI Act with a lighter framework effective January 1, 2027. But the original act — legal services and all — still takes effect June 30, 2026, with enforcement paused. Here's what actually changed and what Colorado SMBs should do this week.",
  },
  "document-ai-decision-making": {
    title: "How to Document AI Decision-Making for Colorado AI Act Compliance",
    date: "March 28, 2026",
    isoDate: "2026-03-28",
    author: "Zachariah Crabill, JD",
    excerpt:
      "The Colorado AI Act requires deployers of covered ADMT to maintain a documented record of consequential decisions. Here's the practical logging and audit-trail system we use for FAIIR-certified clients.",
  },
  "what-is-faiir-framework": {
    title: "What Is the FAIIR Framework? AI Compliance for Colorado Businesses",
    date: "April 11, 2026 (Updated June 10, 2026)",
    isoDate: "2026-04-11",
    isoDateModified: "2026-06-10",
    author: "Zachariah Crabill, JD",
    excerpt:
      "FAIIR is the Foundation for AI Integrity & Regulation — five pillars (Fitness for Purpose, Accountability, Integrity of Data, Informed Use, Risk Management) built to help Colorado businesses meet the Colorado AI Act and the wider AI-regulation patchwork.",
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
    title: "How to Choose a Small Business Attorney in Colorado",
    date: "April 8, 2026",
    isoDate: "2026-04-08",
    author: "Zachariah Crabill, JD",
    excerpt:
      "Choosing a Colorado small-business attorney is more than checking credentials. Here are the seven practical criteria — pricing model, response time, industry fit, and more — that predict whether an attorney will actually be useful to your business.",
  },
  "subscription-legal-services-small-business": {
    title: "Subscription Legal Services for Small Business: How Flat-Rate Legal Plans Actually Work",
    date: "June 25, 2026",
    isoDate: "2026-06-25",
    author: "Zachariah Crabill, JD",
    excerpt:
      "Subscription legal services replace the unpredictable hourly bill with a flat monthly fee for the legal work a small business actually uses — contracts, document review, and quick attorney questions. Here's how the model works, what it costs, and how to tell whether it fits your business.",
    faqs: [
      {
        question: "What are subscription legal services?",
        answer:
          "Subscription legal services are a flat-fee model where a law firm provides a defined bundle of legal work — contract drafting and review, quick attorney questions, and consultations — for a predictable monthly or annual price, instead of billing by the hour.",
      },
      {
        question: "How much do subscription legal services cost?",
        answer:
          "Plans for small businesses commonly run from around $50 to a few hundred dollars a month, scaling with how much attorney work is included. Available Law's tiers are $0 (Explore), $50 (Build), $150 (Grow), and $300 (Lead) per month, with two months free on annual billing.",
      },
      {
        question: "Is a legal subscription cheaper than hiring a lawyer hourly?",
        answer:
          "For a business with ongoing, routine legal needs, almost always — and more importantly, it is predictable. A single hourly matter can cost more than a year of a subscription. For a one-time transaction with no follow-on work, a flat-fee project may be cheaper.",
      },
      {
        question: "Do I still get a real attorney with a subscription plan?",
        answer:
          "Yes. A legitimate subscription firm pairs you with a licensed attorney who reviews your work and is accountable for it. AI may speed up the drafting, but a barred attorney should be reviewing every deliverable before it reaches you.",
      },
    ],
  },
  "ai-business-consulting-vs-legal-counsel": {
    title: "AI Business Consulting vs. AI Legal Counsel: What Your Small Business Actually Needs",
    date: "June 25, 2026",
    isoDate: "2026-06-25",
    author: "Zachariah Crabill, JD",
    excerpt:
      "“AI consultant” and “AI lawyer” solve different problems — one helps you adopt AI, the other keeps that adoption legal. Here's where AI business consulting ends, where legal counsel begins, and how to cover both without two enterprise retainers.",
    faqs: [
      {
        question: "What is the difference between an AI consultant and an AI lawyer?",
        answer:
          "An AI consultant helps you choose, build, and adopt AI tools and measure their impact. An AI lawyer handles the legal side — vendor contracts, regulatory compliance, liability, and privacy — and is the only one who can give you binding legal advice for your specific situation.",
      },
      {
        question: "Do I need a lawyer to use AI in my small business?",
        answer:
          "Not to try a tool, but you do before AI starts influencing decisions about real people, before you sign a significant AI vendor contract, and before you operate in a regulated area covered by laws like the Colorado AI Act.",
      },
      {
        question: "Can an AI consultant help with Colorado AI Act compliance?",
        answer:
          "A consultant can help operate a compliance program, but the program must be designed against the statute's legal duties by an attorney. Determining whether you are a covered deployer and what you owe is a legal judgment, not a strategy question.",
      },
      {
        question: "What is AI governance, and who owns it?",
        answer:
          "AI governance is the set of policies, controls, and documentation that make your AI use defensible. An attorney should design it to the legal standard, and the business operates it day to day. FAIIR is Available Law's attorney-led framework for this.",
      },
    ],
  },
  "small-business-lawyer-cost-colorado": {
    title: "How Much Does a Small Business Lawyer Cost in 2026? Hourly, Flat-Fee, and Subscription Compared",
    date: "June 25, 2026",
    isoDate: "2026-06-25",
    author: "Zachariah Crabill, JD",
    excerpt:
      "Small business legal costs range from a couple hundred dollars for a single document to five-figure bills for an ongoing dispute. Here's a plain breakdown of the four ways lawyers charge — hourly, flat-fee, retainer, and subscription — and how to estimate your annual legal spend.",
    faqs: [
      {
        question: "How much does a small business lawyer cost?",
        answer:
          "It depends on the pricing model. Hourly rates for small business attorneys commonly run from a few hundred dollars an hour up, with specialized and big-firm rates higher. Flat fees apply to defined projects. Subscription plans for ongoing needs commonly run about $50 to $300 a month.",
      },
      {
        question: "Is it cheaper to pay a lawyer hourly or on a flat fee?",
        answer:
          "For a single, well-defined task, a flat fee is usually cheaper and safer because the price is fixed up front. For ongoing needs, a flat monthly subscription typically beats both hourly and repeated flat-fee projects.",
      },
      {
        question: "What is a typical retainer for a small business lawyer?",
        answer:
          "It depends which kind. A classic security retainer is a prepaid balance billed against at the firm's hourly rate. A subscription retainer is a flat monthly fee — commonly $50 to a few hundred dollars for small businesses — for a defined bundle of ongoing work.",
      },
      {
        question: "How can a $50/month plan include real attorney work?",
        answer:
          "Because an AI legal assistant does the drafting and research, and the licensed attorney spends their time on review and judgment instead of typing. That leverage lets one attorney serve more clients well at a lower price without leaving the loop.",
      },
    ],
  },
  "ai-small-business-legal-checklist-2026": {
    title: "Using AI in Your Small Business: A 2026 Legal Checklist",
    date: "June 25, 2026",
    isoDate: "2026-06-25",
    author: "Zachariah Crabill, JD",
    excerpt:
      "Adopting AI tools is easy; staying on the right side of the law while you do it is the part most small businesses skip. This 2026 checklist walks through the legal questions to answer before and after you roll out AI — from vendor contracts and data privacy to the Colorado AI Act.",
    faqs: [
      {
        question: "Is it legal to use AI in my business?",
        answer:
          "Yes — using AI is legal. What is regulated is how you use it: whether you protect personal data, what your vendor contracts say, and whether AI is influencing consequential decisions about real people in ways that trigger laws like the Colorado AI Act.",
      },
      {
        question: "Do small businesses need an AI policy?",
        answer:
          "Practically, yes. A short written AI acceptable use policy — which tools are approved, what data is off-limits, and when humans must review output — is the cheapest risk reduction available, and 'we had no policy' is a weak position after an incident.",
      },
      {
        question: "What is the most common legal mistake small businesses make with AI?",
        answer:
          "Putting confidential or personal data into an AI tool that may retain or train on it, without checking the vendor's terms first. It is easy to do, hard to undo, and can create privacy, confidentiality, and compliance problems at once.",
      },
      {
        question: "Does the Colorado AI Act apply to my small business?",
        answer:
          "It applies if you deploy automated decision-making technology that materially influences a consequential decision — in employment, housing, lending, insurance, healthcare, education, or government services. The free AI Act readiness checker gives you a fast answer.",
      },
    ],
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
      modifiedTime: post.isoDateModified ?? post.isoDate,
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

  // Build the structured-data graph for this post. FAQ schema is appended only
  // when the post defines faqs, so older posts emit exactly what they did before.
  const jsonLd: Array<Record<string, unknown>> = [
    blogPostingSchema({
      slug,
      title: post.title,
      description: post.excerpt,
      datePublished: post.isoDate,
      dateModified: post.isoDateModified ?? post.isoDate,
      authorName: post.author,
    }),
    breadcrumbSchema([
      { name: "Home", url: "/" },
      { name: "Blog", url: "/blog" },
      { name: post.title, url: `/blog/${slug}` },
    ]),
  ];
  if (post.faqs && post.faqs.length > 0) {
    jsonLd.push(faqPageSchema(post.faqs));
  }

  return (
    <>
      <JsonLd data={jsonLd} />
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
