"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase automatically picks up the token from the URL hash
        // and establishes the session when we call getSession
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          router.push("/login?error=auth_failed");
          return;
        }

        if (session) {
          router.push("/dashboard");
        } else {
          // No session yet — listen for auth state change
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (event, session) => {
              if (event === "SIGNED_IN" && session) {
                subscription.unsubscribe();
                router.push("/dashboard");
              }
            }
          );

          // Timeout fallback — if no session after 5s, redirect to login
          setTimeout(() => {
            subscription.unsubscribe();
            router.push("/login?error=timeout");
          }, 5000);
        }
      } catch (err) {
        console.error("Auth callback exception:", err);
        router.push("/login?error=exception");
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="h-screen bg-[#0f0f14] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-[#f59e0b]/20 border-t-[#f59e0b] rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[#a1a1aa]">Signing you in...</p>
      </div>
    </div>
  );
}
