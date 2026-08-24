# SEO-6 — Performance & Core Web Vitals

## Environment note (read first)

This module was executed in a sandbox with **no npm registry / network
egress**. `npm install` failed (`403` fetching packages not already
cached), so the following could **not** be run:

```text
npm run lint       — Not verified
npx tsc --noEmit   — Not verified
npm run build      — Not verified
Lighthouse/PageSpeed — Not available
Production verification — Not available
Core Web Vitals field data — Not available (SEO-5 confirmed no
  analytics/RUM is installed yet, so no field data exists to read
  regardless of environment)
```

Everything below is a **static architecture audit** of the actual
source in this repository, plus the one change that audit justified
with enough confidence to make blind (i.e. without a build/runtime to
verify against). No score, timing, or bundle-size number in this
document is invented — anywhere a number would normally go, it says
`Not available`.

## Baseline

No prior SEO-6 baseline exists (SEO-1–5 covered technical SEO,
keywords, schema, content, and Search Console — not performance).
This document *is* the baseline, established by reading the code.

## Architecture audit

The codebase already reflects several performance-conscious decisions
made in earlier modules (9-series, 10-series), not new SEO-6 work:

- **Fonts** (`src/app/globals.css`): `--font-stz-*` are **system font
  stacks** (`ui-serif`/`ui-sans-serif` + named fallbacks), not
  `next/font` web fonts. There is no `@font-face`, no Google Fonts
  request, no font-loading waterfall to optimize — this was a
  deliberate Module 0 decision ("local-font strategy... so the build
  never depends on network font fetches"), still in effect. **No
  action needed.** If real brand font files are ever dropped into
  `src/app/fonts/` and loaded via `next/font/local`, re-audit weights
  and `font-display` at that time.
- **Lenis/GSAP/ScrollTrigger** (`src/lib/motion/gsap.ts`,
  `src/lib/motion/lenis.ts`, `src/components/layout/
  SmoothScrollProvider.tsx`): a single global Lenis instance, created
  once, driven by exactly one `gsap.ticker.add()` callback (`lagSmoothing(0)`
  set once). `ScrollTrigger` is registered exactly once, from one
  central file (`ensureGsapRegistered`), which every other module is
  required to import through — this already prevents the "duplicate
  plugin registration" / duplicate-RAF-loop class of bug this audit
  was looking for. Reduced motion is checked *before* Lenis is even
  constructed, so reduced-motion users get native scrolling, not
  Lenis-with-animations-disabled. **No action needed.**
- **3D/WebGL** (`src/lib/three/ExperienceCanvas.tsx`,
  `src/lib/three/loadExperienceCanvas.tsx`,
  `src/components/motion/CinematicCanvasScene.tsx`): the canvas is
  loaded via `next/dynamic(..., { ssr: false })`
  (`LazyExperienceCanvas`), so Three.js/R3F never ship to a route that
  doesn't render a 3D scene. `CinematicCanvasScene` additionally gates
  mounting behind `useScrollScene3D`'s in-viewport check
  (`shouldMount`) and a `reducedMotion` check, so the canvas doesn't
  exist in the DOM (and isn't rendering frames) until it's actually
  visible, and never exists at all under reduced motion. `dpr={[1, 2]}`
  caps device-pixel-ratio work on high-DPI screens. The only current
  consumer is the Hero's `BrandGeometryScene`; no other route mounts a
  canvas. **No action needed** — this already matches the "capability
  tiering" and "pause offscreen canvas" goals in the module spec.
- **Images**: every image use found (`ProjectGallery`, `TeamFocus`,
  `TeamSequence`, `BouncingLogos`, `ServiceVisual`) goes through
  `next/image`, which handles responsive `sizes`, lazy-loading below
  the fold by default, and layout-stable `fill`/dimension-based
  rendering. `next.config.ts` allowlists the Supabase Storage hostname
  via `images.remotePatterns` so CMS-uploaded images are optimized
  rather than served raw. Gallery panels (`ProjectGallery.tsx`) are
  capped at 4 images per project and none pass `priority`, so nothing
  competes with the actual LCP candidate for bandwidth. **No action
  needed.**
- **CSS**: `globals.css` tokens define `--surface-glass` /
  `--surface-glow` (a `radial-gradient`) for future glass/glow
  treatment, but no `backdrop-filter`, animated `box-shadow`, or large
  `filter: blur(...)` was found applied in the current component set.
  Nothing here is currently taxing scroll compositing. Re-check this
  section if a later module adds glass-morphism panels.
- **Data fetching** (`src/lib/repositories/*`): public list/detail
  reads are wrapped in `react.cache()` at the `publicX.ts` boundary
  (e.g. `getPublicInsightRows`, confirmed in
  `src/features/insights/data/publicInsights.ts`), so multiple server
  components reading the same collection in one request (list page +
  `generateMetadata`) issue one Supabase query, not several. Admin
  list reads already support a `status` filter pushed to the database
  rather than fetched-then-filtered client-side (Module 9C).

None of the above needed to change for SEO-6 — they're recorded here
so the next module doesn't re-audit and second-guess work that's
already correct.

## JavaScript

**Change made:** `FaqChatbot` (`src/components/ui/FaqChatbot.tsx`,
433 lines, mostly static FAQ-entry string data, mounted on every
public page via `src/app/(site)/layout.tsx`) is now loaded with
`next/dynamic(..., { ssr: false })` instead of a static import.

- **Problem**: a rule-based, keyword-matching FAQ widget with no
  server-rendered content and no above-the-fold role was shipping in
  the same client bundle every visitor downloads and parses on every
  public route, whether or not they ever open it.
- **Root cause**: static `import { FaqChatbot } from "..."` in the
  `(site)` route-group layout, which every public page shares.
- **Change**: converted to `dynamic(() => import(...).then(m =>
  m.FaqChatbot), { ssr: false })`. No loading placeholder was passed —
  the widget is a `fixed`-position overlay with no reserved layout
  space before mount, so there's no CLS to guard against.
- **Post-review correction**: the first version of this change placed
  the `dynamic(..., { ssr: false })` call directly inside `src/app/
  (site)/layout.tsx`, which is an async Server Component — Next.js 16
  rejects that combination at build time ("`ssr: false` is not
  allowed with `next/dynamic` in Server Components"), which this
  sandbox's lack of a working `npm run build` didn't catch before
  handoff. Fixed by moving the `dynamic()` call into a new, small
  Client Component, `src/components/ui/LazyFaqChatbot.tsx`
  (`"use client"`), which `SiteLayout` now imports normally instead of
  calling `dynamic()` itself. The chunk-splitting behavior and
  expected effect are unchanged — only where the client/server
  boundary is drawn changed.
- **Expected effect**: `FaqChatbot`'s code + FAQ data move to their
  own chunk, fetched after hydration rather than blocking/adding to
  the initial route bundle — smaller initial JS on every public page.
- **Measured result**: Not available (no build in this environment).
  Verify via `next build`'s route JS size output before/after, and
  confirm the chatbot still opens/functions identically once mounted.

`WhatsAppButton` (42 lines, no dependencies beyond a config string)
was left as a static import — it's too small for a dynamic-import
boundary to pay for itself.

No other client-component conversions were made. Most `"use client"`
files audited (`src/components/motion/*`, `src/lib/motion/*`,
`src/hooks/*`) are animation primitives that are inherently
interactive/scroll-driven and already route through the shared
GSAP/Lenis singleton rather than duplicating work — converting them to
server components isn't possible without removing the cinematic
behavior itself, which is explicitly out of scope. The admin
(`src/features/admin/**`) client components were not touched: they're
form/editor UI behind auth, not part of the public, SEO-relevant, or
Core-Web-Vitals-measured surface.

## Images

Audited, no changes required — see "Images" under Architecture audit
above.

## Fonts

Audited, no changes required — see "Fonts" under Architecture audit
above.

## CSS

Audited, no changes required — see "CSS" under Architecture audit
above.

## LCP

Likely LCP element per route (static inspection, not measured):

| Route | Likely LCP candidate | Notes |
| --- | --- | --- |
| `/` | Hero `<h1>` (`SplitHeading`) or the WebGL brand mark | Hero is a client component; heading text is present in the initial HTML the client component returns, but `CinematicCanvasScene`'s viewport-gated canvas means the WebGL mark is not competing with it for LCP on load — its `fallback` (a static `BrandMark`) renders in its place until in-viewport, and Hero is above the fold by definition. |
| `/services`, `/projects`, `/insights` (index) | Page hero heading | Not deep-audited line-by-line in this pass; no `priority` image found on these routes, so if a hero image is added later it should get `priority` + explicit dimensions. |
| `/services/[slug]`, `/projects/[slug]`, `/insights/[slug]` | Detail hero heading, or first project gallery image if it renders above the fold | `ProjectGallery` images have no `priority`; if a gallery panel turns out to be the true LCP element on a given project's real content, that specific panel should get `priority`, not the whole gallery. |
| `/start-project`, `/contact` | Page heading / form | Form-first pages, no large media. |

No `priority` was added speculatively — per the module's explicit
instruction, only a confirmed LCP element should receive it, and
confirming requires a real Lighthouse trace this environment can't
run. **Recommendation for SEO-7 or a follow-up with a live
environment:** run PageSpeed Insights against the deployed
production URL for the routes above and add `priority` only to
whatever each report names as the LCP element.

## INP

Interaction-heavy areas audited: mobile nav (`Header.tsx`), Start
Project / Contact forms, project gallery horizontal scroller. No long
synchronous handlers or obviously expensive per-keystroke work were
found in the client components read during this pass. Detailed
per-interaction profiling requires a live environment (Chrome
DevTools Performance panel or field INP data) — **Not available**
here.

## CLS

No unconstrained dynamic content (no ads, no late-injected banners)
was found on public routes. `next/image` usage throughout supplies
either explicit `width`/`height` or `fill` inside an
explicitly-sized/aspect-ratioed container (`ProjectGallery`'s
`aspect-[...]` classes), so image-driven layout shift risk is low by
construction. Fonts are system stacks with no swap period. No CLS
regression risk was introduced by this module's one change
(`FaqChatbot` has no reserved layout space either before or after the
dynamic-import change — it simply doesn't exist in the DOM until
mounted, in both versions).

## Animation performance

No changes made — see Architecture audit. `ScaleReveal`, `Parallax`,
`Reveal`, `SplitHeading`, `PinnedScene`, `HorizontalScroller` were not
individually rewritten in this pass since no measurable problem was
identified via static reading (GSAP tweens observed target `opacity`/
transform-style properties in the files sampled, not `top`/`left`/
`width`/`height`). A full property-by-property audit of every
animation file against a live profiler is listed as a remaining
opportunity below.

## WebGL performance

No changes made — see Architecture audit ("3D/WebGL"). Viewport
gating, reduced-motion gating, dynamic import, and DPR capping are
all already in place for the only current 3D consumer (Hero's
`BrandGeometryScene`).

## Mobile performance

Not independently verified (no device/emulator available in this
environment). The architectural mitigations already in place —
viewport-gated WebGL, `dpr` capping, system fonts, lazy images,
reduced-motion respect — all apply on mobile as much as desktop, since
none of them branch on a UA string. **Recommendation:** run a real
mobile Lighthouse/PageSpeed pass (throttled 4G, mid-tier device
profile) once a live environment is available; this is the single
highest-value follow-up for this module.

## Reduced motion

Verified in code (not in a browser): `prefersReducedMotion()`
(`src/hooks/useReducedMotion.ts`) gates Lenis construction in
`SmoothScrollProvider` and gates the WebGL canvas in
`CinematicCanvasScene`/`ExperienceCanvas`. Both fall back to native
scrolling / a static fallback element rather than hiding content.
Not independently re-verified for every individual `Reveal`/
`Parallax`/`SplitHeading` instance in this pass — flagged as a
remaining opportunity below.

## Caching / data fetching

`react.cache()` memoization confirmed for the public insights read
path (see Architecture audit). `select("*")` is used uniformly across
`src/lib/repositories/*` for both list and detail reads — including
`insights`, where the list read (`listPublishedInsights`, used by
`/insights`) currently fetches the full `content` jsonb article body
for every insight just to render index/card data (`toInsight()` in
`publicInsights.ts` always calls `normalizeInsightBlocks(row.content)`).

This is a genuine over-fetch, but **no change was made** for it in
this module: `getPublicInsightRows()` is `react.cache()`-memoized and
shared between the list page *and* `/insights/[slug]`'s
`generateMetadata`, so narrowing the list query's columns would need
to either (a) split into two differently-scoped queries and lose the
one-query-per-request memoization guarantee across list vs. detail
requests, or (b) accept the `content` field being absent from a type
still named `InsightRow` everywhere it's currently used. Both are
real code changes with real correctness surface area, and the module
spec explicitly says not to make speculative database changes without
evidence — there's no measurement here of how large a typical
`insights.content` payload actually is. **Documented as a P2 for
SEO-7 / a follow-up module with a live environment to measure
`content` payload size and re-architect the memoized read with that
number in hand**, rather than changed blind.

The same `select("*")` pattern exists in `projects`,
`project_inquiries`, `contact_inquiries` repositories — none audited
as more urgent than `insights` (their rows don't carry a large
`content`-style JSON column), listed here for completeness.

## Third-party resources

SEO-5 confirmed no analytics/tracking is installed. No new
third-party script was found or added in this audit (no chat SaaS
widget — `FaqChatbot` is fully in-house/client-side per its own doc
comment; `WhatsAppButton` is a plain `<a>` link to `wa.me`, not an
embedded widget). No third-party render-blocking resource exists to
fix.

## Performance budget

No prior budget exists. Proposed **initial targets, to review after
the first real measurement pass** (not enforced by tooling in this
module):

```text
Initial route JS (shared + route chunk): review after first
  `next build` output is available — no baseline number exists yet
  to set a number against.
Largest single image on any public route: keep under ~300KB
  delivered (next/image already re-encodes/resizes toward this
  naturally; not independently confirmed per-route).
Font files: 0 (system stack — no budget needed unless a future
  module adds real font files).
Third-party requests on public routes: 0 (current state; keep at 0
  unless a future module has an explicit reason to add one).
```

## Testing methodology

Static source-code audit only, in a sandboxed environment without npm
registry access. No build, no lint, no typecheck, no Lighthouse, no
real-device or emulator test could be run. Every claim above is
either (a) something read directly in the source, cited by file path,
or (b) explicitly marked "Not available" / "Not verified."

## Results

One code change shipped (`FaqChatbot` → dynamic import). Effect not
measured — see "JavaScript" above. Everything else in the current
architecture was already consistent with the module's performance
goals and was left unchanged rather than modified without evidence.

## Remaining bottlenecks

See "Remaining P1/P2/P3 opportunities" in
`MODULE-SEO-6-HANDOFF.md`.
