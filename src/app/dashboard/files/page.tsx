"use client";

import DashboardShell from "@/components/DashboardShell";
import EngagementDocuments from "@/components/EngagementDocuments";

// FAIIR client portal — Documents destination. The /dashboard/documents route
// is the SMB member vault; engagement clients get their own document room here
// at /dashboard/files. useEngagementRef inside the component redirects anyone
// without an active engagement seat back to /dashboard.
export default function FilesPage() {
  return (
    <DashboardShell title="Documents">
      <EngagementDocuments />
    </DashboardShell>
  );
}
