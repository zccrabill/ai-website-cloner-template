import Link from "next/link";
import { ArrowRight, Sparkles, Wand2, Rocket, KeyRound } from "lucide-react";
import { SITECRAFT_PATH, SITECRAFT_VALUE_PROPS } from "@/lib/sitecraft";

/**
 * Homepage band for Sitecraft — the website design & build offering. Sits on
 * the homepage as a cross-link to the full /sitecraft landing page, matching
 * the treatment FaiirSection gives the FAIIR offering.
 *
 * Deliberately compact: it teases the four value props from the config and
 * hands off to the landing page for the full pitch + intake form. It does
 * NOT duplicate the intake form (one canonical place for that on /sitecraft).
 */

const ICONS = [Sparkles, Wand2, Rocket, KeyRound];

export default function SitecraftSection() {
  return (
    <section
      id="sitecraft"
      className="w-full bg-[#1F1810] py-20 lg:py-28 px-6"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left: pitch */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#C17832]/40 bg-white/5 px-4 py-1.5 mb-6">
              <Sparkles className="w-4 h-4 text-[#F2B870]" />
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-white/70">
                New · Sitecraft
              </span>
            </div>
            <h2 className="font-heading text-4xl md:text-5xl text-white mb-5 leading-tight">
              Need a website too? We build those.
            </h2>
            <p className="text-lg text-white/70 leading-relaxed mb-8 max-w-xl">
              A lot of business owners know they need a great website — they
              just don&apos;t have the time or the tools to build one. So we
              added it as a service. Beautiful, custom sites, built fast with
              AI, done for you. Same team, same AI-first approach behind
              Available Law.
            </p>
            <Link
              href={SITECRAFT_PATH}
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-[#C17832] text-white rounded-full text-sm font-medium hover:bg-white hover:text-[#1F1810] transition-all"
            >
              Explore Sitecraft
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {/* Right: value-prop mini-grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {SITECRAFT_VALUE_PROPS.map((prop, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <div
                  key={prop.title}
                  className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 hover:border-[#C17832]/40 transition-colors"
                >
                  <Icon
                    className="w-6 h-6 text-[#F2B870] mb-4"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  <h3 className="font-heading text-lg text-white mb-2 leading-tight">
                    {prop.title}
                  </h3>
                  <p className="text-sm text-white/60 leading-relaxed">
                    {prop.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
