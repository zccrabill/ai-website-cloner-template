/**
 * notify-assessment-completed Edge Function.
 *
 * Called by AssessmentRunner after a user submits the soft-gate email step.
 * Sends two transactional emails via Resend:
 *   1. To the lead:    branded results recap with reply CTA
 *   2. To Zachariah:   full lead intel + suggested follow-up angle
 *
 * Fail-open: errors are logged but the function still returns 200 so the
 * UI doesn't error on the user. Real failures show in Supabase function logs.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface AreaScore {
  id: string;
  score: number;
  max: number;
  tier: "green" | "amber" | "red";
}

interface Payload {
  assessment_id: string;
  assessment_name: string;
  email: string;
  wants_tips?: boolean;
  overall_score: number;
  overall_max: number;
  overall_tier: "green" | "amber" | "red";
  area_scores: AreaScore[];
  referer?: string | null;
  user_agent?: string | null;
}

const RESEND_API = "https://api.resend.com/emails";
const NOTIFY_TO = "zachariah@availablelaw.com";
const FROM_USER_RESULTS = "Zachariah Crabill <zachariah@availablelaw.com>";
const FROM_NOTIFICATION = "Available Law <noreply@availablelaw.com>";

function tierLabel(t: "green" | "amber" | "red") {
  if (t === "green") return "Strong (green)";
  if (t === "amber") return "Mixed (amber)";
  return "Needs work (red)";
}

function tierColor(t: "green" | "amber" | "red") {
  if (t === "green") return "#7A8B6F";
  if (t === "amber") return "#C17832";
  return "#A33B2A";
}

function notificationEmailHtml(p: Payload): string {
  const weakAreas = [...p.area_scores]
    .sort((a, b) => a.score / a.max - b.score / b.max)
    .slice(0, 3);
  const weakAreasHtml = weakAreas
    .map(
      (a) =>
        `<li><strong>${a.id}</strong> &mdash; ${a.score}/${a.max} (${tierLabel(a.tier)})</li>`
    )
    .join("");

  return `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#1F1810;max-width:640px;margin:0 auto;padding:24px;">
    <h2 style="font-size:20px;margin-bottom:8px;">New ${p.assessment_name} lead</h2>
    <p style="color:#6B5B4E;font-size:14px;margin-bottom:24px;">A new lead just completed the assessment. Reply to this email to reach them directly.</p>
    <div style="background:#FAF8F5;border:1px solid rgba(31,24,16,0.08);border-radius:12px;padding:20px;margin-bottom:16px;">
      <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#A89279;margin:0 0 12px;">Lead</h3>
      <p style="margin:4px 0;"><strong>Email:</strong> <a href="mailto:${p.email}" style="color:#C17832;">${p.email}</a></p>
      <p style="margin:4px 0;"><strong>Wants tips:</strong> ${p.wants_tips ? "Yes" : "No"}</p>
      <p style="margin:4px 0;"><strong>Source:</strong> ${p.assessment_id}</p>
    </div>
    <div style="background:#FAF8F5;border:1px solid rgba(31,24,16,0.08);border-radius:12px;padding:20px;margin-bottom:16px;">
      <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#A89279;margin:0 0 12px;">Result</h3>
      <p style="margin:4px 0;"><strong>Overall score:</strong> ${p.overall_score} / ${p.overall_max}</p>
      <p style="margin:4px 0;"><strong>Risk tier:</strong> <span style="color:${tierColor(p.overall_tier)};">${tierLabel(p.overall_tier)}</span></p>
    </div>
    <div style="background:#FAF8F5;border:1px solid rgba(31,24,16,0.08);border-radius:12px;padding:20px;">
      <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#A89279;margin:0 0 12px;">Weakest areas</h3>
      <ul style="padding-left:20px;margin:0;">${weakAreasHtml}</ul>
    </div>
    <p style="color:#A89279;font-size:11px;margin-top:24px;">Sent automatically from the Available Law assessment runner. Reply-to is set to the lead.</p>
  </body></html>`;
}

function userResultsEmailHtml(p: Payload): string {
  const weakAreas = [...p.area_scores]
    .sort((a, b) => a.score / a.max - b.score / b.max)
    .slice(0, 3);
  const weakAreasHtml = weakAreas
    .map((a) => `<li><strong>${a.id}</strong> &mdash; scored ${a.score}/${a.max}</li>`)
    .join("");

  return `<!DOCTYPE html><html><body style="font-family:-apple-system,BlinkMacSystemFont,sans-serif;color:#1F1810;max-width:580px;margin:0 auto;padding:24px;background:#FAF8F5;">
    <div style="background:white;border:1px solid rgba(31,24,16,0.08);border-radius:16px;padding:32px;">
      <p style="color:#C17832;font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:600;margin:0 0 8px;">Your results</p>
      <h2 style="font-size:24px;margin:0 0 16px;">${p.assessment_name}</h2>
      <p style="font-size:16px;line-height:1.6;margin-bottom:24px;">Thanks for taking the checkup. Here is your snapshot.</p>
      <div style="border-left:3px solid ${tierColor(p.overall_tier)};padding-left:16px;margin-bottom:24px;">
        <p style="margin:0 0 4px;color:#6B5B4E;font-size:13px;">Overall risk profile</p>
        <p style="margin:0;font-size:22px;font-weight:600;color:${tierColor(p.overall_tier)};">${tierLabel(p.overall_tier)}</p>
        <p style="margin:4px 0 0;color:#6B5B4E;font-size:14px;">${p.overall_score} / ${p.overall_max}</p>
      </div>
      <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#A89279;margin:24px 0 12px;">Where you scored lowest</h3>
      <ul style="padding-left:20px;line-height:1.7;">${weakAreasHtml}</ul>
      <h3 style="font-size:12px;text-transform:uppercase;letter-spacing:1px;color:#A89279;margin:24px 0 12px;">What I would suggest</h3>
      <p style="line-height:1.7;">If you would like to talk through your specific situation, hit reply to this email. There is no obligation and no calendar to book &mdash; just a real conversation about whether your business is set up the way it should be.</p>
      <p style="margin-top:32px;">&mdash; Zachariah Crabill</p>
      <p style="margin:0;color:#A89279;font-size:13px;">Founder &amp; Attorney, Available Law<br/>availablelaw.com</p>
    </div>
    <p style="color:#A89279;font-size:11px;line-height:1.6;padding:16px;max-width:580px;margin:0 auto;">This checkup is educational, not legal advice. Contacting Available Law does not create an attorney-client relationship.</p>
  </body></html>`;
}

async function sendEmail(opts: {
  to: string;
  from: string;
  subject: string;
  html: string;
  reply_to?: string;
}): Promise<{ ok: boolean; error?: string }> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) return { ok: false, error: "RESEND_API_KEY not set" };
  const body: Record<string, unknown> = {
    from: opts.from,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  };
  if (opts.reply_to) body.reply_to = opts.reply_to;
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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: corsHeaders });
  }

  let payload: Payload;
  try {
    payload = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!payload.email || !payload.assessment_id || !payload.assessment_name) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const [notifyRes, userRes] = await Promise.all([
    sendEmail({
      from: FROM_NOTIFICATION,
      to: NOTIFY_TO,
      reply_to: payload.email,
      subject: `New ${payload.assessment_name} lead - ${payload.email}`,
      html: notificationEmailHtml(payload),
    }),
    payload.wants_tips !== false
      ? sendEmail({
          from: FROM_USER_RESULTS,
          to: payload.email,
          subject: `Your ${payload.assessment_name} results`,
          html: userResultsEmailHtml(payload),
        })
      : Promise.resolve({ ok: true }),
  ]);

  if (!notifyRes.ok) console.error("[notify] notify email failed:", notifyRes.error);
  if (!userRes.ok) console.error("[notify] user email failed:", userRes.error);

  return new Response(
    JSON.stringify({ ok: true, notify_sent: notifyRes.ok, user_sent: userRes.ok }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
