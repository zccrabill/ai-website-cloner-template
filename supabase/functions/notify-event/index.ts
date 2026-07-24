/**
 * notify-event Edge Function.
 *
 * One renderer/sender for the dashboard's transactional emails.
 *
 * Supported event_types:
 *   - member.onboarded      → notify Zachariah
 *   - document.uploaded     → notify Zachariah
 *   - draft.sent            → notify the member
 *   - checkout.paid         → notify Zachariah
 *   - faiir.intake_received → notify Zachariah
 *   - website.intake_received → notify Zachariah (Available Webdev project brief)
 *   - status_note.posted    → notify the engagement's client seat(s) with the
 *                             attorney's note + a CTA to their workspace.
 *   - deliverable.released  → notify the engagement's client seat(s) that a
 *                             deliverable is ready in their workspace.
 *   - review.submitted      → notify Zachariah that a client submitted a
 *                             review at /review (lands pending approval).
 *
 * Request shape:
 *   { event_type, user_id?, member_email?, data? }
 *
 * Fail-open: errors are logged but the function still returns 200.
 *
 * Env: RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *      NOTIFY_ADMIN_EMAIL, NOTIFY_FROM_FIRM, NOTIFY_FROM_ZACHARIAH, DASHBOARD_URL
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
  | "faiir.intake_received"
  | "website.intake_received"
  | "status_note.posted"
  | "deliverable.released"
  | "review.submitted";

interface IncomingPayload {
  event_type: EventType;
  user_id?: string | null;
  member_email?: string | null;
  data?: Record<string, unknown>;
}

interface EmailSpec {
  to: string | string[];
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
    console.error(`[notify-event] resolveMemberEmail failed for ${userId}:`, error);
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
    <p style="color:#6B5B4E;font-size:12px;margin-top:24px;">Reply to this email to reach them directly.</p>
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
    <p style="color:#6B5B4E;font-size:14px;line-height:1.6;margin-bottom:20px;">A member uploaded a document to their dashboard.</p>
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
      Your attorney just finalized and sent <strong>${title}</strong>. You can review it in your dashboard whenever you're ready.
    </p>
    <p style="margin:24px 0;">
      <a href="${escapeHtml(DASHBOARD_URL)}/documents" style="display:inline-block;background:#1F1810;color:white;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600;">Open in dashboard →</a>
    </p>
    <p style="color:#6B5B4E;font-size:14px;line-height:1.6;margin-top:24px;">Reply with any questions — it goes straight to me.</p>
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
    <p style="color:#6B5B4E;font-size:14px;line-height:1.6;margin-bottom:20px;">A new FAIIR intake just came in via the landing page form.</p>
    <div style="background:#FAF8F5;border:1px solid rgba(31,24,16,0.08);border-radius:12px;padding:20px;margin-bottom:16px;">
      ${row("Name", fullName)}
      ${row("Email", `<a href="mailto:${escapeHtml(senderEmail)}" style="color:#C17832;">${escapeHtml(senderEmail)}</a>`)}
      ${d.phone ? row("Phone", escapeHtml(d.phone)) : ""}
      ${d.company ? row("Company", escapeHtml(d.company)) : ""}
      ${d.title ? row("Title", escapeHtml(d.title)) : ""}
      ${d.industry ? row("Industry", escapeHtml(d.industry)) : ""}
      ${services !== "—" ? row("Services", services) : ""}
    </div>
    ${d.notes ? `<div style="background:#FAF8F5;border:1px solid rgba(31,24,16,0.08);border-radius:12px;padding:20px;margin-bottom:16px;"><h3 style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#A89279;margin:0 0 8px;">Notes</h3><p style="margin:0;color:#1F1810;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(d.notes)}</p></div>` : ""}
    <p style="margin:24px 0 0;">
      <a href="${escapeHtml(DASHBOARD_URL)}/review" style="display:inline-block;background:#1F1810;color:white;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600;">Open intake queue →</a>
    </p>
  `;
  return {
    from: FROM_FIRM,
    to: ADMIN_EMAIL,
    reply_to: typeof senderEmail === "string" ? senderEmail : undefined,
    subject: `New FAIIR intake: ${fullName} — ${senderEmail}`,
    html: shell("New FAIIR intake", body),
  };
}

// website.intake_received — an Available Webdev project brief came in via
// the /webdev landing form. Emails Zachariah the details with the visitor's
// email as reply-to so a response is one click away.
function websiteIntakeReceivedTemplate(payload: IncomingPayload): EmailSpec {
  const d = payload.data ?? {};
  const senderEmail = payload.member_email ?? (d.email as string) ?? "—";
  const fullName = escapeHtml(d.full_name ?? "(name not provided)");
  const projectTypes = Array.isArray(d.project_types)
    ? (d.project_types as unknown[]).map((s) => escapeHtml(s)).join(", ")
    : "—";
  const body = `
    <p style="color:#6B5B4E;font-size:14px;line-height:1.6;margin-bottom:20px;">A new Available Webdev project brief just came in via the /webdev landing page.</p>
    <div style="background:#FAF8F5;border:1px solid rgba(31,24,16,0.08);border-radius:12px;padding:20px;margin-bottom:16px;">
      ${row("Name", fullName)}
      ${row("Email", `<a href="mailto:${escapeHtml(senderEmail)}" style="color:#C17832;">${escapeHtml(senderEmail)}</a>`)}
      ${d.phone ? row("Phone", escapeHtml(d.phone)) : ""}
      ${d.company ? row("Business", escapeHtml(d.company)) : ""}
      ${d.website_url ? row("Current site", escapeHtml(d.website_url)) : ""}
      ${d.industry ? row("Industry", escapeHtml(d.industry)) : ""}
      ${projectTypes !== "—" ? row("Wants", projectTypes) : ""}
      ${d.budget ? row("Budget", escapeHtml(d.budget)) : ""}
      ${d.timeline ? row("Timeline", escapeHtml(d.timeline)) : ""}
    </div>
    ${d.notes ? `<div style="background:#FAF8F5;border:1px solid rgba(31,24,16,0.08);border-radius:12px;padding:20px;margin-bottom:16px;"><h3 style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#A89279;margin:0 0 8px;">About the business</h3><p style="margin:0;color:#1F1810;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(d.notes)}</p></div>` : ""}
  `;
  return {
    from: FROM_FIRM,
    to: ADMIN_EMAIL,
    reply_to: typeof senderEmail === "string" ? senderEmail : undefined,
    subject: `New Available Webdev brief: ${fullName} — ${senderEmail}`,
    html: shell("New Available Webdev project brief", body),
  };
}

function checkoutPaidTemplate(payload: IncomingPayload): EmailSpec {
  const d = payload.data ?? {};
  const memberEmail = payload.member_email ?? "—";
  const tier = escapeHtml(d.tier ?? "—");
  const amountCents = typeof d.amount_total === "number" ? d.amount_total : null;
  const currency = (typeof d.currency === "string" ? d.currency : "usd").toUpperCase();
  const amountFormatted = amountCents !== null ? `${currency} $${(amountCents / 100).toFixed(2)}` : "—";
  const body = `
    <p style="color:#6B5B4E;font-size:14px;line-height:1.6;margin-bottom:20px;">A new paid signup just landed.</p>
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

// status_note.posted — emails the engagement's client seat(s) the attorney's
// note plus a CTA to their workspace. Recipients come from org_members (the
// engagement seat table), NOT members. Note body is fetched by id (source of
// truth), so the request only needs { engagement_id, note_id }.
async function statusNotePostedSpec(payload: IncomingPayload): Promise<EmailSpec | null> {
  const d = payload.data ?? {};
  const engagementId = typeof d.engagement_id === "string" ? d.engagement_id : null;
  const noteId = typeof d.note_id === "string" ? d.note_id : null;
  if (!engagementId || !noteId) {
    console.error("[notify-event] status_note.posted missing engagement_id/note_id");
    return null;
  }
  const { data: note } = await supabase
    .from("engagement_status_notes")
    .select("body")
    .eq("id", noteId)
    .maybeSingle();
  if (!note?.body) {
    console.error(`[notify-event] status_note.posted note ${noteId} not found`);
    return null;
  }
  const { data: eng } = await supabase
    .from("engagements")
    .select("title, org_id")
    .eq("id", engagementId)
    .maybeSingle();
  if (!eng?.org_id) {
    console.error(`[notify-event] status_note.posted engagement ${engagementId} has no org`);
    return null;
  }
  const { data: members } = await supabase
    .from("org_members")
    .select("email, status")
    .eq("org_id", eng.org_id)
    .in("status", ["active", "invited"]);
  const emails = (members ?? [])
    .map((m) => (m as { email?: string }).email)
    .filter((e): e is string => typeof e === "string" && e.length > 0);
  if (emails.length === 0) {
    console.error(`[notify-event] status_note.posted no recipients for org ${eng.org_id}`);
    return null;
  }
  const noteHtml = escapeHtml(note.body).replace(/\n/g, "<br/>");
  const body = `
    <p style="color:#3F2A1A;font-size:16px;line-height:1.7;margin-bottom:20px;">${noteHtml}</p>
    <p style="margin:24px 0;">
      <a href="${escapeHtml(DASHBOARD_URL)}" style="display:inline-block;background:#1F1810;color:white;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600;">Open your workspace →</a>
    </p>
    <p style="color:#6B5B4E;font-size:14px;line-height:1.6;margin-top:24px;">Reply with any questions — it goes straight to me.</p>
    <p style="margin-top:24px;color:#1F1810;">— Zachariah Crabill<br/><span style="color:#A89279;font-size:13px;">Founder &amp; Attorney, Available Law</span></p>
  `;
  return {
    from: FROM_ZACHARIAH,
    to: emails,
    reply_to: ADMIN_EMAIL,
    subject: "A note on your engagement — Available Law",
    html: shell("A note from your attorney", body),
  };
}

// deliverable.released — emails the engagement's client seat(s) that a new
// deliverable is visible in their workspace. Deliverable is fetched by id
// (source of truth), so the request only needs { engagement_id, deliverable_id }.
async function deliverableReleasedSpec(payload: IncomingPayload): Promise<EmailSpec | null> {
  const d = payload.data ?? {};
  const engagementId = typeof d.engagement_id === "string" ? d.engagement_id : null;
  const deliverableId = typeof d.deliverable_id === "string" ? d.deliverable_id : null;
  if (!engagementId || !deliverableId) {
    console.error("[notify-event] deliverable.released missing engagement_id/deliverable_id");
    return null;
  }
  const { data: deliverable } = await supabase
    .from("deliverables")
    .select("title, description, status")
    .eq("id", deliverableId)
    .maybeSingle();
  if (!deliverable || deliverable.status !== "released") {
    console.error(`[notify-event] deliverable.released ${deliverableId} not found or not released`);
    return null;
  }
  const { data: eng } = await supabase
    .from("engagements")
    .select("title, org_id")
    .eq("id", engagementId)
    .maybeSingle();
  if (!eng?.org_id) {
    console.error(`[notify-event] deliverable.released engagement ${engagementId} has no org`);
    return null;
  }
  const { data: members } = await supabase
    .from("org_members")
    .select("email, status")
    .eq("org_id", eng.org_id)
    .in("status", ["active", "invited"]);
  const emails = (members ?? [])
    .map((m) => (m as { email?: string }).email)
    .filter((e): e is string => typeof e === "string" && e.length > 0);
  if (emails.length === 0) {
    console.error(`[notify-event] deliverable.released no recipients for org ${eng.org_id}`);
    return null;
  }
  const title = escapeHtml(deliverable.title);
  const description = deliverable.description
    ? `<p style="color:#6B5B4E;font-size:14px;line-height:1.6;margin-bottom:20px;">${escapeHtml(deliverable.description)}</p>`
    : "";
  const body = `
    <p style="color:#3F2A1A;font-size:16px;line-height:1.7;margin-bottom:12px;">A new deliverable is ready in your workspace:</p>
    <div style="background:#FAF8F5;border:1px solid rgba(31,24,16,0.08);border-radius:12px;padding:20px;margin-bottom:16px;">
      <p style="color:#1F1810;font-size:15px;font-weight:600;margin:0;">${title}</p>
    </div>
    ${description}
    <p style="margin:24px 0;">
      <a href="${escapeHtml(DASHBOARD_URL)}/deliverables" style="display:inline-block;background:#1F1810;color:white;text-decoration:none;padding:12px 20px;border-radius:8px;font-size:14px;font-weight:600;">View your deliverable →</a>
    </p>
    <p style="color:#6B5B4E;font-size:14px;line-height:1.6;margin-top:24px;">Reply with any questions — it goes straight to me.</p>
    <p style="margin-top:24px;color:#1F1810;">— Zachariah Crabill<br/><span style="color:#A89279;font-size:13px;">Founder &amp; Attorney, Available Law</span></p>
  `;
  return {
    from: FROM_ZACHARIAH,
    to: emails,
    reply_to: ADMIN_EMAIL,
    subject: `Your deliverable is ready: ${deliverable.title} — Available Law`,
    html: shell("A new deliverable is ready", body),
  };
}

// review.submitted — notify Zachariah that a client submitted a review via
// the public /review flow. Reviews land pending, so the CTA points at the
// approval queue rather than the public site.
function reviewSubmittedTemplate(payload: IncomingPayload): EmailSpec {
  const d = payload.data ?? {};
  const rating = typeof d.rating === "number" ? d.rating : 0;
  const stars = "★".repeat(Math.max(0, Math.min(5, rating))) +
    "☆".repeat(Math.max(0, 5 - Math.max(0, Math.min(5, rating))));
  const chips = Array.isArray(d.chips)
    ? (d.chips as unknown[]).map((c) => escapeHtml(c)).join(" · ")
    : "";
  const consentLabels: Record<string, string> = {
    full: "Publish with full name and business",
    first_initial: "Publish with first name + last initial",
    anonymous: "Publish anonymously",
    private: "Do NOT publish — private feedback only",
  };
  const consentLevel = typeof d.consent_level === "string" ? d.consent_level : "";
  const body = `
    <p style="color:#6B5B4E;font-size:14px;line-height:1.6;margin-bottom:20px;">A client just submitted a review. It's pending — nothing publishes until you approve it.</p>
    <div style="background:#FAF8F5;border:1px solid rgba(31,24,16,0.08);border-radius:12px;padding:20px;margin-bottom:16px;">
      ${row("Rating", `<span style="color:#C17832;font-size:16px;letter-spacing:2px;">${stars}</span> (${rating}/5)`)}
      ${row("Name", `${escapeHtml(d.first_name)} ${escapeHtml(d.last_name)}`)}
      ${d.business_name ? row("Business", escapeHtml(d.business_name)) : ""}
      ${d.practice_area ? row("Practice area", escapeHtml(d.practice_area)) : ""}
      ${chips ? row("Highlights", chips) : ""}
      ${row("Consent", escapeHtml(consentLabels[consentLevel] ?? consentLevel))}
      ${row("Will display as", escapeHtml(d.display_name))}
      ${row("AI drafting used", d.ai_drafting_used ? "Yes (original draft stored)" : "No")}
    </div>
    <div style="background:#FAF8F5;border:1px solid rgba(31,24,16,0.08);border-radius:12px;padding:20px;margin-bottom:16px;">
      <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#A89279;margin:0 0 8px;">Review text</h3>
      <p style="margin:0;color:#1F1810;font-size:14px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(d.review_text)}</p>
    </div>
    <p style="margin:24px 0 0;">
      <a href="${escapeHtml(DASHBOARD_URL)}/reviews" style="display:inline-block;background:#1F1810;color:white;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600;">Review &amp; approve →</a>
    </p>
  `;
  return {
    from: FROM_FIRM,
    to: ADMIN_EMAIL,
    subject: `New client review (${rating}/5): ${d.first_name ?? ""} ${d.last_name ?? ""}`.trim(),
    html: shell("New client review submitted", body),
  };
}

/* -------------------------------------------------------------------------- */
/* Dispatcher                                                                 */
/* -------------------------------------------------------------------------- */

async function buildEmail(payload: IncomingPayload): Promise<EmailSpec | null> {
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
        console.error("[notify-event] draft.sent missing member_email and lookup returned null");
        return null;
      }
      return draftSentTemplate(payload);
    case "checkout.paid":
      return checkoutPaidTemplate(payload);
    case "faiir.intake_received":
      return faiirIntakeReceivedTemplate(payload);
    case "website.intake_received":
      return websiteIntakeReceivedTemplate(payload);
    case "status_note.posted":
      return await statusNotePostedSpec(payload);
    case "deliverable.released":
      return await deliverableReleasedSpec(payload);
    case "review.submitted":
      return reviewSubmittedTemplate(payload);
    default:
      console.warn("[notify-event] unknown event_type:", payload.event_type);
      return null;
  }
}

function hasRecipient(to: string | string[]): boolean {
  return Array.isArray(to) ? to.length > 0 : Boolean(to);
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
    return new Response(
      JSON.stringify({ ok: true, sent: false, reason: "no template" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!hasRecipient(spec.to)) {
    return new Response(
      JSON.stringify({ ok: true, sent: false, reason: "no recipient" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const result = await sendEmail(spec);
  if (!result.ok) {
    console.error(`[notify-event] send failed (event=${payload.event_type}):`, result.error);
  }

  return new Response(
    JSON.stringify({ ok: true, sent: result.ok, error: result.error }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
