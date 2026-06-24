"use client";

import DashboardShell from "@/components/DashboardShell";
import EngagementCertification from "@/components/EngagementCertification";

// FAIIR client portal — Certification. Shows the anticipation state until the
// attorney issues the cert, then the reveal: seal, printable certificate, and
// the share kit. useEngagementRef redirects non-clients to /dashboard.
export default function CertificationPage() {
  return (
    <DashboardShell title="Certification">
      <EngagementCertification />
    </DashboardShell>
  );
}
