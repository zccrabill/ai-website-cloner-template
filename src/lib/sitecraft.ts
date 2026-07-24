/**
 * Sitecraft — the website design & build offering from Available Law.
 *
 * ── EDIT THIS FILE TO CUSTOMIZE THE OFFERING ──────────────────────────────
 * Everything customer-facing about Sitecraft lives here: the name, the
 * positioning copy, the packages/pricing, the process steps, the FAQ, and
 * the option lists used by the intake form (project types, budgets,
 * timelines, industries). The landing page, homepage section, and intake
 * form all read from these constants, so changing a package price or
 * renaming the brand is a one-file edit — no component surgery required.
 *
 * The positioning deliberately mirrors how Available Law pitches its legal
 * work: AI does the heavy lifting underneath, and a real expert makes the
 * result great. Same story, applied to websites instead of contracts.
 */

/** Brand name for the offering. Rename here and it updates everywhere. */
export const SITECRAFT_NAME = "Sitecraft";
/** How the brand reads in full, umbrella'd under Available Law. */
export const SITECRAFT_FULL_NAME = "Sitecraft by Available Law";
/** Route the landing page lives at. If you change this, update the nav +
 *  footer links and the SEO canonical in src/app/sitecraft/page.tsx. */
export const SITECRAFT_PATH = "/sitecraft";

/** Short tagline used in eyebrows / nav tooltips. */
export const SITECRAFT_TAGLINE = "Websites, done for you";

/** Hero headline + subhead. */
export const SITECRAFT_HERO = {
  eyebrow: "Sitecraft · Websites by Available Law",
  headline: "You know your business.\nWe'll build the website it deserves.",
  subhead:
    "Most small businesses know they need a great website — they just don't have the time, the tools, or the design eye to build one. That's the gap we close. We design and build beautiful, custom sites fast, with AI doing the heavy lifting and a real builder making every pixel right.",
  primaryCta: "Start your project",
  secondaryCta: "See how it works",
} as const;

export interface ValueProp {
  title: string;
  description: string;
}

/** The "why us" grid. Kept to four so the section stays tight. */
export const SITECRAFT_VALUE_PROPS: ValueProp[] = [
  {
    title: "Custom, not a template",
    description:
      "No drag-and-drop template every other business in town is also using. Your site is designed around your brand, your story, and the customers you're trying to win.",
  },
  {
    title: "Fast, because of AI",
    description:
      "The same AI-first approach we use across Available Law compresses weeks of build time into days — so you get a polished site without the agency timeline or the agency invoice.",
  },
  {
    title: "Built to convert",
    description:
      "Beautiful is the baseline. We design around what actually moves the needle: clear messaging, fast load times, mobile-first layouts, and calls-to-action that turn visitors into customers.",
  },
  {
    title: "You own everything",
    description:
      "The site, the domain, the accounts — all yours. We hand off cleanly and can stay on for updates if you want, but you're never locked in.",
  },
];

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

/** How-it-works steps. */
export const SITECRAFT_PROCESS: ProcessStep[] = [
  {
    number: "01",
    title: "Tell us about your business",
    description:
      "Fill out a short project brief — what you do, who you serve, and what you want the site to accomplish. No tech knowledge required.",
  },
  {
    number: "02",
    title: "We design & build",
    description:
      "We turn your brief into a real, working site — AI accelerates the heavy lifting, and a real builder shapes the design, copy, and details.",
  },
  {
    number: "03",
    title: "Review & refine",
    description:
      "You see it, you react, we polish. We iterate on layout, wording, and imagery until it feels unmistakably like your business.",
  },
  {
    number: "04",
    title: "Launch & hand off",
    description:
      "We ship it live on fast, modern hosting and hand over the keys. Want us to keep it fresh? Add an ongoing care plan.",
  },
];

export interface Package {
  key: string;
  name: string;
  blurb: string;
  price: string;
  priceNote: string;
  features: string[];
  featured?: boolean;
}

/**
 * Packages / pricing.
 *
 * ⚠️ PLACEHOLDER PRICING — set these to your real numbers before promoting
 * the page. Prices are intentionally "from / starting at" so a project can
 * be scoped up on the intake call. Currency is USD.
 */
export const SITECRAFT_PACKAGES: Package[] = [
  {
    key: "launch",
    name: "Launch",
    blurb: "A sharp one-page site to get you online and taken seriously.",
    price: "$1,500",
    priceNote: "starting, one-time",
    features: [
      "Single-page / landing site",
      "Custom design in your brand",
      "Copywriting for every section",
      "Mobile-first & fast-loading",
      "Contact form + basic SEO",
      "Launched on modern hosting",
    ],
  },
  {
    key: "business",
    name: "Business",
    blurb: "A full multi-page site that does the selling for you.",
    price: "$3,500",
    priceNote: "starting, one-time",
    featured: true,
    features: [
      "Up to ~6 pages",
      "Everything in Launch, plus:",
      "Services, About, and lead-gen pages",
      "Blog or news section (optional)",
      "Analytics + conversion tracking",
      "Two rounds of revisions",
    ],
  },
  {
    key: "custom",
    name: "Custom",
    blurb: "E-commerce, web apps, or something more ambitious.",
    price: "Let's talk",
    priceNote: "scoped to the project",
    features: [
      "Online store / e-commerce",
      "Booking, portals, or custom features",
      "Integrations (payments, CRM, etc.)",
      "Multi-page + custom functionality",
      "Scoped and quoted after a quick call",
      "Ongoing partnership available",
    ],
  },
];

/** Optional recurring care plan mentioned on the page. Edit or set to null
 *  to hide the care-plan mention. */
export const SITECRAFT_CARE_PLAN: { price: string; description: string } | null =
  {
    price: "$99/mo",
    description:
      "Optional care plan: hosting, security, small content updates, and edits handled for you — so the site never goes stale.",
  };

export interface Faq {
  question: string;
  answer: string;
}

export const SITECRAFT_FAQS: Faq[] = [
  {
    question: "Do I need to know anything technical?",
    answer:
      "Not a thing. That's the whole point of Sitecraft. You tell us about your business in plain language, and we handle the design, the writing, the build, and the launch. If you can fill out a short form, you can get a great website.",
  },
  {
    question: "How long does it take?",
    answer:
      "Most sites go from brief to launch in one to three weeks, depending on scope and how quickly you get us content and feedback. A one-page Launch site can be ready in days. Because we build AI-first, we're dramatically faster than a traditional agency.",
  },
  {
    question: "Do I own the website?",
    answer:
      "Yes — completely. The site, the domain, and all the accounts are yours. We set everything up in your name and hand over the keys at launch. You're never locked into us to make changes.",
  },
  {
    question: "Can you redesign or fix my existing site?",
    answer:
      "Absolutely. Plenty of our projects are redesigns of sites that look dated, load slowly, or aren't bringing in customers. Share your current site in the intake form and we'll tell you the best path forward.",
  },
  {
    question: "What about hosting and my domain?",
    answer:
      "We handle all the technical setup — hosting, your domain, SSL, analytics — and put it in accounts you own. If you already have a domain, we'll connect it. If you don't, we'll help you get one.",
  },
  {
    question: "How is this related to Available Law?",
    answer:
      "Sitecraft is a service from Available Law — the same AI-first team, applied to websites instead of legal work. If you're already an Available Law client, it's a natural add-on; if you're not, you don't need to be to work with us on a site.",
  },
];

/**
 * Intake form option lists.
 *
 * These drive the dropdowns/chips in the intake form. Reorder, add, or
 * remove freely — the form reads them directly. The `value` is what gets
 * stored in the database; the `label` is what the visitor sees.
 */
export const PROJECT_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: "new_site", label: "Brand-new website" },
  { value: "redesign", label: "Redesign an existing site" },
  { value: "landing_page", label: "Landing page / one-pager" },
  { value: "ecommerce", label: "Online store / e-commerce" },
  { value: "web_app", label: "Web app / custom features" },
  { value: "maintenance", label: "Ongoing updates & care" },
  { value: "not_sure", label: "Not sure yet" },
];

/**
 * Industries. Default is a broad small-business list so the form works for
 * anyone. Narrow it to the industries you want to focus on — e.g. law
 * firms, restaurants, contractors — by editing this array.
 */
export const INDUSTRY_OPTIONS: { value: string; label: string }[] = [
  { value: "professional_services", label: "Professional services" },
  { value: "legal", label: "Law firm / legal" },
  { value: "food_hospitality", label: "Restaurant / hospitality" },
  { value: "retail_ecommerce", label: "Retail / e-commerce" },
  { value: "real_estate", label: "Real estate" },
  { value: "health_wellness", label: "Health / wellness" },
  { value: "trades_construction", label: "Trades / construction" },
  { value: "nonprofit", label: "Nonprofit" },
  { value: "tech_startup", label: "Tech / startup" },
  { value: "other", label: "Something else" },
];

export const BUDGET_OPTIONS: { value: string; label: string }[] = [
  { value: "under_2k", label: "Under $2,000" },
  { value: "2k_5k", label: "$2,000 – $5,000" },
  { value: "5k_10k", label: "$5,000 – $10,000" },
  { value: "10k_plus", label: "$10,000+" },
  { value: "unsure", label: "Not sure yet" },
];

export const TIMELINE_OPTIONS: { value: string; label: string }[] = [
  { value: "asap", label: "As soon as possible" },
  { value: "1_month", label: "Within a month" },
  { value: "1_3_months", label: "1–3 months" },
  { value: "flexible", label: "Flexible / just exploring" },
];
