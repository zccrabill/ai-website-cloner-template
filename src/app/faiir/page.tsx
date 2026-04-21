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
      "FAIIR — the Foundation for AI Integrity & Regulation — is a compliance framework for businesses that deploy artificial intelligence in consequential decisions. A FAIIR-certified business has completed an attorney-led audit of its AI governance, impact assessments, human-review processes, vendor contracts, and incident-response plans, and maintains those standards through ongoing monitoring. FAIIR is built around the duties imposed on deployers by Colorado Senate Bill 24-205 (the Colorado AI Act).",
  },
  {
    question: "Who needs FAIIR certification?",
    answer:
      "Any Colorado-based business that uses AI to make, or to substantially assist in making, consequential decisions about consumers — hiring, lending, insurance, housing, education, healthcare, legal services, employment, and essential government services are all named in SB24-205. If an AI system affects any of those decisions and touches Colorado residents, the deployer owes statutory duties under the law starting in 2026. FAIIR is the framework to meet those duties.",
  },
  {
    question: "How much does FAIIR certification cost?",
    answer:
      "FAIIR is offered in tiered, fixed-fee options so the pricing scales with the AI footprint you actually run. The initial readiness assessment comes in three sizes: Starter at $2,500 (1–2 high-risk AI systems, single business unit), Professional at $5,000 (3–5 systems, board-ready deliverables), and Enterprise from $15,000 (6+ systems or multi-business-unit operators). Final scope is confirmed on a free 30-minute discovery call. Ongoing compliance membership is also tiered: Standard at $49/month, Plus at $149/month (includes the annual re-certification audit), and Enterprise custom pricing from $499/month. Annual billing saves ~17% on every tier. A stand-alone annual re-certification audit is $1,250 for Standard members.",
  },
  {
    question: "How long does the assessment take?",
    answer:
      "Most FAIIR readiness assessments are completed within three to six weeks from engagement signing to final written report. The timeline depends on how quickly your team can share existing documentation (vendor contracts, privacy policies, AI inventories, incident logs). The assessment deliverable is a written gap analysis with prioritized remediation recommendations and a draft governance policy.",
  },
  {
    question: "Is FAIIR a legally required certification?",
    answer:
      "No. The Colorado AI Act itself does not require any third-party certification. However, the statute does require deployers of high-risk AI systems to maintain specific documentation, disclose AI use to consumers, and implement risk management programs. FAIIR certification is a structured way to meet those statutory duties and to demonstrate good-faith compliance in the event of an Attorney General inquiry. FAIIR is delivered by a Colorado-licensed attorney, so the work product is attorney-prepared legal analysis, not a generic audit.",
  },
  {
    question: "What happens after I book a discovery call?",
    answer:
      "The discovery call is 30 minutes, free, and conducted over video. We'll walk through the AI systems your business deploys, identify which fall under SB24-205's high-risk definition, and scope the assessment. If FAIIR is the right fit, you'll receive a written engagement letter and a fixed-fee quote within one business day. If you're not ready for the full assessment, we may recommend starting with the free AI Act readiness check or a smaller compliance review first.",
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
              "Attorney-led Colorado AI Act readiness assessment covering governance, impact assessments, human review, bias audit, documentation, incident response, and vendor contracts. Delivered by a Colorado-licensed attorney. Offered in three tiers: Starter ($2,500, 1–2 systems), Professional ($5,000, 3–5 systems), and Enterprise (from $15,000, multi-business-unit).",
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
              "Monthly Colorado AI Act compliance support for businesses maintaining FAIIR readiness. Offered in three tiers — Standard ($49/month), Plus ($149/month, includes annual re-certification audit), and Enterprise (custom, from $499/month). All tiers include attorney Q&A, regulatory update briefings, audit-trail templates, and Allora AI legal assistant access. Annual billing saves ~17%.",
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
