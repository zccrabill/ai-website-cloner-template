import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, breadcrumbSchema, DEFAULT_OG_IMAGE } from "@/lib/seo";
import { CITIES } from "@/content/city/cityData";

// Required by Next 16 when next.config.js uses `output: "export"`.
export const dynamic = "force-static";

const TITLE = "Colorado Small Business Attorneys — Serving the Front Range";
const DESCRIPTION =
  "Flat-rate legal subscription for Colorado small businesses — serving Denver, Colorado Springs, Fort Collins, Boulder, and Aurora. Contracts, AI vendor review, and Colorado AI Act compliance.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/colorado" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/colorado`,
    title: TITLE,
    description: DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default function ColoradoHubPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Colorado", url: "/colorado" },
        ])}
      />
      <Header />
      <main className="bg-[#FAF8F5] min-h-screen">
        <section className="w-full border-b border-[#1F1810]/8">
          <div className="max-w-[1000px] mx-auto px-6 md:px-8 py-20 md:py-28">
            <p className="text-[#C17832] text-[12px] font-semibold tracking-widest uppercase mb-3">
              Serving Colorado statewide
            </p>
            <h1
              className="font-heading text-4xl md:text-5xl text-[#1F1810] mb-6 leading-tight"
              style={{ fontWeight: 400 }}
            >
              Colorado Small Business Attorneys
            </h1>
            <p className="text-[#6B5B4E] text-lg md:text-xl leading-relaxed max-w-[760px]">
              Available Law is a Colorado-licensed virtual law firm serving
              small businesses across the Front Range — and anywhere else in
              Colorado. Pick your city for local pages, or jump straight to the
              subscription tiers.
            </p>
          </div>
        </section>

        <section className="w-full py-16 md:py-24">
          <div className="max-w-[1000px] mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {CITIES.map((city) => (
                <Link
                  key={city.slug}
                  href={`/colorado/${city.slug}`}
                  className="group"
                >
                  <div className="bg-white border border-[#1F1810]/8 rounded-[20px] p-6 md:p-8 h-full transition-all duration-300 hover:bg-[#F5F0EB] cursor-pointer">
                    <p className="text-[#C17832] text-[12px] font-semibold tracking-widest uppercase mb-3">
                      Colorado
                    </p>
                    <h2 className="font-heading text-xl text-[#1F1810] mb-3 leading-snug group-hover:text-[#D4893F] transition-colors">
                      {city.city}
                    </h2>
                    <p className="text-[#6B5B4E] text-[14px] leading-relaxed mb-4">
                      {city.description}
                    </p>
                    <span className="text-[#C17832] text-[14px] font-medium group-hover:translate-x-1 transition-transform inline-block">
                      View {city.city} page &rarr;
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
