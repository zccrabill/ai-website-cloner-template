/**
 * client-review Edge Function.
 *
 * Backs the public review-collection flow at availablelaw.com/review.
 * Two actions on one endpoint:
 *
 *   POST { action: "draft",  rating, chips, practice_area? }
 *     → { draft }   Generates a short first-person review draft with the
 *                   Anthropic API. The draft is a STARTING POINT the client
 *                   edits and adopts — the UI frames it that way, and the
 *                   final adopted text is stored separately from this draft.
 *
 *   POST { action: "submit", rating, chips, practice_area?, review_text,
 *          ai_drafting_used, ai_draft_text?, first_name, last_name,
 *          business_name?, consent_level, attested }
 *     → { ok }      Validates, stores the review as status='pending' (nothing
 *                   publishes without Zachariah's approval), records the exact
 *                   consent attestation text + timestamp, and emails Zachariah
 *                   via the notify-event function.
 *
 * Compliance (Colorado attorney advertising):
 *   - The generation prompt forbids outcome guarantees, comparative claims,
 *     and statements creating unjustified expectations (Colo. RPC 7.1).
 *   - The consent attestation is composed SERVER-SIDE per consent level and
 *     stored verbatim with the row — that is the audit trail.
 *   - Reviews never auto-publish; they land pending for admin approval.
 *
 * Cost/abuse controls: rolling-24h caps per hashed IP (drafts logged to
 * public.ai_usage with tier='review'; submissions counted from
 * public.client_reviews). IPs are hashed with the same salt scheme as
 * allora-chat, never stored raw.
 *
 * Env: ANTHROPIC_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *      IP_HASH_SALT (optional).
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const DRAFT_MODEL = "claude-sonnet-4-6";

// Rolling-24h caps per hashed IP. Drafts are cheap but metered; submissions
// are tighter because each one lands in Zachariah's inbox.
const DRAFT_DAILY_LIMIT = 15;
const SUBMIT_DAILY_LIMIT = 5;

const IP_HASH_SALT = Deno.env.get("IP_HASH_SALT") ?? "available-law-ava-v1";

const PRACTICE_AREAS = [
  "Estate Planning",
  "Business Succession",
  "Real Estate",
  "Business/LLC",
  "Demand Letter",
  "Other",
];

const CHIP_OPTIONS = [
  "Fast responses",
  "Explained things clearly",
  "Fair pricing",
  "No surprise bills",
  "Made it easy",
  "Knew their stuff",
  "Would recommend",
];

const CONSENT_LEVELS = ["full", "first_initial", "anonymous", "private"] as const;
type ConsentLevel = (typeof CONSENT_LEVELS)[number];

/* -------------------------------------------------------------------------- */
/* Draft generation                                                           */
/* -------------------------------------------------------------------------- */

const DRAFT_SYSTEM_PROMPT = `You draft short client reviews for Available Law, a subscription-based Colorado law firm led by attorney Zachariah Crabill. A real client selected a star rating and descriptive phrases about their experience; your job is to turn those selections into a natural-sounding first-person review draft THE CLIENT will edit and adopt as their own words.

Hard rules (Colorado attorney advertising — never break these):
- Never guarantee or predict outcomes of legal matters ("he'll win your case", "you're guaranteed results").
- Never make comparative claims ("best lawyer in Colorado", "better than other firms", "the only attorney you'll ever need").
- Never state or imply results that create unjustified expectations ("saved me thousands", "got everything I wanted") — the client did not provide those facts.
- Never invent facts, matter details, dollar amounts, timelines, or events the client did not select.
- No superlatives that overpromise ("perfect", "flawless", "the greatest").

Style rules:
- First person, as the client.
- 2 to 4 sentences. Plain, conversational, credible — the way a real small-business owner writes a review.
- Ground the draft ONLY in the star rating, the selected phrases, and (if given) the practice area.
- If the rating is 3 or below, keep the tone honest and measured — do not spin it positive.
- Do not mention that this draft was AI-generated, and do not address the reader.
- Output ONLY the review text. No quotes around it, no preamble, no sign-off.`;

// A style hint is picked at random per call so successive drafts (and drafts
// from different clients) don't all read identically. Paired with temperature
// 1.0 this gives real variation without loosening the compliance rules.
const STYLE_HINTS = [
  "Write it plainspoken and direct, like a quick Google review typed on a phone.",
  "Write it warm and appreciative, but still concrete.",
  "Write it matter-of-fact and businesslike, focused on how the process went.",
  "Lead with what the experience was like, then what stood out.",
  "Lead with what stood out most, then how the overall experience felt.",
  "Keep sentences short. No filler words.",
  "Write it as if recommending the firm to another small-business owner.",
];

async function generateDraft(
  apiKey: string,
  rating: number,
  chips: string[],
  practiceArea: string | null,
): Promise<{ ok: true; draft: string; tokensIn: number; tokensOut: number } | { ok: false; error: string }> {
  const styleHint = STYLE_HINTS[Math.floor(Math.random() * STYLE_HINTS.length)];
  const parts = [
    `Star rating: ${rating} out of 5.`,
    chips.length > 0
      ? `The client says these phrases describe their experience: ${chips.join("; ")}.`
      : "The client did not select descriptive phrases — keep the draft general.",
    practiceArea ? `The matter involved: ${practiceArea}.` : "",
    `Style hint for this draft: ${styleHint}`,
    "Write the review draft now.",
  ].filter(Boolean);

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: DRAFT_MODEL,
        max_tokens: 300,
        temperature: 1.0,
        system: DRAFT_SYSTEM_PROMPT,
        messages: [{ role: "user", content: parts.join("\n") }],
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      console.error("Anthropic error", res.status, errText);
      return { ok: false, error: `Anthropic API error (${res.status})` };
    }
    const data = await res.json();
    const text: string = (data.content ?? [])
      .filter((b: { type: string }) => b.type === "text")
      .map((b: { text: string }) => b.text)
      .join("")
      .trim();
    if (!text) return { ok: false, error: "Empty draft" };
    return {
      ok: true,
      draft: text,
      tokensIn: data.usage?.input_tokens ?? 0,
      tokensOut: data.usage?.output_tokens ?? 0,
    };
  } catch (e) {
    console.error("generateDraft failed", e);
    return { ok: false, error: "Draft generation failed" };
  }
}

/* -------------------------------------------------------------------------- */
/* Consent attestation (composed server-side; stored verbatim = audit trail)  */
/* -------------------------------------------------------------------------- */

function displayNameFor(
  level: ConsentLevel,
  firstName: string,
  lastName: string,
  businessName: string | null,
): string {
  switch (level) {
    case "full":
      return businessName
        ? `${firstName} ${lastName}, ${businessName}`
        : `${firstName} ${lastName}`;
    case "first_initial":
      return `${firstName} ${lastName.charAt(0).toUpperCase()}.`;
    case "anonymous":
      return "Verified client";
    case "private":
      return "Private feedback";
  }
}

function consentTextFor(level: ConsentLevel, displayName: string): string {
  const base =
    "This review reflects my honest experience as a client of Available Law.";
  switch (level) {
    case "full":
      return `${base} I authorize Available Law to publish it with my full name and business, shown as "${displayName}".`;
    case "first_initial":
      return `${base} I authorize Available Law to publish it with my first name and last initial, shown as "${displayName}".`;
    case "anonymous":
      return `${base} I authorize Available Law to publish it anonymously, shown as "${displayName}".`;
    case "private":
      return `${base} I do not authorize publication — this feedback is for Zachariah only.`;
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
}

function getClientIp(req: Request): string {
  const xff = req.headers.get("x-forwarded-for") ?? "";
  const first = xff.split(",")[0].trim();
  return first || req.headers.get("x-real-ip") || "unknown";
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Drafts attempted from this IP in the last 24h (ai_usage, tier='review').
 *  Fail-open so a logging hiccup never blocks a genuine client. */
async function countRecentDrafts(
  serviceClient: SupabaseClient,
  ipHash: string,
): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await serviceClient
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .eq("tier", "review")
    .in("status", ["ok", "error"])
    .gte("created_at", since);
  if (error) {
    console.error("countRecentDrafts failed", error);
    return 0;
  }
  return count ?? 0;
}

async function countRecentSubmissions(
  serviceClient: SupabaseClient,
  ipHash: string,
): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await serviceClient
    .from("client_reviews")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  if (error) {
    console.error("countRecentSubmissions failed", error);
    return 0;
  }
  return count ?? 0;
}

async function logUsage(
  serviceClient: SupabaseClient,
  row: { ip_hash: string; status: string; tokens_in?: number; tokens_out?: number },
): Promise<void> {
  try {
    await serviceClient.from("ai_usage").insert({
      user_id: null,
      ip_hash: row.ip_hash,
      is_anonymous: true,
      tier: "review",
      model: DRAFT_MODEL,
      tokens_in: row.tokens_in ?? 0,
      tokens_out: row.tokens_out ?? 0,
      status: row.status,
    });
  } catch (e) {
    console.error("logUsage failed", e);
  }
}

/** Notify Zachariah via the shared notify-event renderer. Fail-open: the
 *  review is already stored; a mail hiccup must not fail the submission. */
async function notifyReviewSubmitted(
  supabaseUrl: string,
  serviceKey: string,
  data: Record<string, unknown>,
): Promise<void> {
  try {
    await fetch(`${supabaseUrl}/functions/v1/notify-event`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify({ event_type: "review.submitted", data }),
    });
  } catch (e) {
    console.error("notifyReviewSubmitted failed", e);
  }
}

function cleanString(v: unknown, maxLen: number): string {
  return typeof v === "string" ? v.trim().slice(0, maxLen) : "";
}

/* -------------------------------------------------------------------------- */
/* Handler                                                                    */
/* -------------------------------------------------------------------------- */

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  if (!supabaseUrl || !serviceKey) {
    return json({ error: "Server configuration error" }, 500);
  }
  const serviceClient = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const ip = getClientIp(req);
  const ipHash = await sha256Hex(IP_HASH_SALT + ip);

  // ---- Shared validation --------------------------------------------------
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return json({ error: "rating must be a whole number from 1 to 5" }, 400);
  }
  const chips = Array.isArray(body.chips)
    ? (body.chips as unknown[])
        .filter((c): c is string => typeof c === "string")
        .filter((c) => CHIP_OPTIONS.includes(c))
        .slice(0, CHIP_OPTIONS.length)
    : [];
  // "Other" lets the client type what the matter was; the free text (capped,
  // trimmed) replaces the literal "Other" everywhere downstream — storage,
  // the draft prompt, and the public display label.
  let practiceArea =
    typeof body.practice_area === "string" && PRACTICE_AREAS.includes(body.practice_area)
      ? body.practice_area
      : null;
  if (practiceArea === "Other") {
    const custom = cleanString(body.practice_area_other, 80);
    practiceArea = custom || "Other";
  }

  /* ---- action: draft ---------------------------------------------------- */
  if (body.action === "draft") {
    const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
    if (!apiKey) {
      return json({ error: "Drafting is temporarily unavailable" }, 503);
    }

    const used = await countRecentDrafts(serviceClient, ipHash);
    if (used >= DRAFT_DAILY_LIMIT) {
      await logUsage(serviceClient, { ip_hash: ipHash, status: "blocked_ip" });
      return json(
        { error: "Draft limit reached for today. You can still write your review yourself below." },
        429,
      );
    }

    const result = await generateDraft(apiKey, rating, chips, practiceArea);
    if (!result.ok) {
      await logUsage(serviceClient, { ip_hash: ipHash, status: "error" });
      return json({ error: result.error }, 502);
    }
    await logUsage(serviceClient, {
      ip_hash: ipHash,
      status: "ok",
      tokens_in: result.tokensIn,
      tokens_out: result.tokensOut,
    });
    return json({ draft: result.draft });
  }

  /* ---- action: submit --------------------------------------------------- */
  if (body.action === "submit") {
    const reviewText = cleanString(body.review_text, 2000);
    if (reviewText.length < 5) {
      return json({ error: "review_text is required (at least 5 characters)" }, 400);
    }
    const firstName = cleanString(body.first_name, 100);
    const lastName = cleanString(body.last_name, 100);
    if (!firstName || !lastName) {
      return json({ error: "first_name and last_name are required" }, 400);
    }
    const businessName = cleanString(body.business_name, 200) || null;
    const consentLevel = body.consent_level as ConsentLevel;
    if (!CONSENT_LEVELS.includes(consentLevel)) {
      return json({ error: "consent_level is invalid" }, 400);
    }
    if (body.attested !== true) {
      return json({ error: "The attestation checkbox is required" }, 400);
    }
    const aiDraftingUsed = body.ai_drafting_used === true;
    const aiDraftText = aiDraftingUsed ? cleanString(body.ai_draft_text, 2000) || null : null;

    const submitted = await countRecentSubmissions(serviceClient, ipHash);
    if (submitted >= SUBMIT_DAILY_LIMIT) {
      return json({ error: "Submission limit reached. Please try again tomorrow." }, 429);
    }

    const displayName = displayNameFor(consentLevel, firstName, lastName, businessName);
    const consentText = consentTextFor(consentLevel, displayName);

    const { data: inserted, error: insertError } = await serviceClient
      .from("client_reviews")
      .insert({
        rating,
        chips,
        practice_area: practiceArea,
        review_text: reviewText,
        ai_drafting_used: aiDraftingUsed,
        ai_draft_text: aiDraftText,
        first_name: firstName,
        last_name: lastName,
        business_name: businessName,
        consent_level: consentLevel,
        consent_text: consentText,
        consent_agreed_at: new Date().toISOString(),
        display_name: displayName,
        status: "pending",
        ip_hash: ipHash,
      })
      .select("id")
      .single();

    if (insertError) {
      console.error("client_reviews insert failed", insertError);
      return json({ error: "Could not save your review. Please try again." }, 500);
    }

    await notifyReviewSubmitted(supabaseUrl, serviceKey, {
      review_id: inserted.id,
      rating,
      chips,
      practice_area: practiceArea,
      review_text: reviewText,
      first_name: firstName,
      last_name: lastName,
      business_name: businessName,
      consent_level: consentLevel,
      display_name: displayName,
      ai_drafting_used: aiDraftingUsed,
    });

    return json({ ok: true, display_name: displayName });
  }

  return json({ error: "Unknown action" }, 400);
});
