"use client";

import { useState } from "react";

/**
 * Colorado service-area section. An illustrative stylized state map with
 * pins for the major metros we serve, plus an SEO-indexable list of cities
 * and counties underneath.
 *
 * Why a stylized map instead of a topo-accurate GeoJSON render:
 * - Colorado is very close to a true rectangle (37.0–41.0 lat, 102.05–109.05
 *   long), so a clean rectangle with pin positions computed from real
 *   lat/long coordinates is geographically faithful enough and keeps the
 *   bundle tiny (no topojson/d3-geo dependency).
 * - The editorial brand voice favors a clean, designed visual over a
 *   literal cartographic render.
 *
 * Pin coordinates are derived from real city lat/long using a linear
 * projection onto the 700x400 viewBox:
 *   x = ((long + 109.05) / 7.0) * 700
 *   y = ((41.00 - lat) / 4.0) * 400
 *
 * Below the map we render a semantic text block with all the city names so
 * search engines (and LLM answer engines) can pick up the service-area
 * claim even if they skip SVG rendering.
 */

interface City {
  name: string;
  x: number;
  y: number;
  /** Visual weight — larger metros get bigger pins. */
  size: "sm" | "md" | "lg";
  /** Short positioning phrase shown on hover. */
  tagline: string;
}

// Ordered north-to-south, west-to-east so the legend list reads naturally.
const CITIES: City[] = [
  {
    name: "Fort Collins",
    x: 397,
    y: 42,
    size: "md",
    tagline: "Northern Front Range",
  },
  {
    name: "Greeley",
    x: 434,
    y: 58,
    size: "sm",
    tagline: "Weld County",
  },
  {
    name: "Boulder",
    x: 378,
    y: 99,
    size: "md",
    tagline: "Boulder County",
  },
  {
    name: "Denver",
    x: 406,
    y: 126,
    size: "lg",
    tagline: "Denver metro — headquarters",
  },
  {
    name: "Aspen",
    x: 223,
    y: 181,
    size: "sm",
    tagline: "Roaring Fork Valley",
  },
  {
    name: "Grand Junction",
    x: 50,
    y: 194,
    size: "md",
    tagline: "Western Slope",
  },
  {
    name: "Colorado Springs",
    x: 423,
    y: 217,
    size: "lg",
    tagline: "El Paso County",
  },
  {
    name: "Pueblo",
    x: 444,
    y: 275,
    size: "md",
    tagline: "Southern Front Range",
  },
  {
    name: "Durango",
    x: 117,
    y: 372,
    size: "sm",
    tagline: "Four Corners region",
  },
];

const PIN_RADIUS: Record<City["size"], number> = {
  sm: 6,
  md: 8,
  lg: 11,
};

export default function ColoradoMapSection() {
  const [hoveredCity, setHoveredCity] = useState<string | null>(null);

  const hovered = CITIES.find((c) => c.name === hoveredCity) ?? null;

  return (
    <section
      id="service-area"
      className="relative w-full bg-[#FAF8F5] py-24 px-6 overflow-hidden"
      aria-labelledby="service-area-heading"
    >
      {/* Ambient topographic backdrop — faint contour lines bleeding across
          the whole section. Absolutely positioned, pointer-events: none, and
          opacity kept very low so it never competes with content. The curves
          intentionally bunch around the center (where the "mountains" live)
          and smooth out toward the edges. */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g
          fill="none"
          stroke="#1F1810"
          strokeWidth="1"
          opacity="0.055"
        >
          <path d="M -50 120 Q 300 70 520 140 T 920 130 T 1490 90" />
          <path d="M -50 180 Q 280 110 540 200 T 960 180 T 1490 150" />
          <path d="M -50 240 Q 260 160 560 260 T 980 240 T 1490 210" />
          <path d="M -50 300 Q 240 200 580 320 T 1000 300 T 1490 270" />
          <path d="M -50 360 Q 220 240 600 380 T 1020 360 T 1490 330" />
          <path d="M -50 420 Q 200 290 620 440 T 1040 420 T 1490 390" />
          <path d="M -50 480 Q 220 350 640 500 T 1060 480 T 1490 450" />
          <path d="M -50 540 Q 240 410 660 560 T 1080 540 T 1490 510" />
          <path d="M -50 600 Q 260 470 680 620 T 1100 600 T 1490 570" />
          <path d="M -50 660 Q 280 530 700 680 T 1120 660 T 1490 630" />
          <path d="M -50 720 Q 300 590 720 740 T 1140 720 T 1490 690" />
          <path d="M -50 780 Q 320 650 740 800 T 1160 780 T 1490 750" />
          <path d="M -50 840 Q 340 710 760 860 T 1180 840 T 1490 810" />
        </g>
      </svg>

      <div className="relative max-w-[1180px] mx-auto">
        {/* Header */}
        <div className="max-w-[780px] mx-auto text-center mb-14">
          <p className="text-sm font-semibold text-[#C17832] uppercase tracking-wide mb-4">
            Service Area
          </p>
          <h2
            id="service-area-heading"
            className="text-4xl md:text-5xl font-heading text-[#1F1810] mb-6 leading-tight"
          >
            Serving Colorado small businesses, statewide
          </h2>
          <p className="text-lg text-[#6B5B4E] leading-relaxed">
            Available Law is a Colorado-licensed, FAIIR-certified virtual law
            firm. Because we work remotely, we serve small businesses in every
            Colorado county — from the Front Range to the Western Slope.
          </p>
        </div>

        {/* Map */}
        <div className="relative rounded-2xl border border-[#D9CCBC] bg-[#F5F0EB] p-6 md:p-10 shadow-[0_20px_40px_rgba(31,24,16,0.06)]">
          <svg
            viewBox="0 0 700 400"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-auto"
            role="img"
            aria-labelledby="colorado-map-title colorado-map-desc"
          >
            <title id="colorado-map-title">
              Map of Available Law&rsquo;s Colorado service area
            </title>
            <desc id="colorado-map-desc">
              A stylized map of Colorado showing the major cities Available
              Law serves: Fort Collins, Greeley, Boulder, Denver, Aspen, Grand
              Junction, Colorado Springs, Pueblo, and Durango.
            </desc>

            <defs>
              {/* Clip contour lines to the state boundary so they don't
                  spill outside the rectangle. */}
              <clipPath id="col-clip">
                <rect x="10" y="10" width="680" height="380" rx="8" ry="8" />
              </clipPath>
              {/* Faint elevation wash — slightly darker through the
                  mountain spine on the western half of the state. */}
              <linearGradient id="col-relief" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#EDE5DB" stopOpacity="0.35" />
                <stop offset="38%" stopColor="#D9CCBC" stopOpacity="0.45" />
                <stop offset="55%" stopColor="#EDE5DB" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* State rectangle — Colorado is geographically a rectangle */}
            <rect
              x="10"
              y="10"
              width="680"
              height="380"
              rx="8"
              ry="8"
              fill="#FAF8F5"
              stroke="#1F1810"
              strokeWidth="2.5"
            />
            {/* Elevation wash — suggests the Rockies without being a literal
                relief map. Kept subtle enough that pins stay the focal point. */}
            <rect
              x="10"
              y="10"
              width="680"
              height="380"
              rx="8"
              ry="8"
              fill="url(#col-relief)"
            />

            {/* Topographic contour lines.
                Horizontal-ish curves that undulate heavily through the
                Rockies (western half) and smooth out over the eastern
                plains — just like a real USGS quad sheet. Faint grey so
                they recede behind pins and labels. */}
            <g
              clipPath="url(#col-clip)"
              fill="none"
              stroke="#1F1810"
              strokeWidth="1"
              opacity="0.11"
            >
              <path d="M 10 35  L 85 35  Q 130 15  170 40  Q 210 65  250 30  Q 290 55  330 40  L 690 40" />
              <path d="M 10 65  L 80 65  Q 120 35  165 70  Q 205 100 250 55  Q 290 85  335 65  L 690 65" />
              <path d="M 10 95  L 75 95  Q 115 60  160 100 Q 200 135 250 80  Q 290 115 335 95  L 690 95" />
              <path d="M 10 125 L 70 125 Q 110 85  155 130 Q 195 165 250 105 Q 290 140 335 125 L 690 125" />
              <path d="M 10 155 L 70 155 Q 105 110 150 160 Q 195 190 245 130 Q 290 165 340 155 L 690 155" />
              <path d="M 10 185 L 65 185 Q 100 135 145 185 Q 190 215 240 155 Q 285 190 335 185 L 690 185" />
              <path d="M 10 215 L 70 215 Q 105 165 150 215 Q 195 245 245 185 Q 290 220 340 215 L 690 215" />
              <path d="M 10 245 L 75 245 Q 115 195 160 245 Q 200 275 250 215 Q 295 250 345 245 L 690 245" />
              <path d="M 10 275 L 80 275 Q 120 230 165 275 Q 205 305 255 250 Q 300 280 350 275 L 690 275" />
              <path d="M 10 305 L 85 305 Q 125 265 175 305 Q 215 335 265 285 Q 305 310 355 305 L 690 305" />
              <path d="M 10 335 L 90 335 Q 135 300 185 335 Q 225 365 275 320 Q 315 340 360 335 L 690 335" />
              <path d="M 10 365 L 100 365 Q 145 335 195 365 Q 235 390 285 355 Q 325 370 365 365 L 690 365" />
            </g>

            {/* Tighter nested contour loops — these read as individual
                peaks/ranges and give the map a hand-drawn feel.
                Sawatch / Aspen cluster (around x≈225, y≈180),
                San Juans / Durango cluster (around x≈140, y≈335),
                Pikes Peak / Front Range (around x≈395, y≈210). */}
            <g
              clipPath="url(#col-clip)"
              fill="none"
              stroke="#1F1810"
              strokeWidth="1"
              opacity="0.13"
            >
              {/* Sawatch / Elk Range — nested around Aspen */}
              <ellipse cx="225" cy="180" rx="18" ry="10" />
              <ellipse cx="225" cy="180" rx="30" ry="17" />
              <ellipse cx="225" cy="180" rx="44" ry="25" />
              {/* San Juans — nested around Durango */}
              <ellipse cx="140" cy="335" rx="22" ry="12" />
              <ellipse cx="140" cy="335" rx="36" ry="20" />
              <ellipse cx="140" cy="335" rx="52" ry="29" />
              {/* Pikes Peak / near Colorado Springs */}
              <ellipse cx="395" cy="215" rx="14" ry="9" />
              <ellipse cx="395" cy="215" rx="25" ry="16" />
            </g>

            {/* Continental Divide — rough, illustrative only */}
            <path
              d="M 245 10 Q 260 120 220 180 Q 200 240 260 320 Q 275 360 280 390"
              fill="none"
              stroke="#C17832"
              strokeWidth="1.5"
              strokeDasharray="4 6"
              opacity="0.5"
            />
            <text
              x="240"
              y="30"
              textAnchor="end"
              className="fill-[#6B5B4E]"
              fontSize="10"
              fontStyle="italic"
            >
              Continental Divide
            </text>

            {/* State label */}
            <text
              x="540"
              y="40"
              className="fill-[#1F1810] font-heading"
              fontSize="18"
              fontWeight="600"
              letterSpacing="1"
            >
              COLORADO
            </text>

            {/* City pins */}
            {CITIES.map((city) => {
              const isHovered = city.name === hoveredCity;
              const r = PIN_RADIUS[city.size];
              return (
                <g
                  key={city.name}
                  onMouseEnter={() => setHoveredCity(city.name)}
                  onMouseLeave={() => setHoveredCity(null)}
                  onFocus={() => setHoveredCity(city.name)}
                  onBlur={() => setHoveredCity(null)}
                  tabIndex={0}
                  style={{ cursor: "pointer" }}
                >
                  {/* Pulse ring on hover */}
                  {isHovered && (
                    <circle
                      cx={city.x}
                      cy={city.y}
                      r={r + 8}
                      fill="#C17832"
                      opacity="0.2"
                    />
                  )}
                  {/* Pin */}
                  <circle
                    cx={city.x}
                    cy={city.y}
                    r={r}
                    fill={isHovered ? "#C17832" : "#1F1810"}
                    stroke="#FAF8F5"
                    strokeWidth="2"
                  />
                  {/* Label */}
                  <text
                    x={city.x + r + 6}
                    y={city.y + 4}
                    className="fill-[#1F1810]"
                    fontSize={city.size === "lg" ? 14 : 12}
                    fontWeight={city.size === "lg" ? 600 : 500}
                  >
                    {city.name}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Hover tooltip — rendered as HTML so it stays readable over SVG */}
          <div
            className={`pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-4 transition-opacity duration-200 ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
            aria-live="polite"
          >
            {hovered && (
              <div className="bg-[#1F1810] text-white text-sm font-medium px-4 py-2 rounded-lg shadow-lg whitespace-nowrap">
                <span className="font-semibold">{hovered.name}</span>
                <span className="text-[#D9CCBC] mx-2">·</span>
                <span className="text-[#F5F0EB]">{hovered.tagline}</span>
              </div>
            )}
          </div>
        </div>

        {/* SEO text block — semantic, crawlable list of cities we serve.
            LLM answer engines and classical crawlers can pick this up even
            if they never execute the SVG. */}
        <div className="mt-10 max-w-[900px] mx-auto text-center">
          <p className="text-[15px] text-[#6B5B4E] leading-relaxed">
            Available Law serves small businesses, founders, and operators in{" "}
            <strong className="text-[#1F1810]">Denver</strong>,{" "}
            <strong className="text-[#1F1810]">Colorado Springs</strong>,{" "}
            <strong className="text-[#1F1810]">Aurora</strong>,{" "}
            <strong className="text-[#1F1810]">Fort Collins</strong>,{" "}
            <strong className="text-[#1F1810]">Lakewood</strong>,{" "}
            <strong className="text-[#1F1810]">Thornton</strong>,{" "}
            <strong className="text-[#1F1810]">Arvada</strong>,{" "}
            <strong className="text-[#1F1810]">Westminster</strong>,{" "}
            <strong className="text-[#1F1810]">Pueblo</strong>,{" "}
            <strong className="text-[#1F1810]">Centennial</strong>,{" "}
            <strong className="text-[#1F1810]">Boulder</strong>,{" "}
            <strong className="text-[#1F1810]">Greeley</strong>,{" "}
            <strong className="text-[#1F1810]">Longmont</strong>,{" "}
            <strong className="text-[#1F1810]">Loveland</strong>,{" "}
            <strong className="text-[#1F1810]">Grand Junction</strong>,{" "}
            <strong className="text-[#1F1810]">Durango</strong>,{" "}
            <strong className="text-[#1F1810]">Aspen</strong>, and every other
            Colorado municipality. Flat monthly subscription, no billable
            hours, no retainers &mdash; just a Colorado attorney on call when
            you need one.
          </p>
        </div>
      </div>
    </section>
  );
}
