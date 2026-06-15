/**
 * admin-auth-link — generate a working magic-link for a member out-of-band.
 *
 * Why this exists: some corporate mail gateways (e.g. netitco.com) silently
 * quarantine Supabase auth "click to sign in" emails before they reach the
 * user's inbox. This endpoint mints a real magic link with the service-role
 * key so the firm can deliver it through another channel (text, a personal
 * email, etc.) and get the client into the portal immediately.
 *
 * SECURITY — read before touching:
 *   - This can create a login link for ANY email, so it is an auth-sensitive
 *     surface. It is guarded by a shared secret (ADMIN_LINK_SECRET) sent in the
 *     POST body; without a matching secret it returns 401.
 *   - Deployed with `--no-verify-jwt` (so it can be called server-to-server),
 *     which is exactly why the secret guard is mandatory.
 *   - Keep ADMIN_LINK_SECRET private. Rotate it (or redeploy this function as a
 *     403 stub) when you're done with white-glove onboarding.
 *
 * Request:  POST { "secret": "<ADMIN_LINK_SECRET>", "email": "...",
 *                  "redirectTo"?: "https://availablelaw.com/auth/callback" }
 * Response: { "action_link": "...", "email_otp": "123456" }
 *
 * Deploy:   supabase functions deploy admin-auth-link --no-verify-jwt
 * Secret:   supabase secrets set ADMIN_LINK_SECRET=<random>
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.0";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const ADMIN_LINK_SECRET = Deno.env.get("ADMIN_LINK_SECRET") ?? "";

// Constant-time string compare so the secret can't be brute-forced by timing.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  if (!ADMIN_LINK_SECRET) {
    return new Response("ADMIN_LINK_SECRET not configured", { status: 500 });
  }

  let body: { email?: string; secret?: string; redirectTo?: string };
  try {
    body = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (!body.secret || !timingSafeEqual(body.secret, ADMIN_LINK_SECRET)) {
    return new Response("Unauthorized", { status: 401 });
  }
  if (!body.email) {
    return new Response("email required", { status: 400 });
  }

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data, error } = await admin.auth.admin.generateLink({
    type: "magiclink",
    email: body.email,
    options: {
      redirectTo: body.redirectTo ?? "https://availablelaw.com/auth/callback",
    },
  });

  if (error) {
    console.error("[admin-auth-link] generateLink failed:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({
      action_link: data.properties?.action_link ?? null,
      email_otp: data.properties?.email_otp ?? null,
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
});
