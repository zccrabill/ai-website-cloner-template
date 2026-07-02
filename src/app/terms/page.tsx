// Reviewed and approved by Zachariah Crabill (attorney) 2026-07-02.
// Linked from the iOS app's Account tab.

import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

const TITLE = "Terms of Service";
const DESCRIPTION =
  "The terms that govern Available Law memberships, the Ava AI assistant, and the Available Law iOS app.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/terms`,
    title: TITLE,
    description: DESCRIPTION,
  },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className="font-heading text-2xl text-[#1F1810] mb-3">{title}</h2>
      <div className="text-[#6B5B4E] leading-relaxed space-y-3 text-[15px]">{children}</div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="bg-[#FAF8F5] min-h-screen">
        <div className="max-w-[760px] mx-auto px-6 md:px-8 py-20 md:py-24">
          <p className="text-[#C17832] text-[12px] font-semibold tracking-widest uppercase mb-3">
            Legal
          </p>
          <h1 className="font-heading text-4xl text-[#1F1810] mb-2" style={{ fontWeight: 400 }}>
            Terms of Service
          </h1>
          <p className="text-[#A89279] text-sm mb-12">Effective July 2, 2026</p>

          <Section title="The service">
            <p>
              Available Law is a Colorado law firm offering subscription legal
              memberships through availablelaw.com and the Available Law iOS
              app. A membership includes access to Ava, our AI intake
              assistant; encrypted document storage; and — on paid tiers — a
              monthly allotment of attorney tasks. One attorney task is a
              document our AI drafts and a licensed attorney reviews and sends
              you, or a 30-minute attorney consultation, your choice each time.
            </p>
          </Section>

          <Section title="Ava provides information, not advice">
            <p>
              Ava gathers facts about your matter and answers general legal
              questions. Ava&rsquo;s chat replies are legal information, not
              legal advice, and no deliverable is final until a licensed
              Colorado attorney has reviewed it. When you send a matter for
              review, an attorney reviews the intake and delivers the final
              work product — typically within 24 hours.
            </p>
          </Section>

          <Section title="Attorney-client relationship">
            <p>
              Creating a free account or chatting with Ava does not by itself
              create an attorney-client relationship. An attorney-client
              relationship is formed when the firm confirms engagement on a
              matter — for subscription members, per the engagement terms
              accepted at signup. Consultations and matter reviews performed by
              our attorneys are legal services provided under Colorado law and
              the Colorado Rules of Professional Conduct.
            </p>
          </Section>

          <Section title="Membership tiers and billing">
            <p>
              Tiers, pricing, and monthly attorney-task allotments are listed at{" "}
              <a href="/#pricing" className="text-[#C17832] underline">availablelaw.com/#pricing</a>.
              Subscriptions are billed through Stripe monthly or annually and
              renew automatically until canceled. You can cancel anytime from
              your account page; cancellation is effective at the end of the
              current billing period. Unused attorney tasks do not roll over.
              Matter reviews beyond your monthly allotment bill as overage at
              $50 per page of final deliverable, always confirmed with you
              before work begins. Purchases and plan changes happen on
              availablelaw.com — the iOS app does not process payments.
            </p>
          </Section>

          <Section title="Your responsibilities">
            <p>
              Keep your login credentials secure and give us accurate
              information about your matters. The Services may not be used for
              unlawful purposes, to infringe others&rsquo; rights, or to abuse,
              probe, or overload the platform. Fair-use rate limits apply to
              Ava chat.
            </p>
          </Section>

          <Section title="Jurisdiction">
            <p>
              Our attorneys are licensed in Colorado, and consultations and
              matter reviews address Colorado and applicable federal law. If
              your matter requires counsel licensed elsewhere, we will tell you
              rather than guess.
            </p>
          </Section>

          <Section title="Disclaimers and liability">
            <p>
              The Services are provided &ldquo;as is.&rdquo; To the extent
              permitted by law and the Colorado Rules of Professional Conduct,
              our total liability arising out of the non-legal-services
              portions of the platform (software availability, data hosting,
              AI chat) is limited to the amounts you paid us in the twelve
              months before the claim. Nothing in these terms limits
              obligations we owe you as legal-services clients under
              applicable professional-responsibility rules.
            </p>
          </Section>

          <Section title="The iOS app">
            <p>
              The Available Law iOS app is licensed, not sold, for use on
              Apple devices you own or control, per Apple&rsquo;s standard
              Licensed Application End User License Agreement. Apple is not a
              party to these terms and has no responsibility for the app or
              its content.
            </p>
          </Section>

          <Section title="Governing law and changes">
            <p>
              These terms are governed by Colorado law. If we make material
              changes, we will update this page and note the new effective
              date. Questions:{" "}
              <a href="mailto:zachariah@availablelaw.com" className="text-[#C17832] underline">
                zachariah@availablelaw.com
              </a>.
            </p>
          </Section>
        </div>
      </main>
      <Footer />
    </>
  );
}
