import Link from "next/link";
import Image from "next/image";
import { APP_STORE_URL } from "@/components/Footer";

export default function CTASection() {
  return (
    <section className="relative w-full bg-[#FAF8F5] py-[120px] px-8 overflow-hidden">
      {/* Subtle radial gradient orb */}
      <div
        className="absolute inset-0 flex items-center justify-center opacity-[0.06]"
        style={{
          background:
            "radial-gradient(circle, #C17832 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[700px] text-center">
        {/* Label */}
        <p className="text-sm font-medium tracking-wide text-[#C17832] mb-4">
          Get Started
        </p>

        {/* Title */}
        <h2 className="font-heading text-4xl md:text-5xl text-[#1F1810] mb-6">
          Ready to make legal work{" "}
          <span className="italic text-[#C17832]">for</span> your business?
        </h2>

        {/* Subtitle */}
        <p className="text-[#6B5B4E] text-base md:text-lg mb-10 leading-relaxed">
          Join for free. No credit card. No commitment. Just smarter legal support from day one.
        </p>

        {/* CTA Button + App Store badge — two ways in, same firm. */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
          <Link
            href="/login"
            className="inline-block px-8 py-4 bg-[#1F1810] text-white font-medium rounded-full transition-all duration-300 hover:bg-[#C17832] focus:outline-none focus:ring-2 focus:ring-[#C17832] focus:ring-offset-2 focus:ring-offset-[#FAF8F5]"
          >
            Get Started Free →
          </Link>
          <a
            href={APP_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="transition-opacity hover:opacity-80"
            aria-label="Download the Available Law app on the App Store"
          >
            <Image
              src="/images/app-store-badge.svg"
              alt="Download on the App Store"
              width={135}
              height={45}
            />
          </a>
        </div>
        <p className="text-xs text-[#A89279] mt-5">
          Or take us with you — Ava and your matters live in the Available Law
          app.
        </p>
      </div>
    </section>
  );
}
