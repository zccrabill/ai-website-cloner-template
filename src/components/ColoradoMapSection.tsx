/**
 * Colorado service-area section.
 *
 * Visual story:
 *   1. Dense ambient topographic contours bleed across the full section
 *      background — the whole section feels like you're looking at a
 *      topo map, not just the card.
 *   2. The centerpiece is a Breckenridge-style topo vignette focused on
 *      our Colorado Springs home base, with a black star marking the
 *      city and an uppercase serif caption underneath.
 *   3. A horizontal corridor strip beneath the vignette shows the Front
 *      Range service area — DTC (north) to Colorado Springs (south),
 *      with intermediate waypoints and a dashed I-25 line.
 *   4. An SEO-indexable city list at the bottom keeps the service-area
 *      claim crawlable for classical search and LLM answer engines.
 *
 * All contour lines are generated deterministically via a seeded PRNG,
 * so the output is identical across renders and builds (SSR/hydration
 * safe) and bundles zero geospatial dependencies.
 */

/* -------------------------------------------------------------- */
/* Deterministic topographic contour generator                     */
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
  /**
   * Amplitude of the shared terrain shape. Larger values give bigger
   * vertical sweeps — but must be balanced against yPadding to keep
   * the lines inside the visible area.
   */
  sharedAmplitude?: number;
  /** Number of bezier samples per line — higher = smoother. */
  samples?: number;
}

/**
 * Generate a stack of flowing, non-crossing topographic contour paths.
 *
 * The approach: every line in the stack shares the same "macro" terrain
 * shape (a layered sum-of-sines), so they follow the same curves and
 * never cross one another — which is the key property of real topo
 * contours. Each line then adds a tiny per-line wobble (bounded to
 * less than the line spacing) so they don't look like parallel
 * photocopies of one another.
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

  // Layered shared terrain — four sine components at increasing
  // frequency and decreasing amplitude (1/f noise approximation).
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
  // Per-line wobble is capped to a fraction of the inter-line spacing so
  // adjacent contours can never touch or cross.
  const perLineCap = step * 0.38;

  const paths: string[] = [];
  for (let i = 0; i < count; i++) {
    const baseY = yPadding + step * (i + 1);

    const wobbleFreq = 2.2 + rand() * 3.5;
    const wobblePhase = rand() * Math.PI * 2;
    const wobbleAmp = perLineCap * (0.35 + rand() * 0.65);

    // Sample the curve at evenly spaced x values.
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

    // Catmull-Rom → cubic bezier conversion for C1 smoothness.
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

/* -------------------------------------------------------------- */
/* Pre-computed contour sets (module scope — runs once at build)   */
/* -------------------------------------------------------------- */

// Ambient contours that fill the whole section behind the content.
// Wide amplitude, lots of lines, heavy yPadding to absorb the shared-
// noise drift so nothing escapes the viewBox.
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

// Vignette map contours — denser, tighter, higher amplitude relative to
// size so you get the Breckenridge-sheet look.
const MAP_CONTOURS = generateTopoContours({
  seed: 4242,
  count: 56,
  width: 620,
  height: 680,
  xPadding: -10,
  yPadding: 90,
  sharedAmplitude: 58,
  samples: 100,
});

/* -------------------------------------------------------------- */
/* Front Range corridor waypoints                                  */
/* -------------------------------------------------------------- */

interface CorridorNode {
  name: string;
  abbr?: string;
  isHome?: boolean;
}

// North to south — DTC at the top end of the corridor, Colorado Springs
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
          content. Opacity is low enough that pins and text never fight
          with it, but the whole section reads as a topo sheet. */}
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
            law firm headquartered in Colorado Springs. Because we work
            remotely, we serve small businesses up and down the Front
            Range corridor — from the Denver Tech Center south to the
            Springs — and every Colorado county beyond.
          </p>
        </div>

        {/* Topo vignette — Breckenridge-style centerpiece */}
        <figure className="mx-auto" style={{ maxWidth: 520 }}>
          <div className="relative border-[2.5px] border-[#1F1810] bg-[#FAF8F5] p-3 md:p-4 shadow-[0_30px_60px_rgba(31,24,16,0.08)]">
            <svg
              viewBox="0 0 620 680"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-auto block"
              role="img"
              aria-labelledby="col-springs-title col-springs-desc"
            >
              <title id="col-springs-title">
                Topographic vignette — Colorado Springs, Colorado
              </title>
              <desc id="col-springs-desc">
                A stylized topographic map vignette showing Colorado
                Springs, the home base of Available Law, marked with a
                black star at the center.
              </desc>

              {/* Topo contour lines */}
              <g
                fill="none"
                stroke="#1F1810"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.78"
              >
                {MAP_CONTOURS.map((d, i) => (
                  <path key={i} d={d} />
                ))}
              </g>

              {/* Colorado Springs star — placed near center, slightly
                  east of center since the city sits east of Pikes Peak. */}
              <g transform="translate(345, 345)">
                {/* White halo so the star reads over the densest contour
                    bands without fighting them */}
                <circle r="22" fill="#FAF8F5" />
                <polygon
                  points="0,-16 4.7,-4.9 16.5,-4.9 7,2.9 10.6,14.7 0,7.6 -10.6,14.7 -7,2.9 -16.5,-4.9 -4.7,-4.9"
                  fill="#1F1810"
                  stroke="#FAF8F5"
                  strokeWidth="1.2"
                  strokeLinejoin="round"
                />
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
