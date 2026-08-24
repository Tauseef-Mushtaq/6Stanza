# MODULE-SEO-6-HANDOFF

Performance & Core Web Vitals.

> **Post-handoff correction:** the original `FaqChatbot` dynamic-import
> change placed `next/dynamic(..., { ssr: false })` directly inside
> `src/app/(site)/layout.tsx` (an async Server Component), which fails
> Next.js 16's build ("`ssr: false` is not allowed... in Server
> Components") — this sandbox had no working `npm run build` to catch
> it before handoff. Fixed by extracting the dynamic import into a new
> Client Component, `src/components/ui/LazyFaqChatbot.tsx`, imported
> normally by `SiteLayout`. Sections D/E/Q below describe the corrected
> state; see `docs/seo/performance.md`'s "JavaScript" section for the
> full note.

## A. What was inspected

- All five prior SEO handoffs (`MODULE-SEO-1` through `-5`) and
  `docs/seo/keyword-map.md`, `content-roadmap.md`, `search-console.md`,
  `seo-report-template.md`.
- `package.json` / dependency list.
- `next.config.ts`.
- `src/app/layout.tsx` and `src/app/(site)/layout.tsx`.
- `src/app/globals.css` (design tokens, typography, font strategy).
- `src/lib/motion/gsap.ts`, `src/lib/motion/lenis.ts`,
  `src/components/layout/SmoothScrollProvider.tsx`.
- `src/lib/three/ExperienceCanvas.tsx`,
  `src/lib/three/loadExperienceCanvas.tsx`,
  `src/components/motion/CinematicCanvasScene.tsx`.
- `src/features/home/sections/Hero.tsx`.
- `src/features/projects/sections/ProjectGallery.tsx` and other
  `next/image` call sites across `projects`, `insights`, `team`,
  `home` features.
- All `"use client"` files (78 total) — classified, not individually
  rewritten (see §C/§I).
- `src/lib/repositories/*` for query shape (`select("*")` usage).
- `src/features/insights/data/publicInsights.ts` (memoized read
  boundary + row-to-`Insight` mapping).
- `src/components/ui/FaqChatbot.tsx`, `src/components/ui/
  WhatsAppButton.tsx`.

## B. Baseline

No prior performance baseline existed. `npm install` failed in this
sandbox (`403` from the npm registry — no network egress), so `npm
run lint`, `npx tsc --noEmit`, `npm run build`, and any Lighthouse/
PageSpeed run were **not available**. This module's baseline is a
static source-code audit, documented in full in
`docs/seo/performance.md`.

## C. Performance bottlenecks

One concrete, low-risk bottleneck was identified and fixed:

- `FaqChatbot` (433 lines, static FAQ data, no SEO/above-the-fold
  role) was statically imported into `src/app/(site)/layout.tsx`,
  shipping in every public page's initial client bundle regardless of
  whether the visitor ever opens it.

One bottleneck was identified but **not** fixed, because fixing it
safely needs a live environment to verify against (documented instead
as a P2 — see §U):

- `listPublishedInsights()` (`src/lib/repositories/insights.ts`) uses
  `select("*")`, so the `/insights` index page's `react.cache()`-
  memoized read fetches every insight's full `content` jsonb article
  body just to render index/card data. The memoization is shared with
  `/insights/[slug]`'s `generateMetadata`, so narrowing the query
  safely requires either splitting the memoized read or changing the
  `InsightRow` type's guarantees everywhere it's consumed — real
  correctness surface area that shouldn't be changed without a build
  to verify against.

Everything else audited (fonts, Lenis/GSAP singleton architecture,
WebGL viewport/reduced-motion gating, image handling, CSS) was already
consistent with the module's goals — see `docs/seo/performance.md`
Architecture audit for the full list of what was checked and found
already-correct.

## D. Optimizations implemented

1. `src/app/(site)/layout.tsx`: `FaqChatbot` converted from a static
   import to a dynamically-loaded component.
2. `src/components/ui/LazyFaqChatbot.tsx` (new): a `"use client"`
   wrapper that calls `next/dynamic(..., { ssr: false })` on
   `FaqChatbot`, since that call isn't allowed directly inside
   `SiteLayout` (an async Server Component) — see the correction note
   at the top of this file.

That is the code change in this module's patch, plus the one-file
correction above.

## E. JavaScript changes

See D. No other client-component conversions were made — see
`docs/seo/performance.md` "JavaScript" section for why the rest of the
`"use client"` inventory was left as-is.

## F. Image changes

None. Existing `next/image` usage across the codebase already matches
the module's goals (responsive `sizes`, lazy by default, no
speculative `priority`, Supabase host allowlisted in
`next.config.ts`).

## G. Font changes

None. Typography already uses system font stacks
(`--font-stz-display`/`-sans`/`-mono` in `globals.css`) — no web font
request exists to optimize.

## H. CSS changes

None. No `backdrop-filter`, animated `box-shadow`, or large `filter:
blur(...)` was found applied in the current component set.

## I. Animation changes

None. `SmoothScrollProvider`'s Lenis↔GSAP↔ScrollTrigger wiring was
audited and found to already be a single authoritative RAF loop
(`gsap.ticker`) with correct cleanup and a reduced-motion escape hatch
applied *before* Lenis is even constructed.

## J. WebGL changes

None. The sole current 3D consumer (Hero → `CinematicCanvasScene` →
`BrandGeometryScene`) is already dynamically imported
(`next/dynamic(..., { ssr: false })`), viewport-gated
(`useScrollScene3D`'s `shouldMount`), reduced-motion-gated, and DPR-
capped (`dpr={[1, 2]}`).

## K. Mobile strategy

No mobile-specific code changes — the architectural mitigations
already in place (viewport-gated WebGL, DPR capping, system fonts,
lazy images, reduced-motion respect) are UA-agnostic and apply on
mobile as-is. Real mobile Lighthouse/throttled-device testing is
**not available** in this environment; flagged as the top follow-up
(see §U).

## L. Reduced-motion strategy

No changes — `prefersReducedMotion()` already gates both Lenis
construction and WebGL canvas mounting, verified by reading
`SmoothScrollProvider.tsx` and `CinematicCanvasScene.tsx`/
`ExperienceCanvas.tsx`. Not re-verified per individual `Reveal`/
`Parallax` instance in this pass (see §U).

## M. Caching/data-fetching changes

None shipped. The `insights.content` over-fetch (§C) is documented,
not fixed, pending a live environment to measure and verify a re-
architected memoized read against.

## N. Lighthouse/PageSpeed results

Not available — no network/registry access in this sandbox, and no
live/production URL reachable from here.

## O. Core Web Vitals results

Not available. No field data exists yet either (SEO-5 confirmed no
analytics/RUM is installed) — there's nothing to read regardless of
this environment's limitations.

## P. SEO regression results

No SEO-relevant file was touched by this module's one code change
(`(site)/layout.tsx`'s import statement only). Metadata, canonical,
structured data, sitemap, and robots architecture (SEO-1/SEO-3) were
not modified. Full regression testing (`npm run build` + route
inspection) is **not available** in this environment — recommend
running the existing SEO regression check from SEO-1/SEO-3 once a
build is possible.

## Q. Files changed

```text
src/app/(site)/layout.tsx
```

## R. Files added

```text
docs/seo/performance.md
docs/seo/performance-checklist.md
MODULE-SEO-6-HANDOFF.md
src/components/ui/LazyFaqChatbot.tsx   (added in post-handoff correction)
```

## S. Verification

```text
Toolchain verification: Not available (npm registry unreachable —
  403 on install; lint/typecheck/build could not run)
Lighthouse/PageSpeed live verification: Not available
Production verification: Not available
```

Verification Matrix — using only actual evidence available in this
environment:

| Area            | Status | Evidence |
| --------------- | ------ | -------- |
| Build           | Not verified | `npm install` failed (403), build never ran |
| Typecheck       | Not verified | Same — no dependencies installed |
| Lint            | Not verified | Same |
| Homepage        | Statically reviewed | `Hero.tsx`, `CinematicCanvasScene.tsx` read directly |
| Services        | Not deep-audited | No route-specific issue found in time available |
| Projects        | Statically reviewed | `ProjectGallery.tsx` read directly |
| Insights        | Statically reviewed | `publicInsights.ts`, `insights.ts` repository read directly; over-fetch documented, not fixed |
| Images          | Statically reviewed | `next/image` usage sampled across projects/team/home features |
| Fonts           | Statically reviewed | `globals.css` confirms system-font strategy, no web fonts |
| Animations      | Statically reviewed | `gsap.ts`, `lenis.ts`, `SmoothScrollProvider.tsx` read directly |
| WebGL           | Statically reviewed | `ExperienceCanvas.tsx`, `CinematicCanvasScene.tsx` read directly |
| Reduced motion  | Statically reviewed | Gating confirmed in the same files above |
| Mobile          | Not verified | No device/emulator available |
| Sitemap         | Unchanged | Not touched this module |
| Robots          | Unchanged | Not touched this module |
| Canonicals      | Unchanged | Not touched this module |
| Structured data | Unchanged | Not touched this module |

## T. Known limitations

- No build tooling available in this environment — every claim in
  this module is a static-code-reading claim, not a measured one,
  except where explicitly marked otherwise.
- The one shipped change (`FaqChatbot` dynamic import) has an expected
  direction of effect (smaller initial JS on public routes) but no
  measured before/after number.
- The documented `insights.content` over-fetch was deliberately left
  unfixed rather than changed blind.

## U. Remaining P1/P2/P3 opportunities

**P1**
- Run a real mobile + desktop Lighthouse/PageSpeed pass against the
  deployed production URL for `/`, a `/services/[slug]`, a
  `/projects/[slug]`, and a `/insights/[slug]`, and confirm/assign
  `priority` to whatever each report names as the actual LCP element
  (none was added speculatively in this module).
- Re-run `npm run build` in an environment with registry access and
  read the actual route JS output to confirm the `FaqChatbot` dynamic
  import produced the expected chunk split, and to catch any other
  route whose JS is larger than its content justifies.

**P2**
- Resolve the `insights.content` over-fetch (§C/§M): either split
  `getPublicInsightRows()`'s memoized read into a narrow list query +
  a separate detail query, or confirm via a real payload-size
  measurement that it isn't worth the added query.
- Same `select("*")` pattern exists in `projects`,
  `project_inquiries`, and `contact_inquiries` repositories — lower
  urgency than `insights` (no large JSON body column), worth a pass
  once `insights` is resolved.
- Once analytics/RUM exists (flagged as out of scope for SEO-5 and
  this module), wire up real Core Web Vitals field data collection so
  future modules have something other than lab data to check against.

**P3**
- Full property-by-property audit of every `src/lib/motion/*.ts` /
  `src/components/motion/*.tsx` animation for `transform`/`opacity`-
  only usage, verified against a live profiler rather than a source
  read.
- Per-instance reduced-motion re-verification for every individual
  `Reveal`/`Parallax`/`SplitHeading`/`PinnedScene` usage, not just the
  two central gating points (`SmoothScrollProvider`,
  `CinematicCanvasScene`) audited in this module.
- Formal performance budget numbers (JS/image/font weight ceilings)
  once a first real `next build` output exists to set them against —
  see `docs/seo/performance.md` "Performance budget" for the
  placeholder targets proposed in the meantime.

## V. SEO-7 recommendations

SEO-7 is Local SEO, per the roadmap — independent of this module's
findings. The one item worth carrying forward: if SEO-7 touches
`/contact` or any location-specific page, be aware `next/image` and
the Lenis/GSAP architecture are already in a good state and don't need
re-auditing there; focus SEO-7 on local schema/NAP/citation work per
its own spec, not performance.
