"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { XIcon, LinkedInIcon } from "./icons";

interface HeaderProps {
  onFaiirOpen?: () => void;
}

export default function Header({ onFaiirOpen }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Handle smooth scroll for anchor links
  const handleAnchorClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
        setMobileMenuOpen(false);
      }
    }
  };

  return (
    <>
      {/* Announcement banner */}
      <div className="announcement-banner w-full text-center py-2 px-4">
        <p className="text-[13px] text-[#f59e0b] font-medium tracking-wide">
          Now offering AI Legal Risk Consulting for Colorado Businesses —{" "}
          <button
            onClick={onFaiirOpen}
            className="underline underline-offset-2 hover:text-[#fbbf24] transition-colors cursor-pointer"
          >
            Learn more about FAIIR →
          </button>
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

          {/* Nav links — center (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            <a
              href="#hero"
              onClick={(e) => handleAnchorClick(e, "#hero")}
              className="px-4 py-2 rounded-md text-[14px] text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
            >
              Home
            </a>
            <a
              href="#about"
              onClick={(e) => handleAnchorClick(e, "#about")}
              className="px-4 py-2 rounded-md text-[14px] text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
            >
              About
            </a>
            <a
              href="#solutions"
              onClick={(e) => handleAnchorClick(e, "#solutions")}
              className="px-4 py-2 rounded-md text-[14px] text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer"
            >
              Solutions
            </a>
            <Link
              href="/blog"
              className="px-4 py-2 rounded-md text-[14px] text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] transition-all"
            >
              Blog
            </Link>
          </nav>

          {/* Right side: social + CTA buttons (desktop) */}
          <div className="hidden md:flex items-center gap-3">
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
              href="/login"
              className="btn-al btn-al-outline ml-4 text-[13px] px-4 py-2"
            >
              Member Login
            </Link>
            <a
              href="#pricing"
              onClick={(e) => handleAnchorClick(e, "#pricing")}
              className="btn-al btn-al-primary text-[13px] px-4 py-2 cursor-pointer"
            >
              Get Started
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden w-8 h-8 rounded-md border border-white/10 flex items-center justify-center hover:border-white/20 hover:bg-white/[0.04] transition-all"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-4 h-4 text-[#a1a1aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.04] bg-[#09090b]/95 backdrop-blur-md">
            <div className="max-w-[1280px] mx-auto px-6 py-4 flex flex-col gap-2">
              <a
                href="#hero"
                onClick={(e) => handleAnchorClick(e, "#hero")}
                className="px-4 py-2 rounded-md text-[14px] text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer block"
              >
                Home
              </a>
              <a
                href="#about"
                onClick={(e) => handleAnchorClick(e, "#about")}
                className="px-4 py-2 rounded-md text-[14px] text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer block"
              >
                About
              </a>
              <a
                href="#solutions"
                onClick={(e) => handleAnchorClick(e, "#solutions")}
                className="px-4 py-2 rounded-md text-[14px] text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer block"
              >
                Solutions
              </a>
              <Link
                href="/blog"
                className="px-4 py-2 rounded-md text-[14px] text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] transition-all block"
              >
                Blog
              </Link>
              <hr className="border-white/[0.06] my-2" />
              <Link
                href="/login"
                className="px-4 py-2 rounded-md text-[14px] text-[#a1a1aa] hover:text-white hover:bg-white/[0.04] transition-all block"
              >
                Member Login
              </Link>
              <a
                href="#pricing"
                onClick={(e) => handleAnchorClick(e, "#pricing")}
                className="btn-al btn-al-primary text-[13px] px-4 py-2 cursor-pointer block text-center"
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
