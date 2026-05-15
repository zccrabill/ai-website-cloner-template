/**
 * notify-event Edge Function.
 *
 * One renderer/sender for every transactional email the dashboard fires that
 * isn't the AI Act Checker (which has its own dedicated function and isn't
 * worth folding in — different schema, different lead-capture lifecycle).
 *
 * Supported event_types:
 *   - member.onboarded     → notify Zachariah:    "New member just finished onboarding"
 *   - document.uploaded    → notify Zachariah:    "Member uploaded a document"
 *   - draft.sent           → notify the member:   "Your attorney sent you a document"
 *   - checkout.paid        → notify Zachariah:    "New paid signup, tier=X, amount=$Y"
 *   - faiir.intake_received → notify Zachariah:   "New FAIIR intake from <name>"
 *
 * Request shape:
 *   {
 *     event_type: string,
 *     user_id?: string | null,
 *     member_email?: string | null,   // pre-fetched if available; else looked up from members
 *     data?: Record<string, unknown>  // event-specific payload (see each renderer)
 *   }
 *
 * Auth: this function is called from two places.
 *   1) Browser code with the user's anon-key Authorization → fine for events
 *      that only notify the firm (we never expose the rendered HTML back to the
 *      caller, and the function is rate-limited by Resend).
 *   2) stripe-webhook server code with the service-role key.
 *
 * Fail-open: errors are logged but the function still returns 200 so callers
 * (especially client-side fire-and-forget invokes) never error on the user.
 *
 * Required env vars:
 *   RESEND_API_KEY              — re_...
 *   SUPABASE_URL                — auto-injected
 *   SUPABASE_SERVICE_ROLE_KEY   — auto-injected (used to look up member.email when only user_id is passed)
 *
 *   NOTIFY_ADMIN_EMAIL          — defaults to "zachariah@availablelaw.com"
 *   NOTIFY_FROM_FIRM            — defaults to "Available Law <noreply@availablelaw.com>"
 *   NOTIFY_FROM_ZACHARIAH       — defaults to "Zachariah Crabill <zachariah@availablelaw.com>"
 *   DASHBOARD_URL               — defaults to "https://availablelaw.com/dashboard"  (used in email CTAs)
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const RESEND_API = "https://api.resend.com/emails";
const ADMIN_EMAIL =
  Deno.env.get("NOTIFY_ADMIN_EMAIL") ?? "zachariah@availablelaw.com";
const FROM_FIRM =
  Deno.env.get("NOTIFY_FROM_FIRM") ??
  "Available Law <noreply@availablelaw.com>";
const FROM_ZACHARIAH =
  Deno.env.get("NOTIFY_FROM_ZACHARIAH") ??
  "Zachariah Crabill <zachariah@availablelaw.com>";
const DASHBOARD_URL =
  Deno.env.get("DASHBOARD_URL") ?? "https://availablelaw.com/dashboard";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type EventType =
  | "member.onboarded"
  | "document.uploaded"
  | "draft.sent"
  | "checkout.paid"
  | "faiir.intake_received";

interface IncomingPayload {
  event_type: EventType;
  user_id?: string | null;
  member_email?: string | null;
  data?: Record<string, unknown>;
}

interface EmailSpec {
  to: string;
  from: string;
  subject: string;
  html: string;
  reply_to?: string;
}

async function sendEmail(spec: EmailSpec): Promise<{ ok: boolean; error?: string }> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY not set" };
  const body: Record<string, unknown> = {
    from: spec.from,
    to: spec.to,
    subject: spec.subject,
    html: spec.html,
  };
  if (spec.reply_to) body.reply_to = spec.reply_to;
  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: `Resend ${res.status}: ${text}` };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

async function resolveMemberEmail(
  userId: string | null | undefined,
): Promise<string | null> {
  if (!userId) return null;
  const { data, error } = await supabase
    .from("members")
    .select("email")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) {
    console.error(
      `[notify-event] resolveMemberEmail failed for ${userId}:`,
      error,
    );
    return null;
  }
  return data?.email ?? null;
}

/* -------------------------------------------------------------------------- */
/* Templates                                                                  */
/* -------------------------------------------------------------------------- */

function shell(title: string, bodyHtml: string): string {
  return `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#1F1810;max-width:640px;margin:0 auto;padding:24px;background:#FAF8F5;">
    <div style="background:white;border:1px solid rgba(31,24,16,0.08);border-radius:16px;padding:32px;">
      <p style="color:#C17832;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:600;margin:0 0 8px;">Available Law</p>
      <h2 style="font-size:22px;margin:0 0 16px;line-height:1.3;">${title}</h2>
      ${bodyHtml}
    </div>
    <p style="color:#A89279;font-size:11px;line-height:1.6;padding:16px;max-width:640px;margin:0 auto;">Sent automatically from the Available Law dashboard.</p>
  </body></html>`;
}

function row(label: string, value: string): string {
  return `<p style="margin:6px 0;color:#1F1810;font-size:14px;"><strong style="color:#6B5B4E;">${label}:</strong> ${value}</p>`;
}

function escapeHtml(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatBytes(bytes: unknown): string {
  const n = typeof bytes === "number" ? bytes : Number(bytes);
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function memberOnboardedTemplate(payload: IncomingPayload): EmailSpec {
  const d = payload.data ?? {};
  const memberEmail = payload.member_email ?? (d.email as string) ?? "—";
  const body = `
    <p style="color:#6B5B4E;font-size:14px;line-height:1.6;margin-bottom:20px;">
      A new member just completed onboarding. They've signed the engagement
      agreement and are now in the dashboard.
    </p>
    <div style="background:#FAF8F5;border:1px solid rgba(31,24,16,0.08);border-radius:12px;padding:20px;margin-bottom:16px;">
      ${row("Email", `<a href="mailto:${escapeHtml(memberEmail)}" style="color:#C17832;">${escapeHtml(memberEmail)}</a>`)}
      ${row("Full name", escapeHtml(d.full_name))}
      ${row("Business", escapeHtml(d.business_name))}
      ${row("Type", escapeHtml(d.business_type))}
      ${d.industry ? row("Industry", escapeHtml(d.industry)) : ""}
      ${d.state ? row("State", escapeHtml(d.state)) : ""}
      ${d.referral_source ? row("Heard via", escapeHtml(d.referral_source)) : ""}
    </div>
    <p style="color:#6B5B4E;font-size:12px;margin-top:24px;">
      Reply to this email to reach them directly.
    </p>
  `;
  return {
    from: FROM_FIRM,
    to: ADMIN_EMAIL,
    reply_to: typeof memberEmail === "string" ? memberEmail : undefined,
    subject: `New member onboarded: ${memberEmail}`,
    html: shell("New member onboarded", body),
  };
}

function documentUploadedTemplate(payload: IncomingPayload): EmailSpec {
  const d = payload.data ?? {};
  const memberEmail = payload.member_email ?? "—";
  const filename = escapeHtml(d.filename ?? "(unnamed file)");
  const size = formatBytes(d.size_bytes);
  const mime = escapeHtml(d.mime_type ?? "—");
  const body = `
    <p style="color:#6B5B4E;font-size:14px;line-height:1.6;margin-bottom:20px;">
      A member uploaded a document to their dashboard.
    </p>
    <div style="background:#FAF8F5;border:1px solid rgba(31,24,16,0.08);border-radius:12px;padding:20px;margin-bottom:16px;">
      ${row("Member", escapeHtml(memberEmail))}
      ${row("Filename", filename)}
      ${row("Size", size)}
      ${row("Type", mime)}
    </div>
    <p style="margin:24px 0 0;">
      <a href="${escapeHtml(DASHBOARD_URL)}/review" style="display:inline-block;background:#1F1810;color:white;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600;">Open review queue →</a>
    </p>
  `;
  return {
    from: FROM_FIRM,
    to: ADMIN_EMAIL,
    reply_to: typeof memberEmail === "string" ? memberEmail : undefined,
    subject: `Document upload from ${memberEmail}: ${d.filename ?? "file"}`,
    html: shell("New document uploaded", body),
  };
}

function draftSentTemplate(payload: IncomingPayload): EmailSpec {
  const d = payload.data ?? {};
  const memberEmail = payload.member_email ?? "";
  const title = escapeHtml(d.title ?? "your matter");
  const body = `
    <p style="color:#3F2A1A;font-size:16px;line-height:1.7;margin-bottom:20px;">
      Your attorney just finalized and sent <strong>${title}</strong>. You can
      review it in your dashboard whenever you're ready.
    </p>
    <p style="margin:24px 0;">
      <a href="${escapeHtml(DASHBOARD_URL)}/documents" style="display:inline-block;background:#1F1810;color:white;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600;">Open in dashboard →</a>
    </p>
    <p style="color:#6B5B4E;font-size:14px;line-height:1.6;margin-top:24px;">
      Reply with any questions — it goes straight to me.
    </p>
    <p style="margin-top:24px;color:#1F1810;">— Zachariah Crabill<br/><span style="color:#A89279;font-size:13px;">Founder &amp; Attorney, Available Law</span></p>
  `;
  return {
    from: FROM_ZACHARIAH,
    to: memberEmail,
    reply_to: ADMIN_EMAIL,
    subject: `Your attorney sent: ${d.title ?? "a new document"}`,
    html: shell("Your attorney sent you a document", body),
  };
}

function faiirIntakeReceivedTemplate(payload: IncomingPayload): EmailSpec {
  const d = payload.data ?? {};
  const senderEmail = payload.member_email ?? (d.email as string) ?? "—";
  const fullName = escapeHtml(d.full_name ?? "(name not provided)");
  const services = Array.isArray(d.services)
    ? (d.services as unknown[]).map((s) => escapeHtml(s)).join(", ")
    : "—";
  const body = `
    <p style="color:#6B5B4E;font-size:14px;line-height:1.6;margin-bottom:20px;">
      A new FAIIR intake just came in via the landing page form. They're
      looking for more context before booking a discovery call.
    </p>
    <div style="background:#FAF8F5;border:1px solid rgba(31,24,16,0.08);border-radius:12px;padding:20px;margin-bottom:16px;">
      ${row("Name", fullName)}
      ${row("Email", `<a href="mailto:${escapeHtml(senderEmail)}" style="color:#C17832;">${escapeHtml(senderEmail)}</a>`)}
      ${d.phone ? row("Phone", escapeHtml(d.phone)) : ""}
      ${d.company ? row("Company", escapeHtml(d.company)) : ""}
      ${d.title ? row("Title", escapeHtml(d.title)) : ""}
      ${d.industry ? row("Industry", escapeHtml(d.industry)) : ""}
      ${services !== "—" ? row("Services", services) : ""}
    </div>
    ${
      d.notes
        ? `<div style="background:#FAF8F5;border:1px solid rgba(31,24,16,0.08);border-radius:12px;padding:20px;margin-bottom:16px;">
        <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#A89279;margin:0 0 8px;">Notes</h3>
        <p style="margin:0;color:#1F1810;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(d.notes)}</p>
      </div>`
        : ""
    }
    <p style="margin:24px 0 0;">
      <a href="${escapeHtml(DASHBOARD_URL)}/review" style="display:inline-block;background:#1F1810;color:white;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600;">Open intake queue →</a>
    </p>
    <p style="color:#A89279;font-size:11px;margin-top:16px;">Reply-to is set to the sender.</p>
  `;
  return {
    from: FROM_FIRM,
    to: ADMIN_EMAIL,
    reply_to: typeof senderEmail === "string" ? senderEmail : undefined,
    subject: `New FAIIR intake: ${fullName} — ${senderEmail}`,
    html: shell("New FAIIR intake", body),
  };
}

function checkoutPaidTemplate(payload: IncomingPayload): EmailSpec {
  const d = payload.data ?? {};
  const memberEmail = payload.member_email ?? "—";
  const tier = escapeHtml(d.tier ?? "—");
  const amountCents = typeof d.amount_total === "number" ? d.amount_total : null;
  const currency = (typeof d.currency === "string" ? d.currency : "usd").toUpperCase();
  const amountFormatted =
    amountCents !== null
      ? `${currency} $${(amountCents / 100).toFixed(2)}`
      : "—";
  const body = `
    <p style="color:#6B5B4E;font-size:14px;line-height:1.6;margin-bottom:20px;">
      A new paid signup just landed. Stripe has cashed the first invoice and the
      member's tier is now active in Supabase.
    </p>
    <div style="background:#FAF8F5;border:1px solid rgba(31,24,16,0.08);border-radius:12px;padding:20px;margin-bottom:16px;">
      ${row("Member", escapeHtml(memberEmail))}
      ${row("Tier", `<span style="text-transform:capitalize;font-weight:600;">${tier}</span>`)}
      ${row("Amount", amountFormatted)}
    </div>
  `;
  return {
    from: FROM_FIRM,
    to: ADMIN_EMAIL,
    reply_to: typeof memberEmail === "string" ? memberEmail : undefined,
    subject: `New paid signup: ${memberEmail} → ${tier}`,
    html: shell("New paid signup", body),
  };
}

/* -------------------------------------------------------------------------- */
/* Dispatcher                                                                 */
/* -------------------------------------------------------------------------- */

async function buildEmail(payload: IncomingPayload): Promise<EmailSpec | null> {
  // For draft.sent we need the member's email no matter what — look it up
  // if the caller didn't pre-fetch it.
  if (payload.event_type === "draft.sent" && !payload.member_email) {
    const looked = await resolveMemberEmail(payload.user_id);
    payload = { ...payload, member_email: looked };
  }

  switch (payload.event_type) {
    case "member.onboarded":
      return memberOnboardedTemplate(payload);
    case "document.uploaded":
      return documentUploadedTemplate(payload);
    case "draft.sent":
      if (!payload.member_email) {
        console.error(
          "[notify-event] draft.sent missing member_email and lookup returned null",
        );
        return null;
      }
      return draftSentTemplate(payload);
    case "checkout.paid":
      return checkoutPaidTemplate(payload);
    case "faiir.intake_received":
      return faiirIntakeReceivedTemplate(payload);
    default:
      console.warn("[notify-event] unknown event_type:", payload.event_type);
      return null;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  let payload: IncomingPayload;
  try {
    payload = (await req.json()) as IncomingPayload;
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!payload.event_type) {
    return new Response(JSON.stringify({ error: "Missing event_type" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const spec = await buildEmail(payload);
  if (!spec) {
    // Fail-open: unknown event types are acknowledged but not sent.
    return new Response(
      JSON.stringify({ ok: true, sent: false, reason: "no template" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!spec.to) {
    return new Response(
      JSON.stringify({ ok: true, sent: false, reason: "no recipient" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const result = await sendEmail(spec);
  if (!result.ok) {
    console.error(
      `[notify-event] send failed (event=${payload.event_type}):`,
      result.error,
    );
  }

  return new Response(
    JSON.stringify({ ok: true, sent: result.ok, error: result.error }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
