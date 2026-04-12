/**
 * Checkout link map + helpers shared between PricingSection (the marketing
 * homepage cards) and the dedicated /checkout/[tier] pre-checkout page.
 *
 * Why this file exists:
 * - Stripe Payment Links are external URLs we can't generate server-side on a
 *   static export, so we hand-maintain them here. One link per (tier, cycle).
 * - Pricing math lives in src/lib/tiers.ts. This file only stores the Stripe
 *   links and a `buildCheckoutUrl` helper that attaches Supabase user metadata
 *   to the redirect so the Stripe webhook can match the completed session
 *   back to the user record.
 * - Keeping it here (instead of inline in PricingSection) means the new
 *   /checkout/[tier] page and the pricing cards always route through the same
 *   helper, so we never drift between "pricing shows $X" and "Stripe charges $Y".
 */
import type { TierKey } from "@/lib/tiers";

export type BillingCycle = "monthly" | "annual";

export interface TierCheckoutLinks {
  monthly?: string;
  annual?: string;
}

/**
 * Stripe Payment Link per (tier, billing cycle). Missing entries (explore)
 * indicate the tier does not require payment — callers should route to
 * /login or /onboarding instead.
 */
export const CHECKOUT_LINKS: Record<TierKey, TierCheckoutLinks> = {
  explore: {},
  build: {
    monthly: "https://buy.stripe.com/5kQ7sLe8IdFjbiPbnKcMM08",
    annual: "https://buy.stripe.com/7sY4gz8Oobxb4UrfE0cMM09",
  },
  grow: {
    monthly: "https://buy.stripe.com/7sY6oH4y8dFj3Qn63qcMM0a",
    annual: "https://buy.stripe.com/7sY3cv2q00Sx1If77ucMM0b",
  },
  lead: {
    monthly: "https://buy.stripe.com/eVqcN5ggQ0Sx5YvbnKcMM04",
    annual: "https://buy.stripe.com/3cIbJ18Oo6cRcmTfE0cMM0c",
  },
};

/**
 * Resolve the Stripe Payment Link for a given tier + billing cycle. Falls
 * back to monthly when the caller asked for annual and the tier only has a
 * monthly link configured (rare, but keeps the checkout page from breaking).
 * Returns null for free tiers or unconfigured entries.
 */
export function getCheckoutLink(
  tier: TierKey,
  cycle: BillingCycle,
): string | null {
  const links = CHECKOUT_LINKS[tier];
  if (!links) return null;
  if (cycle === "annual" && links.annual) return links.annual;
  if (links.monthly) return links.monthly;
  return null;
}

/**
 * Append Supabase user metadata to a Stripe Payment Link so the checkout
 * webhook can match the completed session back to the user. Falls back to
 * the bare URL when the visitor is anonymous — the webhook will then match
 * on customer email as a secondary key.
 */
export function attachUserParams(
  baseUrl: string,
  opts: { userId?: string | null; userEmail?: string | null },
): string {
  if (!opts.userId && !opts.userEmail) return baseUrl;
  const url = new URL(baseUrl);
  if (opts.userId) url.searchParams.set("client_reference_id", opts.userId);
  if (opts.userEmail) url.searchParams.set("prefilled_email", opts.userEmail);
  return url.toString();
}
