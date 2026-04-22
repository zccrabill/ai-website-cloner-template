/**
 * City data for Colorado landing pages.
 *
 * Each entry drives a single page at /colorado/<slug> with a LocalBusiness
 * JSON-LD node, city-specific copy, and a canonical URL. When you add a new
 * city:
 *   1. Append an entry here.
 *   2. Add `/colorado/<slug>` to src/app/sitemap.ts.
 *   3. Optionally link to it from the footer.
 *
 * Keep `description` to ~155 characters so Google's meta description pass-through
 * doesn't truncate. Keep `heroIntro` under ~400 characters for above-the-fold
 * readability. `industries` and `whySection` are free-form.
 */
export interface CityData {
  slug: string;
  city: string;
  /** For the <title> tag. */
  titleSuffix: string;
  /** Meta description (<=160 chars). */
  description: string;
  /** Approximate city-center coordinates for LocalBusiness geo. */
  latitude: number;
  longitude: number;
  /** 1-2 sentence hero paragraph below the H1. */
  heroIntro: string;
  /**
   * 3-5 industries that matter in this city. Powers a "Industries we see"
   * section that doubles as local keyword coverage.
   */
  industries: string[];
  /**
   * A couple of sentences about why Colorado AI Act compliance specifically
   * matters for businesses in this city.
   */
  aiActLocalAngle: string;
}

export const CITIES: CityData[] = [
  {
    slug: "denver",
    city: "Denver",
    titleSuffix: "Denver Small Business Attorney",
    description:
      "Subscription legal counsel for Denver small businesses — flat $50–$300/month. AI vendor contracts, Colorado AI Act compliance, employment, and business formation.",
    latitude: 39.7392,
    longitude: -104.9903,
    heroIntro:
      "Available Law is a Colorado virtual law firm serving Denver small businesses on a flat monthly subscription. No billable hours, no surprise invoices — just predictable legal support from a Colorado-licensed attorney.",
    industries: [
      "SaaS and AI startups in RiNo and LoDo",
      "Healthcare and biotech near Fitzsimons",
      "Professional services in the CBD and Cherry Creek",
      "Construction and real estate developers",
      "Cannabis and dispensary operators",
    ],
    aiActLocalAngle:
      "Denver's tech sector — especially Boulder-adjacent AI startups, HR-tech vendors, and healthcare AI deployers — sits squarely inside the Colorado AI Act's (SB24-205) definition of high-risk AI. Denver companies that hire, lend, or deliver healthcare decisions through AI need a documented governance program by June 30, 2026.",
  },
  {
    slug: "colorado-springs",
    city: "Colorado Springs",
    titleSuffix: "Colorado Springs Small Business Attorney",
    description:
      "Subscription legal counsel for Colorado Springs small businesses — flat $50–$300/month. AI vendor contracts, Colorado AI Act compliance, employment, and business formation.",
    latitude: 38.8339,
    longitude: -104.8214,
    heroIntro:
      "Available Law is based in Colorado Springs and serves small businesses across El Paso County on a flat monthly subscription. Practical legal help from a Colorado attorney — no billable hours, no retainer surprises.",
    industries: [
      "Defense and aerospace contractors",
      "Cybersecurity and IT services",
      "Nonprofits and ministries",
      "Healthcare practices and medical groups",
      "Home services and trades",
    ],
    aiActLocalAngle:
      "Colorado Springs' defense and cybersecurity ecosystem means a disproportionate number of local employers screen applicants with AI-assisted tools — exactly the use case the Colorado AI Act treats as high-risk. Local employment decisions made with AI will need documented bias testing and consumer notice once SB24-205 takes effect on June 30, 2026.",
  },
  {
    slug: "fort-collins",
    city: "Fort Collins",
    titleSuffix: "Fort Collins Small Business Attorney",
    description:
      "Subscription legal counsel for Fort Collins small businesses — flat $50–$300/month. AI vendor contracts, Colorado AI Act compliance, employment, and business formation.",
    latitude: 40.5853,
    longitude: -105.0844,
    heroIntro:
      "Available Law serves Fort Collins small businesses — from CSU spinouts to Old Town craft producers — on a flat monthly subscription. Plain-language legal help from a Colorado-licensed attorney.",
    industries: [
      "Craft breweries and food producers",
      "Cleantech and hardware startups",
      "CSU-adjacent research spinouts",
      "Outdoor recreation and cycling",
      "Construction and engineering firms",
    ],
    aiActLocalAngle:
      "Fort Collins is a small-business hub with a heavy cluster of CSU spinouts working in AI, robotics, and cleantech. Spinouts that sell AI products into hiring, lending, or healthcare markets fall under the Colorado AI Act's developer duties — a distinct compliance track from simple deployer obligations, and one most local founders haven't planned for.",
  },
  {
    slug: "boulder",
    city: "Boulder",
    titleSuffix: "Boulder Small Business Attorney",
    description:
      "Subscription legal counsel for Boulder small businesses — flat $50–$300/month. AI vendor contracts, Colorado AI Act compliance, employment, and business formation.",
    latitude: 40.015,
    longitude: -105.2705,
    heroIntro:
      "Available Law serves Boulder small businesses and startups on a flat monthly subscription. Whether you're scaling a Pearl Street consumer brand or spinning out of CU, get practical legal help from a Colorado attorney — without billable hours.",
    industries: [
      "AI and machine-learning startups",
      "CU Boulder research spinouts",
      "Natural and organic consumer brands",
      "Outdoor recreation and apparel",
      "Climate tech and cleantech",
    ],
    aiActLocalAngle:
      "Boulder has one of the densest concentrations of early-stage AI companies in the Mountain West. Founders building models, APIs, or agents for consumer-facing decisions are developers under the Colorado AI Act — with documentation, impact assessment, and downstream-notice duties that are materially more demanding than the obligations on their customers.",
  },
  {
    slug: "aurora",
    city: "Aurora",
    titleSuffix: "Aurora Small Business Attorney",
    description:
      "Subscription legal counsel for Aurora small businesses — flat $50–$300/month. AI vendor contracts, Colorado AI Act compliance, employment, and business formation.",
    latitude: 39.7294,
    longitude: -104.8319,
    heroIntro:
      "Available Law serves Aurora small businesses on a flat monthly subscription. From the Anschutz Medical Campus to the DIA corridor, get legal help from a Colorado attorney without the billable-hour sticker shock.",
    industries: [
      "Healthcare and biotech near Anschutz",
      "Logistics and last-mile near DIA",
      "Home services and trades",
      "Restaurants and hospitality",
      "Immigrant-owned small businesses",
    ],
    aiActLocalAngle:
      "Aurora's healthcare density — particularly around the Anschutz Medical Campus — makes Colorado AI Act compliance especially pointed for local providers. Any clinical decision-support or patient-triage AI used by Aurora providers is a high-risk system under SB24-205 once it takes effect on June 30, 2026.",
  },
];
