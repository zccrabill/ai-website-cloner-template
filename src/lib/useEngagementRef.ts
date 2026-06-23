"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getActiveOrgSeat } from "@/lib/engagement";

export interface EngagementRef {
  orgId: string;
  engagementId: string;
  orgName: string;
  title: string;
  status: string;
  holdsPhi: boolean;
}

// Shared resolver for the FAIIR client portal pages. Confirms there's a
// session, finds the caller's active org seat, and loads their latest
// engagement. Non-clients (no active seat) are bounced back to /dashboard;
// logged-out users to /login. Every engagement page (Documents, Deliverables,
// Your Engagement) builds on this so the seat → engagement lookup lives in one
// place.
export function useEngagementRef() {
  const router = useRouter();
  const [ref, setRef] = useState<EngagementRef | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const resolve = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.push("/login");
        return;
      }
      const orgId = await getActiveOrgSeat(session.user.id);
      if (cancelled) return;
      if (!orgId) {
        router.push("/dashboard");
        return;
      }
      const [orgRes, engRes] = await Promise.all([
        supabase.from("orgs").select("name, holds_phi").eq("id", orgId).maybeSingle(),
        supabase
          .from("engagements")
          .select("id, title, status")
          .eq("org_id", orgId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      if (cancelled) return;
      if (!engRes.data) {
        router.push("/dashboard");
        return;
      }
      setRef({
        orgId,
        engagementId: engRes.data.id,
        orgName: orgRes.data?.name ?? "",
        title: engRes.data.title,
        status: engRes.data.status,
        holdsPhi: orgRes.data?.holds_phi ?? false,
      });
      setLoading(false);
    };
    void resolve();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return { ref, loading };
}
