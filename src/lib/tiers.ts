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
   * Monthly allotment of attorney work items. A work item is ANY of:
   *   - a matter review (Allora-drafted document the attorney approves
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

export const TIERS: Record<TierKey, TierConfig> = {
  explore: {
    key: "explore",
    label: "Explore",
    tagline: "See what's possible, no commitment.",
    workItemsPerMonth: 0,
    monthlyPriceUsd: 0,
    annualPriceUsd: 0,
    features: [
      "Unlimited Allora chat (general guidance)",
      "Secure document storage",
      "Upgrade anytime to unlock attorney work",
    ],
  },
  build: {
    key: "build",
    label: "Build",
    tagline: "For founders getting the basics locked down.",
    workItemsPerMonth: 1,
    monthlyPriceUsd: 50,
    annualPriceUsd: 500,
    features: [
      "1 attorney work item per month",
      "Matter reviews or 30-min consultation — your choice",
      "Unlimited Allora chat and document drafting",
      "Secure document storage",
      `Additional reviews: $${OVERAGE_PRICE_PER_PAGE_USD}/page`,
    ],
  },
  grow: {
    key: "grow",
    label: "Grow",
    tagline: "For teams shipping contracts, hiring, and closing deals.",
    workItemsPerMonth: 2,
    monthlyPriceUsd: 150,
    annualPriceUsd: 1500,
    features: [
      "2 attorney work items per month",
      "Any mix of matter reviews and consultations",
      "Priority attorney response (within 2 business days)",
      "Unlimited Allora chat and document drafting",
      "Secure document storage",
      `Additional reviews: $${OVERAGE_PRICE_PER_PAGE_USD}/page`,
    ],
  },
  lead: {
    key: "lead",
    label: "Lead",
    tagline: "For established operators who need depth and speed.",
    workItemsPerMonth: 3,
    monthlyPriceUsd: 300,
    annualPriceUsd: 3000,
    features: [
      "3 attorney work items per month",
      "Any mix of matter reviews and consultations",
      "Priority attorney response (within 1 business day)",
      "Unlimited Allora chat and document drafting",
      "Secure document storage",
      `Additional reviews: $${OVERAGE_PRICE_PER_PAGE_USD}/page`,
    ],
  },
};

/**
 * Resolve a tier config from a raw subscription_tier string. Defaults to
 * explore for unknown or missing values so UI never breaks on bad data.
 */
export function getTier(tier: string | null | undefined): TierConfig {
  if (!tier) return TIERS.explore;
  const key = tier.toLowerCase() as TierKey;
  return TIERS[key] ?? TIERS.explore;
}

/**
 * Annual-over-monthly savings as a whole-dollar amount. Useful for pricing
 * card copy like "Save $100/year".
 */
export function annualSavingsUsd(tier: TierConfig): number {
  return tier.monthlyPriceUsd * 12 - tier.annualPriceUsd;
}
