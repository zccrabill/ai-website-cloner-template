import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

// Custom 404. Next finds this file via convention (app/not-found.tsx).
// Tone matches the rest of the site: dry, helpful, slightly knowing.
export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-[70vh] bg-[#FAF8F5] flex items-center justify-center px-6 py-24">
        <div className="max-w-[640px] text-center">
          <p className="text-[#C17832] text-[12px] font-semibold tracking-widest uppercase mb-4">
            404 &middot; Not Found
          </p>
          <h1 className="font-heading text-4xl md:text-5xl text-[#1F1810] mb-6 leading-tight">
            This page is in legal review.
          </h1>
          <p className="text-[#6B5B4E] text-lg mb-10 leading-relaxed">
            The page you are looking for either moved, never existed, or got rewritten under a new heading. Here are some that definitely exist.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="btn-al btn-al-primary text-[13px] px-6 py-3"
            >
              Back to home
            </Link>
            <Link
              href="/faiir"
              className="btn-al btn-al-ghost text-[13px] px-6 py-3"
            >
              Learn about FAIIR
            </Link>
            <Link
              href="/blog"
              className="btn-al btn-al-ghost text-[13px] px-6 py-3"
            >
              Read the blog
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
