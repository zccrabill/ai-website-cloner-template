"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { XIcon, LinkedInIcon } from "./icons";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      {/* Announcement banner */}
      <div className="announcement-banner w-full text-center py-2 px-4">
        <p className="text-[13px] text-[#f59e0b] font-medium tracking-wide">
          🚀 Now offering AI Legal Risk Consulting for Colorado tech companies —{" "}
          <a href="#" className="underline underline-offset-2 hover:text-[#fbbf24] transition-colors">
            Book a free consult →
          </a>
        </p>
      </div>

      {/* Main nav */}
      <header
        className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-[#09090b]/90 backdrop-blur-md border-b border-white/[0.06]"
            : "bg-[#09090b]/70 backdrop-blur-sm border-b border-white/[0.04]"
        }`}
      >
        <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center flex-shrink-0">
            <Image
              src="/images/logo-arrow.png"
              alt="Av{ai}lable Law"
              width={44}
              height={44}
              className="object-contain"
              style={{ height: "44px", width: "auto" }}
            />
          </Link>

          {/* Nav links — center */}
          <nav className="hidden md:flex items-center gap-1">
            {[
              { label: "Home", href: "/", active: true },
              { label: "About", href: "/about" },
              { label: "Blog", href: "/blog" },
              { label: "Solutions", href: "/solutions" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`px-4 py-2 rounded-md text-[14px] transition-all ${
                  item.active
                    ? "bg-white/[0.07] text-white font-medium"
                    : "text-[#a1a1aa] hover:text-white hover:bg-white/[0.04]"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side: social + CTA */}
          <div className="flex items-center gap-3">
            <a
              href="https://x.com/availablelaw"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-md border border-white/10 flex items-center justify-center hover:border-white/20 hover:bg-white/[0.04] transition-all"
              aria-label="X / Twitter"
            >
              <XIcon className="w-3.5 h-3.5 text-[#a1a1aa]" />
            </a>
            <a
              href="https://www.linkedin.com/company/available-legal-solutions-llc/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-md border border-white/10 flex items-center justify-center hover:border-white/20 hover:bg-white/[0.04] transition-all"
              aria-label="LinkedIn"
            >
              <LinkedInIcon className="w-3.5 h-3.5 text-[#a1a1aa]" />
            </a>
            <Link
              href="/contact"
              className="btn-al btn-al-primary ml-1 text-[13px] px-4 py-2"
            >
              Free Consultation
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
