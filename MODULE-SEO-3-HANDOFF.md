# MODULE-SEO-3-HANDOFF.md

## SEO-3 — Structured Data / Schema.org

Inherits SEO-1 (technical foundation) and SEO-2 (keyword/on-page)
unchanged. No keyword research, copywriting, new articles, local
pages, or visual/frontend changes were made in this module.

---

## Schema architecture

Two new files, per the module's requested `src/lib/seo/` pattern:

- **`src/lib/seo/structuredData.ts`** — pure builder functions
  (`organizationSchema`, `websiteSchema`, `siteGraph`,
  `breadcrumbSchema`, `webPageSchema`, `serviceSchema`,
  `articleSchema`, `projectSchema`). Each returns a plain JSON-LD
  object; none render anything.
- **`src/components/seo/JsonLd.tsx`** — the single safe-rendering
  component (`<script type="application/ld+json">`). Escapes `<` to
  `\u003c` before serialization so CMS text containing a literal
  `</script>` substring can never break out of the tag, while keeping
  the JSON itself valid.

Flow: `page → structuredData.ts builder → <JsonLd data={...} />`,
exactly the architecture the module spec requested. No raw JSON
objects are inlined in any page file.

**Duplicate-prevention audit** (module spec §18, §37): searched the
whole repo for `application/ld+json`, `@context`, `@type`,
`schema.org` before starting — zero existing implementations found.
After implementation, the only file containing
`application/ld+json` is `src/components/seo/JsonLd.tsx` itself (the
one rendering mechanism); every page imports and calls it, none
duplicate it.

---

## Organization schema

One canonical entity (`@id: https://6stanza.com/#organization`),
defined in full exactly once — on the homepage — and referenced by
`@id` everywhere else (Service's `provider`, Article's `publisher`,
Project's `creator`). Fields used: `name`, `url`, `logo`
(`/6stanza-mark.png`, the real brand asset already established in
SEO-1), `description` (the real `siteConfig.tagline`).

**Intentionally omitted** (module spec §4): `sameAs` (no confirmed
official social profile URLs exist in the current project),
`address`, `telephone`, `foundingDate`, employee count, `award`,
`aggregateRating`. None of these facts exist in current project data,
so none were invented.

## WebSite schema

One entity (`@id: https://6stanza.com/#website`), `name`/`url` from
`siteConfig`, `publisher` referencing the Organization by `@id`. No
`SearchAction` — the site has no on-site search endpoint (module spec
§5/§27 — explicitly not faked).

## WebPage schema

Applied to every important static public page: Home, About, Services
(index), Projects (index), Team, Insights (index), Contact,
Start a Project. Each carries its own real `name`/`description`
(reused from the page's actual `metadata` description where one
already existed, not a second copy of the text) and `isPartOf`
referencing the WebSite entity. Not applied to Service/Project/Article
detail pages — those get the more specific `Service`/`CreativeWork`/
`Article` type instead, avoiding redundant schema (module spec §14 —
"prefer a clean graph over schema spam").

## BreadcrumbList

Added to every page that has a real, meaningful hierarchy:

- Static pages: `Home → [Page]`
- `/services/[slug]`: `Home → Services → [Service name]`
- `/projects/[slug]`: `Home → Projects → [Project name]`
- `/insights/[slug]`: `Home → Insights → [Article title]`

Every breadcrumb `item` URL is built through the existing
`absoluteUrl()` helper (SEO-1) — never a hand-typed string — and every
`name` is real page-title/CMS content, never invented (module spec
§7).

## Service schema

One `Service` entity per CMS record on `/services/[slug]`, built
directly from the same `service` object the page already fetched via
`getPublicServiceDetail` (no extra query — that function is
`react.cache()`-memoized, so calling it again in the page body is a
free within-request cache hit, confirmed in code before implementing,
per module spec §33). Fields: `name` (`service.label`), `description`
(`service.description`), `url`, `image` (CMS `service.image` when
present, else the shared brand-image fallback already established in
SEO-1/SEO-2), `provider` referencing the Organization by `@id`.

**Intentionally omitted**: `offers`/price, `serviceArea`,
`aggregateRating`/reviews — none of that data exists in the current
CMS (module spec §8).

**Consistency check** (module spec §9, §29): the Service schema's
`name` is always `service.label`, the exact same value the page's H1
renders and the same value the SEO-2 title composes around
(`"${service.label} Services in Pakistan"`) — verified in code, same
underlying topic represented three different ways, never a mismatch
(e.g. Web Development's page can never carry Cloud Computing's
schema, because both are the same `service` object throughout).

## Article schema

One `Article` entity per published Insight on `/insights/[slug]`,
built from the already-fetched `insight` object
(`getPublicInsightBySlug`, also `react.cache()`-memoized). Fields:
`headline` (`insight.title`), `description` (`insight.excerpt`),
`url`, `datePublished` (`insight.date` — the same real
`published_at`-falling-back-to-`created_at` value already computed
by the data layer for Open Graph in SEO-1, never a fabricated
timestamp), `image` (falls back to the shared brand image — Insight
has no cover-image field yet), `publisher` referencing the
Organization by `@id`.

**No `author` property at all** (module spec §12): the current public
`Insight` type has no author field anywhere in the data layer.
Omitted entirely rather than invented — the module spec is explicit
that omitting is correct here ("It is better to omit unavailable
structured data properties than to publish false information").

**No `dateModified`**: no `updated_at` is exposed to the public data
layer either — same documented gap as SEO-1's sitemap `lastModified`.

## Project pages

`/projects/[slug]` uses `CreativeWork`, not `Product`/`Review` (module
spec §10 explicitly warns against reaching for "the most
lucrative-looking type" when content doesn't support it — a 6STANZA
project write-up is editorial case-study content, not a purchasable
product). Fields: `name` (`project.title`), `description`
(`project.description`), `url`, `image` (shared brand-image
fallback — `ProjectItem` has no cover-image field, same gap already
documented in SEO-1), `keywords` (from the real `project.technologies`
array, only included when non-empty), `creator` referencing the
Organization by `@id`. No fabricated client identity, rating, award,
or date.

---

## Dynamic CMS behavior

Every Service/Article/Project schema field is read from the same live
CMS query the page already performs — nothing is duplicated as static
data. If an admin renames a service, retitles an article, or edits a
project description in the CMS, the corresponding JSON-LD updates on
the very next request automatically (module spec §31).

## Image strategy

Service schema uses the real CMS-uploaded `service.image` when
present, falling back to the shared `/6stanza-mark.png` brand asset
(`defaultOgImage`, already established in SEO-1) when it isn't.
Project and Article schema always use the brand-image fallback — no
per-entity cover image exists yet in either data layer (same
documented gap from SEO-1/SEO-2). No fake or private-storage-path
image URL is ever used (module spec §13).

## IDs / relationships

Stable, deterministic `@id` values built from `absoluteUrl()` — never
a random UUID (module spec §16):

```
https://6stanza.com/#organization
https://6stanza.com/#website
https://6stanza.com/about#webpage  (and one per static page)
https://6stanza.com/services/<slug>#service
https://6stanza.com/projects/<slug>#project
https://6stanza.com/insights/<slug>#article
```

Relationships: `WebPage.isPartOf → WebSite`, `WebSite.publisher →
Organization`, `Service.provider → Organization`,
`Article.publisher → Organization`, `Project.creator → Organization`
— matching the graph the module spec described (§15).

---

## Public vs private routes

Verified via curl against a running `npm run dev` instance that
`/login`, `/design-system`, and `/admin` each return **zero**
`application/ld+json` occurrences — confirmed no schema was added to
any non-indexable route (`/admin/*`, `/account`, `/login`, `/signup`,
`/forgot-password`, `/reset-password`, `/auth/*`, `/design-system`,
`/motion`), matching the SEO-1 indexing policy exactly (module spec
§19). This was a deliberate architectural choice: schema is added
directly inside each individual public page component rather than in
a shared layout, specifically so it can never leak onto a route that
happens to share that layout but isn't itself public (e.g.
`/login`/`/account`/`/design-system` all render inside the same
`(site)` layout as the real public pages, but never receive schema
because the schema calls live in the public pages' own files, not the
shared layout).

---

## Validation performed

No external validator (Schema Markup Validator / Google Rich Results
Test) was reachable from this sandbox. Performed the module's stated
fallback (§29) instead:

1. Fetched the rendered HTML for `/` and `/about` via `curl` against a
   live `npm run dev` instance.
2. Extracted the JSON-LD `<script>` contents.
3. Parsed them with `python3 -m json` (actually run, output shown
   below) — confirmed valid JSON, no malformed syntax.
4. Verified `@type` values match the intended schema
   (`Organization`, `WebSite` on `/`; `WebPage`, `BreadcrumbList` on
   `/about`).
5. Verified every URL field is absolute and uses
   `https://6stanza.com` (never the demo domain).
6. Verified `/login`, `/design-system`, `/admin` emit no JSON-LD at
   all.

```
$ python3 -c "import json; json.loads(<home JSON-LD>); print('Valid JSON. Types:', [...])"
Valid JSON. Types: ['Organization', 'WebSite']
```

**Not claimed**: Google Rich Results eligibility. The module spec is
explicit that valid JSON parsing is not the same as rich-result
eligibility (§29/§30) — this handoff makes no such claim.

---

## Verification

```bash
npx tsc --noEmit   # clean, only the same PRE-EXISTING unrelated error
                     # from SEO-1/SEO-2 (src/app/layout.tsx LayoutProps)
npm run lint         # clean, zero warnings/errors (one warning was
                       # found and fixed during this module — an
                       # unnecessary eslint-disable comment in
                       # JsonLd.tsx, removed)
npm run build         # succeeded
```

---

## Files modified

- `src/app/(site)/page.tsx` — added `siteGraph()` + homepage `WebPage`
- `src/app/(site)/about/page.tsx` — added `WebPage` + `BreadcrumbList`
- `src/app/(site)/services/page.tsx` — added `WebPage` + `BreadcrumbList`
- `src/app/(site)/services/[slug]/page.tsx` — added `Service` + `BreadcrumbList`
- `src/app/(site)/projects/page.tsx` — added `WebPage` + `BreadcrumbList`
- `src/app/(site)/projects/[slug]/page.tsx` — added `CreativeWork` (project) + `BreadcrumbList`
- `src/app/(site)/team/page.tsx` — added `WebPage` + `BreadcrumbList`
- `src/app/(site)/insights/page.tsx` — added `WebPage` + `BreadcrumbList`
- `src/app/(site)/insights/[slug]/page.tsx` — added `Article` + `BreadcrumbList`
- `src/app/(site)/contact/page.tsx` — added `WebPage` + `BreadcrumbList`
- `src/app/(site)/start-project/page.tsx` — added `WebPage` + `BreadcrumbList`

## Files added

- `src/lib/seo/structuredData.ts`
- `src/components/seo/JsonLd.tsx`
- `MODULE-SEO-3-HANDOFF.md`

## Files deleted

None.

---

## Known limitations

- **`LocalBusiness` was intentionally omitted** (module spec §25) —
  the project has no real, reliable published address, phone, or
  location data (deliberately left unpublished since SEO-1/the
  original knowledge-base document), so implementing `LocalBusiness`
  would require inventing fields. Not implemented.
- **Ratings/reviews (`AggregateRating`/`Review`) were intentionally
  omitted** (module spec §26) — no CMS-stored review data exists.
- **`SearchAction` was intentionally omitted** (module spec §27) —
  the site has no on-site search endpoint.
- **Project/Insight cover-image gaps remain** (already documented in
  SEO-1/SEO-2): neither `ProjectItem` nor `Insight` has a public
  cover-image field yet, so `CreativeWork`/`Article` schema both fall
  back to the shared brand image rather than a per-entity photo.
  Closing this is a CMS/media-layer change, out of scope here.
- **Live Supabase data was NOT available during verification** in
  this sandbox (same network restriction documented in SEO-1/SEO-2's
  handoffs) — `/services/[slug]`, `/projects/[slug]`, and
  `/insights/[slug]` schema output was verified in code (reads the
  same already-fetched object the page renders, same pattern
  confirmed working for metadata in SEO-1) but not observed rendering
  with real CMS data end-to-end. Spot-check against
  `https://6stanza.vercel.app/` once a real slug is available.
- No external schema validator (Google Rich Results Test / Schema
  Markup Validator) was reachable from this sandbox — validation was
  limited to structural JSON parsing + manual field review, as noted
  above.

---

## Deferred to SEO-4

New content/articles, topical authority, and content-gap
implementation (the five topics identified in SEO-2's keyword map)
remain entirely deferred to SEO-4, as instructed. Nothing in this
module authored new content.
