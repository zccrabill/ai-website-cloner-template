import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import {
  SITE_URL,
  DEFAULT_OG_IMAGE,
  breadcrumbSchema,
  localBusinessSchema,
} from "@/lib/seo";
import { CITIES } from "@/content/city/cityData";

// Required by Next 16 when next.config.js uses `output: "export"`.
export const dynamic = "force-static";

export function generateStaticParams() {
  return CITIES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city: slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);
  if (!city) {
    return { title: "City not found" };
  }
  const url = `${SITE_URL}/colorado/${city.slug}`;
  const title = `${city.titleSuffix} — Flat-Rate Legal Subscription | Available Law`;
  return {
    title,
    description: city.description,
    alternates: { canonical: `/colorado/${city.slug}` },
    openGraph: {
      type: "website",
      url,
      title,
      description: city.description,
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: city.description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: slug } = await params;
  const city = CITIES.find((c) => c.slug === slug);

  if (!city) {
    return (
      <>
        <Header />
        <main className="bg-[#FAF8F5] min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="font-heading text-3xl text-[#1F1810] mb-4">
              City not found
            </h1>
            <Link href="/" className="text-[#C17832] hover:text-[#D4893F]">
              Back home
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <JsonLd
        data={[
          localBusinessSchema({
            city: city.city,
            slug: city.slug,
            description: city.description,
            latitude: city.latitude,
            longitude: city.longitude,
          }),
          breadcrumbSchema([
            { name: "Home", url: "/" },
            { name: "Colorado", url: "/colorado" },
            { name: city.city, url: `/colorado/${city.slug}` },
          ]),
        ]}
      />
      <Header />
      <main className="bg-[#FAF8F5] min-h-screen">
        {/* Hero */}
        <section className="w-full border-b border-[#1F1810]/8">
          <div className="max-w-[1000px] mx-auto px-6 md:px-8 py-20 md:py-28">
            <p className="text-[#C17832] text-[12px] font-semibold tracking-widest uppercase mb-3">
              Serving {city.city}, Colorado
            </p>
            <h1
              className="font-heading text-4xl md:text-5xl text-[#1F1810] mb-6 leading-tight"
              style={{ fontWeight: 400 }}
            >
              {city.city} Small Business Attorney —{" "}
              <span className="text-[#C17832]">Flat Monthly Subscription</span>
            </h1>
            <p className="text-[#6B5B4E] text-lg md:text-xl leading-relaxed max-w-[760px]">
              {city.heroIntro}
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <Link
                href="/#pricing"
                className="btn-al btn-al-primary text-[13px] px-6 py-3 inline-block"
              >
                See Subscription Tiers
              </Link>
              <Link
                href="/ai-act-checker"
                className="btn-al btn-al-secondary text-[13px] px-6 py-3 inline-block"
              >
                Colorado AI Act Checker
              </Link>
            </div>
          </div>
        </section>

        {/* What we do for local businesses */}
        <section className="w-full py-16 md:py-24">
          <div className="max-w-[1000px] mx-auto px-6 md:px-8">
            <h2
              className="font-heading text-3xl md:text-4xl text-[#1F1810] mb-6"
              style={{ fontWeight: 400 }}
            >
              What we handle for {city.city} businesses
            </h2>
            <p className="text-[#6B5B4E] text-lg leading-relaxed mb-8 max-w-[760px]">
              Available Law is a Colorado-licensed virtual law firm. Every
              subscription includes attorney-reviewed work product — contracts,
              vendor agreements, succession documents, formation filings, and
              ongoing compliance questions — without billable hours or retainer
              burn-down statements.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {[
                {
                  title: "AI vendor contract review",
                  body: "If you're buying AI tools for hiring, lending, healthcare, or customer scoring, your vendor contracts probably leave you holding the bag. We review and redline the clauses that matter most under SB 26-189 — developer documentation, audit rights, and indemnity.",
                },
                {
                  title: "Colorado AI Act compliance",
                  body: "SB 26-189 takes effect January 1, 2027. If your business uses AI to make or materially influence consequential decisions, we help you build the pre-use notice, 30-day adverse-outcome notice, meaningful-human-review process, and three-year records the statute requires.",
                },
                {
                  title: "Business succession planning",
                  body: "Buy-sell agreements, ownership-transition documents, and exit planning for closely held Colorado businesses. Built for owners thinking past the next quarter.",
                },
                {
                  title: "Business formation",
                  body: "LLC formation, operating agreements, and corporate records. Colorado doesn't require a written operating agreement — which is exactly why every LLC needs one.",
                },
                {
                  title: "Technology and SaaS contracts",
                  body: "MSAs, SOWs, terms of service, DPAs, and reseller agreements. Built for technology businesses by an attorney who uses AI every day.",
                },
                {
                  title: "Fractional general counsel",
                  body: "The Lead tier ($300/month, 3 attorney tasks) gives growing businesses a predictable legal partner without the overhead of in-house counsel.",
                },
              ].map((svc) => (
                <div
                  key={svc.title}
                  className="bg-white border border-[#1F1810]/8 rounded-[20px] p-6 md:p-8"
                >
                  <h3 className="font-heading text-xl text-[#1F1810] mb-3 leading-snug">
                    {svc.title}
                  </h3>
                  <p className="text-[#6B5B4E] text-[15px] leading-relaxed">
                    {svc.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Industries we see in this city */}
        <section className="w-full py-16 md:py-24 border-t border-[#1F1810]/8">
          <div className="max-w-[1000px] mx-auto px-6 md:px-8">
            <h2
              className="font-heading text-3xl md:text-4xl text-[#1F1810] mb-6"
              style={{ fontWeight: 400 }}
            >
              Industries we see in {city.city}
            </h2>
            <p className="text-[#6B5B4E] text-lg leading-relaxed mb-8 max-w-[760px]">
              Our {city.city} client base skews toward the industries below —
              though our subscription is designed to serve any Colorado small
              business with recurring legal needs.
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-[760px]">
              {city.industries.map((industry) => (
                <li
                  key={industry}
                  className="flex items-start gap-3 text-[#1F1810] text-[15px] leading-relaxed"
                >
                  <span className="text-[#C17832] mt-1">&#9679;</span>
                  <span>{industry}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Colorado AI Act local angle */}
        <section className="w-full py-16 md:py-24 border-t border-[#1F1810]/8 bg-[#F5F0EB]">
          <div className="max-w-[1000px] mx-auto px-6 md:px-8">
            <p className="text-[#C17832] text-[12px] font-semibold tracking-widest uppercase mb-3">
              Colorado AI Act
            </p>
            <h2
              className="font-heading text-3xl md:text-4xl text-[#1F1810] mb-6"
              style={{ fontWeight: 400 }}
            >
              Why {city.city} businesses need to prepare
            </h2>
            <p className="text-[#6B5B4E] text-lg leading-relaxed mb-6 max-w-[760px]">
              {city.aiActLocalAngle}
            </p>
            <p className="text-[#6B5B4E] text-lg leading-relaxed mb-8 max-w-[760px]">
              Start with the{" "}
              <Link
                href="/ai-act-checker"
                className="text-[#C17832] underline hover:text-[#D4893F]"
              >
                free Colorado AI Act Readiness Checker
              </Link>{" "}
              — a 10-question assessment that maps your obligations to the
              statute and produces a gap-analysis report. From there, we can
              certify your program through{" "}
              <Link
                href="/faiir"
                className="text-[#C17832] underline hover:text-[#D4893F]"
              >
                FAIIR
              </Link>{" "}
              and handle ongoing compliance through a subscription.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="w-full py-16 md:py-24 border-t border-[#1F1810]/8">
          <div className="max-w-[800px] mx-auto px-6 md:px-8 text-center">
            <h2
              className="font-heading text-3xl md:text-4xl text-[#1F1810] mb-4"
              style={{ fontWeight: 400 }}
            >
              Ready to work with a {city.city} attorney?
            </h2>
            <p className="text-[#6B5B4E] text-lg mb-8 leading-relaxed">
              Four subscription tiers starting at $50/month. Cancel anytime. No
              retainer, no billable hours, no surprise invoices.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/#pricing"
                className="btn-al btn-al-primary text-[13px] px-6 py-3 inline-block"
              >
                See Subscription Tiers
              </Link>
              <Link
                href="/about/zachariah-crabill"
                className="btn-al btn-al-secondary text-[13px] px-6 py-3 inline-block"
              >
                About the attorney
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
