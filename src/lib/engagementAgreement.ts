import { supabase } from "@/lib/supabase";

// The in-portal engagement agreement a client signs by click-to-agree. Mirrors
// public.engagement_agreements; body_md is rendered verbatim and its stored
// SHA-256 anchors the signature record written by accept_engagement_agreement().
export interface EngagementAgreement {
  id: string;
  engagement_id: string;
  version: number;
  title: string;
  effective_date: string | null;
  signatory_name: string | null;
  signatory_title: string | null;
  fee_text: string | null;
  body_md: string;
}

// The published agreement for an engagement, only when it still needs signing.
// Returns null if the engagement letter is already signed or nothing is
// published — the two cases where no signing gate should appear.
export async function fetchPendingAgreement(
  engagementId: string
): Promise<EngagementAgreement | null> {
  const { data: eng } = await supabase
    .from("engagements")
    .select("engagement_letter_signed_at")
    .eq("id", engagementId)
    .maybeSingle();
  if (eng?.engagement_letter_signed_at) return null;

  const { data } = await supabase
    .from("engagement_agreements")
    .select(
      "id, engagement_id, version, title, effective_date, signatory_name, signatory_title, fee_text, body_md"
    )
    .eq("engagement_id", engagementId)
    .eq("published", true)
    .maybeSingle();
  return (data as EngagementAgreement) ?? null;
}

// Lightweight gate check used by routing: does this engagement have an unsigned
// published agreement the client must accept before entering the workspace?
export async function hasPendingAgreement(
  engagementId: string,
  signedAt: string | null
): Promise<boolean> {
  if (signedAt) return false;
  const { data } = await supabase
    .from("engagement_agreements")
    .select("id")
    .eq("engagement_id", engagementId)
    .eq("published", true)
    .maybeSingle();
  return Boolean(data);
}
