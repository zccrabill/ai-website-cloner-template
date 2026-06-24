import { supabase } from "@/lib/supabase";

// Robustly open a private engagement file via a short-lived signed URL.
// Two reliability traps this avoids:
//  1. Pop-up blockers: window.open() called AFTER an await is no longer treated
//     as a user gesture and gets blocked. So we open the tab synchronously
//     (before the await) and only set its location once the URL resolves.
//  2. Silent failure: createSignedUrl can fail (expired session, missing
//     object, network). We return { ok:false } so the caller can surface it,
//     instead of the button spinning to nothing.
// 300s expiry is comfortably long for a cold-starting tab on slow firm wifi
// while staying short-lived and RLS-gated at issuance.
export async function openEngagementFile(
  storagePath: string
): Promise<{ ok: boolean }> {
  const win = typeof window !== "undefined" ? window.open("", "_blank") : null;
  try {
    const { data, error } = await supabase.storage
      .from("engagement-docs")
      .createSignedUrl(storagePath, 300);
    if (error || !data?.signedUrl) {
      win?.close();
      return { ok: false };
    }
    if (win) win.location.href = data.signedUrl;
    else if (typeof window !== "undefined") window.location.href = data.signedUrl;
    return { ok: true };
  } catch {
    win?.close();
    return { ok: false };
  }
}
