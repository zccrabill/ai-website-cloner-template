import { supabase } from "@/lib/supabase";

// Shared check: does this user hold an active FAIIR engagement seat?
// Drives routing (workspace vs SMB dashboard), nav trimming, and the
// account page's engagement variant. Invites are claimed on login in
// /auth/callback (and defensively on dashboard load), so "active" is the
// only status that matters here.
export async function getActiveOrgSeat(userId: string): Promise<string | null> {
  const { data } = await supabase
    .from("org_members")
    .select("org_id")
    .eq("user_id", userId)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();
  return data?.org_id ?? null;
}
