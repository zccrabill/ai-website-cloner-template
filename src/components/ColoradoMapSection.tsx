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
      className="w-full bg-[#FAF8F5] py-24 px-6"
      aria-labelledby="service-area-heading"
    >
      <div className="max-w-[1180px] mx-auto">
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

            {/* Dot grid texture — subtle topographic hint */}
            <defs>
              <pattern
                id="col-dots"
                x="0"
                y="0"
                width="16"
                height="16"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="1.5" cy="1.5" r="1" fill="#1F1810" opacity="0.06" />
              </pattern>
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
            <rect
              x="10"
              y="10"
              width="680"
              height="380"
              rx="8"
              ry="8"
              fill="url(#col-dots)"
            />

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
