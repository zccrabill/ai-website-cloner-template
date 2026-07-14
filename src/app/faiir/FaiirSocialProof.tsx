"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

// Consent-gated social proof for the /faiir landing: testimonials and the
// certified-firm strip. Data comes exclusively from get_faiir_social_proof(),
// which only returns what clients affirmatively consented to on their
// Certification page ("Share the win") — named vs. anonymous is their choice,
// and the firm strip requires BOTH an active cert AND the directory-listing
// box. Renders nothing at all while there is nothing consented to show.

export interface CertifiedFirm {
  firm_name: string;
  year: number;
}
export interface Testimonial {
  quote: string;
  attribution: string;
  named: boolean;
}

export function FaiirSocialProofView({
  firms,
  testimonials,
}: {
  firms: CertifiedFirm[];
  testimonials: Testimonial[];
}) {
  if (firms.length === 0 && testimonials.length === 0) return null;

  return (
    <section id="clients" className="py-24 md:py-28 bg-[#F5F0EB] border-t border-[#1F1810]/8">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-2xl mb-14">
          <p className="text-xs font-semibold text-[#C17832] uppercase tracking-widest mb-3">
            Client outcomes
          </p>
          <h2
            className="text-3xl md:text-4xl text-[#1F1810] leading-tight"
            style={{ fontFamily: "'Playfair Display', serif", fontWeight: 400 }}
          >
            Firms that hold their AI to the FAIIR standard.
          </h2>
        </div>

        {testimonials.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
            {testimonials.map((t, i) => (
              <figure
                key={`${t.attribution}-${i}`}
                className="bg-white border border-[#1F1810]/8 rounded-2xl p-6 md:p-8"
              >
                <div
                  className="text-5xl leading-none text-[#C17832]/40 mb-3 select-none"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                  aria-hidden="true"
                >
                  &ldquo;
                </div>
                <blockquote className="text-[15px] text-[#1F1810] leading-relaxed mb-4">
                  {t.quote}
                </blockquote>
                <figcaption className="text-sm text-[#6B5B4E]">
                  — {t.attribution}
                  {t.named && (
                    <span className="ml-2 inline-flex items-center gap-1 text-[11px] font-medium text-[#C17832]">
                      <Image
                        src="/images/faiir-logo.png"
                        alt=""
                        width={14}
                        height={14}
                        className="object-contain"
                      />
                      FAIIR client
                    </span>
                  )}
                </figcaption>
              </figure>
            ))}
          </div>
        )}

        {firms.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-[#6B5B4E] uppercase tracking-widest mb-4">
              FAIIR-certified firms
            </p>
            <div className="flex flex-wrap gap-3">
              {firms.map((f) => (
                <span
                  key={f.firm_name}
                  className="inline-flex items-center gap-2 bg-white border border-[#1F1810]/10 rounded-full pl-2 pr-4 py-1.5"
                >
                  <Image
                    src="/images/faiir-logo.png"
                    alt="FAIIR seal"
                    width={22}
                    height={22}
                    className="object-contain"
                  />
                  <span className="text-sm text-[#1F1810] font-medium">{f.firm_name}</span>
                  <span className="text-[11px] text-[#A89279]">Certified {f.year}</span>
                </span>
              ))}
            </div>
            <p className="text-[11px] text-[#A89279] mt-4 max-w-xl">
              Firms appear here with their written permission, while their certification is
              current. FAIIR certification reflects an attorney-led, point-in-time assessment
              against the FAIIR standard — not a guarantee of compliance or a regulatory approval.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export default function FaiirSocialProof() {
  const [firms, setFirms] = useState<CertifiedFirm[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase.rpc("get_faiir_social_proof");
      if (cancelled || !data) return;
      const payload = data as { certified_firms?: CertifiedFirm[]; testimonials?: Testimonial[] };
      setFirms(payload.certified_firms ?? []);
      setTestimonials(payload.testimonials ?? []);
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return <FaiirSocialProofView firms={firms} testimonials={testimonials} />;
}
