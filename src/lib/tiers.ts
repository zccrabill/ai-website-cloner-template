/**
 * Single source of truth for Available Law's subscription tiers.
 *
 * If you change limits, copy, or pricing here, the PricingSection cards,
 * dashboard counter, account page, and (for Phase 2) attorney review queue
 * overage prompts will all update consistently.
 */

export type TierKey = "explore" | "build" | "grow" | "lead";

export interface TierConfig {
  key: TierKey;
  label: string;
  tagline: string;
  /**
   * Monthly allotment of attorney tasks. An attorney task is ANY of:
   *   - a matter review (Ava-drafted document the attorney approves
   *     and sends to the client)
   *   - a consultation (30-minute attorney call)
   * The client spends the allotment however they want.
   */
  workItemsPerMonth: number;
  /** Monthly price in USD. 0 for free tier. */
  monthlyPriceUsd: number;
  /** Annual price in USD. 0 for free tier. */
  annualPriceUsd: number;
  /** Feature bullets displayed on the tier card. */
  features: string[];
}

/**
 * Overage pricing for additional matter reviews beyond the monthly allotment.
 * Additional consultations are NOT available as overage — client must upgrade.
 */
export const OVERAGE_PRICE_PER_PAGE_USD = 50;

/**
 * Plain-language name + definition for the monthly attorney allotment. Use
 * these everywhere instead of the old internal phrase "work item" so members
 * always see the same, jargon-free wording.
 */
export const ATTORNEY_TASK_LABEL = "attorney task";
export const ATTORNEY_TASK_DEFINITION =
  "One attorney task = a document our AI drafts and a licensed attorney reviews and sends you, or a 30-minute attorney consult — your choice each time.";

export const TIERS: Record<TierKey, TierConfig> = {
  explore: {
    key: "explore",
    label: "Explore",
    tagline: "Kicking the tires — no commitment.",
    workItemsPerMonth: 0,
    monthlyPriceUsd: 0,
    annualPriceUsd: 0,
    features: [
      "Chat with Ava, our AI legal assistant",
      "Encrypted document storage",
    ],
  },
  build: {
    key: "build",
    label: "Build",
    tagline: "Get your legal basics locked down.",
    workItemsPerMonth: 1,
    monthlyPriceUsd: 50,
    annualPriceUsd: 500,
    features: [
      "Ava AI chat & drafting",
      "Encrypted document storage",
    ],
  },
  grow: {
    key: "grow",
    label: "Grow",
    tagline: "When contracts and deals pick up.",
    workItemsPerMonth: 2,
    monthlyPriceUsd: 150,
    annualPriceUsd: 1500,
    features: [
      "Priority attorney replies (2 business days)",
      "Contract template library",
      "Monthly Practice Letter",
      "Ava AI chat & drafting",
      "Encrypted document storage",
    ],
  },
  lead: {
    key: "lead",
    label: "Lead",
    tagline: "Your on-call outside legal department.",
    workItemsPerMonth: 3,
    monthlyPriceUsd: 300,
    annualPriceUsd: 3000,
    features: [
      "Fastest attorney replies (1 business day)",
      "Quarterly legal roadmap review",
      "Early access to new Ava features",
      "Contract template library",
      "Monthly Practice Letter",
      "Ava AI chat & drafting",
      "Encrypted document storage",
    ],
  },
};

/* ------------------------------------------------------------------ */
/* YLab — teen / youth-entrepreneur tiers                            */
/* ------------------------------------------------------------------ */

/**
 * YLab is Available Law's youth program (see /ylab). Teen founders get their
 * own membership that MIRRORS the adult Build & Grow tiers at a 20% youth
 * discount. We keep these as distinct tier keys (not a coupon on the adult
 * tiers) so teen members can be gated, counted, and served YLab-only content
 * cleanly.
 *
 * Account-holder note: a minor's contract is generally voidable in Colorado,
 * so the PARENT/GUARDIAN is the contracting account holder + payer and the
 * teen is the named participant — until YLab helps change that law.
 */
export type YLabTierKey = "ylab_build" | "ylab_grow";

/** Every tier key the system can store in members.subscription_tier. */
export type AnyTierKey = TierKey | YLabTierKey;

/** Youth discount applied to the mirrored adult price (20% off). */
export const YLAB_DISCOUNT = 0.2;

export const YLAB_TIERS: Record<YLabTierKey, TierConfig> = {
  ylab_build: {
    key: "ylab_build" as TierKey,
    label: "Build",
    tagline: "Lock down the legal basics for your first venture.",
    workItemsPerMonth: 1,
    monthlyPriceUsd: 40, // adult Build $50 − 20%
    annualPriceUsd: 400, // adult Build $500 − 20%
    features: [
      "Ava AI chat & drafting",
      "YLab founder community + podcast drops",
      "Encrypted document storage",
    ],
  },
  ylab_grow: {
    key: "ylab_grow" as TierKey,
    label: "Grow",
    tagline: "For teen founders shipping real products and signing real deals.",
    workItemsPerMonth: 2,
    monthlyPriceUsd: 120, // adult Grow $150 − 20%
    annualPriceUsd: 1200, // adult Grow $1,500 − 20%
    features: [
      "Priority attorney replies (2 business days)",
      "Contract template library",
      "YLab founder community + podcast drops",
      "Ava AI chat & drafting",
      "Encrypted document storage",
    ],
  },
};

/** All tiers (adult + YLab) keyed for resolution from a stored string. */
const ALL_TIERS: Record<string, TierConfig> = { ...TIERS, ...YLAB_TIERS };

/**
 * Resolve a tier config from a raw subscription_tier string. Resolves both
 * adult and YLab tiers. Defaults to explore for unknown or missing values so
 * UI never breaks on bad data.
 */
export function getTier(tier: string | null | undefined): TierConfig {
  if (!tier) return TIERS.explore;
  return ALL_TIERS[tier.toLowerCase()] ?? TIERS.explore;
}

/** True when a stored tier key belongs to the YLab (teen) program. */
export function isYLabTier(tier: string | null | undefined): boolean {
  if (!tier) return false;
  return tier.toLowerCase() in YLAB_TIERS;
}

/**
 * Annual-over-monthly savings as a whole-dollar amount. Useful for pricing
 * card copy like "Save $100/year".
 */
export function annualSavingsUsd(tier: TierConfig): number {
  return tier.monthlyPriceUsd * 12 - tier.annualPriceUsd;
}
