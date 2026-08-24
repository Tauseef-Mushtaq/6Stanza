# MODULE-SEO-7-HANDOFF

Local SEO & Local Search Presence.

## A. What was inspected

- All six prior SEO handoffs (`MODULE-SEO-1` through `-6`) and
  `docs/seo/keyword-map.md`, `content-roadmap.md`, `search-console.md`,
  `performance.md`, `performance-checklist.md`.
- `src/config/site.ts`, `src/config/routes.ts`.
- `src/app/(site)/contact/page.tsx`,
  `src/features/contact/sections/ContactDetails.tsx`.
- `src/components/layout/Footer.tsx`.
- `src/features/about/sections/Direction.tsx` (the site's only
  geographic-positioning copy).
- `src/lib/seo/structuredData.ts` (SEO-3's existing schema layer).
- `src/components/ui/FaqChatbot.tsx` (checked for any geographic
  claims in its canned answers — found two, both already
  correctly hedged: Pakistan-based, expansion "ambition," no claim of
  current offices elsewhere).
- Full-repo grep for `address`, `Mardan`, `Peshawar`, `Islamabad`,
  `Lahore`, `Karachi`, `Pakistan`, `geo`, `latitude`/`longitude` across
  `src/`.
- Current Google Business Profile eligibility requirements (web
  research, 2026 sources).

## B. Business/local eligibility

No physical address, office, storefront, verified Google Business
Profile, service area, review, local award, or certification is
established anywhere in the codebase. Per this module's own rule,
none was invented. The one real, verified geographic fact is
country-level: the About page's own copy states 6STANZA is
Pakistan-based, and SEO-2 already encoded that into service page
titles. See `docs/seo/local-seo-roadmap.md` for the full reasoning.

**Flag for the project owner, not resolved in this module:**
`docs/seo/keyword-map.md`'s SEO-2-era "Brand keywords" table includes
a `6STANZA Mardan` navigational row with no supporting fact anywhere
else in the codebase. Per this module's scope ("Do NOT rewrite the
existing keyword map"), it was left untouched, but flagged in both
`docs/seo/local-seo-roadmap.md` and the new SEO-7 section appended to
`keyword-map.md` itself, recommending it be sourced or removed.

## C. Geographic strategy

National (Pakistan) only — already implemented by SEO-2, confirmed
and left unchanged. Regional/city/international all remain
unimplemented, matching SEO-2's own prior research (real local
commercial volume found concentrated in Lahore/Karachi/Islamabad, not
in Mardan; international is stated ambition, not current operation).
No doorway pages were created.

## D. Local search research

Live web research (2026) on Google Business Profile eligibility
confirms: GBP requires real in-person customer contact (storefront or
service-area business that physically visits customers); "online-only
businesses... no in-person customer contact" are explicitly excluded.
No search-volume/difficulty/ranking tool was available in this
environment — every such figure in the deliverables is marked "Not
verified," none invented, matching the existing SEO-2 convention.

## E. Google Business Profile status

**Not verified — likely not currently eligible**, based on the
evidence this codebase provides (no address, no confirmed in-person
customer contact, no defined service area). Documented conditionally
in `docs/seo/local-seo-roadmap.md` — what the setup *would* look like
if the business owner independently confirms eligibility — without
claiming a profile exists or was created. None was created or
modified from this environment.

## F. NAP audit

- **Name**: verified (`siteConfig.name`, `siteConfig.legalName`).
- **Address**: not established anywhere — documented as such, not
  invented.
- **Phone**: no landline/office number exists; WhatsApp Business
  number (`923288553087`) is real, centralized in one config value,
  and used consistently across every entry point (floating button,
  header, footer, contact page) — no inconsistency found.
- **Email**: not established anywhere.
- **Website**: verified (`siteConfig.url`), used consistently
  throughout the existing SEO-1/SEO-3 metadata system.

Full detail in `docs/seo/local-seo-roadmap.md` §NAP audit.

## G. Local schema decision

**No LocalBusiness (or subtype) schema was implemented** — preserves
SEO-3's existing, deliberate principle exactly; no address or service
area exists with enough confidence to publish as structured fact.

**One narrow addition was made:** `areaServed: "Pakistan"` on the
existing `organizationSchema()` in `src/lib/seo/structuredData.ts`.
This restates a fact the site's own visible copy and SEO-2's own
title changes already assert — it does not introduce a new claim, a
street address, opening hours, or any LocalBusiness-specific
assertion. `Organization` (not `LocalBusiness`) remains the schema
type. No `Organization` schema was duplicated — the existing single
instance in `structuredData.ts`, rendered once via `siteGraph()` in
the root layout, was edited in place.

## H. Contact-page changes

None. `/contact` already correctly presents only real information
(project-intake form, WhatsApp link) with a plain `WebPage` schema —
already matches this module's guidance exactly.

## I. Footer/sitewide changes

None. No geographic keyword stuffing existed or was added.

## J. Local content strategy

Appended a new "SEO-7 — Local/national content opportunities" section
to `docs/seo/content-roadmap.md` (P2/P3 only, all national-Pakistan
level, no city-specific topic). The existing file's prior content was
not rewritten, matching module scope.

## K. Local keyword-map changes

Appended a new "SEO-7 — Local SEO" section to `docs/seo/keyword-map.md`
with a query/geography/intent/priority/evidence table, plus the
`6STANZA Mardan` discrepancy flag (§B above). The existing file's
prior content was not rewritten.

## L. Citation strategy

New file: `docs/seo/local-citations.md`. Seven researched categories
(Google Business Profile — conditional; Clutch; TechBehemoths;
GoodFirms; P@SHA; LinkedIn Company Page; Crunchbase), each marked
`Not verified`/opportunity-only — none claimed as an existing listing.
No spam directories or link farms included.

## M. Review strategy

No review/testimonial infrastructure exists in the codebase. No
`aggregateRating`/`Review` structured data was added — SEO-3's
existing avoidance of this was preserved. Documented as a future
module's scope if 6STANZA ever builds real review infrastructure.

## N. Internal linking

Unchanged — no new local page exists to link, so no new internal
linking path was created. SEO-4/SEO-5's existing content graph
(Insight → Service → Project → Start Project) was not touched.

## O. Files changed

```text
src/lib/seo/structuredData.ts   (added areaServed: "Pakistan" to organizationSchema())
docs/seo/keyword-map.md          (appended SEO-7 section only — existing content untouched)
docs/seo/content-roadmap.md      (appended SEO-7 section only — existing content untouched)
```

## P. Files added

```text
docs/seo/local-seo-roadmap.md
docs/seo/local-citations.md
MODULE-SEO-7-HANDOFF.md
```

## Q. Verification

```text
Toolchain verification: Not verified — npm registry unreachable in
  this sandbox (same 403 as SEO-6); npm install, lint, tsc, build,
  and dev server could not run.
Live verification (GBP existence, Maps listing, local rankings,
  local-pack position, reviews, citations, DNS verification, NAP
  consistency across external directories, Google indexing):
  Not verified — none of these were claimed.
```

Code-level checks performed by direct file reading:
- `organizationSchema()` still returns a single `Organization` object
  (no duplicate schema introduced); `siteGraph()` still renders it
  exactly once via the root layout, unchanged from SEO-3.
- No `LocalBusiness` type, `PostalAddress`, `GeoCoordinates`,
  `openingHoursSpecification`, `aggregateRating`, or `Review` was
  introduced anywhere.
- `/contact` page's schema (`webPageSchema` + `breadcrumbSchema`)
  unchanged.
- No canonical, robots, or sitemap file was touched.
- No new route was created (no doorway pages).

## R. Known limitations

- No build tooling available in this environment — the one code
  change (`areaServed` field) was not verified against an actual
  `next build`/schema-validator run. Recommend running Google's Rich
  Results Test against the live `/` page's JSON-LD once a deployment
  exists, to confirm the added field validates cleanly.
- Google Business Profile eligibility research is current as of this
  module's search (2026 sources) but was not cross-checked against
  6STANZA's actual real-world operating details, which this
  environment has no access to — final eligibility can only be
  confirmed by the business owner.

## S. Deferred opportunities

- City-level landing pages (any city).
- LocalBusiness/subtype schema.
- Google Maps embed.
- Google Business Profile creation.
- International (Saudi Arabia/UAE) local SEO.
- Review/testimonial structured data.
- hreflang / country-specific duplicate pages.
- Resolving the `6STANZA Mardan` keyword-map discrepancy (owner
  decision, not a coding task).

Full detail in `docs/seo/local-seo-roadmap.md`.

## T. SEO-8 recommendations

SEO-8 is the Final SEO Audit per the roadmap. Recommend it:
- Re-verify `organizationSchema()`'s new `areaServed` field renders
  correctly and validates once a real build/deployment is available
  (flagged as unverified in this module — see §R).
- Treat this module's local-SEO footprint as intentionally small when
  auditing "completeness" — a minimal, accurate footprint is the
  correct SEO-7 outcome per that module's own final principle, not a
  gap to fill retroactively with invented local signals.
- Confirm no SEO-1 through SEO-7 regression across canonical, robots,
  sitemap, and all structured data types, per SEO-7's own §31.
