// admin-auth-link — RETIRED 2026-06-16.
//
// This was a temporary, secret-guarded white-glove generator that minted magic
// links out-of-band (used to get Pete in while we were still on magic-link
// auth). The portal now uses email + password, so this capability is no longer
// needed — and an endpoint that can forge login links for any account is not
// something to leave running.
//
// This stub returns 410 Gone so the endpoint can no longer mint anything.
// Remove the function entirely with `supabase functions delete admin-auth-link`
// whenever convenient.

Deno.serve(() =>
  new Response(
    "Gone: admin-auth-link has been retired (portal uses email + password auth).",
    { status: 410, headers: { "Content-Type": "text/plain" } },
  )
);
