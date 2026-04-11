import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import AIActChecker from "./AIActChecker";
import {
  SITE_URL,
  breadcrumbSchema,
  faqPageSchema,
  DEFAULT_OG_IMAGE,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Colorado AI Act Readiness Checker — Free 2-Minute Assessment",
  description:
    "Is your Colorado business ready for the AI Act? Take our free 10-question readiness assessment and get a personalized compliance report covering governance, disclosure, bias auditing, and incident response.",
  alternates: { canonical: "/ai-act-checker" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/ai-act-checker`,
    title: "Colorado AI Act Readiness Checker",
    description:
      "Free 10-question assessment for Colorado businesses preparing for the AI Act. Get a personalized readiness score and a gap-analysis report from a Colorado attorney.",
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Colorado AI Act Readiness Checker",
    description:
      "Free 10-question assessment for Colorado businesses preparing for the AI Act.",
  },
};

const CHECKER_FAQS = [
  {
    question: "What is the Colorado AI Act Readiness Checker?",
    answer:
      "A free 10-question assessment from Available Law that helps Colorado businesses evaluate their readiness for Colorado Senate Bill 24-205 (the Colorado AI Act). It produces a readiness score, a RAG (red/amber/green) status, and a personalized list of compliance gaps mapped to the statute.",
  },
  {
    question: "How long does it take?",
    answer:
      "Most businesses finish the assessment in about two minutes. You will see a teaser score before providing any contact information, and a full personalized report after entering your email.",
  },
  {
    question: "Is this a substitute for legal advice?",
    answer:
      "No. The Readiness Checker is an educational tool. It is not legal advice and does not create an attorney-client relationship with Available Law. For an enforceable compliance opinion, schedule a FAIIR assessment with an Available Law attorney.",
  },
  {
    question: "Who built this?",
    answer:
      "The assessment was built by Available Law, a Colorado virtual law firm founded by attorney Zachariah Crabill. The questions are mapped to the core duties under Colorado SB24-205 (the Colorado AI Act) and related AI governance best practices.",
  },
];

export default function AIActCheckerPage() {
  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "AI Act Readiness Checker", url: "/ai-act-checker" },
          ]),
          faqPageSchema(CHECKER_FAQS),
        ]}
      />
      <Header />
      <main className="bg-[#FAF8F5] min-h-screen">
        <AIActChecker />
      </main>
      <Footer />
    </>
  );
}
