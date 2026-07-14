"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { hasPendingAgreement } from "@/lib/engagementAgreement";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          router.push("/login?error=auth_failed");
          return;
        }

        const routeUser = async (userId: string) => {
          // Claim any pending FAIIR workspace invite for this email. Idempotent,
          // and matched server-side against the *authenticated* email — a
          // forwarded magic link cannot claim someone else's seat.
          await supabase.rpc("claim_org_memberships");

          // FAIIR engagement clients skip the SMB onboarding wizard entirely:
          // their engagement letter is signed offline (countersigned PDF), and
          // the wizard's built-in agreement is the subscription contract — the
          // wrong document for an engagement client to ever see.
          const { data: seat } = await supabase
            .from("org_members")
            .select("org_id")
            .eq("user_id", userId)
            .eq("status", "active")
            .limit(1)
            .maybeSingle();

          if (seat) {
            // First stop for an engagement client who hasn't signed yet is the
            // in-portal agreement — set a password, agree, and they're in.
            const { data: eng } = await supabase
              .from("engagements")
              .select("id, engagement_letter_signed_at")
              .eq("org_id", seat.org_id)
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle();
            if (eng && (await hasPendingAgreement(eng.id, eng.engagement_letter_signed_at ?? null))) {
              router.push("/dashboard/agreement");
              return;
            }
            router.push("/dashboard");
            return;
          }

          // Check if user has completed onboarding
          // maybeSingle (not single): a brand-new user has no members row yet,
          // and single() treats "0 rows" as an error (PGRST116 + a 406) on the
          // happy-path first sign-in. maybeSingle returns null cleanly so we
          // route them to /onboarding without spurious console noise.
          const { data: profile } = await supabase
            .from("members")
            .select("onboarding_complete")
            .eq("user_id", userId)
            .maybeSingle();

          if (profile?.onboarding_complete) {
            router.push("/dashboard");
          } else {
            router.push("/onboarding");
          }
        };

        if (session) {
          await routeUser(session.user.id);
        } else {
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
              if (event === "SIGNED_IN" && session) {
                subscription.unsubscribe();
                await routeUser(session.user.id);
              }
            }
          );

          setTimeout(() => {
            subscription.unsubscribe();
            router.push("/login?error=timeout");
          }, 5000);
        }
      } catch (err) {
        console.error("Auth callback exception:", err);
        // If members table doesn't exist yet, just go to onboarding
        router.push("/onboarding");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="h-screen bg-[#FAF8F5] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#C17832]/20 border-t-[#C17832] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#6B5B4E]">Signing you in...</p>
      </div>
    </div>
  );
}
