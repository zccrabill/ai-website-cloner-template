import type { Metadata } from "next";

// The review link is shared directly with clients after a matter wraps —
// it's not a destination page, so keep it out of search results.
export const metadata: Metadata = {
  title: "Share your experience — Available Law",
  description:
    "Tell us how your experience with Available Law went. Takes about a minute.",
  robots: { index: false, follow: false },
};

export default function ReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
