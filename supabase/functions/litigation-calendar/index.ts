/**
 * litigation-calendar Edge Function.
 *
 * Subscribable ICS feed of every pending litigation deadline. Subscribe once
 * (Outlook/Google/Apple: "add calendar from URL") and new/changed deadlines
 * flow onto the calendar automatically — weeks in advance, no manual entry.
 *
 * For each pending deadline the feed emits:
 *   - an all-day event on the due date (with a 9 AM day-before VALARM for
 *     clients that honor alarms on subscribed calendars)
 *   - companion "T-30 / T-14 / T-7" heads-up events before the due date, since
 *     Google/Outlook ignore VALARMs on subscriptions
 *
 * Auth: token-as-capability (same pattern as brief-unsubscribe) — the opaque
 * ics_token from litigation_settings must be supplied as ?token=. Deploy with
 * verify_jwt = false (calendar apps can't send Authorization headers).
 * The feed is read-only and contains matter captions + deadline titles only.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false, autoRefreshToken: false } }
);

const LEAD_EVENT_DAYS = [30, 14, 7];

function icsDate(isoDate: string): string {
  return isoDate.replaceAll("-", "");
}

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Escape per RFC 5545 §3.3.11 and fold long lines. */
function esc(s: string): string {
  return s
    .replaceAll("\\", "\\\\")
    .replaceAll(";", "\\;")
    .replaceAll(",", "\\,")
    .replaceAll("\n", "\\n");
}

function vevent(opts: {
  uid: string;
  date: string; // all-day, YYYY-MM-DD
  summary: string;
  description: string;
  alarm?: boolean;
}): string {
  const lines = [
    "BEGIN:VEVENT",
    `UID:${opts.uid}`,
    `DTSTAMP:${icsDate(opts.date)}T000000Z`,
    `DTSTART;VALUE=DATE:${icsDate(opts.date)}`,
    `DTEND;VALUE=DATE:${icsDate(addDays(opts.date, 1))}`,
    `SUMMARY:${esc(opts.summary)}`,
    `DESCRIPTION:${esc(opts.description)}`,
    "TRANSP:TRANSPARENT",
  ];
  if (opts.alarm) {
    lines.push(
      "BEGIN:VALARM",
      "ACTION:DISPLAY",
      `DESCRIPTION:${esc(opts.summary)}`,
      "TRIGGER:-PT15H", // 9 AM the day before an all-day event
      "END:VALARM"
    );
  }
  lines.push("END:VEVENT");
  return lines.join("\r\n");
}

Deno.serve(async (req) => {
  try {
    const token = new URL(req.url).searchParams.get("token") ?? "";
    const { data: settings } = await supabase
      .from("litigation_settings")
      .select("ics_token")
      .eq("id", true)
      .maybeSingle();

    if (!settings || !token || token !== settings.ics_token) {
      return new Response("Not found", { status: 404 });
    }

    const { data: deadlines, error } = await supabase
      .from("litigation_deadlines")
      .select(
        "id, title, rule_ref, basis, due_date, attorney_confirmed, status, litigation_matters(caption, case_number)"
      )
      .eq("status", "pending")
      .order("due_date");
    if (error) throw error;

    const today = new Date().toLocaleDateString("en-CA", { timeZone: "America/Denver" });
    const events: string[] = [];

    for (const d of deadlines ?? []) {
      const matter = d.litigation_matters as unknown as {
        caption: string;
        case_number: string | null;
      } | null;
      const caption = matter
        ? `${matter.caption}${matter.case_number ? ` (${matter.case_number})` : ""}`
        : "Unassigned matter";
      const flag = d.attorney_confirmed ? "" : " [UNCONFIRMED]";
      const description = [
        caption,
        d.rule_ref ? `Rule: ${d.rule_ref}` : null,
        d.basis ? `Basis: ${d.basis}` : null,
        d.attorney_confirmed
          ? null
          : "Computed date NOT yet attorney-confirmed — verify before relying on it.",
      ]
        .filter(Boolean)
        .join("\n");

      events.push(
        vevent({
          uid: `lit-deadline-${d.id}@availablelaw.com`,
          date: d.due_date,
          summary: `⚖️ DUE: ${d.title} — ${caption}${flag}`,
          description,
          alarm: true,
        })
      );

      for (const lead of LEAD_EVENT_DAYS) {
        const leadDate = addDays(d.due_date, -lead);
        if (leadDate <= today) continue; // don't backfill past heads-ups
        events.push(
          vevent({
            uid: `lit-deadline-${d.id}-t${lead}@availablelaw.com`,
            date: leadDate,
            summary: `⏳ T-${lead} days: ${d.title} — ${caption}${flag}`,
            description: `Due ${d.due_date}.\n${description}`,
          })
        );
      }
    }

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Available Law//Litigation Deadlines//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:Available Law — Litigation Deadlines",
      "X-WR-TIMEZONE:America/Denver",
      "REFRESH-INTERVAL;VALUE=DURATION:PT4H",
      ...events,
      "END:VCALENDAR",
    ].join("\r\n");

    return new Response(ics, {
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  } catch (err) {
    console.error("litigation-calendar error:", err);
    return new Response("Error", { status: 500 });
  }
});
