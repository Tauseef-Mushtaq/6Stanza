# MODULE-SEO-DOMAIN-ALIGNMENT-HANDOFF

Focused domain-alignment task. Not a new SEO module, no SEO-9, no
architecture changes.

## A. Objective

The site is currently deployed and publicly reachable only at
`https://6stanza.vercel.app`. SEO-1 through SEO-8 built the entire
canonical/metadata/sitemap/robots/structured-data system around
`https://6stanza.com`, the intended future custom domain, which is
not yet live. This task realigns the single source of truth so
Google sees the current Vercel deployment as a coherent, correctly
self-referencing, indexable site — without rebuilding anything.

## B. Previous active domain

`https://6stanza.com`

## C. Current active domain

`https://6stanza.vercel.app`

## D. Files changed

- `src/config/site.ts` — `siteConfig.url` changed from
  `https://6stanza.com` to `https://6stanza.vercel.app`. This is the
  single source of truth every SEO system reads from (confirmed by
  inspection — `absoluteUrl()`, `metadataBase`, `sitemap.ts`,
  `robots.ts`, and `structuredData.ts` all resolve through it, none
  hardcode a domain independently). Added a comment explaining the
  current-vs-future domain distinction.
- `src/lib/seo/canonical.ts` — doc comment updated to describe the
  domain as currently-active-Vercel / eventually-custom-domain,
  instead of asserting `https://6stanza.com` as fact. No logic
  changed — `absoluteUrl()` and `defaultOgImage` still resolve purely
  through `siteConfig.url`.
- `src/app/layout.tsx` — doc comment updated for the same reason (was
  asserting `https://6stanza.com` as "the real production origin" in
  prose; now points to `siteConfig.url` generically since that value
  can change). No metadata logic changed.
- `docs/seo/final-seo-checklist.md` — the two active checklist
  sections that referenced `https://6stanza.com` as the domain to
  verify were updated to `https://6stanza.vercel.app`, since this is
  a live, forward-looking checklist someone will use right now, not a
  historical record.

No other file required a change — `src/config/routes.ts` is
relative-path-only (confirmed, not touched); no `sameAs` structured
data exists yet to update; `NEXT_PUBLIC_SITE_URL` (used only by
`authService.ts` for auth redirects) is a separate, pre-existing
source of truth not read by any SEO system — left untouched per the
task's own instruction not to introduce unnecessary configuration
changes.

## E. SEO systems updated

- `metadataBase` (root layout — resolves via `siteConfig.url`)
- Canonical URLs (`absoluteUrl()` — every public route)
- Sitemap (`src/app/sitemap.ts` — resolves via the same public data
  functions + `absoluteUrl()`, no hardcoded domain in that file)
- Robots (`src/app/robots.ts` — `Sitemap:` line resolves via
  `siteConfig.url`, no hardcoded domain in that file)
- Open Graph (root + per-page `openGraph.url`/`.images`)
- Twitter (root + per-page `twitter.images`)
- Structured data (`Organization.url`/`.@id`, `WebSite.url`/`.@id`,
  `WebPage.url`/`.@id`, `BreadcrumbList` item URLs, `Service`/
  `Article`/`CreativeWork` URLs and `@id`s — all resolve via
  `absoluteUrl()`/`siteConfig.url`, none hardcoded in
  `structuredData.ts`)

Nothing else was touched: no new schema type, no title/description
rewrites, no relative-internal-link conversions, no routing/CMS/
performance/animation changes.

## F. Verification

```bash
npm run lint        # clean, 0 errors, 0 warnings
npx tsc --noEmit      # clean
npm run build          # succeeded, all 34 routes compiled
```

HTTP verification via `curl` against a running `npm run dev` instance:

| Route | Canonical | Title (unchanged) |
|---|---|---|
| `/` | `https://6stanza.vercel.app` | 6STANZA — Technology Partner... |
| `/about` | `https://6stanza.vercel.app/about` | About Us — Technology Partner in Pakistan — 6STANZA |
| `/services` | `https://6stanza.vercel.app/services` | Technology Services in Pakistan — 6STANZA |
| `/projects` | `https://6stanza.vercel.app/projects` | Projects — Case Studies & Selected Work — 6STANZA |
| `/insights` | `https://6stanza.vercel.app/insights` | Insights — Engineering & Technology Articles — 6STANZA |
| `/team` | `https://6stanza.vercel.app/team` | Meet the Team — 6STANZA |
| `/contact` | `https://6stanza.vercel.app/contact` | Contact Us — 6STANZA |
| `/start-project` | `https://6stanza.vercel.app/start-project` | Start a Project — 6STANZA |

`/robots.txt`: disallow list unchanged; `Sitemap:
https://6stanza.vercel.app/sitemap.xml` — confirmed via curl.

`/sitemap.xml`: all 8 static URLs now under `https://6stanza.vercel.app`
— confirmed via curl. Dynamic CMS entries (service/project/insight
slugs) resolve through the same code path and will carry the same
domain once live data is reachable — not independently observable in
this sandbox (Supabase host not in this environment's network
allowlist, same limitation documented in every prior SEO module).

JSON-LD: `/` emits `Organization` (`@id`, `url`, `logo` all
`https://6stanza.vercel.app/...`) + `WebSite` + `WebPage`, all under
the new domain — confirmed via curl. `/about` emits `WebPage` +
`BreadcrumbList` with both breadcrumb item URLs under the new domain
— confirmed via curl.

Open Graph on `/`: `og:url` and `og:image` both confirmed under
`https://6stanza.vercel.app` via curl.

Indexability unchanged: `/login` still emits `noindex, nofollow`
(curl-confirmed) — SEO-8's indexability architecture was not touched.

## G. Remaining 6stanza.com references

Repo-wide search after implementation found `6stanza.com` in:

**Intentionally retained (future-domain comments, added by this task):**
- `src/config/site.ts` — comment explaining `siteConfig.url` will
  change back to this domain when it goes live.
- `src/lib/seo/canonical.ts` — same, in its doc comment.
- `docs/seo/final-seo-checklist.md` — one sentence noting the future
  domain in context.

**Historical documentation (unmodified, correctly left as-is):**
- `MODULE-SEO-1-HANDOFF.md`, `MODULE-SEO-3-HANDOFF.md`,
  `MODULE-SEO-5-HANDOFF.md`, `MODULE-SEO-8-HANDOFF.md`,
  `MODULE-6-HANDOFF.md` — these are dated records of what was true
  when each module ran. Rewriting them would falsify the project's
  own history; not done, per this task's explicit instruction.
- `docs/seo/search-console.md`, `docs/seo/local-citations.md`,
  `docs/seo/local-seo-roadmap.md` — these describe the *future*
  Search Console/citation setup process for the eventual custom
  domain (DNS TXT verification, domain-property setup) — that
  workflow is inherently about `6stanza.com`, not the temporary
  Vercel URL, so left unmodified as category B (future-domain
  reference).

**Zero accidental active SEO references remain** — every occurrence
outside the three intentionally-retained future-domain comments is in
a historical handoff or a future-domain-specific procedural doc, not
in any code path that generates a live canonical, metadata, sitemap,
robots, or JSON-LD value.

## H. Important deployment note

The current canonical/SEO domain is `https://6stanza.vercel.app`.

When the custom domain `https://6stanza.com` becomes the real
production domain, change `siteConfig.url` in `src/config/site.ts`
back to it (that one line is the entire source of truth — every other
file reads through `absoluteUrl()`/`siteConfig.url`, nothing else
needs editing), then re-run the same verification performed in
section F above against the new domain, and re-submit the sitemap in
Search Console under the new property.

---

STOP.
Do not begin another SEO module after this task.
