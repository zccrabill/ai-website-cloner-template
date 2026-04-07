# Behaviors — availablelaw.com

## Header Scroll Behavior
- **Trigger:** scroll > 50px
- **State A (top):** background transparent, logo/nav/text visible over hero image
- **State B (scrolled):** background white, box-shadow subtle
- **Transition:** `transition-all duration-300`
- **Implementation:** `useEffect` + `scroll` event listener, `useState(scrolled)`

## Testimonials Carousel
- **Interaction model:** Click-driven (← → arrows + 8 dot indicators)
- **Cards:** 8 total, one visible at a time
- **Mechanism:** CSS `transform: translateX(-index * 100%)` on carousel track
- **Track width:** Matches carousel wrapper (overflow: hidden)
- **Arrows:** ← wraps to last, → wraps to first
- **Dots:** Active dot in amber (#f59e0b), inactive in gray outline

## Featured In Logos
- **Interaction:** Hover reveals color (grayscale → full color)
- **Implementation:** `onMouseEnter/Leave` toggle `filter: grayscale()`
- **Default state:** `filter: grayscale(1)`, `opacity: 0.7`
- **Hover state:** `filter: grayscale(0)`, `opacity: 1`

## No Scroll-Driven Animations
- No IntersectionObserver fade-ins on scroll
- No Lenis or smooth scroll library
- No scroll-snap
- No parallax

## Responsive
- Perks: 2-col desktop → 1-col mobile
- Pricing cards: 3-col desktop → 1-col mobile
- Solutions: 2-col desktop → 1-col mobile (text first, then image)
- Breakpoint: ~768px (md)
