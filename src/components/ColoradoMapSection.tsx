/**
 * Colorado service-area section.
 *
 * Visual story:
 *   1. Dense ambient topographic contours bleed across the full section
 *      background — the whole section feels like you're looking at a
 *      topo map sheet.
 *   2. The centerpiece is an editorial layered landscape illustration of
 *      Pikes Peak rising over Colorado Springs, with a star marker for
 *      our home base nestled at its eastern base.
 *   3. A horizontal corridor strip beneath the illustration shows the
 *      Front Range service area — DTC (north) south to Colorado Springs
 *      — with intermediate waypoints along the I-25 dashed line.
 *   4. An SEO-indexable city list at the bottom keeps the service-area
 *      claim crawlable for search engines and LLM answer engines.
 *
 * The background contours use a deterministic seeded PRNG so the output
 * is identical across renders and builds (SSR/hydration safe) and ship
 * zero geospatial dependencies.
 */

/* -------------------------------------------------------------- */
/* Deterministic topographic contour generator (for section bg)    */
/* -------------------------------------------------------------- */

/**
 * Mulberry32 — tiny seeded PRNG. Deterministic output matters for
 * SSR/hydration and keeps the generated lines stable across builds.
 */
function mulberry32(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface ContourOptions {
  seed: number;
  count: number;
  width: number;
  height: number;
  xPadding?: number;
  yPadding?: number;
  sharedAmplitude?: number;
  samples?: number;
}

/**
 * Generate a stack of flowing, non-crossing topographic contour paths.
 *
 * Every line in the stack shares the same "macro" terrain shape (a
 * layered sum-of-sines), so they follow the same curves and never cross
 * each other — which is the defining property of real topo contours.
 * Each line then adds a tiny per-line wobble (bounded to less than the
 * line spacing) so they don't look like perfect photocopies.
 */
function generateTopoContours({
  seed,
  count,
  width,
  height,
  xPadding = 0,
  yPadding = 0,
  sharedAmplitude = 55,
  samples = 80,
}: ContourOptions): string[] {
  const rand = mulberry32(seed);

  const sharedComponents = [
    {
      freq: 1.5 + rand() * 0.9,
      phase: rand() * Math.PI * 2,
      amp: sharedAmplitude * 1.0,
    },
    {
      freq: 2.9 + rand() * 1.1,
      phase: rand() * Math.PI * 2,
      amp: sharedAmplitude * 0.48,
    },
    {
      freq: 4.7 + rand() * 1.4,
      phase: rand() * Math.PI * 2,
      amp: sharedAmplitude * 0.23,
    },
    {
      freq: 7.5 + rand() * 1.8,
      phase: rand() * Math.PI * 2,
      amp: sharedAmplitude * 0.11,
    },
  ];

  const sharedNoise = (t: number): number =>
    sharedComponents.reduce(
      (sum, c) => sum + Math.sin(t * Math.PI * c.freq + c.phase) * c.amp,
      0,
    );

  const usableHeight = height - yPadding * 2;
  const usableWidth = width - xPadding * 2;
  const step = usableHeight / (count + 1);
  const perLineCap = step * 0.38;

  const paths: string[] = [];
  for (let i = 0; i < count; i++) {
    const baseY = yPadding + step * (i + 1);

    const wobbleFreq = 2.2 + rand() * 3.5;
    const wobblePhase = rand() * Math.PI * 2;
    const wobbleAmp = perLineCap * (0.35 + rand() * 0.65);

    const pts: [number, number][] = [];
    for (let j = 0; j <= samples; j++) {
      const t = j / samples;
      const x = xPadding + t * usableWidth;
      const y =
        baseY +
        sharedNoise(t) +
        Math.sin(t * Math.PI * wobbleFreq + wobblePhase) * wobbleAmp;
      pts.push([x, y]);
    }

    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let j = 0; j < pts.length - 1; j++) {
      const p0 = pts[Math.max(0, j - 1)];
      const p1 = pts[j];
      const p2 = pts[j + 1];
      const p3 = pts[Math.min(pts.length - 1, j + 2)];
      const c1x = p1[0] + (p2[0] - p0[0]) / 6;
      const c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6;
      const c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d +=
        ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)},` +
        ` ${c2x.toFixed(1)} ${c2y.toFixed(1)},` +
        ` ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    paths.push(d);
  }

  return paths;
}

// Ambient contours that fill the whole section behind the content.
const BG_CONTOURS = generateTopoContours({
  seed: 2026,
  count: 78,
  width: 1440,
  height: 1100,
  xPadding: -40,
  yPadding: 180,
  sharedAmplitude: 95,
  samples: 90,
});

/* -------------------------------------------------------------- */
/* Front Range corridor waypoints                                  */
/* -------------------------------------------------------------- */

interface CorridorNode {
  name: string;
  abbr?: string;
  isHome?: boolean;
}

// North to south: DTC at the top of the corridor, Colorado Springs
// (home base) at the southern end.
const CORRIDOR_NODES: CorridorNode[] = [
  { name: "Denver Tech Center", abbr: "DTC" },
  { name: "Lone Tree" },
  { name: "Castle Rock" },
  { name: "Monument" },
  { name: "Colorado Springs", isHome: true },
];

/* -------------------------------------------------------------- */
/* Component                                                       */
/* -------------------------------------------------------------- */

export default function ColoradoMapSection() {
  return (
    <section
      id="service-area"
      className="relative w-full bg-[#FAF8F5] py-24 px-6 overflow-hidden"
      aria-labelledby="service-area-heading"
    >
      {/* Ambient topographic backdrop — fills the full section behind
          content. Opacity is low enough that the vignette and text never
          fight with it, but the whole section reads as a topo sheet. */}
      <svg
        className="pointer-events-none absolute inset-0 w-full h-full"
        viewBox="0 0 1440 1100"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <g
          fill="none"
          stroke="#1F1810"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.09"
        >
          {BG_CONTOURS.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </svg>

      <div className="relative max-w-[1100px] mx-auto">
        {/* Header */}
        <div className="max-w-[780px] mx-auto text-center mb-14">
          <p className="text-sm font-semibold text-[#C17832] uppercase tracking-wide mb-4">
            Service Area
          </p>
          <h2
            id="service-area-heading"
            className="text-4xl md:text-5xl font-heading text-[#1F1810] mb-6 leading-tight"
          >
            Based in Colorado Springs.
            <br className="hidden md:block" /> Serving the Front Range.
          </h2>
          <p className="text-lg text-[#6B5B4E] leading-relaxed">
            Available Law is a Colorado-licensed, FAIIR-certified virtual
            law firm headquartered at the foot of Pikes Peak. Because we
            work remotely, we serve small businesses up and down the
            Front Range corridor — from the Denver Tech Center south to
            the Springs — and every Colorado county beyond.
          </p>
        </div>

        {/* Pikes Peak editorial landscape illustration */}
        <figure className="mx-auto" style={{ maxWidth: 680 }}>
          <div className="relative border-[2.5px] border-[#1F1810] bg-[#FAF8F5] shadow-[0_30px_60px_rgba(31,24,16,0.08)]">
            <svg
              viewBox="0 0 800 520"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto block"
              role="img"
              aria-labelledby="pikes-peak-title pikes-peak-desc"
            >
              <title id="pikes-peak-title">
                Pikes Peak rising above Colorado Springs
              </title>
              <desc id="pikes-peak-desc">
                An editorial landscape illustration of Pikes Peak, the
                14,115-foot mountain that towers over Colorado Springs,
                home base of Available Law. A black star marks the city
                nestled against the mountain&rsquo;s eastern foothills.
              </desc>

              {/* Sky background — matches the card bg but explicit so
                  the ambient section contours don't bleed through. */}
              <rect x="0" y="0" width="800" height="520" fill="#FAF8F5" />

              {/* Sun — a warm disk behind the summit, half-occluded by
                  the peak once the mountain paths draw over it. */}
              <circle
                cx="550"
                cy="155"
                r="54"
                fill="#F2B870"
                opacity="0.58"
              />

              {/* Distant range — the farthest ridge. Palest fill so it
                  recedes into haze. */}
              <path
                d="M 0 380
                   L 0 310
                   Q 55 290 110 305
                   Q 170 275 230 300
                   Q 290 270 350 295
                   Q 415 270 475 295
                   Q 540 275 600 300
                   Q 665 280 725 305
                   Q 775 295 800 310
                   L 800 380 Z"
                fill="#D9CCBC"
              />

              {/* Middle range — mid-distance ridges, slightly more
                  defined peaks than the far range. */}
              <path
                d="M 0 380
                   L 0 335
                   Q 45 315 90 330
                   Q 140 285 190 315
                   Q 245 275 290 305
                   Q 335 285 380 315
                   Q 425 330 470 305
                   Q 525 280 575 310
                   Q 625 285 675 315
                   Q 725 290 770 320
                   Q 790 325 800 335
                   L 800 380 Z"
                fill="#A89279"
              />

              {/* Pikes Peak — the hero silhouette. Broad rounded summit
                  at roughly x=430, y=118, with the characteristic massif
                  shoulders spreading from x=150 (left base) to x=700
                  (right base). Dominant dark fill. */}
              <path
                d="M 150 380
                   Q 195 362 225 342
                   Q 260 315 285 285
                   Q 315 245 340 210
                   Q 365 175 385 148
                   Q 400 128 420 120
                   Q 445 116 465 124
                   Q 488 135 502 160
                   Q 522 195 538 230
                   Q 558 270 578 305
                   Q 605 340 635 362
                   Q 668 378 700 380
                   L 150 380 Z"
                fill="#6B5B4E"
              />

              {/* Pikes Peak linework highlight — a faint top edge stroke
                  that gives the silhouette a clean editorial outline on
                  just the summit and upper slopes. */}
              <path
                d="M 225 342
                   Q 260 315 285 285
                   Q 315 245 340 210
                   Q 365 175 385 148
                   Q 400 128 420 120
                   Q 445 116 465 124
                   Q 488 135 502 160
                   Q 522 195 538 230
                   Q 558 270 578 305"
                fill="none"
                stroke="#1F1810"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Snow cap — a thin cream crescent hugging the summit
                  dome. Colorado 14ers hold snow well into summer. */}
              <path
                d="M 378 148
                   Q 398 128 420 122
                   Q 444 118 465 128
                   Q 478 135 488 148
                   Q 472 144 450 144
                   Q 428 146 408 150
                   Q 390 153 378 148 Z"
                fill="#EDE5DB"
              />

              {/* Left foreground pines — small triangular silhouettes
                  along the plain, adds scale and editorial texture. */}
              <g fill="#1F1810">
                <polygon points="55,380 48,380 55,364" />
                <polygon points="55,380 62,380 55,364" />
                <polygon points="84,380 79,380 84,369" />
                <polygon points="84,380 89,380 84,369" />
                <polygon points="118,380 110,380 118,362" />
                <polygon points="118,380 126,380 118,362" />
                <polygon points="144,380 138,380 144,368" />
                <polygon points="144,380 150,380 144,368" />
              </g>

              {/* Right foreground pines — smaller cluster to the east of
                  the mountain, beyond the Colorado Springs marker. */}
              <g fill="#1F1810">
                <polygon points="730,380 724,380 730,368" />
                <polygon points="730,380 736,380 730,368" />
                <polygon points="760,380 755,380 760,371" />
                <polygon points="760,380 765,380 760,371" />
              </g>

              {/* Horizon line — subtle baseline extending past the
                  mountain silhouettes so the plain reads as ground. */}
              <line
                x1="0"
                y1="380"
                x2="800"
                y2="380"
                stroke="#1F1810"
                strokeWidth="1"
                opacity="0.35"
              />

              {/* Colorado Springs star — placed at the eastern foot of
                  Pikes Peak, on the horizon line. The city sits in a
                  valley against the mountain's base, so this is where
                  the marker geographically belongs. */}
              <g transform="translate(660, 380)">
                {/* Cream halo so the star reads cleanly over whatever
                    sits behind it. */}
                <circle r="22" fill="#FAF8F5" />
                <polygon
                  points="0,-16 4.7,-4.9 16.5,-4.9 7,2.9 10.6,14.7 0,7.6 -10.6,14.7 -7,2.9 -16.5,-4.9 -4.7,-4.9"
                  fill="#1F1810"
                  stroke="#FAF8F5"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
              </g>

              {/* Small directional label 'PIKES PEAK 14,115 ft' floating
                  above the summit — subtle editorial annotation. */}
              <g fontFamily="Georgia, serif" fill="#1F1810" opacity="0.7">
                <text
                  x="435"
                  y="85"
                  textAnchor="middle"
                  fontSize="13"
                  fontStyle="italic"
                  letterSpacing="0.5"
                >
                  Pikes Peak
                </text>
                <text
                  x="435"
                  y="100"
                  textAnchor="middle"
                  fontSize="10"
                  letterSpacing="0.5"
                >
                  14,115 ft
                </text>
              </g>
            </svg>
          </div>

          <figcaption className="mt-7 text-center">
            <h3 className="font-heading text-3xl md:text-[34px] tracking-[0.08em] text-[#1F1810] uppercase leading-none">
              Colorado Springs
            </h3>
            <p className="mt-2 text-sm text-[#6B5B4E] tracking-[0.06em]">
              Home Base · Elevation 6,035 ft
            </p>
          </figcaption>
        </figure>

        {/* Corridor strip — Front Range waypoints from DTC to Springs */}
        <div className="mt-16 max-w-[820px] mx-auto">
          <p className="text-[11px] font-semibold text-[#C17832] uppercase tracking-[0.22em] text-center mb-6">
            Front Range Corridor
          </p>

          <div className="relative px-3">
            {/* Dashed I-25 line connecting all the nodes */}
            <div
              className="absolute top-[11px] left-[28px] right-[28px] border-t border-dashed border-[#A89279]"
              aria-hidden="true"
            />

            <ol className="relative flex items-start justify-between">
              {CORRIDOR_NODES.map((node) => (
                <li
                  key={node.name}
                  className="flex flex-col items-center text-center flex-1 first:items-start last:items-end first:text-left last:text-right"
                >
                  {node.isHome ? (
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      className="shrink-0 relative z-10"
                      aria-hidden="true"
                    >
                      <circle cx="12" cy="12" r="11" fill="#FAF8F5" />
                      <polygon
                        points="12,1.5 14.9,8.5 22.5,8.5 16.3,13.3 18.7,20.7 12,16.2 5.3,20.7 7.7,13.3 1.5,8.5 9.1,8.5"
                        fill="#1F1810"
                      />
                    </svg>
                  ) : (
                    <span
                      className="relative z-10 block w-[18px] h-[18px] rounded-full bg-[#FAF8F5] border-[2px] border-[#1F1810]"
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`mt-3 text-[11px] uppercase tracking-[0.1em] leading-tight ${
                      node.isHome
                        ? "font-semibold text-[#1F1810]"
                        : "text-[#6B5B4E]"
                    }`}
                  >
                    {node.abbr ?? node.name}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="mt-4 flex justify-between text-[10px] text-[#A89279] uppercase tracking-[0.22em] px-1">
            <span>North</span>
            <span>South</span>
          </div>
        </div>

        {/* SEO text block — semantic, crawlable list of cities we serve.
            LLM answer engines and classical crawlers can pick this up
            even if they never render the SVG. */}
        <div className="mt-16 max-w-[900px] mx-auto text-center">
          <p className="text-[15px] text-[#6B5B4E] leading-relaxed">
            Available Law serves small businesses, founders, and operators
            in{" "}
            <strong className="text-[#1F1810]">Colorado Springs</strong>,{" "}
            <strong className="text-[#1F1810]">Monument</strong>,{" "}
            <strong className="text-[#1F1810]">Castle Rock</strong>,{" "}
            <strong className="text-[#1F1810]">Lone Tree</strong>,{" "}
            <strong className="text-[#1F1810]">Centennial</strong>,{" "}
            <strong className="text-[#1F1810]">Greenwood Village</strong>,{" "}
            <strong className="text-[#1F1810]">the Denver Tech Center</strong>
            ,{" "}
            <strong className="text-[#1F1810]">Denver</strong>,{" "}
            <strong className="text-[#1F1810]">Aurora</strong>,{" "}
            <strong className="text-[#1F1810]">Boulder</strong>,{" "}
            <strong className="text-[#1F1810]">Fort Collins</strong>,{" "}
            <strong className="text-[#1F1810]">Pueblo</strong>, and every
            other Colorado municipality. Flat monthly subscription, no
            billable hours, no retainers &mdash; just a Colorado attorney
            on call when you need one.
          </p>
        </div>
      </div>
    </section>
  );
}
