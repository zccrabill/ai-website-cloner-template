# Page Topology — availablelaw.com

## URL
https://www.availablelaw.com

## Platform
Squarespace (detected from class names, CDN, font loading)

## Scroll Model
Standard vertical scroll (no scroll-snap, no Lenis)

## Z-Index Layering
- Header: fixed, z-50
- Sections: flow content, stacked vertically

## Sections (top to bottom)

| # | Name | Height | Background | Interaction |
|---|------|--------|-----------|-------------|
| - | Header | 184px (fixed) | Transparent → White on scroll | Scroll-triggered |
| 0 | Hero | 100vh | Geometric 3D image (hero-bg.jpeg) | Static |
| 1 | Testimonials | 894px | White | Click-driven carousel |
| 2 | Featured In | 591px | White | Hover (grayscale logos) |
| 3 | Perks | 998px | White | Static |
| 4 | Business Solutions (Pricing) | 1393px | Dark charcoal #38383b | Static |
| 5 | Av{ai}lable Solutions | 1338px | Light gray #dfe0e1 | Static |
| 6 | Solution Based Billing | 1192px | Dark charcoal #38383b | Static |
| 7 | Quote | 478px | Light gray #dfe0e1 | Static |
| 8 | Footer | 413px | Light gray #dfe0e1 | Static |

## Design Token Summary

### Colors
- `#ffffff` — white (testimonials, featured, perks sections)
- `#dfe0e1` — light gray (solutions, quote, footer sections)
- `#38383b` — dark charcoal (pricing, billing sections)
- `#c7c2bc` — cream (heading text in dark sections, primary button bg)
- `#f59e0b` — amber (accent: `{ai}` spans, stars, active dots)
- `#1d1d1f` — near-black (primary text)
- `#6b7280` — medium gray (secondary text)
- `#7a7a78` — muted gray (solutions heading color)
- `rgba(0,0,0,0.38)` — outline button border

### Fonts
- **Headings**: adonis-web (Squarespace proprietary) → substituted with Playfair Display
- **Body**: Pontano Sans (Google Fonts)

### Button Style
- Shape: `border-radius: 16px 0px 16px 0px` (top-left + bottom-right rounded)
- Text: uppercase, letter-spacing 0.1em, ~13px
- Primary: bg #c7c2bc, black text
- Dark: bg #38383b, cream text
- Outline: transparent, 2px solid rgba(0,0,0,0.38)

### Logo
- Image: `/images/logo-arrow.png` (2500×3750 WebP, renamed PNG)
- Arrow/angular mark in dark gray lines
- Used in header center (60px height)
