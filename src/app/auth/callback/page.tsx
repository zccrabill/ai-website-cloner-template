"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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
          // Check if user has completed onboarding
          const { data: profile } = await supabase
            .from("members")
            .select("onboarding_complete")
            .eq("user_id", userId)
            .single();

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
