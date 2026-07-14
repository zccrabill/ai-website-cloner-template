"use client";

import EngagementAgreementGate from "@/components/EngagementAgreementGate";

// Focused, full-screen engagement-agreement signing gate. Not wrapped in
// DashboardShell — a client signs before entering the workspace chrome. Unsigned
// engagement clients are routed here from /auth/callback, /dashboard, and any
// engagement page (via useEngagementRef).
export default function EngagementAgreementPage() {
  return <EngagementAgreementGate />;
}
