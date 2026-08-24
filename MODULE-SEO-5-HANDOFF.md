# MODULE-SEO-5-HANDOFF.md

## SEO-5 — Search Console, Measurement & SEO Monitoring

Scope: build the measurement/monitoring foundation (Search Console
readiness, reporting framework, indexing workflow) and, as a
companion task, the reverse of SEO-4's Insight → Service link
(Service → Related Insights). No rebuild of SEO-1/2/3/4.

---

## A. What was inspected

Read first, as required: `MODULE-SEO-1/2/3/4-HANDOFF.md`,
`docs/seo/keyword-map.md`, `docs/seo/content-roadmap.md`. Then
inspected directly (not assumed):

- `src/app/sitemap.ts`, `src/app/robots.ts` — sitemap/robots
  implementation.
- `src/lib/seo/canonical.ts`, `src/lib/seo/structuredData.ts` —
  canonical/JSON-LD layer.
- `src/config/site.ts`, `src/config/routes.ts` — production domain
  and route source of truth.
- Every public route under `src/app/(site)/` and `src/app/admin/`.
- `.env.local` (redacted before reading further) and every
  `NEXT_PUBLIC_*` usage in `src` — found `NEXT_PUBLIC_SITE_URL` used
  by `authService.ts` for auth redirect URLs, with a `localhost:3000`
  fallback. This is **separate** from `siteConfig.url`
  (`https://6stanza.com`, hardcoded), which is what canonical/
  sitemap/robots/OG actually use. Not changed — `siteConfig.url` is
  SEO-1's deliberate choice (documented there: "never the demo Vercel
  domain"), and unifying the two was not clearly required for SEO-5,
  so it's logged as an observation, not touched (spec §32: only make
  code changes genuinely necessary for this module).
- Searched the codebase for any existing analytics/tracking/consent
  code (`gtag`, `GTM-`, `G-`, `google-analytics`, `consent`,
  `cookie`) — found none beyond Supabase's own session cookies
  (unrelated to analytics).
- `src/app/(site)/services/[slug]/page.tsx` and
  `src/features/services/data/publicServices.ts` — for the
  Service → Related Insights companion task.

---

## B. Search Console readiness

Full detail in `docs/seo/search-console.md`. Summary:

- Production domain **code-verified** as `https://6stanza.com`
  (`siteConfig.url`), used consistently everywhere it matters.
- Whether that domain is actually live, DNS-controlled by someone
  with Search Console access, or deployed at all — **not verified**,
  no access to any of that from this environment.
- Recommended property type: **Domain property** if DNS access is
  available, **URL-prefix property** as fallback. Exact manual steps
  for both are documented in `docs/seo/search-console.md`.

---

## C. Sitemap status

Code-verified, single implementation (`src/app/sitemap.ts`), no
duplication created. Live-fetches published services/projects/
insights via the same RLS-scoped reads the real pages use, so
draft/archived content structurally cannot appear. No admin/auth
routes included. Live HTTP accessibility of `/sitemap.xml` in
production — **not verified**. No changes made; it was already
correct.

## D. Robots status

Code-verified, single implementation (`src/app/robots.ts`). Correct
disallow list, correct `sitemap:` declaration built from the same
`siteConfig.url`, no asset blocking. Live accessibility — **not
verified**. No changes made.

## E. Canonical status

Code-verified across every public template — every canonical resolves
through `absoluteUrl()` against `siteConfig.url`; no localhost, no
`*.vercel.app`, no missing or duplicate canonicals found on any
indexable route. Whether production HTML actually renders these as
expected — **not verified**, requires a live fetch.

## F. Indexability status

Full route-by-route classification (INDEX / NOINDEX / N/A) is in
`docs/seo/search-console.md`. Matches SEO-1's original audit exactly
— no route added or reclassified since, confirmed by re-inspecting
every route directory this module.

---

## G. Search Console setup

Cannot be completed from this environment — no DNS access, no
deployment access, no Google account access. Documented as an exact
manual procedure (domain-property TXT record, or URL-prefix HTML
file/meta tag/GA verification) in `docs/seo/search-console.md`
"Property" section. **Search Console verification: Not available in
this environment.**

---

## H. Live verification status

```text
Production domain live at https://6stanza.com: Not verified
Search Console property created: Not verified
Search Console verification completed: Not verified
Live sitemap.xml HTTP accessibility: Not verified
Live robots.txt HTTP accessibility: Not verified
Google indexing status (any URL): Not verified
Search impressions/clicks/CTR/position: Not available (no data source)
Core Web Vitals / CrUX data: Not available (requires production traffic)
```

No number, status, or claim in this list was fabricated or estimated
— each is either a direct fact from the codebase (marked
code-verified elsewhere in this handoff) or explicitly marked not
verified.

---

## I. Measurement framework

Documented in `docs/seo/search-console.md`: the Performance report
breakdown (queries/pages/countries/devices/search appearance), the
index-coverage classification table with a recommended action per
status, and the SEO opportunity framework:

- **Opportunity A** — high impressions / low CTR → title/description/
  intent-alignment review.
- **Opportunity B** — near page 1 → content depth, internal links,
  topical coverage.
- **Opportunity C** — high CTR / low impressions → build supporting
  content and internal links to grow visibility.
- **Opportunity D** — high impressions / high CTR → study what's
  working (topic, title pattern, format), don't copy mechanically.

None of these have been applied to real data yet — no data exists.
The framework is ready for the first real reporting period.

---

## J. Reporting framework

`docs/seo/seo-report-template.md` — a repeatable, dated report
structure (period, organic performance, top queries/pages, gains/
declines, indexing issues, search appearance, Core Web Vitals status,
content opportunities cross-referenced against the content roadmap,
recommended + completed actions). Ships empty; explicitly instructs
against pre-filled example numbers.

Monitoring cadence (spec §14):

**Weekly** — indexing errors, newly discovered pages, major ranking
swings, unusual traffic changes.

**Monthly** — full report via `seo-report-template.md`: clicks,
impressions, CTR, average position, top queries, top landing pages,
content opportunities, declining pages.

**Quarterly** — content refresh candidates, keyword strategy
revisions, topic-cluster gaps (cross-check against
`docs/seo/content-roadmap.md`), service/content relationship health
(are `related_service_slug` links still accurate as services/articles
change), technical SEO review (re-run the sitemap/robots/canonical
checks in `docs/seo/search-console.md`).

---

## K. Content measurement workflow

"Content ↔ Search Console loop" in `docs/seo/search-console.md`
connects `docs/seo/content-roadmap.md` to real query data once
available: published article → Search Console Pages/Queries for that
URL → compare against `keyword-map.md`'s planned keywords → where
real queries diverge, that's a genuine signal for a content update or
a new P2/P3 backlog entry. No queries were invented to pre-populate
this — it's a documented process, run for real once data exists.

`docs/seo/keyword-map.md` was **not replaced** — a short "SEO-5
addendum" section was added (plan vs. reality comparison guidance)
and one stale line was corrected (it referenced an old module
numbering where "Local SEO" was "SEO-5" — now SEO-7 per the current
roadmap in this module's brief). Everything else in that file is
unchanged.

---

## L. Conversion measurement readiness

Inspected the real conversion paths: `/start-project`, `/contact`,
each service page's `ServiceFinalCta`, and each insight's
`RelatedServiceCTA` (SEO-4). No analytics/event-tracking system
exists currently (confirmed by codebase search — see "What was
inspected"), so no conversion funnel can be measured today.

**Not implemented this module** — spec §18 explicitly says not to
build a complex conversion system unless the architecture cleanly
supports it, and adding analytics infrastructure without a decision
on *which* provider and *what* consent requirements apply would be
scope creep beyond "document what's needed."

**Recommended future events**, if/when an analytics provider is
added:

| Event | Fires on |
|---|---|
| `service_view` | Service detail page render (already trackable by URL alone via Search Console/analytics pageviews — a named event isn't strictly required) |
| `insight_view` | Insight detail page render |
| `related_service_click` | Click on SEO-4/5's `RelatedServiceCTA` (Insight → Service) |
| `related_insight_click` | Click on this module's `RelatedInsights` (Service → Insight) |
| `start_project_cta_click` | Click on any `ctaRoute`/"Start a Project" link, tagged with its source page |
| `start_project_submitted` | Successful submission on `/start-project` |
| `contact_submitted` | Successful submission on `/contact` |

This funnel — organic visitor → landing page → service/insight →
CTA → Start Project/Contact — matches spec §18's target shape exactly
and is achievable with the existing route structure once an analytics
provider exists; nothing about the current architecture blocks it.

---

## M. Service → Related Insights

Implemented, per spec §23, using the **existing** real relationship
from SEO-4 (`insights.related_service_slug`) rather than a new schema:

- **New**: `src/features/services/sections/RelatedInsights.tsx` — a
  server component that reads `getPublicInsightRows()` (already
  request-memoized, already used elsewhere), filters to published
  insights whose `related_service_slug` matches the current service,
  caps at 3, and renders real, crawlable `<Link href="/insights/...">`
  cards. Renders nothing (graceful empty state) when no article
  currently points at that service.
- **Changed**: `src/app/(site)/services/[slug]/page.tsx` — renders
  `<RelatedInsights serviceSlug={service.slug} />` between
  `ServiceWhy6Stanza` and `ServiceFinalCta`.
- No new database column, no new admin field, no duplicate CMS
  concept — this reuses SEO-4's column in the opposite direction.
  Internal-linking graph is now genuinely bidirectional:

```text
Insight → Service (SEO-4, RelatedServiceCTA)
Service → Related Insights (SEO-5, RelatedInsights)
```

Completing the graph spec §24 describes:
`Insight → Service → Related Insights → Project → Start Project`
(the `→ Project` and `→ Start Project` links already existed via
`ServiceFinalCta` and the services/projects pages themselves).

Currently, only the 5 SEO-4 articles have a `related_service_slug`
set, so today only `/services/web-development`, `/services/devops`,
`/services/cloud-computing`, `/services/cyber-security`, and
`/services/seo` will show a Related Insights section; the other 3
service pages (networking, marketing, video-editing) correctly show
nothing, since no article currently relates to them — not a bug, not
faked.

---

## N. Files changed

- `docs/seo/keyword-map.md` — one stale module-numbering line
  corrected, one addendum section added (no content rewritten).
- `docs/seo/content-roadmap.md` — one addendum section added.
- `src/app/(site)/services/[slug]/page.tsx` — added `RelatedInsights`
  import + render.

## O. Files added

- `docs/seo/search-console.md`
- `docs/seo/seo-report-template.md`
- `src/features/services/sections/RelatedInsights.tsx`
- `MODULE-SEO-5-HANDOFF.md` (this file)

---

## P. Verification results

Per spec §3, SEO-4's unverified state was checked first:

```bash
npm install
```

**Result: failed.** `npm error code E403` /
`403 Forbidden - GET https://registry.npmjs.org/...` for every
package. Confirmed this is an environment network-policy block, not
a transient/package-specific issue:

```bash
curl -sI https://registry.npmjs.org/zustand
# HTTP/2 403, x-deny-reason: host_not_allowed
```

The egress proxy in this sandbox denies `registry.npmjs.org` outright
(`x-deny-reason: host_not_allowed`). This is identical to the
limitation SEO-4 already hit — **not a regression, not new** — this
session simply confirmed it directly with a raw request rather than
inferring it from a failed install. `node_modules` remains empty (0
packages). `npm run lint`, `npx tsc --noEmit`, `npm run build`, and
`npm run dev` (spec §35) **could not be run** as a direct consequence
— none of the four commands were skipped by choice; each requires a
populated `node_modules`.

What was verified without a toolchain:
- Every new/edited file was read back in full.
- Brace/paren balance was checked programmatically for the two files
  with the most structural risk (`page.tsx`, `RelatedInsights.tsx`).
- Import paths (`@/components/ui/TechnicalLabel`, `@/components/ui/
  Container`, `@/components/motion`, `@/features/insights/data/
  publicInsights`) were confirmed to exist on disk at those exact
  paths.
- Field-name consistency for `related_service_slug` was re-confirmed
  by re-reading `database.types.ts`, `InsightRow`, and
  `getPublicInsightRows()` — `RelatedInsights.tsx` reads
  `insight.category`, `insight.title`, `insight.slug` directly off
  the raw `InsightRow` (not the mapped `Insight` type), matching the
  actual column names in `database.types.ts`.

**Must be run before this ships**, in an environment with registry
access:
```bash
npm install
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```
Then verify `/`, `/services`, `/insights`, `/sitemap.xml`,
`/robots.txt`, a representative `/services/<slug>` (one of
web-development/devops/cloud-computing/cyber-security/seo, to see the
new Related Insights section render; one of
networking/marketing/video-editing, to confirm the graceful empty
state), and all 5 SEO-4 `/insights/<slug>` pages.

---

## Q. Known limitations

- Nothing in this module's live-data sections (Search Console
  property, indexing status, performance numbers, Core Web Vitals) is
  verified — all require account/DNS/production access this
  environment doesn't have. Documented, not worked around.
- `npm install`/`lint`/`tsc`/`build`/`dev` did not run this session —
  same blocker as SEO-4, now root-caused to the registry being denied
  by the sandbox's egress policy rather than a transient issue.
- `NEXT_PUBLIC_SITE_URL` (used by auth) and `siteConfig.url` (used by
  everything SEO-related) are two different sources of truth for "the
  site's URL." Not unified this module — flagged as worth a future
  look, not touched now since it wasn't clearly in SEO-5's scope and
  the SEO-facing one (`siteConfig.url`) is confirmed correct.
- No analytics/conversion tracking exists — documented as a
  recommendation (section L), not implemented, per spec §18's
  guidance not to over-build this.
- `RelatedInsights` only has content to show for 5 of 8 services
  today (the 5 with a SEO-4 article pointing at them) — expected, not
  a defect; will fill in as the P2/P3 content roadmap is executed.

## R. Manual production steps

For the site owner, in order:

1. Confirm `https://6stanza.com` is the live, deployed production
   domain (or update `siteConfig.url` first if it's actually
   something else — check with whoever controls deployment/DNS).
2. Search Console → Add property → Domain (`6stanza.com`) if DNS
   access exists; otherwise URL-prefix (`https://6stanza.com`). Full
   steps in `docs/seo/search-console.md` "Property."
3. Complete verification (DNS TXT record, or HTML file/meta tag/GA).
4. Search Console → Sitemaps → submit `https://6stanza.com/sitemap.xml`.
5. Run URL Inspection on the priority list in
   `docs/seo/search-console.md` ("URL Inspection priority order"),
   starting with the homepage.
6. Wait for Search Console to accumulate Performance data (days to a
   couple of weeks), then run the first real report using
   `docs/seo/seo-report-template.md`.
7. In a real dev environment with registry access: run
   `npm install && npm run lint && npx tsc --noEmit && npm run build`
   to actually verify SEO-4 and SEO-5's code changes before deploying
   them.

---

## S. SEO-6 recommendations

Proceed to **SEO-6 — Performance / Core Web Vitals** as already
planned in the roadmap this module inherited. SEO-5 deliberately did
not touch LCP/INP/CLS, images, fonts, bundle size, or caching — that
is SEO-6's full scope, and this module's Core Web Vitals section in
`docs/seo/search-console.md` only documents *where* that data will
eventually be visible, not what to do about it.

One additional, smaller item worth folding into SEO-6 or SEO-8: once
`npm install` succeeds in a real environment, actually run the SEO-4
+ SEO-5 verification suite (`lint`/`tsc`/`build`) and record real
results in a follow-up note — both modules currently carry an
"unverified by toolchain" flag that only a working `node_modules` can
clear.
