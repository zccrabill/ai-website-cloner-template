"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, FlaskConical, HeartHandshake, LayoutTemplate } from "lucide-react";
import AnnouncementBanner from "@/components/AnnouncementBanner";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Smooth scroll on home page; navigate to /#anchor from other pages
  const handleAnchorClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    anchor: string
  ) => {
    setMobileMenuOpen(false);
    if (pathname === "/") {
      e.preventDefault();
      const target = document.querySelector(anchor);
      if (target) target.scrollIntoView({ behavior: "smooth" });
    } else {
      e.preventDefault();
      router.push(`/${anchor}`);
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
      <AnnouncementBanner />
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo */}
        <div className="flex items-center flex-shrink-0">
          <Link href="/" className="flex items-center font-heading text-lg font-semibold text-[#1F1810]">
            Av<span className="text-[#C17832]">{"{"}</span>ai<span className="text-[#C17832]">{"}"}</span>lable Law
          </Link>
        </div>

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
          <a
          href="#testimonials"
            onClick={(e) => handleAnchorClick(e, "#testimonials")}
            className="text-[#6B5B4E] hover:text-[#1F1810] relative group transition-colors cursor-pointer text-sm"
          >
            Reviews
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C17832] group-hover:w-full transition-all duration-300" />
          </a>
          <Link
            href="/blog"
            className="text-[#6B5B4E] hover:text-[#1F1810] relative group transition-colors text-sm"
          >
            Blog
            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#C17832] group-hover:w-full transition-all duration-300" />
          </Link>
          {/* YLab — represented by its lab flask (à la Google Labs). Icon-only
              to keep it distinct from the text nav; tooltip names it. */}
          <Link
            href="/ylab"
            aria-label="YLab — teen entrepreneur lab"
            title="YLab"
            className="group relative flex items-center justify-center text-[#C17832] hover:text-[#A9652A] transition-colors"
          >
            <FlaskConical
              className="w-[1.15rem] h-[1.15rem] transition-transform duration-200 group-hover:scale-110 group-hover:-rotate-6"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#1F1810] text-white text-[10px] font-medium rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              YLab
            </span>
          </Link>
          {/* Sidebar — the attorney community. Icon-only like YLab; the
              heart-handshake reads "connection + care" and avoids being
              mistaken for the Ava chat bubble. Tooltip names it. */}
          <Link
            href="/sidebar"
            aria-label="Sidebar — a community for attorneys"
            title="Sidebar"
            className="group relative flex items-center justify-center text-[#C17832] hover:text-[#A9652A] transition-colors"
          >
            <HeartHandshake
              className="w-[1.15rem] h-[1.15rem] transition-transform duration-200 group-hover:scale-110 group-hover:rotate-6"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#1F1810] text-white text-[10px] font-medium rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Sidebar
            </span>
          </Link>
          {/* Sitecraft — website design & build. Icon-only like YLab/Sidebar;
              the layout-template glyph reads "web page." Tooltip names it. */}
          <Link
            href="/sitecraft"
            aria-label="Sitecraft — website design & build"
            title="Sitecraft"
            className="group relative flex items-center justify-center text-[#C17832] hover:text-[#A9652A] transition-colors"
          >
            <LayoutTemplate
              className="w-[1.15rem] h-[1.15rem] transition-transform duration-200 group-hover:scale-110"
              strokeWidth={1.75}
              aria-hidden="true"
            />
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#1F1810] text-white text-[10px] font-medium rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              Sitecraft
            </span>
          </Link>
        </nav>

        {/* Right side: CTA buttons (desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/faiir"
            className="flex items-center gap-1.5 px-5 py-2 bg-[#C17832] text-white rounded-full text-sm font-medium hover:bg-[#A9652A] transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
            FAIIR
          </Link>
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
            <Link
              href="/ylab"
              className="flex items-center gap-2 text-[#6B5B4E] hover:text-[#1F1810] transition-colors text-sm"
            >
              <FlaskConical
                className="w-4 h-4 text-[#C17832]"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              YLab
            </Link>
            <Link
              href="/sidebar"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-[#6B5B4E] hover:text-[#1F1810] transition-colors text-sm"
            >
              <HeartHandshake
                className="w-4 h-4 text-[#C17832]"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              Sidebar
            </Link>
            <Link
              href="/sitecraft"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 text-[#6B5B4E] hover:text-[#1F1810] transition-colors text-sm"
            >
              <LayoutTemplate
                className="w-4 h-4 text-[#C17832]"
                strokeWidth={1.75}
                aria-hidden="true"
              />
              Sitecraft — Websites
            </Link>
            <hr className="border-[#1F1810]/8 my-2" />
            <Link
              href="/faiir"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-1.5 px-6 py-2 bg-[#C17832] text-white rounded-full text-sm font-medium hover:bg-[#A9652A] transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              FAIIR Certification
            </Link>
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
