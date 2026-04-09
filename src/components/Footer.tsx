"use client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { XIcon, LinkedInIcon } from "./icons";

const ThemeToggle = dynamic(
  () => import("./ThemeProvider").then((mod) => ({ default: mod.ThemeToggle })),
  { ssr: false }
);

export default function Footer() {
  return (
    <footer className="w-full bg-[#0f0f14] dark:bg-[#0f0f14] light:bg-white border-t border-white/[0.06] dark:border-white/[0.06] light:border-gray-200">
      {/* Main footer body */}
      <div className="max-w-[1200px] mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* Brand */}
        <div>
          <p
            className="font-heading mb-3"
            style={{ fontSize: "22px", color: "#f0f0f5", fontWeight: 400 }}
          >
            Av<span style={{ color: "#f59e0b" }}>{"{"}</span>ai<span style={{ color: "#f59e0b" }}>{"}"}</span>lable Law
          </p>
          <p className="text-[14px] text-[#71717a] light:text-gray-600 leading-relaxed mb-5 max-w-[240px]">
            AI-powered legal solutions for Colorado businesses. Practical advice
            from an attorney who builds with AI.
          </p>
          <div className="flex items-center gap-2">
            <a
              href="https://x.com/availablelaw"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-md border border-white/10 light:border-gray-300 flex items-center justify-center hover:border-white/20 light:hover:border-gray-400 transition-all"
            >
              <XIcon className="w-3.5 h-3.5 text-[#71717a] light:text-gray-600" />
            </a>
            <a
              href="https://www.linkedin.com/company/available-legal-solutions-llc/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-md border border-white/10 light:border-gray-300 flex items-center justify-center hover:border-white/20 light:hover:border-gray-400 transition-all"
            >
              <LinkedInIcon className="w-3.5 h-3.5 text-[#71717a] light:text-gray-600" />
            </a>
          </div>
        </div>

        {/* Navigation */}
        <div>
          <p className="text-[12px] font-semibold text-[#52525b] light:text-gray-500 tracking-widest uppercase mb-4">
            Navigation
          </p>
          <ul className="flex flex-col gap-3">
            {[
              { label: "Home", href: "/#hero" },
              { label: "About", href: "/#about" },
              { label: "Solutions", href: "/#solutions" },
              { label: "Blog", href: "/blog" },
              { label: "Member Login", href: "/login" },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-[14px] text-[#71717a] light:text-gray-600 hover:text-[#fafafa] light:hover:text-gray-900 transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services */}
        <div>
          <p className="text-[12px] font-semibold text-[#52525b] light:text-gray-500 tracking-widest uppercase mb-4">
            Services
          </p>
          <ul className="flex flex-col gap-3">
            {[
              "AI Contract Review",
              "AI Liability Audits",
              "Data Privacy Assessments",
              "Fractional AI General Counsel",
              "Transactional Legal Work",
            ].map((service) => (
              <li key={service}>
                <a
                  href="#"
                  className="text-[14px] text-[#71717a] light:text-gray-600 hover:text-[#fafafa] light:hover:text-gray-900 transition-colors"
                >
                  {service}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/[0.05] light:border-gray-200">
        <div className="max-w-[1200px] mx-auto px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-[12px] text-[#52525b] light:text-gray-600">
            © 2026 Available Legal Solutions, LLC. All rights reserved.
          </p>
          <ThemeToggle />
          <p
            className="text-[11px] text-[#3f3f46] light:text-gray-500 leading-relaxed max-w-[600px]"
            style={{ fontFamily: "var(--font-body), 'Inter', sans-serif" }}
          >
            <strong className="text-[#52525b] light:text-gray-600">Disclaimer:</strong> Information on this site is for general
            informational purposes only and does not constitute legal advice. Use of this site does not
            create an attorney-client relationship. <strong className="text-[#52525b] light:text-gray-600">AI Disclosure:</strong>{" "}
            Some content may be AI-assisted and reviewed by a licensed attorney.
          </p>
        </div>
      </div>
    </footer>
  );
}
