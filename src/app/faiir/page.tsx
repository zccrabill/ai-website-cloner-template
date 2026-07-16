import type { Metadata } from "next";
import FaiirLanding from "./FaiirLanding";
import JsonLd from "@/components/JsonLd";
import {
  SITE_URL,
  DEFAULT_OG_IMAGE,
  breadcrumbSchema,
  faqPageSchema,
  serviceSchema,
} from "@/lib/seo";

// Required by Next 16 when next.config.js uses `output: "export"`.
export const dynamic = "force-static";

const PAGE_URL = `${SITE_URL}/faiir`;
const TITLE = "FAIIR Certification — Colorado AI Act Compliance Framework";
const DESCRIPTION =
  "FAIIR is the attorney-led AI compliance certification for Colorado businesses. Tiered fixed-fee assessments from $2,500, ongoing membership from $49/month, and an annual re-certification audit to maintain Colorado AI Act readiness.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: PAGE_URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: PAGE_URL,
    type: "website",
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
    },
  },
};

const FAIIR_FAQS = [
  {
    question: "What is FAIIR certification?",
    answer:
      "FAIIR — the Foundation for AI Integrity & Regulation — is a professional compliance standard for how businesses use AI, organized into five pillars (Fitness for purpose, Accountability, Integrity of data, Informed use, and Risk management) with 41 documented pass/fail controls. A FAIIR-certified business has been assessed against that standard by a licensed attorney — covering its ADMT inventory, pre-use and adverse-outcome notices, meaningful human-review process, vendor documentation, and recordkeeping — and maintains it through ongoing monitoring. For Colorado businesses, the assessment maps each pillar to the duties imposed on deployers by Senate Bill 26-189 (the Colorado AI Act, signed May 14, 2026 and effective January 1, 2027).",
  },
  {
    question: "What is the FAIIR framework benchmarked against?",
    answer:
      "FAIIR is designed to be complementary to the standards and laws shaping AI governance. It operationalizes the NIST AI Risk Management Framework at small-business scale, maps its pillars to the disclosure, human-review, and recordkeeping duties in Colorado SB 26-189 and the wider U.S. state AI-law patchwork, aligns with the EU AI Act's disclosure and content-labeling obligations, and covers AI-specific ground that SOC 2 and ISO/IEC 42001 don't reach. Certification is not a government approval or a guarantee of compliance — it is attorney-led, evidence-based, documented proof of reasonable care, renewed annually.",
  },
  {
    question: "Who needs FAIIR certification?",
    answer:
      "Any Colorado-based business that uses ADMT to make, or to materially influence, a consequential decision about consumers — education, employment, residential real estate, lending, insurance, healthcare, and government services are all named in SB 26-189. If an automated tool affects any of those decisions and touches Colorado residents, the deployer owes statutory duties under the law starting January 1, 2027. FAIIR is the framework to meet those duties.",
  },
  {
    question: "How much does FAIIR certification cost?",
    answer:
      "FAIIR is offered in tiered, fixed-fee options so the pricing scales with the AI footprint you actually run. The initial readiness assessment comes in three sizes: Starter at $2,500 (1–2 in-scope ADMT systems, single business unit), Professional at $5,000 (3–5 systems, board-ready deliverables), and Enterprise from $15,000 (6+ systems or multi-business-unit operators). Final scope is confirmed on a free 30-minute discovery call. Ongoing compliance membership is also tiered: Standard at $49/month, Plus at $149/month (includes the annual re-certification audit), and Enterprise custom pricing from $499/month. Annual billing saves ~17% on every tier. A stand-alone annual re-certification audit is $1,250 for Standard members.",
  },
  {
    question: "How long does the assessment take?",
    answer:
      "Most FAIIR readiness assessments are completed within three to six weeks from engagement signing to final written report. The timeline depends on how quickly your team can share existing documentation (vendor contracts, privacy policies, ADMT inventories, any prior consumer notices). The assessment deliverable is a written gap analysis with prioritized remediation recommendations and draft notice and human-review templates.",
  },
  {
    question: "Is FAIIR a legally required certification?",
    answer:
      "No. The Colorado AI Act itself does not require any third-party certification. However, the statute does require deployers of covered ADMT to post pre-use notices, send 30-day adverse-outcome notices, provide meaningful human review, and maintain three years of records. FAIIR certification is a structured way to meet those statutory duties and to demonstrate good-faith compliance during the Attorney General's 60-day cure window. FAIIR is delivered by a Colorado-licensed attorney, so the work product is attorney-prepared legal analysis, not a generic audit.",
  },
  {
    question: "What happens after I book a discovery call?",
    answer:
      "The discovery call is 30 minutes, free, and conducted over video. We'll walk through the AI systems your business deploys, identify which qualify as covered ADMT under SB 26-189, and scope the assessment. If FAIIR is the right fit, you'll receive a written engagement letter and a fixed-fee quote within one business day. If you're not ready for the full assessment, we may recommend starting with the free AI Act readiness check or a smaller compliance review first.",
  },
];

const BREADCRUMBS = [
  { name: "Home", url: "/" },
  { name: "FAIIR", url: "/faiir" },
];

export default function FaiirPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: "FAIIR Compliance Assessment",
            description:
              "Attorney-led Colorado AI Act (SB 26-189) readiness assessment covering ADMT inventory, pre-use and adverse-outcome notices, meaningful human review, developer documentation, vendor contracts, and recordkeeping. Delivered by a Colorado-licensed attorney. Offered in three tiers: Starter ($2,500, 1–2 systems), Professional ($5,000, 3–5 systems), and Enterprise (from $15,000, multi-business-unit).",
            url: PAGE_URL,
            serviceType: "AI Compliance Certification",
            price: "2500",
            priceCurrency: "USD",
            offerDescription:
              "Starter tier starts at $2,500. Professional $5,000. Enterprise from $15,000. Fixed fee confirmed after a free 30-minute discovery call.",
          }),
          serviceSchema({
            name: "FAIIR Compliance Membership",
            description:
              "Monthly Colorado AI Act compliance support for businesses maintaining FAIIR readiness. Offered in three tiers — Standard ($49/month), Plus ($149/month, includes annual re-certification audit), and Enterprise (custom, from $499/month). All tiers include attorney Q&A, regulatory update briefings, recordkeeping templates, and Ava AI legal assistant access. Annual billing saves ~17%.",
            url: `${PAGE_URL}#membership`,
            serviceType: "AI Compliance Subscription",
            price: "49",
            priceCurrency: "USD",
            offerDescription:
              "Standard $49/mo, Plus $149/mo, Enterprise from $499/mo. Cancel anytime on monthly; annual plans save ~17%.",
          }),
          faqPageSchema(FAIIR_FAQS),
          breadcrumbSchema(BREADCRUMBS),
        ]}
      />
      <FaiirLanding faqs={FAIIR_FAQS} />
    </>
  );
}
