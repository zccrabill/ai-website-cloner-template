/**
 * stripe-webhook Edge Function.
 *
 * Receives Stripe webhook events and keeps the `members` table in sync with
 * subscription state. Without this function, paid users stay on `explore`
 * forever (the static export site can't run a webhook handler itself).
 *
 * Events handled:
 *   - checkout.session.completed       → first signup: link user ↔ stripe customer, set tier
 *   - customer.subscription.updated    → plan change, trial-to-paid, status change
 *   - customer.subscription.deleted    → cancellation: mark canceled, revert to explore
 *   - invoice.payment_failed           → mark past_due
 *
 * Also fires a `checkout.paid` notification email to Zachariah on first signup
 * via the notify-event function (best-effort, fail-open).
 *
 * Required env vars (set in Supabase Edge Functions secrets):
 *   STRIPE_SECRET_KEY                 — sk_live_... or sk_test_...
 *   STRIPE_WEBHOOK_SECRET             — whsec_... from the webhook endpoint config
 *   SUPABASE_URL                      — auto-injected
 *   SUPABASE_SERVICE_ROLE_KEY         — auto-injected
 *
 *   STRIPE_PRICE_BUILD_MONTHLY        — price_... for Build $50/mo
 *   STRIPE_PRICE_BUILD_ANNUAL         — price_... for Build $500/yr
 *   STRIPE_PRICE_GROW_MONTHLY         — price_... for Grow $150/mo
 *   STRIPE_PRICE_GROW_ANNUAL          — price_... for Grow $1500/yr
 *   STRIPE_PRICE_LEAD_MONTHLY         — price_... for Lead $300/mo
 *   STRIPE_PRICE_LEAD_ANNUAL          — price_... for Lead $3000/yr
 *
 * Wire in Stripe dashboard:
 *   Endpoint URL: https://<project-ref>.functions.supabase.co/stripe-webhook
 *   Events to send: checkout.session.completed, customer.subscription.updated,
 *                   customer.subscription.deleted, invoice.payment_failed
 *
 * Webhook returns 2xx on success. On signature failures returns 400 (Stripe
 * will retry on 5xx but not 4xx; we want to fail loud on bad signatures).
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@17.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

type TierKey = "explore" | "build" | "grow" | "lead";
type SubStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "unpaid"
  | "paused"
  | "inactive";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2025-09-30.clover",
  httpClient: Stripe.createFetchHttpClient(),
});

// Subtle: createSubtleCryptoProvider is required for Deno because the default
// crypto provider relies on Node's `crypto` module.
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// Build the price-id → tier map from env vars. Missing entries get logged but
// don't throw — that way a partial config still processes the configured tiers.
function buildPriceMap(): Map<string, TierKey> {
  const map = new Map<string, TierKey>();
  const pairs: Array<[string, TierKey]> = [
    ["STRIPE_PRICE_BUILD_MONTHLY", "build"],
    ["STRIPE_PRICE_BUILD_ANNUAL", "build"],
    ["STRIPE_PRICE_GROW_MONTHLY", "grow"],
    ["STRIPE_PRICE_GROW_ANNUAL", "grow"],
    ["STRIPE_PRICE_LEAD_MONTHLY", "lead"],
    ["STRIPE_PRICE_LEAD_ANNUAL", "lead"],
  ];
  for (const [envKey, tier] of pairs) {
    const priceId = Deno.env.get(envKey);
    if (priceId) map.set(priceId, tier);
  }
  return map;
}

const PRICE_MAP = buildPriceMap();

function resolveTier(priceId: string | null | undefined): TierKey {
  if (!priceId) return "explore";
  return PRICE_MAP.get(priceId) ?? "explore";
}

// Normalize Stripe's subscription.status to what our UI shows. Stripe statuses
// are already strings we can store directly, but we also need an "active-ish"
// boolean later, so keep the raw value.
function normalizeStatus(stripeStatus: string | null | undefined): SubStatus {
  const s = (stripeStatus ?? "").toLowerCase();
  if (
    s === "active" ||
    s === "trialing" ||
    s === "past_due" ||
    s === "canceled" ||
    s === "incomplete" ||
    s === "incomplete_expired" ||
    s === "unpaid" ||
    s === "paused"
  ) {
    return s as SubStatus;
  }
  return "inactive";
}

interface MemberUpdate {
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_tier?: TierKey;
  subscription_status?: SubStatus;
  current_period_end?: string | null;
}

async function updateMemberByUserId(
  userId: string,
  patch: MemberUpdate,
): Promise<void> {
  const { error } = await supabase
    .from("members")
    .update(patch)
    .eq("user_id", userId);
  if (error) {
    console.error(`[stripe-webhook] update by user_id ${userId} failed:`, error);
  }
}

async function updateMemberByCustomerId(
  stripeCustomerId: string,
  patch: MemberUpdate,
): Promise<void> {
  const { error } = await supabase
    .from("members")
    .update(patch)
    .eq("stripe_customer_id", stripeCustomerId);
  if (error) {
    console.error(
      `[stripe-webhook] update by stripe_customer_id ${stripeCustomerId} failed:`,
      error,
    );
  }
}

// Fire-and-forget admin notification on first paid signup. Done by calling our
// own notify-event function, which centralizes Resend usage.
async function fireCheckoutPaidNotification(payload: {
  userId: string | null;
  email: string | null;
  tier: TierKey;
  amount_total: number | null;
  currency: string | null;
}): Promise<void> {
  try {
    const notifyUrl = `${supabaseUrl}/functions/v1/notify-event`;
    await fetch(notifyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      body: JSON.stringify({
        event_type: "checkout.paid",
        user_id: payload.userId,
        member_email: payload.email,
        data: {
          tier: payload.tier,
          amount_total: payload.amount_total,
          currency: payload.currency,
        },
      }),
    });
  } catch (err) {
    console.error("[stripe-webhook] notify-event invoke failed:", err);
  }
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const userId = session.client_reference_id;
  const customerId =
    typeof session.customer === "string"
      ? session.customer
      : session.customer?.id ?? null;
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;
  const email = session.customer_details?.email ?? session.customer_email ?? null;

  if (!userId) {
    console.warn(
      "[stripe-webhook] checkout.session.completed missing client_reference_id — cannot link to member",
      { sessionId: session.id, email },
    );
    return;
  }

  // Pull the subscription to resolve the price → tier. The session sometimes
  // arrives before subscription items are populated, so fetching explicitly
  // is the safer path.
  let tier: TierKey = "explore";
  let status: SubStatus = "inactive";
  let periodEnd: string | null = null;

  if (subscriptionId) {
    try {
      const sub = await stripe.subscriptions.retrieve(subscriptionId);
      const priceId = sub.items.data[0]?.price?.id ?? null;
      tier = resolveTier(priceId);
      status = normalizeStatus(sub.status);
      periodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000).toISOString()
        : null;
    } catch (err) {
      console.error(
        `[stripe-webhook] failed to retrieve subscription ${subscriptionId}:`,
        err,
      );
    }
  }

  await updateMemberByUserId(userId, {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    subscription_tier: tier,
    subscription_status: status,
    current_period_end: periodEnd,
  });

  await fireCheckoutPaidNotification({
    userId,
    email,
    tier,
    amount_total: session.amount_total,
    currency: session.currency,
  });
}

async function handleSubscriptionUpdated(
  sub: Stripe.Subscription,
): Promise<void> {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  const priceId = sub.items.data[0]?.price?.id ?? null;
  const tier = resolveTier(priceId);
  const status = normalizeStatus(sub.status);
  const periodEnd = sub.current_period_end
    ? new Date(sub.current_period_end * 1000).toISOString()
    : null;

  await updateMemberByCustomerId(customerId, {
    stripe_subscription_id: sub.id,
    subscription_tier: tier,
    subscription_status: status,
    current_period_end: periodEnd,
  });
}

async function handleSubscriptionDeleted(
  sub: Stripe.Subscription,
): Promise<void> {
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer.id;
  await updateMemberByCustomerId(customerId, {
    subscription_tier: "explore",
    subscription_status: "canceled",
    current_period_end: null,
  });
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
): Promise<void> {
  const customerId =
    typeof invoice.customer === "string"
      ? invoice.customer
      : invoice.customer?.id;
  if (!customerId) return;
  await updateMemberByCustomerId(customerId, {
    subscription_status: "past_due",
  });
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!webhookSecret) {
    console.error("[stripe-webhook] STRIPE_WEBHOOK_SECRET not configured");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      webhookSecret,
      undefined,
      cryptoProvider,
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[stripe-webhook] signature verification failed:", message);
    return new Response(`Webhook signature verification failed: ${message}`, {
      status: 400,
    });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        // Ack unknown events without processing — keeps Stripe's retry queue clean.
        break;
    }
  } catch (err) {
    // Return 500 so Stripe retries — handlers should be idempotent so retries are safe.
    console.error(`[stripe-webhook] handler for ${event.type} threw:`, err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
