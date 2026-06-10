/**
 * send-faiir-brief Edge Function.
 *
 * Sends one issue of The FAIIR Brief to opted-in members via Resend, reusing the
 * warm availablelaw.com domain. Supabase stays the single source of truth for the
 * subscriber list (no Resend Audience to keep in sync).
 *
 * Three modes (POST JSON body):
 *   { "issue_number": 7, "dry_run": true }                 -> returns who WOULD receive it, sends nothing
 *   { "issue_number": 7, "test_email": "you@x.com" }       -> sends one copy to that address only
 *   { "issue_number": 7 }                                  -> LIVE broadcast to all opted-in members
 *
 * Idempotent: a (issue, email) already marked 'sent' in faiir_brief_sends is skipped,
 * so a re-run after a partial failure only sends the stragglers.
 *
 * Auth: requires header  x-brief-secret: <TRIGGER_SECRET>.  The function is deployed
 * with verify_jwt=false; this shared secret (known only from the private source) is
 * what gates triggering a real send.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// ---- config -------------------------------------------------------------
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

// Rotate by editing here + redeploying. Not exposed to any client.
const TRIGGER_SECRET = "brief_trg_9f2c7a1e84db4350bf6e2d19c0a7e5b3";

const FROM = "Zachariah Crabill <zachariah@availablelaw.com>";
const REPLY_TO = "zachariah@availablelaw.com";
const RESEND_API = "https://api.resend.com/emails";
const UNSUB_BASE = `${SUPABASE_URL}/functions/v1/brief-unsubscribe`;
const SEND_DELAY_MS = 120; // gentle pacing under Resend's rate limit

const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

// ---- supabase REST helpers (service role) -------------------------------
async function sb(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...init,
    headers: {
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
}

interface Issue {
  id: string;
  issue_number: number;
  subject_line: string;
  preheader: string | null;
  html: string;
  status: string;
}

interface Member {
  id: string;
  email: string;
  full_name: string | null;
  unsubscribe_token: string;
}

// Inject a hidden preheader and swap the unsubscribe token into the issue HTML.
function personalize(issueHtml: string, preheader: string | null, unsubUrl: string): string {
  let out = issueHtml.replaceAll("%%unsubscribe_url%%", unsubUrl);
  if (preheader) {
    const hidden =
      `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${preheader}</div>` +
      `<div style="display:none;max-height:0;overflow:hidden;">&#8199;&#65279;&zwnj;</div>`;
    out = /<body[^>]*>/i.test(out)
      ? out.replace(/(<body[^>]*>)/i, `$1${hidden}`)
      : hidden + out;
  }
  return out;
}

async function resendSend(to: string, subject: string, htmlBody: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!RESEND_API_KEY) return { ok: false, error: "RESEND_API_KEY not set" };
  try {
    const res = await fetch(RESEND_API, {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to, reply_to: REPLY_TO, subject, html: htmlBody }),
    });
    if (!res.ok) return { ok: false, error: `Resend ${res.status}: ${await res.text()}` };
    const data = await res.json().catch(() => ({}));
    return { ok: true, id: data?.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

// ---- handler ------------------------------------------------------------
Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });
  if (req.headers.get("x-brief-secret") !== TRIGGER_SECRET) return json(401, { error: "Unauthorized" });

  let body: { issue_number?: number; issue_id?: string; test_email?: string; dry_run?: boolean };
  try {
    body = await req.json();
  } catch {
    return json(400, { error: "Invalid JSON" });
  }

  // 1. Load the issue
  const filter = body.issue_id
    ? `id=eq.${body.issue_id}`
    : body.issue_number != null
    ? `issue_number=eq.${body.issue_number}`
    : null;
  if (!filter) return json(400, { error: "Provide issue_number or issue_id" });

  const issueRes = await sb(`faiir_brief_issues?${filter}&select=id,issue_number,subject_line,preheader,html,status&limit=1`);
  if (!issueRes.ok) return json(500, { error: `Load issue failed: ${await issueRes.text()}` });
  const issues = (await issueRes.json()) as Issue[];
  const issue = issues[0];
  if (!issue) return json(404, { error: "Issue not found" });

  // 2. TEST MODE — single copy, no logging, no status change
  if (body.test_email) {
    const previewUnsub = `${UNSUB_BASE}?token=preview`;
    const htmlBody = personalize(issue.html, issue.preheader, previewUnsub);
    const r = await resendSend(body.test_email, `[TEST] ${issue.subject_line}`, htmlBody);
    return json(r.ok ? 200 : 502, {
      mode: "test",
      issue_number: issue.issue_number,
      to: body.test_email,
      sent: r.ok,
      resend_id: r.id,
      error: r.error,
    });
  }

  // 3. Resolve the recipient list (opted-in members with an email)
  const memRes = await sb(
    `members?newsletter_opt_in=eq.true&email=not.is.null&select=id,email,full_name,unsubscribe_token`,
  );
  if (!memRes.ok) return json(500, { error: `Load members failed: ${await memRes.text()}` });
  const members = (await memRes.json()) as Member[];

  // Skip anyone already marked sent for this issue (idempotency)
  const priorRes = await sb(`faiir_brief_sends?issue_id=eq.${issue.id}&status=eq.sent&select=email`);
  const priorSent = new Set(
    priorRes.ok ? ((await priorRes.json()) as { email: string }[]).map((r) => r.email.toLowerCase()) : [],
  );
  const recipients = members.filter((m) => m.email && !priorSent.has(m.email.toLowerCase()));

  // 4. DRY RUN — show the blast list, send nothing
  if (body.dry_run) {
    return json(200, {
      mode: "dry_run",
      issue_number: issue.issue_number,
      subject_line: issue.subject_line,
      would_send: recipients.length,
      already_sent: priorSent.size,
      recipients: recipients.map((m) => ({ email: m.email, name: m.full_name })),
    });
  }

  // 5. LIVE SEND
  await sb(`faiir_brief_issues?id=eq.${issue.id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: "sending", updated_at: new Date().toISOString() }),
  });

  let sent = 0;
  let failed = 0;
  const details: Array<{ email: string; ok: boolean; error?: string }> = [];

  for (const m of recipients) {
    const unsubUrl = `${UNSUB_BASE}?token=${encodeURIComponent(m.unsubscribe_token)}`;
    const htmlBody = personalize(issue.html, issue.preheader, unsubUrl);
    const r = await resendSend(m.email, issue.subject_line, htmlBody);

    await sb(`faiir_brief_sends`, {
      method: "POST",
      headers: { Prefer: "resolution=merge-duplicates" },
      body: JSON.stringify({
        issue_id: issue.id,
        member_id: m.id,
        email: m.email,
        status: r.ok ? "sent" : "failed",
        resend_id: r.id ?? null,
        error: r.error ?? null,
        sent_at: r.ok ? new Date().toISOString() : null,
      }),
    });

    if (r.ok) sent++;
    else failed++;
    details.push({ email: m.email, ok: r.ok, error: r.error });
    if (SEND_DELAY_MS) await new Promise((res) => setTimeout(res, SEND_DELAY_MS));
  }

  const finalStatus = failed === 0 ? "sent" : sent === 0 ? "failed" : "sent";
  await sb(`faiir_brief_issues?id=eq.${issue.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: finalStatus,
      sent_at: new Date().toISOString(),
      recipient_count: sent,
      updated_at: new Date().toISOString(),
    }),
  });

  return json(200, { mode: "live", issue_number: issue.issue_number, sent, failed, skipped: priorSent.size, details });
});
