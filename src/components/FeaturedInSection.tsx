"use client";
import Image from "next/image";

const logos = [
  { src: "/images/featured-1.jpeg", alt: "Featured publication 1", width: 140, height: 79 },
  { src: "/images/featured-2.png", alt: "Featured publication 2", width: 90, height: 47 },
  { src: "/images/featured-3.png", alt: "Featured publication 3", width: 65, height: 34 },
  { src: "/images/featured-4.webp", alt: "Featured publication 4", width: 140, height: 78 },
];

export default function FeaturedInSection() {
  return (
    <section id="featured" className="w-full bg-[#0f0f14] flex flex-col items-center justify-center py-20 border-t border-white/6">
      <p className="text-[#52525b] text-sm tracking-[0.2em] uppercase mb-16" style={{ fontFamily: "var(--font-body), 'Pontano Sans', sans-serif" }}>
        Featured In
      </p>
      <div className="flex flex-row items-center justify-center gap-16 flex-wrap px-8">
        {logos.map((logo, i) => (
          <div
            key={i}
            className="transition-all duration-300"
            style={{ filter: "brightness(0.6)", opacity: 0.7 }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.filter = "brightness(1)";
              (e.currentTarget as HTMLElement).style.opacity = "1";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.filter = "brightness(0.6)";
              (e.currentTarget as HTMLElement).style.opacity = "0.7";
            }}
          >
            <Image src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} className="object-contain" />
          </div>
        ))}
      </div>
    </section>
  );
}
