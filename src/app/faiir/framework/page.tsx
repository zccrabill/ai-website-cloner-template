import type { Metadata } from "next";
import FrameworkContent from "./FrameworkContent";
import JsonLd from "@/components/JsonLd";
import {
  SITE_URL,
  DEFAULT_OG_IMAGE,
  breadcrumbSchema,
  faqPageSchema,
} from "@/lib/seo";

// Required by Next 16 when next.config.js uses `output: "export"`.
export const dynamic = "force-static";

const PAGE_URL = `${SITE_URL}/faiir/framework`;
const TITLE = "The FAIIR Framework — Five Pillars, 41 Controls";
const DESCRIPTION =
  "FAIIR (Foundation of AI Integrity & Regulation) is an attorney-led AI compliance standard for small and midsize businesses: five pillars, 41 pass/fail controls, benchmarked to the NIST AI Risk Management Framework and mapped to Colorado SB 26-189.";

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

const FRAMEWORK_FAQS = [
  {
    question: "What are the five pillars of FAIIR?",
    answer:
      "Fitness for Purpose (is each AI tool suited to the task it's used for), Accountability (who owns AI at the organization, decided in advance), Integrity of Data (what goes into the AI, where it goes, and how long it lives there), Informed Use (do employees and customers actually know what's going on), and Risk Management (if something goes wrong, will you know, contain it, and be able to prove what you did). The five pillars contain 41 specific controls, each with a pass/fail bar.",
  },
  {
    question: "What does a FAIIR certification letter actually mean?",
    answer:
      "A FAIIR certification letter reflects an attorney-led assessment of an organization's practices against the framework's defined controls, based on evidence the organization submits. It is annual and firm-specific — never lifetime, never transferable. It is not a government approval or a guarantee of regulatory compliance; it is documented proof of reasonable care, the same way a SOC 2 report doesn't make a system unbreachable but shows security was taken seriously.",
  },
  {
    question: "What is FAIIR benchmarked against?",
    answer:
      "FAIIR is designed to be complementary to the standards and laws shaping AI governance: it operationalizes the NIST AI Risk Management Framework at SMB scale, maps its pillars to the disclosure, human-review, and recordkeeping duties in Colorado SB 26-189 and the wider U.S. state AI-law patchwork, aligns its Informed Use pillar with the EU AI Act's disclosure and content-labeling obligations, and covers AI-specific ground that SOC 2 and ISO/IEC 42001 don't reach — at a weight a small business can actually carry.",
  },
  {
    question: "Does FAIIR certify AI models or products?",
    answer:
      "No. FAIIR certifies an organization's practices around deploying and using AI — not the AI models themselves. A certified organization that adopts a new model still applies its framework to that new model. FAIIR is also not a substitute for legal advice specific to your jurisdiction or industry, and it does not replace obligations under HIPAA, GDPR, the EU AI Act, or state law; it is designed to help organizations meet those obligations in an organized way.",
  },
];

const BREADCRUMBS = [
  { name: "Home", url: "/" },
  { name: "FAIIR", url: "/faiir" },
  { name: "The Framework", url: "/faiir/framework" },
];

export default function FrameworkPage() {
  return (
    <>
      <JsonLd
        data={[faqPageSchema(FRAMEWORK_FAQS), breadcrumbSchema(BREADCRUMBS)]}
      />
      <FrameworkContent faqs={FRAMEWORK_FAQS} />
    </>
  );
}
