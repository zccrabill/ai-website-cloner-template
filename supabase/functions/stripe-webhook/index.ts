/**
 * stripe-webhook Edge Function — Available Law member tier sync.
 *
 * Keeps public.members in sync with Stripe subscription state.
 *
 * IMPORTANT CONTEXT: the Stripe account (acct_1QWeZDEzO2ttUB9e) is currently
 * shared with the Links golf business, so this endpoint receives BOTH
 * businesses' events. Events whose subscription does not resolve to an
 * Available Law tier are ignored entirely — matching members by email on a
 * foreign event is how zccrabill@gmail.com's member row got overwritten with
 * golf-trial state on 2026-05-15. Do not weaken the guard until the
 * businesses are split into separate Stripe accounts.
 *
 * Tier resolution order (first hit wins, per subscription item):
 *   1. price.metadata.tier          — set `tier=build|grow|lead` on a price in
 *                                     Stripe and it just works, no redeploy
 *   2. STRIPE_PRICE_* env vars      — explicit price-id pins (optional)
 *   3. PRODUCT_TO_TIER              — Available Law product ids (stable across
 *                                     price changes; preferred default path)
 *   4. FALLBACK_PRICE_TO_TIER       — legacy/known price ids
 *
 * Events handled:
 *   - checkout.session.completed     → link member ↔ customer, set tier/status
 *   - customer.subscription.created/updated → tier/status/period sync
 *   - customer.subscription.deleted → revert to explore/canceled
 *   - invoice.payment_failed        → mark past_due (only for the member's
 *                                     own AL subscription)
 *
 * Fires a `checkout.paid` admin email via notify-event on paid AL checkouts
 * (best-effort, never blocks the webhook response).
 *
 * Returns 400 ONLY on signature failure. Handler/DB errors return 500 so
 * Stripe retries; writes are idempotent so retries are safe. Non-AL or
 * unmatchable events return 200 (nothing to do — don't clog Stripe's queue).
 *
 * Required secrets (already set on the project):
 *   STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET  (+ auto-injected SUPABASE_URL,
 *   SUPABASE_SERVICE_ROLE_KEY)
 * Optional:
 *   STRIPE_PRICE_BUILD_MONTHLY/_ANNUAL, STRIPE_PRICE_GROW_*, STRIPE_PRICE_LEAD_*
 *
 * Stripe endpoint: "Available Law — member tier sync"
 *   https://ndxejojdxzzcjrnkscos.supabase.co/functions/v1/stripe-webhook
 *   Subscribe: checkout.session.completed, customer.subscription.created,
 *   customer.subscription.updated, customer.subscription.deleted,
 *   invoice.payment_failed
 *
 * Deploy (from web/):  supabase functions deploy stripe-webhook --no-verify-jwt
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import Stripe from "https://esm.sh/stripe@17.5.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

type TierKey = "explore" | "build" | "grow" | "lead";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY") ?? "";
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  httpClient: Stripe.createFetchHttpClient(),
});
// Deno needs the SubtleCrypto provider for async signature verification.
const cryptoProvider = Stripe.createSubtleCryptoProvider();

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/* -------------------------------------------------------------------------- */
/* Tier resolution                                                            */
/* -------------------------------------------------------------------------- */

// Available Law products (verified against live Stripe 2026-06-09). Products
// are stable across price changes, so new Build/Grow prices resolve with no
// redeploy. Lead has no product entry yet — add it when the Lead product id
// is confirmed; its known price ids are pinned below.
const PRODUCT_TO_TIER: Record<string, TierKey> = {
  prod_UJ1zr0CssdPHIi: "build", // "Build" — $50/mo, $300/yr legacy, $500/yr current
  prod_UJ1zOYywt1Eqln: "grow", // "Grow" — $1500/yr current (grow_annually), monthly
};

// Known price ids, kept as a last-resort net. Includes the legacy ids from the
// previous deployment plus the current lookup-keyed annuals.
const FALLBACK_PRICE_TO_TIER: Record<string, TierKey> = {
  // Build
  price_1TKicyEzO2ttUB9eHg576TlM: "build", // $50/mo
  price_1TKiczEzO2ttUB9e3xhpUnbD: "build", // $300/yr (legacy)
  price_1TUHHFEzO2ttUB9eEDyzxuNw: "build", // $500/yr lookup_key=build_annually
  price_1TKPvHEzO2ttUB9ew0fhGCY4: "build", // legacy
  price_1TKPvhEzO2ttUB9eAcJH1kxO: "build", // legacy
  // Grow
  price_1TUHTnEzO2ttUB9eervW5lPH: "grow", // $1500/yr lookup_key=grow_annually
  price_1TKid0EzO2ttUB9eVZXldSfk: "grow", // legacy monthly
  price_1TKid1EzO2ttUB9eXXg8Nw1E: "grow", // legacy annual
  price_1TKPvIEzO2ttUB9ecRb0qVaz: "grow", // legacy
  price_1TKPviEzO2ttUB9eUlX8q0Nk: "grow", // legacy
  // Lead
  price_1TKPvIEzO2ttUB9eHGC2yT4i: "lead", // $300/mo
  price_1TKPvjEzO2ttUB9eXXLAFgF0: "lead", // $3000/yr
  price_1TKid2EzO2ttUB9erEmX7Xtp: "lead", // legacy annual
};

function isTierKey(v: unknown): v is TierKey {
  return v === "explore" || v === "build" || v === "grow" || v === "lead";
}

function buildEnvPriceMap(): Record<string, TierKey> {
  const pairs: Array<[string, TierKey]> = [
    ["STRIPE_PRICE_BUILD_MONTHLY", "build"],
    ["STRIPE_PRICE_BUILD_ANNUAL", "build"],
    ["STRIPE_PRICE_GROW_MONTHLY", "grow"],
    ["STRIPE_PRICE_GROW_ANNUAL", "grow"],
    ["STRIPE_PRICE_LEAD_MONTHLY", "lead"],
    ["STRIPE_PRICE_LEAD_ANNUAL", "lead"],
  ];
  const map: Record<string, TierKey> = {};
  for (const [key, tier] of pairs) {
    const id = Deno.env.get(key);
    if (id) map[id] = tier;
  }
  return map;
}
const ENV_PRICE_MAP = buildEnvPriceMap();

function productIdOf(p: unknown): string | null {
  if (!p) return null;
  if (typeof p === "string") return p;
  const id = (p as { id?: unknown }).id;
  return typeof id === "string" ? id : null;
}

/**
 * Resolve an Available Law tier from a subscription, or null when the
 * subscription is not an Available Law plan (e.g. a Links golf membership on
 * the shared account). Null means "not ours — do not touch the database".
 */
function tierFromSubscription(sub: Stripe.Subscription): TierKey | null {
  for (const item of sub.items?.data ?? []) {
    const price = item.price;
    if (!price) continue;
    const metaTier = price.metadata?.tier;
    if (isTierKey(metaTier) && metaTier !== "explore") return metaTier;
    if (price.id && ENV_PRICE_MAP[price.id]) return ENV_PRICE_MAP[price.id];
    const productId = productIdOf(price.product);
    if (productId && PRODUCT_TO_TIER[productId]) return PRODUCT_TO_TIER[productId];
    if (price.id && FALLBACK_PRICE_TO_TIER[price.id]) {
      return FALLBACK_PRICE_TO_TIER[price.id];
    }
  }
  return null;
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Return the value only if it's a real UUID — guards the user_id query
 * (a non-UUID client_reference_id like "preview" must never reach Postgres). */
function asUuid(v: string | null | undefined): string | null {
  return v && UUID_RE.test(v) ? v : null;
}

function customerIdOf(
  c: string | { id: string } | null | undefined,
): string | null {
  if (!c) return null;
  return typeof c === "string" ? c : c.id ?? null;
}

/** current_period_end lives on the subscription pre-Basil and on the items
 * post-Basil; read both so an SDK/API version bump can't zero it out. */
function periodEndIso(sub: Stripe.Subscription): string | null {
  const item = sub.items?.data?.[0] as
    | { current_period_end?: number }
    | undefined;
  const top = sub as unknown as { current_period_end?: number };
  const secs = item?.current_period_end ?? top.current_period_end ?? null;
  return secs ? new Date(secs * 1000).toISOString() : null;
}

interface MemberRow {
  user_id: string;
  email: string | null;
  subscription_tier: TierKey | null;
  stripe_subscription_id: string | null;
}

/**
 * Match a member by client_reference_id (uuid) → stripe customer id → email.
 * Only subscription-kind rows with a real auth user are eligible; manual
 * project clients are never billing-synced.
 */
async function findMember(params: {
  clientReferenceId?: string | null;
  stripeCustomerId?: string | null;
  email?: string | null;
}): Promise<MemberRow | null> {
  const select = "user_id, email, subscription_tier, stripe_subscription_id";
  const base = () =>
    admin
      .from("members")
      .select(select)
      .eq("kind", "subscription")
      .not("user_id", "is", null)
      .limit(1);

  const crid = asUuid(params.clientReferenceId);
  if (crid) {
    const { data, error } = await base().eq("user_id", crid);
    if (error) console.error("[stripe-webhook] lookup by user_id failed", error);
    if (data?.[0]) return data[0] as MemberRow;
  }

  if (params.stripeCustomerId) {
    const { data, error } = await base().eq(
      "stripe_customer_id",
      params.stripeCustomerId,
    );
    if (error) console.error("[stripe-webhook] lookup by customer_id failed", error);
    if (data?.[0]) return data[0] as MemberRow;
  }

  if (params.email) {
    const { data, error } = await base().ilike("email", params.email);
    if (error) console.error("[stripe-webhook] lookup by email failed", error);
    if (data?.[0]) return data[0] as MemberRow;
  }

  return null;
}

interface MemberPatch {
  stripe_customer_id?: string | null;
  stripe_subscription_id?: string | null;
  subscription_tier?: TierKey;
  subscription_status?: string;
  current_period_end?: string | null;
}

async function patchMember(userId: string, patch: MemberPatch): Promise<void> {
  const { error } = await admin
    .from("members")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("user_id", userId);
  if (error) {
    // Throw → 500 → Stripe retries. Writes are idempotent so retries are safe.
    console.error("[stripe-webhook] patchMember failed", { userId, patch, error });
    throw error;
  }
}

/** Best-effort admin email on paid AL checkout. Never blocks the webhook. */
async function fireCheckoutPaid(p: {
  userId: string | null;
  email: string | null;
  tier: TierKey;
  amountTotal: number | null;
  currency: string | null;
}): Promise<void> {
  try {
    await fetch(`${SUPABASE_URL}/functions/v1/notify-event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({
        event_type: "checkout.paid",
        user_id: p.userId,
        member_email: p.email,
        data: { tier: p.tier, amount_total: p.amountTotal, currency: p.currency },
      }),
    });
  } catch (err) {
    console.error("[stripe-webhook] notify-event invoke failed:", err);
  }
}

/* -------------------------------------------------------------------------- */
/* Event handlers                                                             */
/* -------------------------------------------------------------------------- */

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
): Promise<void> {
  const customerId = customerIdOf(session.customer as never);
  const subscriptionId =
    typeof session.subscription === "string"
      ? session.subscription
      : session.subscription?.id ?? null;
  const email =
    session.customer_details?.email ?? session.customer_email ?? null;

  // ----- One-time payments (demand letters, engagements, golf fees…) -----
  // No subscription → nothing tier-related to sync. Link the Stripe customer
  // only when the checkout explicitly carries an AL user id; an email-only
  // match on a one-time payment must not rewrite billing state.
  if (!subscriptionId) {
    const crid = asUuid(session.client_reference_id);
    if (!crid) return;
    const member = await findMember({ clientReferenceId: crid });
    if (member && customerId) {
      await patchMember(member.user_id, { stripe_customer_id: customerId });
    }
    return;
  }

  // ----- Subscription checkouts -----
  let sub: Stripe.Subscription;
  try {
    sub = await stripe.subscriptions.retrieve(subscriptionId);
  } catch (err) {
    // Wrong-mode key or transient failure — 500 so Stripe retries visibly.
    console.error("[stripe-webhook] subscriptions.retrieve failed", {
      subscriptionId,
      err,
    });
    throw err;
  }

  const tier = tierFromSubscription(sub);
  if (!tier) {
    // Not an Available Law plan (golf membership, or a brand-new AL price
    // missing from every map). Skipping entirely is the safe behavior on a
    // shared account; if this IS a new AL price, add metadata.tier to it.
    console.warn("[stripe-webhook] ignoring non-AL subscription checkout", {
      session_id: session.id,
      subscription: subscriptionId,
      prices: sub.items?.data?.map((i) => i.price?.id),
    });
    return;
  }

  const member = await findMember({
    clientReferenceId: session.client_reference_id,
    stripeCustomerId: customerId,
    email,
  });
  if (!member) {
    // A paying AL customer with no member row — they bought via a bare
    // payment link without signing up first. Loud log + admin email so this
    // never silently strands a paying client again.
    console.error("[stripe-webhook] PAID AL CHECKOUT WITH NO MEMBER MATCH", {
      session_id: session.id,
      client_reference_id: session.client_reference_id,
      email,
      customerId,
      tier,
    });
    await fireCheckoutPaid({
      userId: null,
      email,
      tier,
      amountTotal: session.amount_total,
      currency: session.currency,
    });
    return;
  }

  await patchMember(member.user_id, {
    stripe_customer_id: customerId,
    stripe_subscription_id: subscriptionId,
    subscription_tier: tier,
    subscription_status: sub.status,
    current_period_end: periodEndIso(sub),
  });

  await fireCheckoutPaid({
    userId: member.user_id,
    email: email ?? member.email,
    tier,
    amountTotal: session.amount_total,
    currency: session.currency,
  });
}

async function handleSubscriptionChange(
  sub: Stripe.Subscription,
): Promise<void> {
  const tier = tierFromSubscription(sub);
  if (!tier) {
    // Links/golf subscription on the shared account — never touch members.
    return;
  }

  const customerId = customerIdOf(sub.customer as never);

  // Email fallback is safe here because AL-ness is already established.
  let email: string | null = null;
  if (customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      if (customer && !(customer as Stripe.DeletedCustomer).deleted) {
        email = (customer as Stripe.Customer).email ?? null;
      }
    } catch {
      /* non-fatal */
    }
  }

  const member = await findMember({ stripeCustomerId: customerId, email });
  if (!member) {
    console.warn("[stripe-webhook] no member match for AL subscription event", {
      sub_id: sub.id,
      customerId,
      email,
    });
    return;
  }

  await patchMember(member.user_id, {
    stripe_customer_id: customerId,
    stripe_subscription_id: sub.id,
    subscription_tier: tier,
    subscription_status: sub.status,
    current_period_end: periodEndIso(sub),
  });
}

async function handleSubscriptionDeleted(
  sub: Stripe.Subscription,
): Promise<void> {
  // The deleted payload still carries items → AL check works the same way.
  const tier = tierFromSubscription(sub);
  if (!tier) return;

  const customerId = customerIdOf(sub.customer as never);
  const member = await findMember({ stripeCustomerId: customerId });
  if (!member) return;

  // Only cancel the member if it's THEIR subscription being deleted (a stale
  // or second subscription on the same customer must not kill an active one).
  if (member.stripe_subscription_id && member.stripe_subscription_id !== sub.id) {
    console.warn("[stripe-webhook] ignoring delete of non-current subscription", {
      deleted: sub.id,
      current: member.stripe_subscription_id,
    });
    return;
  }

  await patchMember(member.user_id, {
    subscription_tier: "explore",
    subscription_status: "canceled",
    current_period_end: null,
  });
}

async function handleInvoicePaymentFailed(
  invoice: Stripe.Invoice,
): Promise<void> {
  const customerId = customerIdOf(invoice.customer as never);
  if (!customerId) return;

  // Invoice payloads vary across API versions; resolve the subscription id
  // defensively, then verify it's an AL subscription before writing anything.
  const rawSub = (invoice as unknown as { subscription?: unknown }).subscription;
  const subId =
    typeof rawSub === "string"
      ? rawSub
      : (rawSub as { id?: string } | null | undefined)?.id ?? null;
  if (!subId) return;

  let sub: Stripe.Subscription;
  try {
    sub = await stripe.subscriptions.retrieve(subId);
  } catch (err) {
    console.error("[stripe-webhook] invoice sub retrieve failed", { subId, err });
    return; // can't verify AL-ness → don't write
  }
  if (!tierFromSubscription(sub)) return; // golf invoice — ignore

  const member = await findMember({ stripeCustomerId: customerId });
  if (!member) return;
  if (member.stripe_subscription_id && member.stripe_subscription_id !== subId) {
    return; // failure on some other subscription, not the member's AL plan
  }

  await patchMember(member.user_id, { subscription_status: "past_due" });
}

/* -------------------------------------------------------------------------- */
/* Entry point                                                                */
/* -------------------------------------------------------------------------- */

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  if (!STRIPE_WEBHOOK_SECRET) {
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
      STRIPE_WEBHOOK_SECRET,
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
        await handleCheckoutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;
      case "customer.subscription.created":
      case "customer.subscription.updated":
        await handleSubscriptionChange(event.data.object as Stripe.Subscription);
        break;
      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        // Ack unhandled events without processing.
        break;
    }
  } catch (err) {
    console.error(`[stripe-webhook] handler for ${event.type} threw:`, err);
    return new Response(
      JSON.stringify({
        error: err instanceof Error ? err.message : String(err),
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
