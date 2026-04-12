import { Suspense } from "react";
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
        {/*
         * Suspense boundary is required because CheckoutClient calls
         * useSearchParams(). Without it, Next 16's static export throws
         * "useSearchParams() should be wrapped in a suspense boundary"
         * during prerender and the build fails. The fallback is a static
         * skeleton of the layout so the first paint doesn't flash empty.
         */}
        <Suspense fallback={<CheckoutFallback />}>
          <CheckoutClient initialTier={tierKey} />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

/**
 * Lightweight skeleton shown while the client component hydrates and reads
 * search params. Matches the two-column checkout layout so nothing jumps.
 */
function CheckoutFallback() {
  return (
    <div className="max-w-[1180px] mx-auto px-6 md:px-8 py-12 lg:py-16">
      <div className="mb-8 h-4 w-32 rounded bg-[#EDE5DB]" />
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_400px] gap-10 lg:gap-12">
        <div className="space-y-6">
          <div className="h-10 w-3/4 rounded bg-[#EDE5DB]" />
          <div className="h-4 w-2/3 rounded bg-[#EDE5DB]" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
            <div className="h-28 rounded-xl bg-[#EDE5DB]" />
            <div className="h-28 rounded-xl bg-[#EDE5DB]" />
            <div className="h-28 rounded-xl bg-[#EDE5DB]" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4">
            <div className="h-32 rounded-xl bg-[#EDE5DB]" />
            <div className="h-32 rounded-xl bg-[#EDE5DB]" />
          </div>
        </div>
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="h-[360px] rounded-2xl bg-[#EDE5DB]" />
        </aside>
      </div>
    </div>
  );
}
