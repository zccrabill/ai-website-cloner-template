import type { Metadata } from "next";
import YLabLanding from "./YLabLanding";
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

const PAGE_URL = `${SITE_URL}/ylab`;
// Root layout applies the "%s | Available Law" title template, so do NOT
// repeat the brand suffix here (it would double to "… | Available Law | Available Law").
const TITLE = "YLab — Youth Leadership & Business";
const DESCRIPTION =
  "YLab is a youth-led legal and business lab for teen entrepreneurs — real legal backup on a discounted membership, a podcast for the next generation of founders, and a teen-led push to change Colorado law so under-18s can form LLCs and sign contracts. Attorney-guided by Zachariah Crabill.";

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

const YLAB_FAQS = [
  {
    question: "What is YLab?",
    answer:
      "YLab — Youth Leadership And Business — is Available Law's youth-led legal and business lab for teen entrepreneurs. It's three things in one: a discounted legal membership built for founders under 18, a podcast spotlighting the next generation of entrepreneurs, and a teen-led movement to change Colorado law so young founders can form LLCs and sign enforceable contracts before they turn 18. It's guided by Zachariah Crabill — a licensed Colorado attorney who started young himself — but the agenda is set by the teens.",
  },
  {
    question: "Who is YLab for?",
    answer:
      "Teen entrepreneurs — roughly ages 13 to 17 — who are building something real or want to, plus the parents and guardians who support them. You don't need a registered company or revenue to join; you need an idea and the drive to work on it.",
  },
  {
    question: "My teen is under 18 — can they really have a law firm and a membership?",
    answer:
      "Yes, with a structure that respects the current law. Because a minor's contract is generally voidable in Colorado, the parent or guardian is the account holder and payer, and the teen is the named participant who works day-to-day with our AI assistant and attorney. That friction — needing an adult to sign — is exactly the barrier YLab exists to change.",
  },
  {
    question: "How much does a YLab membership cost?",
    answer:
      "YLab mirrors Available Law's regular memberships at a 20% youth discount. Build is $40/month (vs. $50) and Grow is $120/month (vs. $150), each including monthly attorney work — a reviewed document or a 30-minute consult — plus Ava AI legal chat. Annual billing saves more.",
  },
  {
    question: "What is the law you're trying to change?",
    answer:
      "In Colorado today, minors generally can't form an LLC on their own and the contracts they sign are voidable, which makes it hard for young people to start real, bankable businesses. YLab organizes and supports teen founders to lead a push to update Colorado law so under-18 entrepreneurs can form LLCs and enter enforceable contracts. The effort is youth-led and attorney-guided.",
  },
];

const BREADCRUMBS = [
  { name: "Home", url: "/" },
  { name: "YLab", url: "/ylab" },
];

export default function YLabPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: "YLab Teen Founder Membership",
            description:
              "Discounted legal membership for teen entrepreneurs from Available Law. Mirrors the regular Build and Grow memberships at a 20% youth discount — Build $40/month, Grow $120/month — each including monthly attorney work (a reviewed document or a 30-minute consult) and Ava AI legal assistance. A parent or guardian is the account holder.",
            url: `${PAGE_URL}#membership`,
            serviceType: "Legal Subscription for Teen Entrepreneurs",
            price: "40",
            priceCurrency: "USD",
            offerDescription:
              "YLab Build $40/mo, Grow $120/mo — a 20% youth discount off the regular memberships. Parent/guardian holds the account.",
          }),
          faqPageSchema(YLAB_FAQS),
          breadcrumbSchema(BREADCRUMBS),
        ]}
      />
      <YLabLanding faqs={YLAB_FAQS} />
    </>
  );
}
