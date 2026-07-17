import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import {
  DEFAULT_OG_IMAGE,
  FOUNDER_URL,
  breadcrumbSchema,
  personSchema,
} from "@/lib/seo";

// Required by Next 16 when next.config.js uses `output: "export"`.
export const dynamic = "force-static";

const TITLE =
  "Zachariah Crabill, JD — Founder & Attorney, Available Law";
const DESCRIPTION =
  "Zachariah Crabill is a Colorado-licensed attorney, founder of Available Law, and creator of the FAIIR certification framework for the Colorado AI Act (SB 26-189). Writing and practice focus: AI governance, AI vendor contracts, and small-business legal ops.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/about/zachariah-crabill" },
  openGraph: {
    type: "profile",
    url: FOUNDER_URL,
    title: TITLE,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
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

/**
 * /about/zachariah-crabill
 *
 * Why this page exists:
 * - E-E-A-T signal for legal (YMYL) content. Every BlogPosting on the site
 *   sets author.url = FOUNDER_URL; without a real page at that URL, the
 *   structured data dead-ends and Google/Perplexity/ChatGPT won't cite us
 *   as an authoritative source on the Colorado AI Act.
 * - Disambiguates "Zachariah Crabill" as the author entity so LLM retrievers
 *   link the Person back to the Organization and the published posts.
 * - Gives prospective clients a face and credentials without forcing them
 *   to find the founder on LinkedIn or Google first.
 *
 * Editorial notes:
 * - Every factual claim here should be independently checkable (bar
 *   directory, speaking engagements, media mentions, published writing).
 *   If you can't point to a public source, don't put it on the page.
 * - Items marked {/* TODO: ... *\/} are waiting on confirmed facts from
 *   the founder — fill them in before shipping.
 */
export default function AboutZachariahPage() {
  return (
    <>
      <JsonLd
        data={[
          personSchema(),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "About", url: "/about/zachariah-crabill" },
          ]),
        ]}
      />
      <Header />
      <main className="bg-[#FAF8F5] min-h-screen">
        {/* Hero */}
        <section className="w-full border-b border-[#1F1810]/8">
          <div className="max-w-[800px] mx-auto px-6 md:px-8 py-16 md:py-24">
            <p className="text-[#C17832] text-[12px] font-semibold tracking-widest uppercase mb-3">
              About
            </p>
            <h1
              className="font-heading text-4xl md:text-5xl text-[#1F1810] mb-6 leading-tight"
              style={{ fontWeight: 400 }}
            >
              Zachariah Crabill, JD
            </h1>
            <p className="text-[#6B5B4E] text-xl leading-relaxed mb-4">
              Founder &amp; Attorney, Available Law. Creator of the FAIIR
              certification framework for the Colorado AI Act.
            </p>
            <p className="text-[#A89279] text-[14px]">
              Colorado-licensed &middot; Based in Colorado &middot; Serving the
              Front Range
            </p>
          </div>
        </section>

        {/* Bio */}
        <section className="w-full py-16">
          <div className="max-w-[800px] mx-auto px-6 md:px-8 space-y-6 text-[#1F1810] text-lg leading-relaxed">
            <h2
              className="font-heading text-3xl text-[#1F1810]"
              style={{ fontWeight: 400 }}
            >
              About Zachariah
            </h2>

            <p>
              Zachariah Crabill is a Colorado-licensed attorney and the founder
              of <Link href="/" className="text-[#C17832] hover:text-[#D4893F] underline">Available Law</Link>,
              a virtual law firm built for small businesses that need serious
              legal support without big-firm billing. He started Available Law
              after watching too many Colorado founders and operators pay for
              legal work they could not predict, could not explain, and could
              not keep. The subscription model that runs Available Law today is
              his answer to that problem.
            </p>

            <p>
              His practice focuses on artificial intelligence law — the
              Colorado AI Act (SB 26-189), AI vendor contracts, AI governance,
              and the documentation regulators will ask for when enforcement
              begins on January 1, 2027. He built{" "}
              <Link href="/faiir" className="text-[#C17832] hover:text-[#D4893F] underline">
                FAIIR — the Foundation of AI Integrity &amp; Regulation
              </Link>{" "}
              as a structured, attorney-led framework for getting Colorado
              businesses through the statute with defensible, dated work
              product.
            </p>

            <p>
              Beyond AI, Zachariah handles the legal work most Colorado small
              businesses actually run into: entity formation, operating
              agreements, business succession planning, vendor contracts, and
              the occasional hard conversation with a co-founder. He uses
              Ava, Available Law&apos;s AI legal assistant, to prepare
              drafts and research faster — but every deliverable is reviewed
              by a human attorney before it reaches a client. Ava is a
              tool; the legal judgment is his.
            </p>

            {/* Every claim below is independently verifiable — law school
                enrollment records, the FARB conference program, and the
                NBCOT webinar archive. This paragraph is the primary E-E-A-T
                signal LLMs use when deciding whether to cite the site on
                Colorado AI Act topics. Do not add anything that cannot be
                pointed to in a public source. */}
            <p>
              Zachariah earned his JD from Liberty University School of Law,
              class of 2021, and was admitted to the Colorado bar the same
              year. Recent speaking work includes serving as an Expert
              Panelist at the FARB Conference in 2024 and as a Featured
              Speaker at the NBCOT Regulatory Webinar in 2025 — both audiences
              focused on professional regulation and compliance frameworks,
              which overlap directly with the documented governance the
              Colorado AI Act requires of any business deploying covered ADMT.
            </p>
          </div>
        </section>

        {/* Credentials grid */}
        <section className="w-full py-12 border-t border-[#1F1810]/8">
          <div className="max-w-[800px] mx-auto px-6 md:px-8">
            <h2
              className="font-heading text-2xl text-[#1F1810] mb-8"
              style={{ fontWeight: 400 }}
            >
              Credentials
            </h2>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <dt className="text-xs font-semibold text-[#A89279] tracking-widest uppercase mb-2">
                  Bar admission
                </dt>
                <dd className="text-[#1F1810]">
                  State of Colorado &middot; Admitted 2021 &middot; Bar No. 56783
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[#A89279] tracking-widest uppercase mb-2">
                  Degree
                </dt>
                <dd className="text-[#1F1810]">
                  Juris Doctor (JD) &mdash; Liberty University School of Law, 2021
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[#A89279] tracking-widest uppercase mb-2">
                  Regulator
                </dt>
                <dd className="text-[#1F1810]">
                  Colorado Supreme Court Office of Attorney Regulation Counsel
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold text-[#A89279] tracking-widest uppercase mb-2">
                  Practice focus
                </dt>
                <dd className="text-[#1F1810]">
                  AI law &middot; Business formation &middot; Technology
                  contracts
                </dd>
              </div>
            </dl>
          </div>
        </section>

        {/* Areas of focus */}
        <section className="w-full py-12 border-t border-[#1F1810]/8">
          <div className="max-w-[800px] mx-auto px-6 md:px-8">
            <h2
              className="font-heading text-2xl text-[#1F1810] mb-6"
              style={{ fontWeight: 400 }}
            >
              Areas of focus
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[#1F1810]">
              {[
                "Colorado AI Act (SB 26-189) compliance",
                "AI governance and ADMT compliance programs",
                "FAIIR — Foundation of AI Integrity & Regulation",
                "AI vendor contract review and negotiation",
                "Business succession planning and buy-sell agreements",
                "Technology contracts",
                "Colorado LLC formation and operating agreements",
                "Fractional general counsel for small business",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[15px] leading-relaxed"
                >
                  <span className="text-[#C17832] mt-1">&bull;</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Recent writing */}
        <section className="w-full py-12 border-t border-[#1F1810]/8">
          <div className="max-w-[800px] mx-auto px-6 md:px-8">
            <h2
              className="font-heading text-2xl text-[#1F1810] mb-6"
              style={{ fontWeight: 400 }}
            >
              Recent writing
            </h2>
            <ul className="space-y-4">
              {[
                {
                  slug: "colorado-ai-act-rewrite-2026-smb-impact",
                  title:
                    "Colorado Just Rewrote Its AI Law — What It Means for Your Small Business",
                },
                {
                  slug: "colorado-ai-act-2026",
                  title:
                    "Colorado AI Act 2026: The Plain-Language Guide for Businesses",
                },
                {
                  slug: "what-is-faiir-framework",
                  title:
                    "What Is the FAIIR Framework? AI Compliance for Colorado Businesses",
                },
                {
                  slug: "5-ai-vendor-contract-clauses",
                  title:
                    "5 AI Vendor Contract Clauses Your Company Is Missing",
                },
                {
                  slug: "ai-liability-insurance-coverage",
                  title: "Does Your Business Insurance Cover AI Liability?",
                },
              ].map((post) => (
                <li key={post.slug}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="text-[#1F1810] hover:text-[#C17832] underline underline-offset-2 decoration-[#C17832]/40 hover:decoration-[#C17832]"
                  >
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/blog"
              className="inline-block mt-8 text-[#C17832] hover:text-[#D4893F] text-[14px] font-medium"
            >
              See all writing &rarr;
            </Link>
          </div>
        </section>

        {/* Contact / CTA */}
        <section className="w-full py-16 border-t border-[#1F1810]/8">
          <div className="max-w-[800px] mx-auto px-6 md:px-8">
            <h2
              className="font-heading text-2xl text-[#1F1810] mb-4"
              style={{ fontWeight: 400 }}
            >
              Get in touch
            </h2>
            <p className="text-[#6B5B4E] text-lg leading-relaxed mb-6">
              The fastest path to working with Zachariah is a subscription to
              Available Law or a FAIIR discovery call. If you just want to ask
              a question, email works too.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/#pricing"
                className="btn-al btn-al-primary text-[13px] px-6 py-3 text-center"
              >
                See subscription plans
              </Link>
              <Link
                href="/faiir"
                className="btn-al btn-al-ghost text-[13px] px-6 py-3 text-center"
              >
                Book a FAIIR call
              </Link>
              <a
                href="mailto:zachariah@availablelaw.com"
                className="btn-al btn-al-ghost text-[13px] px-6 py-3 text-center"
              >
                zachariah@availablelaw.com
              </a>
            </div>

            <p className="text-[#A89279] text-[12px] mt-10 leading-relaxed">
              Nothing on this page is legal advice. Contacting Available Law
              does not create an attorney-client relationship. A relationship
              is formed only through a signed engagement agreement with
              Available Law, LLC.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
