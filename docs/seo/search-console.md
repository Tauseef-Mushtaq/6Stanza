# 6STANZA — Google Search Console (SEO-5)

This documents Search Console readiness, setup procedure, and the
ongoing monitoring workflow. It does not duplicate the underlying
sitemap/robots/canonical/schema implementations (SEO-1/SEO-3) — it
documents how to use them with Search Console.

**No Search Console account, DNS access, or production deployment was
available in this environment.** Every claim below is labeled
**Verified**, **Code-verified**, or **Not verified** per the module
rule — nothing about live indexing, impressions, clicks, or rankings
is asserted without a real source.

---

## Property

| Field | Status |
|---|---|
| Production domain | `https://6stanza.com` — **Code-verified** (`src/config/site.ts` `siteConfig.url`, used consistently by `absoluteUrl()`, the sitemap, robots.txt, and every canonical/OG URL in the codebase) |
| Actually deployed at that domain | **Not verified** — no access to DNS records, hosting/deployment dashboard, or a live HTTP request to `https://6stanza.com` from this environment |
| Search Console property created | **Not verified** |
| Search Console verification completed | **Not verified** |

### Recommended property type

**Domain property** (covers `http://`, `https://`, `www` and non-`www`
variants, and all subdomains under one property) — appropriate once
DNS access for `6stanza.com` is available. A **URL-prefix property**
(`https://6stanza.com`) is the fallback if DNS-level verification
isn't an option (e.g. DNS is managed by someone without Search Console
access) — it verifies via an HTML file, meta tag, or the existing
Google Analytics/Tag Manager account instead, at the cost of not
automatically covering `www`/non-`www`/`http` variants as one
property.

### Verification method (manual — requires DNS or hosting access this environment does not have)

**Domain property (recommended):**
1. Search Console → Add property → Domain → enter `6stanza.com`.
2. Google provides a TXT record value.
3. Add that TXT record at the DNS provider that manages `6stanza.com`.
4. Click Verify in Search Console once DNS has propagated (can take
   up to 24–48 hours).

**URL-prefix property (fallback):**
1. Search Console → Add property → URL prefix → `https://6stanza.com`.
2. Choose one: HTML file upload to the site root, HTML meta tag added
   to `<head>`, or verification via an already-verified Google
   Analytics/Tag Manager account on the same domain.
3. Click Verify.

Neither path can be completed from this environment — both require
either DNS access or a live deployment to upload/serve a verification
file, neither of which is available here.

---

## Sitemap

**Code-verified** (read directly, not assumed):

- Implementation: `src/app/sitemap.ts` — Next.js's file-based
  `MetadataRoute.Sitemap` convention, served at `/sitemap.xml`. One
  authoritative implementation; SEO-5 did not create a second one.
- Includes: all static top-level routes (`primaryNav` +
  `ctaRoute` from `src/config/routes.ts`) plus every currently
  **published** service, project, and insight, read live via
  `getPublicServices()` / `getPublicProjects()` / `getPublicInsights()`
  — the same request-time, RLS-scoped reads the actual pages use, so
  draft/archived CMS rows can never appear in the sitemap (enforced by
  Postgres RLS policy, not just application logic — see
  `insights_select_published` etc. in `supabase/migrations/0005_cms_content.sql`).
- Excludes: `/admin`, `/login`, `/signup`, `/account`,
  `/forgot-password`, `/reset-password`, `/design-system`, `/motion`
  — none of these are in `primaryNav`/`ctaRoute`, so none are ever
  added to the sitemap.
- No `lastModified` — deliberately omitted since no `updated_at` is
  exposed through the public data layer (documented already in
  SEO-1's handoff; SEO-5 did not change this).
- **Not verified**: actual HTTP accessibility of
  `https://6stanza.com/sitemap.xml`, whether it returns valid XML in
  production, and whether Google has successfully fetched it — all
  require a live deployment.

### Sitemap quality check (spec §29)

| Check | Result |
|---|---|
| Duplicate URLs | Code-verified: none — each route type is added exactly once, from one query each |
| Draft/unpublished content included | Code-verified: cannot happen — RLS restricts the public read to `status = 'published'` regardless of application code |
| Admin/auth URLs included | Code-verified: not present — not in `primaryNav`/`ctaRoute` |
| Redirects / 404s in the sitemap | Not verified — requires a live crawl |
| Invalid canonical targets | Not verified — requires a live crawl (see "Canonical status" below for the code-level check that was possible) |

---

## Robots.txt

**Code-verified**: `src/app/robots.ts`, served at `/robots.txt`. One
implementation; not duplicated.

- `allow: "/"` for all user agents, with an explicit `disallow` list:
  `/admin`, `/account`, `/login`, `/signup`, `/forgot-password`,
  `/reset-password`, `/auth/`, `/design-system`, `/motion`.
- Declares `sitemap: https://6stanza.com/sitemap.xml` (built from the
  same `siteConfig.url`, so it can't drift to a different domain than
  the sitemap actually serves from).
- No CSS/JS/asset paths are blocked.
- Every disallowed route also carries page-level `noindex, nofollow`
  metadata (SEO-1) — `robots.txt` disallow is the first line of
  defense, not the only one, matching the module's own guidance that
  `robots.txt` alone doesn't guarantee de-indexing.
- **Not verified**: live HTTP accessibility of
  `https://6stanza.com/robots.txt`.

No changes were made to `robots.ts` or `sitemap.ts` this module — both
were already correct on inspection.

---

## Indexing workflow (URL Inspection / Request Indexing)

Manual process, once a Search Console property exists:

```text
Publish article/service/project
      ↓
Confirm it appears at /sitemap.xml (redeploy or wait for next request-time render)
      ↓
Confirm the page's own canonical URL is correct (view page source or a
"View source" request — <link rel="canonical">)
      ↓
Search Console → URL Inspection → paste the full URL
      ↓
Read "Coverage" — Indexed / Not indexed / Crawled, not indexed / etc.
      ↓
If "Not indexed" and the page is genuinely ready to be public,
use "Request Indexing"
      ↓
Re-check after a few days — Google controls the actual timeline,
this is a request, not a guarantee
```

Do not request indexing for every URL reflexively (spec §28) — only
for pages that are new, were recently fixed, or show an unexpected
"Not indexed" status the site owner wants resolved sooner.

### URL Inspection priority order (spec §30)

1. Homepage (`/`)
2. `/services`
3. Each of the 8 service detail pages (`/services/<slug>`)
4. Important project detail pages (`/projects/<slug>`)
5. `/insights`
6. The five SEO-4 P1 articles:
   - `/insights/web-development-cost-in-pakistan`
   - `/insights/how-to-choose-a-devops-partner`
   - `/insights/what-cloud-migration-involves`
   - `/insights/what-application-security-covers`
   - `/insights/what-is-technical-seo`
7. Remaining published insights

---

## Index coverage classification (spec §28)

| Status | Meaning | Recommended action |
|---|---|---|
| Indexed | Google has crawled and indexed the URL | None — monitor performance |
| Not indexed — intentional | A `noindex` page (admin, auth, etc.) correctly excluded | None — this is correct behavior |
| Not indexed — investigate | A public, indexable page Google chose not to index | Check content quality/duplication, request indexing after fixing, not before |
| Discovered — not indexed | Google knows the URL exists but hasn't crawled it yet | Usually resolves on its own; request indexing if the page is a priority |
| Crawled — not indexed | Google crawled it but decided not to index it | Check for thin/duplicate content or a canonical pointing elsewhere |
| Duplicate | Google identified this as a duplicate of another URL | Verify the canonical tag points to the intended URL |
| Canonical issue | Google's chosen canonical differs from the declared one | Compare "Google-selected canonical" vs. "User-declared canonical" in URL Inspection; investigate why they disagree |
| Blocked | Blocked by `robots.txt` or a `noindex` directive | Confirm this is intentional (matches the "Indexability audit" table below) |
| Server error | The page returned a 4xx/5xx when Google requested it | Investigate immediately — this can affect the whole site's crawl budget |

This table is a reference for interpreting Search Console's Coverage
report once live data exists — none of these statuses have been
observed yet (**Not verified**, no Search Console access).

---

## Indexability audit (spec §7)

Every current public route, classified:

### INDEX

| Route | Notes |
|---|---|
| `/` | Homepage |
| `/about` | |
| `/services` | |
| `/services/<slug>` (×8, CMS-backed) | |
| `/projects` | |
| `/projects/<slug>` (CMS-backed) | |
| `/team` | |
| `/insights` | |
| `/insights/<slug>` (CMS-backed) | |
| `/contact` | |
| `/start-project` | |

### NOINDEX / RESTRICT

| Route | Mechanism |
|---|---|
| `/admin` and all `/admin/*` | `noindex, nofollow` metadata (Module 10G) + `robots.txt` disallow |
| `/account` | page-level `noindex` + `robots.txt` disallow |
| `/login`, `/signup`, `/forgot-password`, `/reset-password` | page-level `noindex` + `robots.txt` disallow |
| `/auth/*` | `robots.txt` disallow |
| `/design-system` | page-level `noindex` + `robots.txt` disallow |
| `/motion` | segment-level `noindex` (own `layout.tsx`) + `robots.txt` disallow |

### NOT APPLICABLE

| Route | Reason |
|---|---|
| `/sitemap.xml`, `/robots.txt` | Machine-readable files, not content pages |

This matches SEO-1's original audit with no drift found — no route
has been added or reclassified since.

---

## Canonical status (spec §6)

Code-verified for every public template (all read directly from the
files listed):

| Page | Canonical source | Result |
|---|---|---|
| Homepage | `src/app/(site)/page.tsx` metadata | `alternates.canonical: "/"` → resolves to `https://6stanza.com` |
| Static pages (about/services/projects/team/insights/contact/start-project) | Each page's `metadata` export | `alternates: { canonical: "<path>" }`, all via `absoluteUrl()` |
| `/services/[slug]` | `generateMetadata()` | `absoluteUrl(\`/services/${slug}\`)` |
| `/projects/[slug]` | `generateMetadata()` | Same pattern |
| `/insights/[slug]` | `generateMetadata()` | Same pattern |
| `/login` etc. | `noindex` — canonical not meaningful | N/A |

No localhost, `*.vercel.app`, or hardcoded-per-page domain was found
anywhere — every canonical resolves through the single
`absoluteUrl()` helper against `siteConfig.url`. No duplicate
canonicals, no missing canonicals on any indexable route. **Not
verified**: whether the deployed production HTML actually renders
these tags as expected (requires a live page fetch, not just source
inspection).

---

## Performance (clicks / impressions / CTR / average position)

Search Console's Performance report is the source for all of these —
none of it can be produced without a verified property and time for
Google to accumulate data (typically a few days minimum after
verification, often 1–2 weeks for a meaningful sample).

**Baseline: Not yet available.** See `docs/seo/seo-report-template.md`
for the exact reporting structure to fill in once a property is
verified and has collected data — no numbers should be entered there
until they come from a real Search Console export.

Break down by, once available:
- **Queries** — Performance → Search results → Queries tab
- **Pages** — Performance → Search results → Pages tab
- **Countries** — Performance → Search results → Countries tab (useful given 6STANZA's Pakistan focus + Saudi/UAE expansion ambition documented in `docs/seo/keyword-map.md`)
- **Devices** — Performance → Search results → Devices tab
- **Search appearance** — Performance → Search results → Search appearance tab (standard results vs. any rich-result types Google actually grants)

---

## Search appearance (spec §27)

Structured data (SEO-3: Organization, WebSite, Service, Article,
CreativeWork/Project, Breadcrumb) makes 6STANZA **eligible** for
enhanced search appearances (e.g. breadcrumb trails in results,
sitelinks) — it does not guarantee them. Whether any rich result
actually appears is entirely Google's decision and only observable in
Search Console's "Search appearance" filter once live. **Not
verified** — no claim is made here about which, if any, rich results
currently render.

---

## Core Web Vitals

Search Console reports Core Web Vitals (LCP, INP, CLS) under the
"Core Web Vitals" section, sourced from real Chrome User Experience
Report (CrUX) field data once the site has enough traffic to populate
it. This module only documents where to find that report — it does
**not** implement or optimize for Core Web Vitals; that is SEO-6's
explicit scope. **Not verified** — no CrUX data exists to report yet
without production traffic.

---

## Search Console vs. Analytics (spec §17)

| | Search Console | Analytics (not currently implemented — see below) |
|---|---|---|
| Measures | Google Search impressions, clicks, CTR, average position, queries, indexing status, Core Web Vitals (CrUX) | Sessions, users, on-site engagement, conversions, behavior after landing |
| Data source | Google's own search index/crawl | A tracking script running in the visitor's browser |
| Answers | "Did Google show us, and did people click?" | "What did people do once they arrived?" |

Both are needed for the full loop this module describes
(target → discovered → searched → shown → clicked → performs →
improve) — Search Console covers everything up through "clicked";
analytics would be needed for "performs" and "improve" in the
conversion sense. See `MODULE-SEO-5-HANDOFF.md` "Analytics status"
for what was found and what is recommended.

---

## Content ↔ Search Console loop (spec §12)

```text
docs/seo/content-roadmap.md (planned topics)
        ↓
Article published (SEO-4)
        ↓
Search Console Performance → Pages tab, filtered to that URL
        ↓
Search Console Performance → Queries tab, filtered to that URL
        ↓
Compare actual queries against docs/seo/keyword-map.md's planned
primary/secondary keywords for that topic
        ↓
Where real queries diverge from the plan (new phrasing, unexpected
related questions), that's a genuine content-improvement or
supporting-article signal — not before
        ↓
New/updated entry in docs/seo/content-roadmap.md's P2/P3 backlog
```

No queries are invented here to pre-fill this loop — it is
documented as a process to run once Search Console has real query
data for the SEO-4 articles, not populated with guesses now.

## Keyword map compatibility (spec §13)

`docs/seo/keyword-map.md` records **planned/target** keywords per
page, researched from live SERPs during SEO-2 — it does not (and
could not, without a paid tool) claim actual search volume. Search
Console's Queries report, once available, is the source of **actual**
queries a page is shown for and clicked on. Future SEO work should
read both side by side:

| | `keyword-map.md` | Search Console Queries |
|---|---|---|
| Source | SERP research, human judgement | Real Google Search data |
| Tells you | What a page was *built* to target | What it's *actually* found for |
| Use it to | Plan new content, write titles/descriptions | Validate or correct those plans, find content gaps the plan missed |

`keyword-map.md` itself was not rewritten this module — only this
cross-reference guidance was added, per spec §13 ("do not replace the
existing keyword map").
