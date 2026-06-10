/**
 * brief-unsubscribe Edge Function.
 *
 * Public GET endpoint hit from the "Unsubscribe" link in every FAIIR Brief.
 * Looks up the member by their opaque unsubscribe_token (service role, bypasses
 * RLS) and flips newsletter_opt_in -> false. Returns a friendly branded page.
 *
 * CAN-SPAM: a working one-click unsubscribe with no login required. Idempotent —
 * clicking twice is fine. Unknown/missing token returns a graceful page, not an error.
 *
 * verify_jwt = false (recipients are not logged in). No secret needed: the token
 * itself is the capability, and it only ever unsubscribes its own owner.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const BRAND = {
  bg: "#FAF8F5",
  card: "#FFFFFF",
  text: "#1F1810",
  muted: "#6B5B4E",
  faint: "#A89279",
  accent: "#C17832",
  green: "#7A8B6F",
};

function page(opts: { heading: string; body: string; tone?: "ok" | "info" }): string {
  const bar = opts.tone === "info" ? BRAND.faint : BRAND.green;
  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<meta name="robots" content="noindex"/>
<title>The FAIIR Brief</title>
</head>
<body style="margin:0;background:${BRAND.bg};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:${BRAND.text};">
  <div style="max-width:520px;margin:0 auto;padding:64px 24px;">
    <div style="background:${BRAND.card};border:1px solid rgba(31,24,16,0.08);border-radius:16px;padding:40px;">
      <p style="color:${BRAND.accent};font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:600;margin:0 0 20px;">The FAIIR Brief</p>
      <div style="border-left:3px solid ${bar};padding-left:18px;">
        <h1 style="font-size:22px;line-height:1.3;margin:0 0 12px;">${opts.heading}</h1>
        <p style="font-size:15px;line-height:1.6;color:${BRAND.muted};margin:0;">${opts.body}</p>
      </div>
      <p style="margin:32px 0 0;font-size:13px;color:${BRAND.faint};">
        Available Law, LLC &middot; <a href="https://availablelaw.com" style="color:${BRAND.accent};text-decoration:none;">availablelaw.com</a>
      </p>
    </div>
  </div>
</body></html>`;
}

function html(status: number, content: string): Response {
  return new Response(content, {
    status,
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const token = url.searchParams.get("token")?.trim();

  if (!token) {
    return html(
      400,
      page({
        tone: "info",
        heading: "We couldn't read that link",
        body: "This unsubscribe link is missing its token. If you'd like to stop receiving The FAIIR Brief, just reply to any issue with \"unsubscribe\" and Zachariah will take care of it.",
      }),
    );
  }

  // Service-role PATCH by token. Returns the updated row(s) so we can greet by name.
  let updated: Array<{ email?: string; full_name?: string }> = [];
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/members?unsubscribe_token=eq.${encodeURIComponent(token)}`,
      {
        method: "PATCH",
        headers: {
          apikey: SERVICE_ROLE,
          Authorization: `Bearer ${SERVICE_ROLE}`,
          "Content-Type": "application/json",
          Prefer: "return=representation",
        },
        body: JSON.stringify({ newsletter_opt_in: false }),
      },
    );
    if (res.ok) updated = await res.json();
    else console.error("[brief-unsubscribe] patch failed:", res.status, await res.text());
  } catch (err) {
    console.error("[brief-unsubscribe] error:", err instanceof Error ? err.message : String(err));
  }

  if (updated.length === 0) {
    // Unknown token (or already removed). Don't leak whether it existed; confirm either way.
    return html(
      200,
      page({
        tone: "info",
        heading: "You're all set",
        body: "If this email was on the list, it has been removed from The FAIIR Brief. You won't receive any more issues. Changed your mind later? Reply to Zachariah anytime.",
      }),
    );
  }

  const name = updated[0]?.full_name?.split(" ")[0];
  return html(
    200,
    page({
      tone: "ok",
      heading: name ? `Done, ${name} — you're unsubscribed` : "Done — you're unsubscribed",
      body: "You won't receive any more issues of The FAIIR Brief. No hard feelings. If you ever want back in, just reply to Zachariah and he'll re-add you.",
    }),
  );
});
