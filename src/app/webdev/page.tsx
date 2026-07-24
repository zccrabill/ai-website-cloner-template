import type { Metadata } from "next";
import WebdevLanding from "./WebdevLanding";
import JsonLd from "@/components/JsonLd";
import {
  SITE_URL,
  DEFAULT_OG_IMAGE,
  breadcrumbSchema,
  faqPageSchema,
  serviceSchema,
} from "@/lib/seo";
import { WEBDEV_FAQS, WEBDEV_NAME } from "@/lib/webdev";

// Required by Next 16 when next.config.js uses `output: "export"`.
export const dynamic = "force-static";

const PAGE_URL = `${SITE_URL}/webdev`;
// Root layout applies the "%s | Available Law" title template, so do NOT
// repeat the brand suffix here.
const TITLE = "Available Webdev: Custom Website Design & Build for Small Business";
const DESCRIPTION =
  "Available Webdev by Available Law designs and builds beautiful, custom small-business websites — fast, AI-first, and done for you. Launch sites from $1,500. You own everything.";

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

const BREADCRUMBS = [
  { name: "Home", url: "/" },
  { name: WEBDEV_NAME, url: "/webdev" },
];

export default function WebdevPage() {
  return (
    <>
      <JsonLd
        data={[
          serviceSchema({
            name: "Available Webdev — Website Design & Development",
            description:
              "Custom website design and development from Available Law. Beautiful, mobile-first small-business websites built AI-first and done for you — from one-page Launch sites to multi-page Business sites and custom e-commerce. Clients own the site, domain, and accounts.",
            url: `${PAGE_URL}#packages`,
            serviceType: "Website Design and Development",
            price: "1500",
            priceCurrency: "USD",
            offerDescription:
              "Launch (one-page) sites from $1,500, Business (multi-page) sites from $3,500, and custom e-commerce/web apps scoped to the project.",
          }),
          faqPageSchema(WEBDEV_FAQS),
          breadcrumbSchema(BREADCRUMBS),
        ]}
      />
      <WebdevLanding />
    </>
  );
}
