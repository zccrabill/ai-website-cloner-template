"use client";

import DashboardShell from "@/components/DashboardShell";
import EngagementJourney from "@/components/EngagementJourney";

// FAIIR client portal — Your Engagement (the phase journey). useEngagementRef
// inside the component redirects anyone without an active engagement seat to
// /dashboard.
export default function JourneyPage() {
  return (
    <DashboardShell title="Your Engagement">
      <EngagementJourney />
    </DashboardShell>
  );
}
