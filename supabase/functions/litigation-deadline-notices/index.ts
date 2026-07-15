/**
 * litigation-deadline-notices Edge Function.
 *
 * Fired daily by pg_cron (see migration 20260714090000). Sends Zachariah ONE
 * digest email covering:
 *   - deadlines whose reminder lead time (reminder_lead_days) is reached today
 *     (or was missed on a day the cron didn't run — catch-up included)
 *   - anything overdue and still pending
 *   - computed deadlines still awaiting attorney confirmation
 *
 * Idempotent: each (deadline, lead_days) reminder is recorded in
 * litigation_deadline_notices with a unique constraint, so reruns never
 * double-send. No content → no email.
 *
 * Env: RESEND_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const RESEND_API = "https://api.resend.com/emails";
const FROM = "Available Law Litigation <noreply@availablelaw.com>";
const PORTAL_URL = "https://availablelaw.com/dashboard/litigation";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false, autoRefreshToken: false } }
);

/** Today as YYYY-MM-DD in the court's timezone. */
function todayDenver(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "America/Denver" });
}

function daysBetween(fromIso: string, toIso: string): number {
  const from = new Date(`${fromIso}T12:00:00Z`).getTime();
  const to = new Date(`${toIso}T12:00:00Z`).getTime();
  return Math.round((to - from) / 86_400_000);
}

interface DeadlineRow {
  id: string;
  title: string;
  rule_ref: string | null;
  due_date: string;
  attorney_confirmed: boolean;
  reminder_lead_days: number[];
  status: string;
  litigation_matters: { caption: string; case_number: string | null } | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok");

  try {
    const today = todayDenver();

    const { data: deadlines, error } = await supabase
      .from("litigation_deadlines")
      .select(
        "id, title, rule_ref, due_date, attorney_confirmed, reminder_lead_days, status, litigation_matters(caption, case_number)"
      )
      .eq("status", "pending")
      .order("due_date");
    if (error) throw error;

    const { data: sentRows } = await supabase
      .from("litigation_deadline_notices")
      .select("deadline_id, lead_days");
    const sent = new Set((sentRows ?? []).map((r) => `${r.deadline_id}:${r.lead_days}`));

    const reminders: { d: DeadlineRow; lead: number; daysLeft: number }[] = [];
    const overdue: DeadlineRow[] = [];

    for (const d of (deadlines ?? []) as unknown as DeadlineRow[]) {
      const daysLeft = daysBetween(today, d.due_date);
      if (daysLeft < 0) {
        overdue.push(d);
        continue;
      }
      // Largest lead time already reached and not yet sent → one reminder per
      // deadline per digest (catch-up collapses missed leads into one line).
      const due = d.reminder_lead_days
        .filter((lead) => daysLeft <= lead && !sent.has(`${d.id}:${lead}`))
        .sort((a, b) => b - a);
      if (due.length > 0) reminders.push({ d, lead: due[0], daysLeft });
    }

    const unconfirmed = ((deadlines ?? []) as unknown as DeadlineRow[]).filter(
      (d) => !d.attorney_confirmed && daysBetween(today, d.due_date) >= 0
    );

    if (reminders.length === 0 && overdue.length === 0) {
      return json({ ok: true, sent: 0, note: "nothing to notice today" });
    }

    const line = (d: DeadlineRow, extra: string) => {
      const matter = d.litigation_matters
        ? `${d.litigation_matters.caption}${d.litigation_matters.case_number ? ` (${d.litigation_matters.case_number})` : ""}`
        : "Unassigned matter";
      const conf = d.attorney_confirmed ? "" : " — ⚠️ UNCONFIRMED, verify & confirm";
      return `<li style="margin-bottom:8px;"><strong>${escapeHtml(d.title)}</strong>${
        d.rule_ref ? ` <span style="color:#A89279;">(${escapeHtml(d.rule_ref)})</span>` : ""
      }<br/>${escapeHtml(matter)} — due <strong>${d.due_date}</strong> ${extra}${conf}</li>`;
    };

    const sections: string[] = [];
    if (overdue.length > 0) {
      sections.push(
        `<h3 style="color:#B3261E;">Overdue (${overdue.length})</h3><ul>${overdue
          .map((d) => line(d, `(${-daysBetween(today, d.due_date)} days past)`))
          .join("")}</ul>`
      );
    }
    if (reminders.length > 0) {
      sections.push(
        `<h3 style="color:#1F1810;">Coming up (${reminders.length})</h3><ul>${reminders
          .map(({ d, daysLeft }) => line(d, `(${daysLeft} days out)`))
          .join("")}</ul>`
      );
    }
    if (unconfirmed.length > 0) {
      sections.push(
        `<p style="color:#6B5B4E;font-size:13px;">${unconfirmed.length} computed deadline(s) still await your confirmation in the portal.</p>`
      );
    }

    const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#1F1810;max-width:560px;">
      <h2 style="color:#C17832;">Litigation deadlines — ${today}</h2>
      ${sections.join("")}
      <p style="margin-top:24px;"><a href="${PORTAL_URL}" style="color:#C17832;">Open the litigation console →</a></p>
      <p style="color:#A89279;font-size:12px;margin-top:24px;">Automated notice from your Available Law litigation calendar. Computed dates are suggestions — verify against current rules and court orders before relying on them.</p>
    </div>`;

    const { data: settings } = await supabase
      .from("litigation_settings")
      .select("notice_email")
      .eq("id", true)
      .maybeSingle();
    const to = settings?.notice_email ?? "zachariah@availablelaw.com";

    const subjectBits = [
      overdue.length > 0 ? `${overdue.length} OVERDUE` : null,
      reminders.length > 0 ? `${reminders.length} upcoming` : null,
    ].filter(Boolean);

    const resendRes = await fetch(RESEND_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM,
        to: [to],
        subject: `⚖️ Litigation deadlines: ${subjectBits.join(", ")}`,
        html,
      }),
    });
    if (!resendRes.ok) throw new Error(`Resend ${resendRes.status}: ${await resendRes.text()}`);

    // Record every lead ≤ the one noticed, so catch-up lines don't re-fire
    // tomorrow at a smaller lead they logically already covered.
    const noticeRows = reminders.flatMap(({ d, daysLeft }) =>
      d.reminder_lead_days
        .filter((lead) => daysLeft <= lead)
        .map((lead) => ({ deadline_id: d.id, lead_days: lead }))
    );
    if (noticeRows.length > 0) {
      const { error: logError } = await supabase
        .from("litigation_deadline_notices")
        .upsert(noticeRows, { onConflict: "deadline_id,lead_days", ignoreDuplicates: true });
      if (logError) console.error("notice log error:", logError);
    }

    return json({ ok: true, reminders: reminders.length, overdue: overdue.length });
  } catch (err) {
    console.error("litigation-deadline-notices error:", err);
    // Fail-open like notify-event: cron shouldn't retry-storm.
    return json({ ok: false, error: String(err) });
  }
});

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
  });
}

function escapeHtml(s: string): string {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
