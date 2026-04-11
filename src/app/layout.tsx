import type { Metadata } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";
import JsonLd from "@/components/JsonLd";
import {
  SITE_URL,
  SITE_NAME,
  SITE_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  organizationSchema,
  websiteSchema,
} from "@/lib/seo";

// Homepage title tag. Kept separate from SITE_TAGLINE ("Legal Solutions for
// All") because the tagline is a brand slogan, not an SEO-optimized title.
// This string is the single highest-weighted on-page ranking signal and is
// also what AI answer engines quote when citing the site.
const HOMEPAGE_TITLE =
  "Colorado's subscription law firm for small business | Available Law";

const dmSerif = DM_Serif_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: HOMEPAGE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "subscription law firm Colorado",
    "small business lawyer Colorado",
    "Colorado small business attorney",
    "flat fee lawyer Colorado",
    "monthly legal subscription",
    "fractional general counsel Colorado",
    "Colorado AI Act",
    "Colorado AI Act compliance",
    "SB24-205",
    "AI vendor contract review",
    "FAIIR certification",
    "virtual law firm Colorado",
    "business formation Colorado",
    "AI compliance lawyer",
    "Available Law",
    "Zachariah Crabill",
  ],
  authors: [{ name: "Zachariah Crabill", url: SITE_URL }],
  creator: "Available Law, LLC",
  publisher: "Available Law, LLC",
  category: "Legal Services",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: HOMEPAGE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "en_US",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} logo`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: HOMEPAGE_TITLE,
    description: SITE_DESCRIPTION,
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
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico?v=2", sizes: "any" },
      { url: "/icon-192.png?v=2", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png?v=2", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSerif.variable} ${inter.variable}`}>
      <head>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
      </head>
      <body className="min-h-full bg-[#FAF8F5] text-[#1F1810] antialiased">
        {children}
      </body>
    </html>
  );
}
