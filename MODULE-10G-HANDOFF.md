# MODULE 10G — FINAL PRODUCTION QA

## 0. Environment note — verification NOT run

Same limitation as 10F and every module since Frontend Stabilization
Part 2 — no npm registry access in this sandbox (`npm install` still
fails with `403` on the first dependency it tries to fetch). No
lint/typecheck/build/dev/browser verification was possible. This
module is a **static production-readiness audit**, not a build-verified
one — see 10F's "Verification debt" note, which still applies and now
covers this module too.

## A. What was audited

- Codebase-wide grep for `TODO`, `FIXME`, and stray `console.log` (as
  opposed to the intentional `console.error`/`console.warn` calls
  documented throughout prior modules).
- `public/` and `src/app/` for favicon/app-icon presence.
- `src/app/` for `robots.txt`/`sitemap.xml` (Next's file-based
  conventions) and `metadataBase` correctness.
- `src/app/layout.tsx`'s pre-existing `LayoutProps` typecheck note,
  re-read for context (not re-verified — see §0).
- Cross-check of `MODULE-FRONTEND-STABILIZATION-PART2-HANDOFF.md`'s
  claim that `ServiceCompass.tsx` is unused dead code, against current
  source.

## B. Findings

### B1. No `TODO`/`FIXME`/stray `console.log` — clean

Grepped the entire `src/` tree. Nothing found. No action needed —
noting this explicitly since "no debug/dead-code residue" is a normal
final-QA checklist item and it's worth confirming it was actually
checked, not skipped.

### B2. No favicon / app icon existed

`public/` contained only `6stanza-mark.png` (the design-system brand
asset, non-square, used via `<BrandMark>`); `src/app/` had no
`icon.png`/`favicon.ico`/`icon.tsx`. Every route would have served the
browser's default document icon.

**Fix:** generated `src/app/icon.png` (Next's file-based app-icon
convention — automatically served as the site favicon/icon for every
route, no manual `<link rel="icon">` or metadata wiring needed) from
the existing brand mark: padded to a square canvas with a small margin
(the source asset is a tall, non-square crop — used directly it would
be squashed into a square favicon), resized to 512×512. No new asset
was designed; this is the same mark `BrandMark.tsx` already renders
elsewhere, just reframed for icon use. `public/6stanza-mark.png` and
`BrandMark.tsx` are untouched.

### B3. No `robots.txt` / `sitemap.xml`

Neither existed anywhere in the project — a fully public marketing
site had no crawl directives and no sitemap for search engines.

**Fix:** added `src/app/robots.ts` and `src/app/sitemap.ts`, both
using Next's file-based metadata-route conventions (auto-served at
`/robots.txt` and `/sitemap.xml`, no manual route/route.ts needed).

- `robots.ts` allows crawling of the public site and explicitly
  disallows `/admin`, `/account`, and the auth routes
  (`/login`, `/signup`, `/forgot-password`, `/reset-password`,
  `/auth/`) — none of these have SEO value and `/admin` already
  carries `noindex, nofollow` metadata (Module 7A's
  `src/app/admin/layout.tsx`); this keeps crawlers from even
  requesting those URLs in the first place, a step further than the
  meta tag alone.
- `sitemap.ts` lists the static top-level routes only (home +
  everything in `primaryNav`/`ctaRoute`, sourced from the existing
  `src/config/routes.ts` — no hardcoded duplicate route list). It
  **deliberately does not** enumerate CMS-backed detail pages
  (`/services/[slug]`, `/projects/[slug]`, `/insights/[slug]`) — every
  one of those routes already avoids build-time CMS enumeration on
  purpose (`generateStaticParams` returns `[]` in each, per the
  Module 9F/9G/9I handoffs, specifically because a build-time slug
  list goes stale the moment something is published or archived
  afterward). A sitemap has the identical staleness problem in the
  other direction — a static list here would eventually contain 404s
  and omit newly-published pages. Doing this properly needs a live CMS
  read inside `sitemap()` (which supports async data fetching), which
  is a real, scoped improvement but bigger than this audit-focused
  module — flagged below as follow-up rather than guessed at.

## C. Re-confirmed from prior modules (no new issue, no change)

- **`ServiceCompass.tsx` dead code** — the Frontend Stabilization
  Part 2 handoff flagged this component as unused. Re-checked: the
  only other reference to the string "ServiceCompass" anywhere in
  `src/` is a *comment* in `Services.tsx` ("Re-tone the shared
  ServiceCompass primitive for this dark section") — not an import or
  render. Confirmed still accurate; still not wired up, still not
  modified here (same reasoning as before: it has no reduced-motion or
  mobile-intensity handling, and speculatively adding that to
  never-rendered code isn't useful — wire it up first if it's ever
  needed, then bring it up to the same standard as `ServiceRail`/
  `SixSJourney`).
- **`LayoutProps` in `src/app/layout.tsx`** — this is Next.js's
  generated typed-routes global (`.next/types`), only available after
  a real `next build`/`next dev` has run once; a bare `tsc --noEmit`
  without that generation step fails on it. This has been re-flagged,
  not re-verified, in every module since 10A because none of them
  could run a build. Still open, still not a bug in the line itself —
  confirm it disappears once a real build runs.

## D. Files changed

**Added**
- `src/app/robots.ts`
- `src/app/sitemap.ts`
- `src/app/icon.png` (generated from `public/6stanza-mark.png`, see B2)

No files modified or deleted. No design, copy, CMS, or behavior
changes outside the three additions above.

## E. Verification

- **Static audit performed** — see §A/§B.
- **NOT run:** `npm run lint`, `npx tsc --noEmit`, `npm run build`,
  `npm run dev`. Same environment limitation as every module since
  Frontend Stabilization Part 2 (§0). In particular, `icon.png`'s
  automatic favicon wiring and `robots.ts`/`sitemap.ts`'s output at
  `/robots.txt`/`/sitemap.xml` have not been checked in a running dev
  server — verify both once a build is possible.

## F. Remaining work / what's left after this module

This closes out the module list that was outstanding
(10F, 10G). What's left is no longer "features to build" — the app is
feature-complete per every prior handoff — it's verification debt:

1. **Run the full suite** (`npm install && npm run lint && npx tsc
   --noEmit && npm run build && npm run dev`) in an environment with
   npm registry access. This is now the single most important next
   step — a large span of the codebase (everything since Frontend
   Stabilization Part 2, including this module and 10F) has never
   been compiled, only hand-reviewed.
2. **Browser QA matrix** at 1440/1280/768/390/375px, load → scroll
   forward → scroll backward → navigate away → navigate back → scroll
   again, on every major page (carried over from Frontend
   Stabilization Part 1/2's own deferred checklist — never performed).
3. **Live-Supabase testing**: auth flows (including the open-redirect
   fix in 10F — manually try `/login?redirect=//evil.example`),
   full CRUD across all four CMS content types, media upload/remove/
   reorder, and both inquiry forms (including the newly-wired honeypot
   in 10F) against a real project.
4. **Real typefaces** — still on the system font fallback stack since
   Module 0; tokens are ready for `next/font/local`, just needs woff2
   files.
5. **CSP** — flagged in 10F, deliberately not attempted without a
   browser to iterate against.
6. **Sitemap CMS enumeration** (§B3) — upgrade `sitemap.ts` to read
   published services/projects/insights slugs live, once there's a
   live CMS connection to verify freshness/behavior against.
7. **`ServiceCompass.tsx`** — decide whether to wire it up (and bring
   it to parity with `ServiceRail`) or remove it; currently inert.
