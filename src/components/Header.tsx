"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
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
    <header
      className={`sticky top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[rgba(250,248,245,0.85)] backdrop-blur-md border-b border-[#1F1810]/8"
          : "bg-[rgba(250,248,245,0.7)] backdrop-blur-sm"
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between gap-8">
        {/* Logo */}
        <Link href="/" className="flex items-center flex-shrink-0 font-heading text-lg font-semibold text-[#1F1810]">
          Av<span className="text-[#C17832]">{"{ai}"}</span>lable Law
        </Link>

        {/* Nav links — center (desktop) */}
        <nav className="hidden md:flex items-center gap-8">
          <a
            href="#solutions"
            onClick={(e) => handleAnchorClick(e, "#solutions")}
            className="text-[#6B5B4E] hover:text-[#1F1810] relative group transition-colors cursor-pointer text-sm"
          >
            Solutions
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C17832] group-hover:w-full transition-all duration-300" />
          </a>
          <a
            href="#how"
            onClick={(e) => handleAnchorClick(e, "#how")}
            className="text-[#6B5B4E] hover:text-[#1F1810] relative group transition-colors cursor-pointer text-sm"
          >
            How It Works
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C17832] group-hover:w-full transition-all duration-300" />
          </a>
          <a
            href="#pricing"
            onClick={(e) => handleAnchorClick(e, "#pricing")}
            className="text-[#6B5B4E] hover:text-[#1F1810] relative group transition-colors cursor-pointer text-sm"
          >
            Pricing
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C17832] group-hover:w-full transition-all duration-300" />
          </a>
          <Link
            href="/blog"
            className="text-[#6B5B4E] hover:text-[#1F1810] relative group transition-colors text-sm"
          >
            Blog
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C17832] group-hover:w-full transition-all duration-300" />
          </Link>
        </nav>

        {/* Right side: CTA button (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className="px-6 py-2 bg-[#1F1810] text-white rounded-full text-sm font-medium hover:bg-[#C17832] transition-colors"
          >
            Member Login
          </Link>
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden w-8 h-8 flex items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <svg
            className="w-5 h-5 text-[#1F1810]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#1F1810]/8 bg-[#FAF8F5]">
          <div className="max-w-[1280px] mx-auto px-6 py-4 flex flex-col gap-4">
            <a
              href="#solutions"
              onClick={(e) => handleAnchorClick(e, "#solutions")}
              className="text-[#6B5B4E] hover:text-[#1F1810] transition-colors block text-sm"
            >
              Solutions
            </a>
            <a
              href="#how"
              onClick={(e) => handleAnchorClick(e, "#how")}
              className="text-[#6B5B4E] hover:text-[#1F1810] transition-colors block text-sm"
            >
              How It Works
            </a>
            <a
              href="#pricing"
              onClick={(e) => handleAnchorClick(e, "#pricing")}
              className="text-[#6B5B4E] hover:text-[#1F1810] transition-colors block text-sm"
            >
              Pricing
            </a>
            <Link
              href="/blog"
              className="text-[#6B5B4E] hover:text-[#1F1810] transition-colors block text-sm"
            >
              Blog
            </Link>
            <hr className="border-[#1F1810]/8 my-2" />
            <Link
              href="/login"
              className="px-6 py-2 bg-[#1F1810] text-white rounded-full text-sm font-medium hover:bg-[#C17832] transition-colors block text-center"
            >
              Member Login
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
