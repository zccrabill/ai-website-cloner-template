import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { TIERS, TierKey } from "@/lib/tiers";
import CheckoutClient from "./CheckoutClient";

/**
 * Pre-checkout page modeled after Calendly's "Upgrade to Standard" screen.
 * Layout: tier selector + billing cycle toggle (monthly/annual with savings
 * badge) on the left, order summary sidebar on the right, single "Continue
 * to Payment" CTA that redirects to the matching Stripe Payment Link.
 *
 * Why this exists on a static export:
 * - Next 16 `output: "export"` blocks Stripe Checkout Sessions (no server
 *   API routes), so we can't build a first-party checkout. Instead, this
 *   page is a hosted summary + billing-cycle picker that hands off to
 *   Stripe Payment Links on confirmation.
 * - We prerender one HTML file per paid tier via generateStaticParams so
 *   /checkout/build, /checkout/grow, /checkout/lead are all crawlable and
 *   work from a CDN.
 */

const CHECKOUT_TIERS: TierKey[] = ["build", "grow", "lead"];

export function generateStaticParams() {
  return CHECKOUT_TIERS.map((tier) => ({ tier }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tier: string }>;
}): Promise<Metadata> {
  const { tier } = await params;
  const tierKey = tier.toLowerCase() as TierKey;
  const config = TIERS[tierKey];
  if (!config || !CHECKOUT_TIERS.includes(tierKey)) {
    return {
      title: "Checkout not found",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `Checkout — ${config.label} plan`,
    description: `Review your ${config.label} subscription, choose monthly or annual billing, and complete your Available Law membership.`,
    alternates: { canonical: `/checkout/${tierKey}` },
    // Checkout pages don't need to rank — they just need to convert. Block
    // them from the index so search engines don't land visitors on a flow
    // they didn't start from the pricing page.
    robots: { index: false, follow: false },
  };
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ tier: string }>;
}) {
  const { tier } = await params;
  const tierKey = tier.toLowerCase() as TierKey;
  if (!CHECKOUT_TIERS.includes(tierKey)) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="bg-[#FAF8F5] min-h-screen">
        <CheckoutClient initialTier={tierKey} />
      </main>
      <Footer />
    </>
  );
}
