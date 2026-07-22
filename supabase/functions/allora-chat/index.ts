// allora-chat — Available Law's AI legal intake assistant powered by Claude.
//
// Contract with the client chat UI:
//   Request:  { messages, conversation_id?, user_id?, force_ready? }
//   Response: {
//     reply: string,
//     ready_for_review: boolean,
//     draft_id: string | null,
//     pending_question?: { text, options[], allow_custom } | null,
//     attached_documents: [...],
//     usage_context?: { tier, limit, used, remaining, is_over_limit, is_free_tier }
//   }
//
// Ava's role is INTAKE ONLY. She gathers facts, asks clarifying questions
// (preferring structured quick-reply questions via [ASK: {...}] JSON blocks),
// and hands the matter off to the attorney. She does NOT draft contracts,
// letters, or legal documents in the chat — that's the attorney's job after
// review.
//
// COST CONTROLS (added v20): every call is logged to public.ai_usage, and a
// rolling-24h rate limit is enforced server-side (members keyed by user_id,
// anonymous visitors by hashed IP) with a global circuit breaker. Anonymous +
// free Explore traffic runs on Haiku; paid tiers run on Sonnet.
//
// COMMUNITY WAITLIST (added v24): Ava knows the Sidebar (attorney community)
// and YLab (teen founders) programs, captures waitlist signups via
// [WAITLIST: {...}] tokens → public.waitlist_signups + notification email,
// and carries a mental-health safety block (988 / COLAP) for Sidebar traffic.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_DOCS = 5;
const MAX_TOTAL_BYTES = 10 * 1024 * 1024;
const MAX_SINGLE_DOC_BYTES = 8 * 1024 * 1024;

// Keep in sync with src/lib/tiers.ts — Deno edge functions can't import from
// the Next.js app, so the monthly allotment lives here as a constant. If you
// change a tier limit, update BOTH files.
const TIER_LIMITS: Record<string, number> = {
  explore: 0,
  build: 1,
  grow: 2,
  lead: 3,
};
const TIER_LABELS: Record<string, string> = {
  explore: "Explore",
  build: "Build",
  grow: "Grow",
  lead: "Lead",
};
const OVERAGE_PRICE_PER_PAGE_USD = 50;

// --- Cost controls -------------------------------------------------------
// Model per audience: free/anonymous chat is intake/triage and runs fine on
// Haiku at a fraction of the cost; paid members get Sonnet.
const SONNET_MODEL = "claude-sonnet-4-5";
const HAIKU_MODEL = "claude-haiku-4-5-20251001";

// Rolling-24h request caps. The function counts ai_usage rows (status ok|error,
// i.e. real Anthropic attempts — blocks don't count) per identity in the last
// 24h and refuses once the cap is hit. Tune freely.
const ANON_DAILY_LIMIT = 5; // per hashed IP (teaser is 2 turns client-side)
const EXPLORE_DAILY_LIMIT = 15; // per free member
const PAID_DAILY_LIMIT = 150; // per paid member (abuse backstop, ~unlimited)
const GLOBAL_DAILY_LIMIT = 1500; // circuit breaker across everyone

// IPs are hashed before storage so we never keep raw addresses. Override the
// salt with an IP_HASH_SALT secret if desired.
const IP_HASH_SALT = Deno.env.get("IP_HASH_SALT") ?? "available-law-ava-v1";

interface UsageContext {
  tier: string;
  tierLabel: string;
  limit: number;
  used: number;
  remaining: number;
  isOverLimit: boolean;
  isFreeTier: boolean;
}

const AVA_SYSTEM_PROMPT_BASE = `You are Ava, the AI legal intake assistant for Available Law, a Colorado-based, FAIIR-certified law firm led by attorney Zachariah Crabill.

FAIIR stands for the Foundation of AI Integrity & Regulation — an independent AI compliance certification standard maintained by FAIIR, LLC, a separate company from Available Law. FAIIR, LLC is not a law firm; certification is a compliance product, not legal advice, and does not create an attorney-client relationship. Available Law is FAIIR-certified itself and provides the legal work that supports certification — deployer notices, AI vendor contracts, and Colorado AI Act counsel. Never describe FAIIR as Available Law's own standard or as attorney-led. If someone asks about getting certified, point them to [FAIIR certification](https://availablelaw.com/faiir).

YOUR ROLE IS INTAKE, NOT DRAFTING.
You gather the facts a real attorney will need to handle the client's matter. You do NOT write contracts, letters, cease-and-desists, operating agreements, or any other legal deliverable inside the chat. When the client asks you to draft something, explain that the attorney drafts it after reviewing the intake, and continue gathering facts.

HOW TO RESPOND:
- Sound like a sharp, friendly human — the way a helpful colleague texts you back. Warm and direct, never stiff, salesy, or robotic.
- Keep replies SHORT. Most are one to three sentences. This is a small chat window, not a memo — if you've written more than a short paragraph, trim it.
- Don't open with filler. Avoid starting messages with "Great question," "I appreciate that," "I appreciate the enthusiasm," or similar throat-clearing. Vary your wording and usually just answer.
- Don't lecture or over-justify. If you can't do something, say so in one plain sentence and move straight to what happens next — skip the "here's why" explainer.
- Ask ONE question at a time. Never fire off a list of questions.
- When the question has 2–4 common answers, use the structured quick-reply format (see below) so the client can tap a chip instead of typing.
- Never claim to be a lawyer or give a final legal opinion. An attorney reviews every substantive matter.
- If someone asks about something outside legal intake (press, podcast, partnerships, general business questions), don't brush them off with "that's outside my wheelhouse" — warmly point them to availablelaw.com or the team, and offer to help if a legal need comes up.
- If a user is in an urgent situation (active threat, court deadline today, criminal arrest), tell them to call Available Law directly rather than use chat.

FORMATTING — IMPORTANT:
- Write in plain, conversational prose. Do NOT use markdown emphasis: no **bold**, no *italics*, no # headings, and no "Label:"-style bold mini-headers. They read as clunky and over-formatted in a small chat bubble.
- LINKS: whenever you point someone to a page on the site, make it a clickable markdown link with a full https:// URL and a short, natural label — never paste a bare URL as plain text. Canonical links:
  - Plans / upgrading: [see our plans](https://availablelaw.com/#pricing)
  - Signing in: [sign in](https://availablelaw.com/login)
  - Homepage: [availablelaw.com](https://availablelaw.com)
  - Sidebar attorney community: [Sidebar](https://availablelaw.com/sidebar)
  - YLab teen founders: [YLab](https://availablelaw.com/ylab)
  So instead of "upgrade at availablelaw.com/#pricing", write "you can [upgrade your plan](https://availablelaw.com/#pricing)".
- A simple dash-bullet list is fine when you are genuinely listing options (for example, the membership plans). Keep the bullet text plain — no bold inside it. Example: "- Build — $50/mo, 1 attorney item per month".
- No emoji.

DOCUMENTS ON FILE:
The client may have documents stored in their Available Law account. Those documents are attached to the FIRST message of the conversation for your reference, NOT uploaded fresh each turn. Do NOT tell the client "I see you uploaded X" more than once, and never accuse them of re-uploading something. Only mention a document if the client brings it up OR it is clearly relevant to the question they just asked. If a document appears irrelevant to the matter at hand, ignore it silently.

QUICK-REPLY QUESTION FORMAT
When you ask a question that has 2–4 likely answers, emit the question naturally AND append a single-line JSON block at the very end of your message in this exact format:

[ASK: {"question":"What kind of entity are you forming?","options":["LLC","S-Corp","Nonprofit","Not sure yet"],"allow_custom":true}]

Rules for [ASK] blocks:
- 2–4 options, each under 40 characters.
- Always set allow_custom to true so the client can also type their own answer.
- "question" should match the question you asked above in prose (can be slightly shorter).
- Only emit one [ASK] block per message. Don't use it for open-ended questions like "Tell me what happened."
- Don't use [ASK] on your first greeting message — let the client lead.

READY-FOR-REVIEW HANDOFF — CRITICAL
When you have enough facts for the attorney to take the matter over, you MUST end your message with these three tokens, each on its own line, in this exact order:

[MATTER_TITLE: short descriptive label, e.g. "1099 contractor agreement for HVAC business"]
[MATTER_SUMMARY: 2–4 sentence plain-English summary including the client's situation, specific help needed, and any deadlines or key facts]
[READY_FOR_REVIEW]

These tokens are the ONLY way the matter reaches the attorney. Without them, the client gets nothing and the attorney never hears about it.

You MUST emit all three tokens whenever ANY of the following are true:
1. You tell the client "the attorney will draft/review/handle" something.
2. You mention the 24-hour turnaround.
3. You summarize what the attorney will produce (e.g., "Here's what the attorney will draft for you: ...").
4. The client says something like "sounds good," "go ahead," "send it," or otherwise signals they're done answering questions.
5. You have at least 4 substantive pieces of information about the matter and the client has stopped volunteering new details.

DO NOT emit the tokens on your first greeting, or when the client has only said "hi" or "yes" or similar one-word responses. Never invent details — if a field is unclear, keep asking questions instead of forcing the handoff.

COMMUNITY PROGRAMS — SIDEBAR AND YLAB
Available Law runs two community initiatives. Know them cold, because their pages send people to you:

1. Sidebar ([Sidebar](https://availablelaw.com/sidebar)) — a FREE community for attorneys. In a courtroom a sidebar is the conversation away from the jury; this is that for the profession: small recurring virtual peer circles (6–8 attorneys), casual in-person gatherings along Colorado's Front Range, and an open conversation — on podcasts and beyond — about the mental-health weight of practicing law. Founded by Zachariah, who speaks openly about his own hardest seasons in the profession. It costs nothing, it is not a client-development funnel, joining creates no attorney-client relationship, and it is NOT therapy or crisis care. Attorneys anywhere can join a virtual circle; gatherings are Colorado-based.

2. YLab ([YLab](https://availablelaw.com/ylab)) — Youth Leadership & Business, a lab for teen entrepreneurs (roughly 13–17): a discounted legal membership mirroring the regular tiers at 20% off (Build $40/mo, Grow $120/mo — a parent or guardian signs up and holds the account since a minor's contract is voidable under current Colorado law), a podcast, and a youth-led push to change Colorado law so under-18 founders can form LLCs and sign enforceable contracts. Currently in founding-waitlist mode.

WAITLIST CAPTURE — SIDEBAR AND YLAB
When someone wants to join Sidebar or YLab (a circle, the gatherings, the podcast, the founding waitlist), your job is to capture their signup, not to run legal intake:
- Gather, one question at a time: their name and email. For Sidebar, also ask what draws them (peer circle, gatherings, sharing their story / podcast) and, if it comes up naturally, where they practice or their career stage. For YLab, ask whether you're talking to the teen or the parent/guardian.
- Once you have a real name AND a real email address, append this single-line token at the very end of your message:
[WAITLIST: {"program":"sidebar","name":"Jane Smith","email":"jane@example.com","interest":"peer circle","note":"solo family-law attorney in Denver, 8 years in"}]
- "program" must be exactly "sidebar" or "ylab". "interest" and "note" are optional — include what you actually learned, nothing invented.
- Emit the token ONCE per signup, and NEVER without a real name and email the person gave you themselves.
- In the visible part of that same reply, confirm they're on the list and that Zachariah will reach out personally.
- Waitlist signups are free for everyone, on any plan or no plan. Do NOT emit [READY_FOR_REVIEW] for a waitlist signup, and do not pitch memberships to Sidebar folks — Sidebar is not a sales channel.

MENTAL-HEALTH SAFETY — IMPORTANT
Because of Sidebar, attorneys may open up to you about burnout, depression, drinking, or worse. If anyone expresses hopelessness, thoughts of self-harm, or suicide: drop whatever flow you were in. Respond like a human first — brief, warm, no scripts. Then point them to call or text 988 (the Suicide & Crisis Lifeline), and if they're a legal professional, to the [Colorado Lawyer Assistance Program](https://www.coloradolap.org) — free and confidential, built for lawyers. Say plainly that you're an AI and not a crisis counselor, but that these people are, and that reaching out is worth doing today. Never treat that moment as intake, never pivot to a sales point, never lecture.

Available Law serves Colorado small businesses, startups, and individuals. Tiers: Explore (free), Build, Grow, Lead. Keep replies short — usually well under 120 words unless the client explicitly asks for depth.`;

function buildUsageSystemBlock(ctx: UsageContext | null): string {
  if (!ctx) return "";

  if (ctx.isFreeTier) {
    return `\n\n--- CLIENT PLAN & USAGE (CRITICAL) ---\nThe client is on the FREE ${ctx.tierLabel} plan. This plan does NOT include any attorney work — no matter reviews, no consultations.\n\nDO NOT emit [READY_FOR_REVIEW] under any circumstances for a free-tier client. Instead, at the point where you would normally hand off, politely explain that attorney review requires a paid membership and point them at their upgrade options:\n  - Build: $50/mo, includes 1 attorney work item / month (matter review OR 30-min consultation)\n  - Grow: $150/mo, 2 / month\n  - Lead: $300/mo, 3 / month\nTell them they can [upgrade your plan](https://availablelaw.com/#pricing) and come right back to finish the handoff. You can still help them gather facts and understand their situation in the chat — you just can't dispatch the matter to a human attorney until they're on a paid plan.`;
  }

  if (ctx.isOverLimit) {
    return `\n\n--- CLIENT PLAN & USAGE (CRITICAL) ---\nThe client is on the ${ctx.tierLabel} plan (${ctx.limit} attorney work item${ctx.limit === 1 ? "" : "s"}/month) and has already used ${ctx.used} this billing period — they are OVER their monthly allotment.\n\nBefore emitting [READY_FOR_REVIEW], you MUST tell the client plainly that this matter will bill as an overage at $${OVERAGE_PRICE_PER_PAGE_USD}/page on the final deliverable, and get their explicit go-ahead. Use an [ASK] block with options like "Yes, send it anyway" and "Wait until next month" so they can confirm with one tap. Only emit the handoff tokens AFTER the client confirms they're okay with the overage. If they decline, stop and let them know you'll hold the matter until their allotment resets.`;
  }

  // Under limit. Ava doesn't need to bring this up proactively, but should
  // be aware of it in case the client asks.
  return `\n\n--- CLIENT PLAN & USAGE ---\nThe client is on the ${ctx.tierLabel} plan (${ctx.limit} attorney work item${ctx.limit === 1 ? "" : "s"}/month) and has used ${ctx.used} of ${ctx.limit} this billing period (${ctx.remaining} remaining). This matter WILL count as one of their included work items once the attorney sends it, but you don't need to bring this up unless the client asks — just proceed with the normal intake flow.`;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AttachedDoc {
  filename: string;
  mime_type: string;
  storage_path: string;
  size_bytes: number;
  base64?: string;
  text?: string;
  skipped?: string;
}

interface PendingQuestion {
  text: string;
  options: string[];
  allow_custom: boolean;
}

interface WaitlistSignup {
  program: "sidebar" | "ylab";
  name: string;
  email: string;
  interest?: string;
  note?: string;
}

/** Standard response body used for rate-limit refusals — same shape the UI
 *  already renders, so the message just appears as Ava's reply. */
function limitBody(message: string) {
  return {
    reply: message,
    ready_for_review: false,
    draft_id: null,
    pending_question: null,
    attached_documents: [],
    usage_context: null,
  };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  let body: {
    messages?: ChatMessage[];
    conversation_id?: string | null;
    user_id?: string | null;
    force_ready?: boolean;
  };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const messages = (body.messages ?? []).filter(
    (m) =>
      m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string"
  );
  if (messages.length === 0) {
    return json({ error: "messages is required" }, 400);
  }

  const apiKey = Deno.env.get("ANTHROPIC_API_KEY");
  if (!apiKey) {
    return json({ error: "Server is missing ANTHROPIC_API_KEY" }, 500);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  let authedClient: SupabaseClient | null = null;
  let serviceClient: SupabaseClient | null = null;
  let uid: string | null = body.user_id ?? null;

  if (supabaseUrl && anonKey && authHeader.startsWith("Bearer ")) {
    try {
      authedClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: userData } = await authedClient.auth.getUser();
      uid = userData?.user?.id ?? uid;
    } catch (e) {
      console.warn("auth resolution failed", e);
    }
  }
  if (supabaseUrl && serviceKey) {
    serviceClient = createClient(supabaseUrl, serviceKey);
  }

  const usageContext = await fetchUsageContext(uid, serviceClient);

  // ---- Cost controls: classify audience, pick model, enforce caps --------
  const isAnon = !uid;
  const tier = isAnon ? "anonymous" : (usageContext?.tier ?? "explore");
  // Paid = any recognized non-explore member tier (build/grow/lead, and the
  // YLab teen tiers once they're added to TIER_LIMITS). Anonymous + Explore
  // run on Haiku; paid runs on Sonnet.
  const isPaid = !isAnon && tier !== "explore";
  const model = isPaid ? SONNET_MODEL : HAIKU_MODEL;

  const ip = getClientIp(req);
  const ipHash = await sha256Hex(IP_HASH_SALT + ip);

  if (serviceClient) {
    // Global circuit breaker first — bounds total daily spend no matter what.
    const globalCount = await countGlobalRecent(serviceClient);
    if (globalCount >= GLOBAL_DAILY_LIMIT) {
      await logUsage(serviceClient, {
        user_id: uid, ip_hash: ipHash, is_anonymous: isAnon, tier, model,
        status: "blocked_global",
      });
      return json(limitBody(
        "Ava is getting an unusually high number of messages right now. Please try again in a little while.",
      ));
    }

    // Per-identity rolling-24h cap.
    const limit = isAnon
      ? ANON_DAILY_LIMIT
      : (isPaid ? PAID_DAILY_LIMIT : EXPLORE_DAILY_LIMIT);
    const usedToday = isAnon
      ? await countRecent(serviceClient, "ip_hash", ipHash)
      : await countRecent(serviceClient, "user_id", uid as string);

    if (usedToday >= limit) {
      await logUsage(serviceClient, {
        user_id: uid, ip_hash: ipHash, is_anonymous: isAnon, tier, model,
        status: isAnon ? "blocked_ip" : "blocked_user",
      });
      const msg = isAnon
        ? "You've reached the free preview limit. Create a free account to keep chatting with Ava — it only takes a minute."
        : isPaid
          ? "You've hit an unusually high number of messages today. Please try again later, or reach out to us directly."
          : "You've reached today's chat limit on the free plan. It resets within 24 hours — or upgrade any time for more.";
      return json(limitBody(msg));
    }
  }

  const attachedDocs = await fetchUserDocs(uid, serviceClient);

  // Inject a system-level nudge at the end of the message history when the
  // client explicitly asked to send the matter — this encourages Ava to
  // emit the handoff tokens even if she was about to ask another question.
  // EXCEPTION: when the client is on a free tier or over their allotment,
  // the force_ready nudge is softened so Ava still respects the overage
  // confirmation gate from the system prompt.
  const shouldGateForceReady =
    !!body.force_ready &&
    !!usageContext &&
    (usageContext.isFreeTier || usageContext.isOverLimit);

  const forceReadyNudge = shouldGateForceReady
    ? "(System: the client just clicked 'Send to attorney for review'. Before emitting the handoff tokens, follow the plan-and-usage rules above — either redirect them to upgrade (free tier) or confirm the overage charge (over limit). Do NOT skip the confirmation step.)"
    : "(System: the client just clicked 'Send to attorney for review'. Please finalize the intake and emit the [MATTER_TITLE], [MATTER_SUMMARY], and [READY_FOR_REVIEW] tokens at the end of your next reply so the matter reaches the attorney.)";

  const messagesForClaude: ChatMessage[] = body.force_ready
    ? [...messages, { role: "user", content: forceReadyNudge }]
    : messages;

  const anthropicMessages = buildAnthropicMessages(messagesForClaude, attachedDocs);
  const systemPrompt = AVA_SYSTEM_PROMPT_BASE + buildUsageSystemBlock(usageContext);

  let assistantText = "";
  let tokensIn = 0;
  let tokensOut = 0;
  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "anthropic-beta": "pdfs-2024-09-25",
      },
      body: JSON.stringify({
        model,
        max_tokens: 2048,
        system: systemPrompt,
        messages: anthropicMessages,
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic error", anthropicRes.status, errText);
      await logUsage(serviceClient, {
        user_id: uid, ip_hash: ipHash, is_anonymous: isAnon, tier, model,
        status: "error",
      });
      return json({ error: `Anthropic API error (${anthropicRes.status})` }, 502);
    }

    const data = await anthropicRes.json();
    const blocks = Array.isArray(data?.content) ? data.content : [];
    assistantText = blocks
      .filter((b: { type: string }) => b?.type === "text")
      .map((b: { text: string }) => b.text)
      .join("\n")
      .trim();
    tokensIn = data?.usage?.input_tokens ?? 0;
    tokensOut = data?.usage?.output_tokens ?? 0;

    if (!assistantText) {
      assistantText =
        "I had trouble generating a response just now — could you try rephrasing?";
    }
  } catch (err) {
    console.error("Anthropic fetch failed", err);
    await logUsage(serviceClient, {
      user_id: uid, ip_hash: ipHash, is_anonymous: isAnon, tier, model,
      status: "error",
    });
    return json({ error: "Failed to reach the AI service" }, 502);
  }

  const parsed = parseMatterTokens(assistantText);
  const pending = extractPendingQuestion(parsed.cleanText);
  const waitlist = extractWaitlistToken(pending.cleanText);
  const cleanText = waitlist.cleanText;

  // Community waitlist capture (Sidebar / YLab). Fail-open: a malformed token
  // or a DB/email hiccup never breaks the chat reply the visitor sees.
  if (waitlist.signup && serviceClient) {
    await persistWaitlistSignup(serviceClient, waitlist.signup, uid);
  }

  // Defense-in-depth: if Ava mistakenly emits [READY_FOR_REVIEW] for a
  // free-tier client, strip the flag so we don't create a draft. The attorney
  // should only ever receive matters from paid clients, or from paid clients
  // who explicitly confirmed an overage.
  const readyForReview =
    parsed.readyForReview && !(usageContext?.isFreeTier ?? false);
  let draftId: string | null = null;

  // Draft creation uses the SERVICE client to bypass RLS — the authed
  // client may not have insert rights on drafts, which previously caused
  // silent failures and no Slack notification.
  if (readyForReview && serviceClient && uid) {
    try {
      const matterTitle =
        parsed.matterTitle ||
        pickFirstSubstantiveMessage(messages, 80) ||
        "New legal matter";
      const matterSummary =
        parsed.matterSummary ||
        pickFirstSubstantiveMessage(messages, 2000) ||
        "(no summary captured)";

      const { data: draftRow, error: draftErr } = await serviceClient
        .from("drafts")
        .insert({
          user_id: uid,
          conversation_id: body.conversation_id ?? null,
          title: matterTitle.slice(0, 120),
          client_request: matterSummary,
          draft_content: cleanText,
          status: "pending_review",
        })
        .select("id")
        .single();

      if (draftErr) {
        console.error("draft insert failed", draftErr);
      }
      draftId = draftRow?.id ?? null;

      if (draftId && supabaseUrl && serviceKey) {
        try {
          const notifyRes = await fetch(
            `${supabaseUrl}/functions/v1/notify-attorney`,
            {
              method: "POST",
              headers: {
                "content-type": "application/json",
                Authorization: `Bearer ${serviceKey}`,
                apikey: serviceKey,
              },
              body: JSON.stringify({ draft_id: draftId }),
            }
          );
          if (!notifyRes.ok) {
            const errText = await notifyRes.text();
            console.error("notify-attorney failed", notifyRes.status, errText);
          } else {
            console.log("notify-attorney ok", await notifyRes.json());
          }
        } catch (e) {
          console.error("notify-attorney invoke failed", e);
        }
      }
    } catch (e) {
      console.error("draft persistence failed", e);
    }
  }

  // Log the successful call (drives auditing + the rate limit counter).
  await logUsage(serviceClient, {
    user_id: uid, ip_hash: ipHash, is_anonymous: isAnon, tier, model,
    tokens_in: tokensIn, tokens_out: tokensOut, status: "ok",
  });

  const attachedSummary = attachedDocs.map((d) => ({
    filename: d.filename,
    attached: !d.skipped,
    skipped_reason: d.skipped ?? null,
  }));

  return json({
    reply: cleanText,
    ready_for_review: readyForReview,
    draft_id: draftId,
    pending_question: pending.question,
    attached_documents: attachedSummary,
    usage_context: usageContext
      ? {
          tier: usageContext.tier,
          tier_label: usageContext.tierLabel,
          limit: usageContext.limit,
          used: usageContext.used,
          remaining: usageContext.remaining,
          is_over_limit: usageContext.isOverLimit,
          is_free_tier: usageContext.isFreeTier,
        }
      : null,
  });
});

/* ---- Cost-control helpers ------------------------------------------------ */

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

/** Count this identity's real Anthropic attempts (ok|error, not blocks) in the
 *  last 24h. Fail-open (returns 0) so a logging hiccup never takes Ava down. */
async function countRecent(
  serviceClient: SupabaseClient,
  col: "user_id" | "ip_hash",
  val: string,
): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await serviceClient
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .eq(col, val)
    .in("status", ["ok", "error"])
    .gte("created_at", since);
  if (error) {
    console.error("countRecent failed", error);
    return 0;
  }
  return count ?? 0;
}

async function countGlobalRecent(serviceClient: SupabaseClient): Promise<number> {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await serviceClient
    .from("ai_usage")
    .select("id", { count: "exact", head: true })
    .in("status", ["ok", "error"])
    .gte("created_at", since);
  if (error) {
    console.error("countGlobalRecent failed", error);
    return 0;
  }
  return count ?? 0;
}

async function logUsage(
  serviceClient: SupabaseClient | null,
  row: {
    user_id: string | null;
    ip_hash: string | null;
    is_anonymous: boolean;
    tier: string;
    model: string | null;
    tokens_in?: number;
    tokens_out?: number;
    status: string;
  },
): Promise<void> {
  if (!serviceClient) return;
  try {
    await serviceClient.from("ai_usage").insert({
      user_id: row.user_id,
      ip_hash: row.ip_hash,
      is_anonymous: row.is_anonymous,
      tier: row.tier,
      model: row.model,
      tokens_in: row.tokens_in ?? 0,
      tokens_out: row.tokens_out ?? 0,
      status: row.status,
    });
  } catch (e) {
    console.error("logUsage failed", e);
  }
}

async function fetchUsageContext(
  uid: string | null,
  serviceClient: SupabaseClient | null
): Promise<UsageContext | null> {
  if (!uid || !serviceClient) return null;

  try {
    const [memberRes, usageRes] = await Promise.all([
      serviceClient
        .from("members")
        .select("subscription_tier, subscription_status")
        .eq("user_id", uid)
        .maybeSingle(),
      serviceClient.rpc("get_usage_this_period", { p_user_id: uid }),
    ]);

    const rawTier = (memberRes.data?.subscription_tier ?? "explore").toLowerCase();
    const tier = rawTier in TIER_LIMITS ? rawTier : "explore";
    const tierLabel = TIER_LABELS[tier] ?? "Explore";
    const limit = TIER_LIMITS[tier] ?? 0;
    const used = typeof usageRes.data === "number" ? usageRes.data : 0;
    const remaining = Math.max(limit - used, 0);
    const isFreeTier = tier === "explore";
    const isOverLimit = !isFreeTier && used >= limit;

    return { tier, tierLabel, limit, used, remaining, isOverLimit, isFreeTier };
  } catch (e) {
    console.error("fetchUsageContext failed", e);
    return null;
  }
}

async function fetchUserDocs(
  uid: string | null,
  serviceClient: SupabaseClient | null
): Promise<AttachedDoc[]> {
  if (!uid || !serviceClient) return [];
  const attached: AttachedDoc[] = [];

  try {
    const { data: docs, error: docErr } = await serviceClient
      .from("documents")
      .select("id, filename, mime_type, storage_path, size_bytes, status")
      .eq("user_id", uid)
      .neq("status", "archived")
      .order("uploaded_at", { ascending: false })
      .limit(MAX_DOCS);

    if (docErr) {
      console.error("doc list failed", docErr);
      return attached;
    }
    if (!docs || docs.length === 0) return attached;

    let totalBytes = 0;
    for (const d of docs) {
      if (totalBytes + (d.size_bytes ?? 0) > MAX_TOTAL_BYTES) {
        attached.push({
          filename: d.filename,
          mime_type: d.mime_type ?? "",
          storage_path: d.storage_path,
          size_bytes: d.size_bytes ?? 0,
          skipped: "exceeds total size budget",
        });
        continue;
      }
      if ((d.size_bytes ?? 0) > MAX_SINGLE_DOC_BYTES) {
        attached.push({
          filename: d.filename,
          mime_type: d.mime_type ?? "",
          storage_path: d.storage_path,
          size_bytes: d.size_bytes ?? 0,
          skipped: "file too large (>8MB)",
        });
        continue;
      }

      const { data: fileData, error: dlErr } = await serviceClient.storage
        .from("documents")
        .download(d.storage_path);

      if (dlErr || !fileData) {
        console.error("download failed", d.storage_path, dlErr);
        attached.push({
          filename: d.filename,
          mime_type: d.mime_type ?? "",
          storage_path: d.storage_path,
          size_bytes: d.size_bytes ?? 0,
          skipped: "download failed",
        });
        continue;
      }

      const buffer = new Uint8Array(await fileData.arrayBuffer());
      totalBytes += buffer.length;

      const mime = (d.mime_type ?? "").toLowerCase();
      const ext = (d.filename.split(".").pop() ?? "").toLowerCase();
      const isText =
        mime.startsWith("text/") || ext === "txt" || ext === "md" || ext === "csv";

      if (isText) {
        attached.push({
          filename: d.filename,
          mime_type: mime || "text/plain",
          storage_path: d.storage_path,
          size_bytes: buffer.length,
          text: new TextDecoder().decode(buffer),
        });
      } else {
        attached.push({
          filename: d.filename,
          mime_type: mime || "application/octet-stream",
          storage_path: d.storage_path,
          size_bytes: buffer.length,
          base64: base64Encode(buffer),
        });
      }
    }
  } catch (e) {
    console.error("attach docs failed", e);
  }

  return attached;
}

function extractPendingQuestion(
  text: string
): { cleanText: string; question: PendingQuestion | null } {
  const match = text.match(/\[ASK:\s*(\{[\s\S]+?\})\s*\]/i);
  if (!match) return { cleanText: text, question: null };

  let parsed: PendingQuestion | null = null;
  try {
    const raw = JSON.parse(match[1]);
    if (
      raw &&
      typeof raw.question === "string" &&
      Array.isArray(raw.options) &&
      raw.options.length > 0
    ) {
      parsed = {
        text: String(raw.question).trim(),
        options: raw.options
          .slice(0, 4)
          .map((o: unknown) => String(o).trim())
          .filter((o: string) => o.length > 0),
        allow_custom: raw.allow_custom !== false,
      };
    }
  } catch (e) {
    console.warn("failed to parse [ASK] block", e);
  }

  const cleanText = text.replace(/\[ASK:\s*\{[\s\S]+?\}\s*\]/i, "").trim();
  return { cleanText, question: parsed };
}

function extractWaitlistToken(
  text: string
): { cleanText: string; signup: WaitlistSignup | null } {
  const match = text.match(/\[WAITLIST:\s*(\{[\s\S]+?\})\s*\]/i);
  if (!match) return { cleanText: text, signup: null };

  let signup: WaitlistSignup | null = null;
  try {
    const raw = JSON.parse(match[1]);
    const program = String(raw?.program ?? "").toLowerCase();
    const name = String(raw?.name ?? "").trim();
    const email = String(raw?.email ?? "").trim();
    // Only accept well-formed signups; a hallucinated or partial token is
    // stripped from the reply but not persisted.
    if (
      (program === "sidebar" || program === "ylab") &&
      name.length > 1 &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ) {
      signup = {
        program,
        name: name.slice(0, 120),
        email: email.slice(0, 254),
        interest: raw?.interest ? String(raw.interest).slice(0, 200) : undefined,
        note: raw?.note ? String(raw.note).slice(0, 1000) : undefined,
      };
    } else {
      console.warn("waitlist token rejected", { program, hasName: !!name, email });
    }
  } catch (e) {
    console.warn("failed to parse [WAITLIST] block", e);
  }

  const cleanText = text
    .replace(/\[WAITLIST:\s*\{[\s\S]+?\}\s*\]/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return { cleanText, signup };
}

/** Insert the signup row and email Zachariah. Both steps fail-open. */
async function persistWaitlistSignup(
  serviceClient: SupabaseClient,
  signup: WaitlistSignup,
  uid: string | null
): Promise<void> {
  try {
    const { error } = await serviceClient.from("waitlist_signups").insert({
      program: signup.program,
      name: signup.name,
      email: signup.email,
      interest: signup.interest ?? null,
      note: signup.note ?? null,
      user_id: uid,
      source: "ava",
    });
    if (error) console.error("waitlist insert failed", error);
  } catch (e) {
    console.error("waitlist persistence failed", e);
  }

  // Notification email — same Resend account notify-event uses. Skipped
  // silently if the secret is absent; the DB row is the source of truth.
  const resendKey = Deno.env.get("RESEND_API_KEY");
  if (!resendKey) return;
  const programLabel = signup.program === "sidebar" ? "Sidebar" : "YLab";
  // The Sidebar WhatsApp invite is PRIVATE — it goes only in this admin email
  // so Zachariah can send it personally. Never expose it to Ava or the site
  // (public invite links get scraped and bot-joined). Rotate via the
  // SIDEBAR_WHATSAPP_INVITE secret if the link is ever compromised.
  const sidebarInvite =
    Deno.env.get("SIDEBAR_WHATSAPP_INVITE") ??
    "https://chat.whatsapp.com/Gztz1qNVACKI1591eFBh80";
  const firstName = signup.name.split(/\s+/)[0];
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from:
          Deno.env.get("NOTIFY_FROM_FIRM") ??
          "Available Law <noreply@availablelaw.com>",
        to: Deno.env.get("NOTIFY_ADMIN_EMAIL") ?? "zachariah@availablelaw.com",
        subject: `New ${programLabel} waitlist signup — ${signup.name}`,
        text: [
          `Ava just captured a ${programLabel} waitlist signup.`,
          ``,
          `Name:     ${signup.name}`,
          `Email:    ${signup.email}`,
          `Interest: ${signup.interest ?? "—"}`,
          `Note:     ${signup.note ?? "—"}`,
          ``,
          ...(signup.program === "sidebar"
            ? [
                `Copy-paste welcome reply (send from your inbox to ${signup.email}):`,
                `----------------------------------------------------------------`,
                `Subject: Welcome to Sidebar`,
                ``,
                `Hi ${firstName} — Zachariah here. Thanks for raising your hand for Sidebar; you're on the founding list.`,
                ``,
                `First thing: the private WhatsApp group where the community hangs out day-to-day. It's invite-only on purpose, so please keep the link off social:`,
                sidebarInvite,
                ``,
                `I'll follow up personally as your peer circle comes together. Glad you're here.`,
                ``,
                `— Zachariah`,
                `----------------------------------------------------------------`,
                ``,
              ]
            : []),
          `All signups: select * from waitlist_signups order by created_at desc;`,
        ].join("\n"),
      }),
    });
    if (!res.ok) {
      console.error("waitlist notify email failed", res.status, await res.text());
    }
  } catch (e) {
    console.error("waitlist notify email errored", e);
  }
}

function parseMatterTokens(text: string): {
  cleanText: string;
  readyForReview: boolean;
  matterTitle: string | null;
  matterSummary: string | null;
} {
  const titleMatch = text.match(/\[MATTER_TITLE:\s*([^\]]+)\]/i);
  const summaryMatch = text.match(/\[MATTER_SUMMARY:\s*([\s\S]+?)\]/i);
  const readyForReview = /\[READY_FOR_REVIEW\]/i.test(text);

  const cleanText = text
    .replace(/\[MATTER_TITLE:[^\]]+\]/gi, "")
    .replace(/\[MATTER_SUMMARY:[\s\S]+?\]/gi, "")
    .replace(/\[READY_FOR_REVIEW\]/gi, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return {
    cleanText,
    readyForReview,
    matterTitle: titleMatch ? titleMatch[1].trim() : null,
    matterSummary: summaryMatch ? summaryMatch[1].trim() : null,
  };
}

function pickFirstSubstantiveMessage(
  messages: ChatMessage[],
  maxLen: number
): string | null {
  const userMsgs = messages.filter((m) => m.role === "user");
  if (userMsgs.length === 0) return null;
  const TRIVIAL = /^(hi|hello|hey|yo|yes|no|ok(ay)?|sure|thanks?|cool|y|n)[!.?\s]*$/i;
  const picked =
    userMsgs.find((m) => m.content.trim().length > 15 && !TRIVIAL.test(m.content.trim())) ??
    userMsgs[0];
  return picked.content.trim().slice(0, maxLen);
}

function buildAnthropicMessages(
  messages: ChatMessage[],
  docs: AttachedDoc[]
): Array<{ role: string; content: unknown }> {
  const out: Array<{ role: string; content: unknown }> = [];
  // Docs attach to the FIRST user message (not the last). This keeps them
  // in the conversation history at a fixed point so Claude doesn't treat
  // them as freshly uploaded on every turn.
  const firstUserIdx = messages.findIndex((m) => m.role === "user");
  const attachable = docs.filter((d) => !d.skipped);
  const skipped = docs.filter((d) => d.skipped);

  messages.forEach((m, idx) => {
    if (idx !== firstUserIdx || (attachable.length === 0 && skipped.length === 0)) {
      out.push({ role: m.role, content: m.content });
      return;
    }

    const contentBlocks: unknown[] = [];

    if (attachable.length) {
      const intro =
        `The client has the following document${attachable.length === 1 ? "" : "s"} stored in their Available Law account. They were uploaded previously and may or may not be relevant to what we discuss below — only bring them up if the client asks or if a document is clearly on-topic, and never claim a document was just uploaded unless the client says so themselves:\n` +
        attachable
          .map((d, i) => `${i + 1}. ${d.filename} (${formatBytes(d.size_bytes)})`)
          .join("\n") +
        "\n\n---";
      contentBlocks.push({ type: "text", text: intro });

      for (const d of attachable) {
        if (d.base64 && d.mime_type === "application/pdf") {
          contentBlocks.push({
            type: "document",
            source: { type: "base64", media_type: "application/pdf", data: d.base64 },
          });
        } else if (
          d.base64 &&
          ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(d.mime_type)
        ) {
          contentBlocks.push({
            type: "image",
            source: { type: "base64", media_type: d.mime_type, data: d.base64 },
          });
        } else if (d.text) {
          contentBlocks.push({
            type: "text",
            text: `\n=== ${d.filename} ===\n${d.text}\n=== end of ${d.filename} ===`,
          });
        } else if (d.base64) {
          contentBlocks.push({
            type: "text",
            text: `[Document "${d.filename}" (${d.mime_type}) is on file but not directly readable by you.]`,
          });
        }
      }
    }

    if (skipped.length) {
      contentBlocks.push({
        type: "text",
        text:
          `These documents are on file but were not attached due to size limits: ` +
          skipped.map((d) => `${d.filename} (${d.skipped})`).join(", "),
      });
    }

    contentBlocks.push({ type: "text", text: m.content });

    out.push({
      role: "user",
      content: contentBlocks.length > 1 ? contentBlocks : m.content,
    });
  });

  return out;
}

function formatBytes(n: number): string {
  if (!n) return "0 B";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function base64Encode(bytes: Uint8Array): string {
  let binary = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunk)));
  }
  return btoa(binary);
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", ...CORS_HEADERS },
  });
}
