# Design inspiration — member-site enhancements (saved 2026-06-09)

Source: https://www.relevantlaw.com/plans?location=colorado-colorado-springs
(Client-rendered React page — needs a live browser inspection / screenshots to capture exact tokens before cloning.)

Two elements Zachariah wants to adapt for the Available Law member experience:

## 1. Credit-card-style membership card
A physical-card metaphor for a member's plan. Target spec for our build:
- Card aspect ratio (~1.586:1, real credit-card proportions), rounded corners, subtle gradient + soft shadow.
- Tier-driven styling: Build / Grow / Lead each get a distinct gradient or finish (e.g. Lead = darkest/“metal”), so the card visually signals status.
- Shows: member name, tier label, "Member since" date, a member ID, the Av{ai}lable Law wordmark/seal (mind the {ai} brace rule — only braces are #C17832), and maybe a chip motif.
- Lives on **My Account** (`/dashboard/account`) and could also render as the hero of the member dashboard.
- Pull from `members` (full_name, subscription_tier, created_at, id).

## 2. "Member experience" section with a demo dashboard
A marketing-side preview that shows prospects what the logged-in member dashboard looks like, on the pricing/plans page:
- A framed, non-interactive (or lightly animated) mock of the real dashboard — stat cards (plan, attorney work this month, conversations, documents), quick actions, recent activity.
- Reuse the real dashboard components with seeded demo data so it stays in sync with the actual product.
- Goal: build trust / reduce signup friction by showing the post-purchase experience up front.
- Place on `/checkout/[tier]` and/or a new `/plans` or homepage `#pricing` adjacent section.

## Build notes
- Both are additive UI; no backend changes needed (card reads existing member fields; demo uses seeded data).
- When building, do a live inspect of the source page (Chrome MCP screenshot) to match spacing/gradient feel, then adapt to the Available Law warm palette (#1F1810 / #C17832 / #7A8B6F / #FAF8F5).
