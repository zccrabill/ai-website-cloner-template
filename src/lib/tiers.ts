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
      "Unlimited Ava AI chat & drafting",
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
      "Unlimited Ava AI chat & drafting",
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
      "Unlimited Ava AI chat & drafting",
      "Encrypted document storage",
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
