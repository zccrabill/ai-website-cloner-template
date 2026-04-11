# Google Business Profile Setup — Available Law

**Status:** not yet created
**Owner:** Zachariah Crabill
**Estimated time:** 20 minutes to submit, 3–14 days for Google verification
**Why this matters:** Maps placement, Google review collection, "local pack" appearances for "Colorado AI attorney" and similar queries, and rich-result eligibility that feeds the Knowledge Graph (which ChatGPT, Claude, and Perplexity all pull from).

---

## The virtual-firm situation

Available Law is a **service-area business (SAB)**. Google explicitly supports this model — you do not need a storefront, and you can (and should) hide your street address from the public listing. Lawyers, plumbers, consultants, and home-based businesses all use this pattern.

The key setting is "I deliver goods and services to my customers at their location." Select that during setup and Google will prompt you to define a service area instead of a storefront.

## Step-by-step

### 1. Pre-work (do this before you start the form)
- Confirm business name: **Available Law, LLC**
- Confirm primary category: **Attorney** (exact match — not "Lawyer" or "Law Firm")
- Secondary categories to add later: **Legal Services, Business to Business Service, Corporate Office**
- Service area: **State of Colorado** (you can list the whole state for a virtual SAB)
- Phone: a dedicated business line Google can call for verification. If you only have a cell, use it — it is fine for a solo/virtual firm. A Google Voice number works but sometimes flags verification.
- Website URL: `https://availablelaw.com`
- Hours: real business hours (not 24/7 — Google penalizes implausible hours)
- Description (750 char max): draft below

### 2. Create the profile
1. Go to `https://business.google.com/create`
2. Sign in with the Google account you want to own this profile. **Important:** use an account that will persist — `zachariah@availablelaw.com` via Google Workspace is ideal. Avoid a personal gmail.
3. Enter business name: `Available Law`
4. Choose business type: **Service business**
5. When asked "Do you want to add a location customers can visit?" → **No**
6. Set service area: **Colorado** (add "Denver," "Boulder," "Colorado Springs," "Fort Collins," and "Aurora" as additional specific areas — this boosts local pack visibility for those city-level searches)
7. Primary category: **Attorney**
8. Contact info: phone + website
9. Address for verification: your real mailing address. **Hide it** on the public listing (checkbox labeled "I don't serve customers at my business address").

### 3. Verification
Google will offer one or more of: postcard mail, phone call, email, or video. For attorneys and home-based SABs, **video verification** is now the fastest path — they'll ask you to walk through a live video call showing signage, a physical office or workspace, and proof that you operate the business (bar card, LLC registration, etc.).

Have ready on the video call:
- Colorado Bar Association card
- Colorado LLC registration for Available Law, LLC
- A laptop or monitor showing availablelaw.com
- The Available Law logo printed or visible on screen (Google has accepted digital-only signage for virtual firms since mid-2025)

### 4. Complete the profile immediately after verification
This is the step most people skip and it is where the ranking juice comes from.

**Business description (paste this, edit as needed):**

> Available Law is a Colorado-based virtual law firm helping small and mid-sized businesses navigate AI compliance, technology contracts, and the Colorado AI Act. Founded by attorney Zachariah Crabill, we pair licensed Colorado attorneys with Allora — our AI legal assistant — to deliver transparent, flat-rate legal help from anywhere in the state. We also offer FAIIR certification, a framework for auditing how businesses use artificial intelligence for fairness, accountability, and compliance. Every matter is attorney-reviewed before it reaches the client. No hourly billing, no surprises, no gatekeeping.

**Services to add** (each one is its own searchable entity):
- AI Act Compliance Review
- AI Vendor Contract Review
- Business Formation
- Technology Contract Drafting
- FAIIR AI Certification
- Employment Contract Review
- Trademark Registration
- Legal Consultation (30 minutes)
- Attorney Document Review
- Startup Legal Setup

For each service add a short description (Google allows 300 chars) and a price or "starting at" where possible. Priced services outrank unpriced ones in comparison queries.

**Attributes to enable:**
- Online appointments: Yes
- Online consultations: Yes
- LGBTQ+ friendly: Yes (if applicable)
- Identifies as veteran-owned / woman-owned / etc.: if applicable
- Accessible: Yes (virtual is inherently accessible)

**Photos to upload** (minimum 5, ideally 10+):
- Logo (square, 1080x1080, transparent background version preferred)
- Cover photo (1080x608 — use the hero image from availablelaw.com or a custom graphic)
- Team photo — real photo of Zachariah, professional but approachable
- Product/service graphics — screenshots of the Allora interface (blurred client data), FAIIR badge, the Available Law dashboard
- Office / workspace — even a clean desk shot adds trust

### 5. Connect to Search Console + Analytics
After verification:
1. Verify `availablelaw.com` in Google Search Console (DNS TXT record or HTML file in `public/`)
2. Link Search Console to Google Business Profile
3. Submit the sitemap we're generating (`/sitemap.xml`)
4. Set up Google Analytics 4 and link it to GBP

### 6. First-week actions after going live

1. **Ask 3 people for reviews.** Friends, former clients, beta testers. Google reviews are the #1 local ranking factor. Getting from 0 to 3 reviews in the first week triples your local pack odds. Always reply to reviews within 24 hours.
2. **Create your first Google Post.** GBP has a built-in mini-blog. Post a short update about the CO AI Act or a recent FAIIR engagement. Posts expire after 7 days so schedule one weekly.
3. **Add Q&A.** You can pre-seed your own Q&A on your profile. Add at least 5 common questions (pricing, service area, what's the AI Act, do you take contingency cases, how does FAIIR work). Answer them yourself.
4. **Enable messaging.** Let prospects text you from the profile. Set an auto-reply with a CTA to book a 30-min consultation.

### 7. Red flags that get profiles suspended
Avoid these or you'll lose the listing:
- Keyword-stuffing the business name ("Available Law — Colorado AI Attorney Firm") — **don't do this.** Use the legal entity name only.
- Listing multiple categories that aren't accurate
- Fake reviews — never buy reviews
- Pretending to have a physical office when you don't
- Hours that don't match what you actually answer the phone

## Ongoing maintenance (15 min / week)
- Weekly Google Post
- Reply to every review within 24 hours
- Update the "services" list whenever you add a new offering
- Upload 1 new photo per month
- Once per quarter, refresh the business description to mention the latest regulatory news (GBP rewards freshness)

## How this plugs into the rest of the SEO strategy
GBP is one of three entity signals LLMs use to verify "who is Available Law":
1. **Google Business Profile** (this doc)
2. **Website JSON-LD schema** (being added now — Organization + LegalService + Attorney)
3. **Off-site mentions** (Crunchbase, LinkedIn Company Page, Clutch, CO Bar directory)

All three must say the same thing — same name, same address (or service area), same phone, same description. This is called **NAP consistency** and it's what tells Google (and Bing, and Perplexity) that the entity is real.

Next action: after GBP is submitted for verification, create the LinkedIn Company Page and Crunchbase profile using the exact same business description above.
