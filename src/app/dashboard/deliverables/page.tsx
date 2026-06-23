"use client";

import DashboardShell from "@/components/DashboardShell";
import EngagementDeliverables from "@/components/EngagementDeliverables";

// FAIIR client portal — Deliverables library. useEngagementRef inside the
// component redirects anyone without an active engagement seat to /dashboard.
export default function DeliverablesPage() {
  return (
    <DashboardShell title="Deliverables">
      <EngagementDeliverables />
    </DashboardShell>
  );
}
