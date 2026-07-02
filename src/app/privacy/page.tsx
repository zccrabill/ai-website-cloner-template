// Reviewed and approved by Zachariah Crabill (attorney) 2026-07-02.
// Linked from the iOS app's Account tab and App Store Connect.

import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

const TITLE = "Privacy Policy";
const DESCRIPTION =
  "How Available Law collects, uses, and protects your information across availablelaw.com and the Available Law iOS app.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/privacy`,
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

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="bg-[#FAF8F5] min-h-screen">
        <div className="max-w-[760px] mx-auto px-6 md:px-8 py-20 md:py-24">
          <p className="text-[#C17832] text-[12px] font-semibold tracking-widest uppercase mb-3">
            Legal
          </p>
          <h1 className="font-heading text-4xl text-[#1F1810] mb-2" style={{ fontWeight: 400 }}>
            Privacy Policy
          </h1>
          <p className="text-[#A89279] text-sm mb-12">Effective July 2, 2026</p>

          <Section title="Who we are">
            <p>
              Available Law is a Colorado law firm providing subscription legal
              services to small businesses and individuals through
              availablelaw.com and the Available Law iOS app (together, the
              &ldquo;Services&rdquo;). This policy explains what information we
              collect, how we use it, and the choices you have. Questions go to{" "}
              <a href="mailto:zachariah@availablelaw.com" className="text-[#C17832] underline">
                zachariah@availablelaw.com
              </a>.
            </p>
          </Section>

          <Section title="What we collect">
            <p>
              <strong className="text-[#1F1810]">Account information.</strong>{" "}
              Name, email address, password (stored as a salted hash — we never
              see it), and the business details you share during onboarding
              (business name, type, industry, state).
            </p>
            <p>
              <strong className="text-[#1F1810]">Legal matter content.</strong>{" "}
              Messages you exchange with Ava (our AI intake assistant),
              documents you upload, and matters you send for attorney review.
            </p>
            <p>
              <strong className="text-[#1F1810]">Billing information.</strong>{" "}
              Payments are processed by Stripe. We store your subscription tier
              and status; we never store your card number.
            </p>
            <p>
              <strong className="text-[#1F1810]">Usage and security data.</strong>{" "}
              Standard server logs and AI-usage records used for rate limiting
              and abuse prevention. IP addresses used for rate limiting are
              stored only as salted one-way hashes.
            </p>
          </Section>

          <Section title="How we use it">
            <p>
              To deliver the Services: answering your questions, routing matters
              to a licensed attorney, storing your documents, managing your
              subscription, and keeping the platform secure. We do not sell your
              information, and we do not use it for third-party advertising.
            </p>
          </Section>

          <Section title="AI processing">
            <p>
              Conversations with Ava are processed by Anthropic&rsquo;s Claude
              models via API to generate responses. Under our API terms with
              Anthropic, these conversations are not used to train Anthropic&rsquo;s
              models. Documents stored in your account may be provided to the
              model as context for your conversations. Every substantive matter
              is reviewed by a licensed Colorado attorney before any deliverable
              is sent — Ava provides legal information, not legal advice.
            </p>
          </Section>

          <Section title="Where your data lives">
            <p>
              Client data is stored with Supabase (managed Postgres and file
              storage), encrypted in transit and at rest, with row-level
              security so only you and firm staff can access your records. We
              use a small set of service providers to operate the platform:
              Supabase (database and storage), Stripe (payments), Anthropic (AI
              processing), Cloudflare (bot protection), Netlify (hosting), and
              Calendly (consultation scheduling). Each receives only what it
              needs to perform its function.
            </p>
          </Section>

          <Section title="Confidentiality and privilege">
            <p>
              We treat the contents of your member portal as confidential.
              Whether attorney-client privilege attaches to a particular
              communication depends on your engagement with the firm — see our{" "}
              <a href="/terms" className="text-[#C17832] underline">Terms of Service</a>{" "}
              and your engagement agreement for specifics.
            </p>
          </Section>

          <Section title="The iOS app">
            <p>
              The Available Law iOS app signs in to the same account and stores
              your session securely in the device keychain. The app contains no
              third-party advertising or analytics SDKs and does not track you
              across other apps or websites. Data collected through the app is
              the same data described above, used only to provide the Services.
            </p>
          </Section>

          <Section title="Retention and deletion">
            <p>
              We retain client records while your account is active and as
              required by Colorado attorney record-keeping obligations. You can
              delete uploaded documents at any time from the portal. To request
              account deletion, email{" "}
              <a href="mailto:zachariah@availablelaw.com" className="text-[#C17832] underline">
                zachariah@availablelaw.com
              </a>{" "}
              — we will delete your account and associated data except where
              professional-responsibility rules require us to keep matter
              records.
            </p>
          </Section>

          <Section title="Children">
            <p>
              The Services are not directed to children under 13. YLab
              memberships for teen founders are held and managed by a parent or
              guardian, who is the account holder.
            </p>
          </Section>

          <Section title="Changes">
            <p>
              If we make material changes to this policy, we will update this
              page and note the new effective date above.
            </p>
          </Section>
        </div>
      </main>
      <Footer />
    </>
  );
}
