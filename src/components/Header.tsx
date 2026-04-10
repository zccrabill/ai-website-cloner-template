"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

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
      <div className="max-w-[1280px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
        {/* Logo + FAIIR Seal */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Link href="/" className="flex items-center font-heading text-lg font-semibold text-[#1F1810]">
            Av<span className="text-[#C17832]">{"{"}</span>ai<span className="text-[#C17832]">{"}"}</span>lable Law
          </Link>
          <a
            href={pathname === "/" ? "#faiir" : "/#faiir"}
            onClick={(e) => handleAnchorClick(e, "#faiir")}
            className="group relative flex items-center justify-center"
            aria-label="FAIIR Certified — learn more"
            title="FAIIR Certified — Click to learn more"
          >
            <Image
              src="/images/faiir-logo.png"
              alt="FAIIR Certified"
              width={36}
              height={36}
              className="object-contain transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3"
            />
            <span className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-[#1F1810] text-white text-[10px] font-medium rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              FAIIR Certified
            </span>
          </a>
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
