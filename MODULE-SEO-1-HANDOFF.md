# MODULE-SEO-1-HANDOFF.md

## SEO-1 — Technical SEO Foundation

Scope: technical crawlability/indexability/canonicalization only. No
keyword research, no copy rewrites, no structured data, no frontend
redesign — all deferred to SEO-2+ per module spec.

---

## Audit findings (before changes)

- Root layout (`src/app/layout.tsx`) had basic `title`/`description`/
  `metadataBase` but no `robots`, `openGraph`, or `twitter` defaults.
- Homepage (`src/app/(site)/page.tsx`) had **no metadata export at
  all** — silently inherited only the bare root defaults.
- Every other static page (`/about`, `/services`, `/projects`,
  `/team`, `/insights`, `/contact`, `/start-project`) already had a
  real `title` + `description`, but **no `alternates.canonical`**.
- `/login`, `/signup`, `/forgot-password`, `/reset-password`,
  `/account` had page `title`s but **no `robots: noindex`** at the
  page-metadata level — only relied on `robots.txt` disallow, which
  the module spec explicitly flags as insufficient on its own (a
  page can still get indexed if discovered/linked externally).
- `/admin` already had proper `noindex, nofollow` (Module 10G) — no
  change needed.
- `/design-system` had **no metadata at all** (no title, no
  robots) and was **not** in `robots.txt`'s disallow list — a real
  gap; this internal showcase route was fully crawlable/indexable.
- `/motion` already had a segment `layout.tsx` with `noindex,
  nofollow` (someone had already handled this one) but was, like
  `/design-system`, **missing from `robots.txt`**.
- `generateMetadata()` on all three dynamic detail routes
  (`/services/[slug]`, `/projects/[slug]`, `/insights/[slug]`) only
  set `title`/`description` — no canonical, no Open Graph, no Twitter
  card.
- `sitemap.ts` (Module 10G) intentionally listed only static routes,
  with the gap explicitly flagged in that module's own handoff
  comment: CMS-backed detail pages weren't enumerated because a
  build-time slug list would go stale. It also set
  `lastModified: new Date()` on every entry — a fabricated,
  constantly-changing signal the module spec explicitly warns
  against (§14).
- `robots.ts` (Module 10G) already existed and correctly disallowed
  `/admin`, `/account`, `/login`, `/signup`, `/forgot-password`,
  `/reset-password`, `/auth/` — but not `/design-system` or
  `/motion`.
- No dedicated canonical-URL helper existed — canonical construction
  was ad hoc per file.
- `notFound()` / `not-found.tsx` architecture already exists and is
  used correctly by all three dynamic detail routes for genuinely
  missing slugs (distinct from query failures, which correctly
  `throwPublicCmsError` instead per Module 10B — verified in code,
  not just assumed).

---

## Technical SEO changes

### New file
- **`src/lib/seo/canonical.ts`** — `absoluteUrl(path)` (always
  resolves against `siteConfig.url` = `https://6stanza.com`, never
  the demo Vercel domain) and `defaultOgImage` (the real
  `/6stanza-mark.png` brand asset, used as the OG/Twitter fallback
  wherever a page/entity has no CMS image of its own).

### Root metadata (`src/app/layout.tsx`)
- Added `alternates.canonical: "/"` default, `robots: { index: true,
  follow: true }` default, `openGraph` defaults (type, siteName,
  title, description, url, image), and `twitter` (summary_large_image
  card) defaults. Every page inherits these unless it overrides them.

### Homepage (`src/app/(site)/page.tsx`)
- Added explicit `metadata` export (previously missing entirely):
  `title: { absolute: "..." }` (bypasses the `%s — 6STANZA` template
  intentionally, so the homepage doesn't render as
  "6STANZA — ... — 6STANZA" — this was caught and fixed during
  verification, see below), `description`, and
  `alternates.canonical: "/"`.

### Static pages — canonical added
`/about`, `/services`, `/projects`, `/team`, `/insights`, `/contact`,
`/start-project` each got `alternates: { canonical: "<path>" }` added
to their existing `metadata` export. Titles/descriptions were **not**
touched — they already existed and are out of scope for SEO-1 (no
keyword rewriting per §28).

### Private/internal pages — noindex added
`/account`, `/login`, `/signup`, `/forgot-password`, `/reset-password`
each got `robots: { index: false, follow: false }` added to their
existing `metadata` export (title unchanged). `/design-system` got a
full new `metadata` export (title + noindex — previously had none).
`/motion` already had this via its existing `layout.tsx`.

### `robots.ts`
Added `/design-system` and `/motion` to the `disallow` list. Comment
updated to note that `robots.txt` is the first line of defense but
each of these routes also carries its own page-level `noindex`
directive as the actual enforcement mechanism (§10).

### `sitemap.ts`
Rewritten to also read live public CMS data (`getPublicServices`,
`getPublicProjects`, `getPublicInsights` — the same
`react.cache()`-memoized functions the actual pages use) and emit
`/services/<slug>`, `/projects/<slug>`, `/insights/<slug>` entries for
every currently-published record, closing the gap the Module 10G
handoff had explicitly flagged. A failed CMS read for one content
type degrades to an empty list for that type only, rather than
throwing and dropping the entire sitemap (including the static
routes). `lastModified` is now omitted everywhere — none of
`ServiceItem`/`ProjectItem`/`Insight` currently expose a real
`updated_at` to the public data layer, and fabricating one on every
request would violate §14.

### Dynamic route metadata
`/services/[slug]`, `/projects/[slug]`, `/insights/[slug]`
`generateMetadata()` now each also set:
- `alternates.canonical` (via `absoluteUrl`)
- `openGraph` (type: "article", title, description, url, image)
- `twitter` (summary_large_image card)

Images: `ServiceItem` has a real `image` field from CMS uploads (used
when present); `ProjectItem` and `Insight` currently have **no**
cover-image field in the public data layer, so those two fall back to
`defaultOgImage` rather than inventing a per-entity image (§16). This
is a known gap for a future module if project/insight cover images
get added to the CMS.

The existing "query failure → empty metadata, never fabricate" pattern
(Module 10B, §18) was preserved unchanged in all three files.

---

## Metadata

Root defaults (title template, robots, OG, Twitter) live in
`src/app/layout.tsx`. Every route inherits them unless it sets its
own `metadata`/`generateMetadata`. `metadataBase` anchors every
relative URL to `https://6stanza.com`.

## Dynamic metadata

See "Dynamic route metadata" above — services/projects/insights all
now carry canonical + Open Graph + Twitter, sourced only from actual
CMS content, never fabricated.

## Canonicals

`absoluteUrl()` in `src/lib/seo/canonical.ts` is now the single
construction point. Static pages set `alternates.canonical` as a
relative path (resolved against `metadataBase`); dynamic pages set it
as a full absolute URL via `absoluteUrl()`. Both approaches produce
identical output — verified via curl (see Verification below).

## Robots

- **Indexable**: `/`, `/about`, `/services`, `/services/[slug]`,
  `/projects`, `/projects/[slug]`, `/team`, `/insights`,
  `/insights/[slug]`, `/contact`, `/start-project`.
- **Non-indexable** (`noindex, nofollow` + `robots.txt` disallow):
  `/admin` (and everything under it), `/account`, `/login`,
  `/signup`, `/forgot-password`, `/reset-password`, `/auth/*`,
  `/design-system`, `/motion`.

## Sitemap

Dynamically generated at request time from `primaryNav`/`ctaRoute`
(static) plus live CMS reads (dynamic). No hardcoded slug list, no
stale entries, no fabricated `lastModified`.

## Social metadata

Open Graph + Twitter (summary_large_image) defaults set at the root,
overridden per-page where a page has more specific content (dynamic
detail routes). All images fall back to the real 6STANZA brand mark
asset when no CMS image exists — never a broken or invented URL.

## Demo vs production

`siteConfig.url` (`https://6stanza.com`) is the only value
`absoluteUrl()`, `metadataBase`, `robots.ts`, and `sitemap.ts` ever
resolve against. The demo Vercel domain
(`https://6-stanza-demo.vercel.app`) does not appear anywhere in
metadata, canonical, robots, or sitemap output, regardless of which
environment actually serves the request — verified by inspecting
every file that touches URL construction; there is no
environment-conditional branch that could accidentally substitute the
demo domain.

## Routes

See "Robots" section above for the full indexable/non-indexable
breakdown.

---

## Verification

Actual commands run, actual results (not claimed without running):

```bash
npx tsc --noEmit   # clean, except one PRE-EXISTING unrelated error:
                    # src/app/layout.tsx: Cannot find name 'LayoutProps'
                    # (present before this module, not caused by SEO-1)
npm run lint        # clean, zero warnings/errors
npm run build        # succeeded
```

Rendered-HTML checks via `curl` against a running `npm run dev`
instance:

| URL | Result |
|---|---|
| `/robots.txt` | 200, correct disallow list, correct sitemap URL |
| `/sitemap.xml` | 200, valid XML, correct `https://6stanza.com` origin, all static routes present, no `lastModified` |
| `/` | `<title>6STANZA — Technology Partner for Strategy, Software & Systems</title>` (no more doubling — see below), canonical `https://6stanza.com`, `og:title`/`og:url` present |
| `/about` | `<title>About — 6STANZA</title>`, canonical `https://6stanza.com/about` |
| `/contact` | canonical `https://6stanza.com/contact` |
| `/start-project` | canonical `https://6stanza.com/start-project` |
| `/login` | `<meta name="robots" content="noindex, nofollow"/>` present |
| `/design-system` | `<meta name="robots" content="noindex, nofollow"/>` present (previously had none) |
| `/motion` | `<meta name="robots" content="noindex, nofollow"/>` present |

**Bug found and fixed during verification**: the homepage title
initially rendered as `"6STANZA — ... — 6STANZA"` (doubled) because a
plain string `title` still passes through the root's `%s — 6STANZA`
template. Fixed by using `title: { absolute: "..." }`, which bypasses
the template. Re-verified via curl after the fix — confirmed correct.

---

## Known limitations

- **Supabase is network-blocked in this sandbox**
  (`Host not in allowlist: hmdaorajqckzuuywxlmg.supabase.co`), so:
  - The sitemap's dynamic CMS entries (services/projects/insights
    slugs) could not be verified against real data in this
    environment — the code path is correct and reads the same live
    functions the actual pages use, but the *output* with real rows
    hasn't been observed here. Verify against a real deployment.
  - `/services/not-a-real-service` returned the CMS **query-failure**
    error page in this sandbox (expected, since every Supabase call
    fails here) rather than the genuine **not-found** `404` — the two
    are different code paths (`throwPublicCmsError` vs `notFound()`)
    and only the not-found path was already known-correct from prior
    module verification. The 404-for-truly-missing-slug behavior
    itself was **not** independently re-verified in this module
    because a live database connection wasn't available. This should
    be spot-checked against a real deployment/staging environment.
- `ProjectItem` and `Insight` have no cover-image field in the public
  data layer yet, so their Open Graph images fall back to the site
  brand mark rather than a per-entity image. Not a defect — just a
  gap for a future CMS/media module to close.
- No `manifest.json`/web app manifest was found or added — out of
  scope for SEO-1 (not a crawl/index blocker) and not requested; flag
  for a future module if PWA-style install metadata becomes a goal.
- www vs non-www and HTTP→HTTPS redirect behavior are DNS/hosting
  configuration, not application code — this module documents the
  intended canonical host (`6stanza.com`, no `www`) but the actual
  redirect enforcement must be configured at the DNS/Vercel level,
  which this module has no access to. **Action needed outside this
  codebase**: confirm `www.6stanza.com` redirects to `6stanza.com`
  (or vice versa, whichever is chosen) at the domain/DNS/hosting
  layer.
- Query-string handling (`?utm_source=`, etc.) was not modified —
  `alternates.canonical` values set in this module never include
  query parameters, so canonical tags are already clean regardless of
  how a page is actually visited. No further action was needed or
  taken.

---

## Deferred to SEO-2

Per module scope, explicitly **not** performed in SEO-1:
- Keyword research
- Search-intent analysis
- Title/description keyword optimization or copy rewrites
- Structured data / schema.org (JSON-LD)
- Any content strategy work

---

## SEO-2 recommendations

1. Verify the dynamic sitemap and the true not-found (404) path
   against a real deployment with live Supabase access — both are
   code-correct here but couldn't be observed end-to-end in this
   sandbox.
2. Add `updated_at` to the public `ServiceItem`/`ProjectItem`/
   `Insight` shapes so the sitemap can carry real `lastModified`
   values instead of omitting them.
3. Add cover-image fields for projects/insights in the CMS/media
   layer so their Open Graph images can be entity-specific instead of
   falling back to the brand mark.
4. Confirm and enforce the www/non-www + HTTPS redirect at the
   DNS/hosting layer (outside this codebase).
5. Begin actual keyword research and on-page content optimization —
   the technical foundation from SEO-1 is now in place to support it.
