/**
 * Centralized SEO constants and JSON-LD schema builders for Available Law.
 *
 * Why this file exists:
 * - Single source of truth for site URL, name, entity description, etc.
 * - All structured data (JSON-LD) is generated here so Google / Bing / Perplexity
 *   / ChatGPT / Claude retrieval systems see a consistent entity definition.
 * - Changing a field here updates every page automatically on rebuild.
 */

export const SITE_URL = "https://availablelaw.com";
export const SITE_NAME = "Available Law";
export const LEGAL_NAME = "Available Law, LLC";
export const SITE_TAGLINE = "Legal Solutions for All";
/**
 * Short meta description (<=160 chars) for <meta name="description"> and
 * Open Graph. Keep under 160 so Google doesn't truncate.
 */
export const SITE_DESCRIPTION =
  "Colorado's subscription law firm for small business. Flat monthly pricing for contracts, employment, AI vendor review, and Colorado AI Act compliance.";

/**
 * Long-form entity description for JSON-LD schema. Search engines and LLM
 * retrievers read this — it can be longer and more descriptive than the
 * meta description without SEO penalty. Structured as an extractable
 * "[Entity] is a [category] serving [geography] that [differentiator]"
 * sentence so LLM answer engines (ChatGPT, Perplexity, Google AI Overviews)
 * can quote it cleanly.
 */
export const SITE_DESCRIPTION_LONG =
  "Available Law is a Colorado-licensed, FAIIR-certified virtual law firm serving small businesses on a flat monthly subscription. It handles contracts, employment, AI vendor review, and Colorado AI Act (SB24-205) compliance through four subscription tiers — Explore, Build, Grow, and Lead — without billable hours. Available Law is also the home of FAIIR, the Foundation for AI Integrity & Regulation, an AI certification framework for the Colorado AI Act.";
export const CONTACT_EMAIL = "zachariah@availablelaw.com";
export const FOUNDER_NAME = "Zachariah Crabill";
export const FOUNDER_CREDENTIAL = "JD";
export const JURISDICTION = "Colorado";
export const COUNTRY = "US";

export const DEFAULT_OG_IMAGE = `${SITE_URL}/images/logo-transparent.png`;

/**
 * Organization + LegalService combined schema.
 * Attached to every page via the root layout.
 */
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LegalService", "ProfessionalService"],
    "@id": `${SITE_URL}/#organization`,
    name: SITE_NAME,
    legalName: LEGAL_NAME,
    alternateName: "Av{ai}lable Law",
    slogan: SITE_TAGLINE,
    url: SITE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_URL}/images/logo-transparent.png`,
      width: 512,
      height: 512,
    },
    image: DEFAULT_OG_IMAGE,
    description: SITE_DESCRIPTION_LONG,
    email: CONTACT_EMAIL,
    foundingDate: "2025",
    founder: {
      "@type": "Person",
      "@id": `${SITE_URL}/#founder`,
      name: FOUNDER_NAME,
      honorificSuffix: FOUNDER_CREDENTIAL,
      jobTitle: "Founder & Attorney",
      worksFor: { "@id": `${SITE_URL}/#organization` },
      knowsAbout: [
        "Artificial Intelligence Law",
        "Colorado AI Act",
        "Technology Contracts",
        "AI Vendor Due Diligence",
        "Business Formation",
        "Startup Law",
      ],
    },
    areaServed: {
      "@type": "State",
      name: "Colorado",
      containsPlace: [
        { "@type": "City", name: "Denver" },
        { "@type": "City", name: "Boulder" },
        { "@type": "City", name: "Colorado Springs" },
        { "@type": "City", name: "Fort Collins" },
        { "@type": "City", name: "Aurora" },
      ],
    },
    serviceType: [
      "AI Act Compliance Review",
      "AI Vendor Contract Review",
      "Technology Contract Drafting",
      "Business Formation",
      "FAIIR AI Certification",
      "Attorney Document Review",
      "Legal Consultation",
    ],
    knowsAbout: [
      "Colorado AI Act",
      "Colorado Senate Bill 24-205",
      "Artificial Intelligence Compliance",
      "AI Governance",
      "Vendor Contracts",
      "Technology Law",
      "Business Formation",
      "Employment Contracts",
    ],
    priceRange: "$$",
    address: {
      "@type": "PostalAddress",
      addressRegion: "CO",
      addressCountry: COUNTRY,
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: CONTACT_EMAIL,
        areaServed: "US-CO",
        availableLanguage: ["English"],
      },
    ],
    // sameAs links help search engines and LLM retrievers disambiguate
    // "Available Law" from any other entity with a similar name. These URLs
    // must resolve to live profiles — if you claim additional ones
    // (Crunchbase, Facebook, YouTube, etc.), add them here.
    sameAs: [
      "https://www.linkedin.com/company/available-legal-solutions-llc/",
      "https://x.com/availablelaw",
    ],
  };
}

/**
 * WebSite schema — enables sitelinks search box in Google results.
 */
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    url: SITE_URL,
    name: SITE_NAME,
    description: SITE_DESCRIPTION_LONG,
    publisher: { "@id": `${SITE_URL}/#organization` },
    inLanguage: "en-US",
  };
}

/**
 * Blog posting schema for individual blog entries.
 */
export function blogPostingSchema(params: {
  slug: string;
  title: string;
  description: string;
  datePublished: string; // ISO 8601
  dateModified?: string;
  authorName?: string;
  image?: string;
}) {
  const url = `${SITE_URL}/blog/${params.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    headline: params.title,
    description: params.description,
    url,
    mainEntityOfPage: url,
    datePublished: params.datePublished,
    dateModified: params.dateModified ?? params.datePublished,
    inLanguage: "en-US",
    image: params.image ?? DEFAULT_OG_IMAGE,
    author: {
      "@type": "Person",
      name: params.authorName ?? `${FOUNDER_NAME}, ${FOUNDER_CREDENTIAL}`,
      url: SITE_URL,
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
    isPartOf: { "@id": `${SITE_URL}/#website` },
  };
}

/**
 * FAQPage schema — feeds into AI Overviews and "People Also Ask."
 */
export function faqPageSchema(
  questions: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

/**
 * Service schema for a specific offering. Use on product/service landing
 * pages so search engines (and LLMs) can extract price, provider, and
 * area-served facts directly.
 */
export function serviceSchema(params: {
  name: string;
  description: string;
  url: string;
  serviceType: string;
  price?: string;
  priceCurrency?: string;
  offerDescription?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${params.url}#service`,
    name: params.name,
    description: params.description,
    url: params.url,
    serviceType: params.serviceType,
    provider: { "@id": `${SITE_URL}/#organization` },
    areaServed: {
      "@type": "State",
      name: JURISDICTION,
    },
    ...(params.price
      ? {
          offers: {
            "@type": "Offer",
            price: params.price,
            priceCurrency: params.priceCurrency ?? "USD",
            description: params.offerDescription,
            availability: "https://schema.org/InStock",
          },
        }
      : {}),
  };
}

/**
 * BreadcrumbList schema — helps Google render the URL hierarchy in SERPs.
 */
export function breadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url}`,
    })),
  };
}

/**
 * Common FAQ entries about Available Law and FAIIR. Kept here so they stay
 * in sync between the homepage schema, the llms.txt narrative, and any
 * dedicated FAQ pages we add later.
 */
export const HOMEPAGE_FAQS: Array<{ question: string; answer: string }> = [
  {
    question: "What is Available Law?",
    answer:
      "Available Law is a Colorado-licensed, FAIIR-certified virtual law firm serving small businesses on a flat monthly subscription. Instead of billable hours, clients pay a predictable monthly fee for contracts, employment support, AI vendor review, and Colorado AI Act (SB24-205) compliance. Available Law pairs licensed Colorado attorneys with Allora, an AI legal assistant, to deliver work faster without sacrificing attorney review.",
  },
  {
    question: "What is FAIIR?",
    answer:
      "FAIIR stands for the Foundation for AI Integrity & Regulation — an AI certification framework created by Available Law to help businesses audit their AI systems for compliance with the Colorado AI Act and emerging state AI laws. FAIIR includes an initial attorney-led assessment, a written certification letter, and ongoing compliance monitoring.",
  },
  {
    question: "Does Available Law serve clients outside Colorado?",
    answer:
      "Available Law's attorneys are licensed in Colorado and primarily serve Colorado businesses. Some FAIIR compliance work can support multi-state companies headquartered in Colorado.",
  },
  {
    question: "How much does Available Law cost?",
    answer:
      "Available Law offers four flat-rate subscription tiers: Explore is free and gives access to Allora's self-serve tools, Build is $50/month and includes 1 attorney work item, Grow is $150/month and includes 2 attorney work items, and Lead is $300/month and includes 3 attorney work items. Overages are billed at $50 per page of additional attorney review.",
  },
  {
    question: "Is Allora an AI lawyer?",
    answer:
      "No. Allora is an AI legal assistant, not a lawyer. Allora can draft documents, research issues, and prepare matters for review, but every deliverable is reviewed by a licensed Colorado attorney before it reaches the client. Allora does not autonomously provide legal advice.",
  },
  {
    question: "What is the Colorado AI Act?",
    answer:
      "The Colorado AI Act (Senate Bill 24-205) is a 2024 Colorado law that regulates the development and deployment of high-risk artificial intelligence systems. It imposes duties on developers and deployers to prevent algorithmic discrimination, maintain risk management programs, and disclose when AI is used to make consequential decisions. The law takes effect in 2026.",
  },
];
