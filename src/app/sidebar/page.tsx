import type { Metadata } from "next";
import SidebarLanding from "./SidebarLanding";
import JsonLd from "@/components/JsonLd";
import {
  SITE_URL,
  DEFAULT_OG_IMAGE,
  breadcrumbSchema,
  faqPageSchema,
} from "@/lib/seo";

// Required by Next 16 when next.config.js uses `output: "export"`.
export const dynamic = "force-static";

const PAGE_URL = `${SITE_URL}/sidebar`;
// Root layout applies the "%s | Available Law" title template, so do NOT
// repeat the brand suffix here (it would double to "… | Available Law | Available Law").
const TITLE = "Sidebar — A Community for Attorneys";
const DESCRIPTION =
  "Sidebar is Available Law's community for attorneys — small peer circles, casual Front Range gatherings, and honest conversation about the mental-health weight of practicing law. No networking agenda, no CLE pitch. Founded by Zachariah Crabill, an attorney who talks openly about the hard parts of this profession.";

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

const SIDEBAR_FAQS = [
  {
    question: "What is Sidebar?",
    answer:
      "Sidebar is Available Law's community for attorneys. In a courtroom, a sidebar is the conversation that happens away from the jury — and that's the idea: a place where lawyers can talk to other lawyers honestly, without the posture the job usually demands. It's three things: small recurring peer circles, casual in-person gatherings along Colorado's Front Range, and an ongoing public conversation — on podcasts and beyond — aimed at making mental-health struggles in the legal profession something we actually talk about.",
  },
  {
    question: "Who is Sidebar for?",
    answer:
      "Attorneys — practicing, in-house, government, solo, on a break from the law, or seriously thinking about leaving it. Law students and recent grads are welcome too. The in-person gatherings are Colorado-based, but peer circles meet virtually, so attorneys anywhere can join.",
  },
  {
    question: "Does Sidebar cost anything?",
    answer:
      "No. Sidebar is free. It isn't a product or a client-development funnel — it's a mission. Available Law hosts it because the profession's isolation is a problem worth working on, not because there's a membership to sell you.",
  },
  {
    question: "Is Sidebar therapy or crisis support?",
    answer:
      "No. Sidebar is peer community — colleagues who understand the job, showing up for each other. It is not counseling, and joining does not create an attorney-client relationship with Available Law. If you're in crisis right now, call or text 988 (the Suicide & Crisis Lifeline), and know that the Colorado Lawyer Assistance Program (COLAP) offers free, confidential support built specifically for legal professionals.",
  },
  {
    question: "Is what I share kept private?",
    answer:
      "Circles run on a simple rule: what's said in the circle stays in the circle. That's a community norm, not a legal privilege — so share at the level you're comfortable with. There's no attendance list published anywhere, and you'll never be quoted or identified without your explicit okay.",
  },
  {
    question: "Why is a law firm doing this?",
    answer:
      "Because the founder has lived it. Zachariah Crabill talks openly — on podcasts and elsewhere — about the hardest seasons of his own career and what the pressure of this profession can do to a person. Study after study shows attorneys struggle with depression, anxiety, and problem drinking at rates well above the general population, and mostly in silence. Sidebar is his answer: make the conversation normal, and give attorneys a room where they don't have to perform.",
  },
];

const BREADCRUMBS = [
  { name: "Home", url: "/" },
  { name: "Sidebar", url: "/sidebar" },
];

export default function SidebarPage() {
  return (
    <>
      <JsonLd
        data={[faqPageSchema(SIDEBAR_FAQS), breadcrumbSchema(BREADCRUMBS)]}
      />
      <SidebarLanding faqs={SIDEBAR_FAQS} />
    </>
  );
}
