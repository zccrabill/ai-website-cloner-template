import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#FAF8F5] border-t border-[#1F1810]/8">
      {/* Main footer body */}
      <div className="max-w-[1200px] mx-auto px-8 py-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-12">
        {/* Brand Column */}
        <div>
          <p className="font-heading text-lg mb-4 text-[#1F1810]">
            Av<span className="text-[#C17832]">{"{"}</span>ai<span className="text-[#C17832]">{"}"}</span>lable Law
          </p>
          <p className="text-sm text-[#6B5B4E] leading-relaxed max-w-xs">
            AI-powered legal solutions for Colorado businesses. Practical advice from attorneys who build with AI.
          </p>
          <p className="text-xs text-[#A89279] mt-4">
            Based in Colorado Springs &middot; Serving the Front Range
          </p>
        </div>

        {/* Navigation Column */}
        <div>
          <p className="text-xs font-semibold text-[#A89279] tracking-widest uppercase mb-4">
            Navigation
          </p>
          <ul className="flex flex-col gap-3">
            {[
              { label: "Home", href: "/" },
              { label: "Solutions", href: "/#solutions" },
              { label: "Pricing", href: "/#pricing" },
              { label: "How It Works", href: "/#how" },
              { label: "Blog", href: "/blog" },
            ].map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-sm text-[#6B5B4E] hover:text-[#C17832] transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Services Column */}
        <div>
          <p className="text-xs font-semibold text-[#A89279] tracking-widest uppercase mb-4">
            Services
          </p>
          <ul className="flex flex-col gap-3">
            {[
              { label: "Colorado AI Act Checker", href: "/ai-act-checker" },
              { label: "FAIIR Certification", href: "/faiir" },
              { label: "AI Contract Review", href: "/#solutions" },
              { label: "AI Liability Audits", href: "/#solutions" },
              { label: "Fractional GC", href: "/#solutions" },
            ].map((service) => (
              <li key={service.label}>
                <Link
                  href={service.href}
                  className="text-sm text-[#6B5B4E] hover:text-[#C17832] transition-colors"
                >
                  {service.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Connect Column */}
        <div>
          <p className="text-xs font-semibold text-[#A89279] tracking-widest uppercase mb-4">
            Connect
          </p>
          <ul className="flex flex-col gap-3">
            <li>
              <Link
                href="/login"
                className="text-sm text-[#6B5B4E] hover:text-[#C17832] transition-colors"
              >
                Member Login
              </Link>
            </li>
            <li>
              <a
                href="https://x.com/availablelaw"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#6B5B4E] hover:text-[#C17832] transition-colors"
              >
                X / Twitter
              </a>
            </li>
            <li>
              <a
                href="https://www.linkedin.com/company/available-legal-solutions-llc/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#6B5B4E] hover:text-[#C17832] transition-colors"
              >
                LinkedIn
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#1F1810]/8">
        <div className="max-w-[1200px] mx-auto px-8 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <p className="text-xs text-[#6B5B4E]">
            © 2026 Available Law, LLC. All rights reserved.
          </p>
          <p className="text-xs text-[#6B5B4E] leading-relaxed max-w-md">
            Information on this site is for general informational purposes only and does not constitute legal advice. AI Disclosure: Some content may be AI-assisted and reviewed by our licensed attorneys.
          </p>
        </div>
      </div>
    </footer>
  );
}
