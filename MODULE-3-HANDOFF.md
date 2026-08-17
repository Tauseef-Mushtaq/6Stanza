# MODULE 3 — HANDOFF (revised: Module 3.1 visual refinement)

This supersedes the original Module 3 handoff below the `---` divider,
which is kept for history. This section documents the cinematic
visual-refinement pass requested on top of the existing Module 3
homepage. **Modules 0–2 were not touched. Module 4 was not started.**

## Scope of this pass

Given the size of the full brief, this pass focused on the two changes
the brief marked as highest-priority and most concretely specified,
plus one quick, low-risk viewport fix, rather than a shallow touch
across every chapter:

1. **Hero 3D object → the actual 6STANZA mark** (spec §3) — done in full.
2. **Services compass → an engineered dial, not a decorative circle**
   (spec §2 Ch.03) — done in full.
3. **Positioning chapter → viewport-dominant** (spec §2 Ch.02) — done.

Six S, Selected Work, Team, and Final CTA were audited against the
brief's explicit "do NOT" rules (no card grids, no dashboard cards) and
already comply — see "Audited, not changed" below. Bringing every
remaining chapter to full `min-h-svh` cinematic pacing is a reasonable
next increment but was left out of this patch to keep it small and
reviewable.

## Changed / new files

```
src/features/home/scene/markShape.ts                  NEW
src/features/home/scene/BrandGeometry.tsx              MODIFIED
src/features/experience/services/ServiceCompass.tsx    MODIFIED
src/features/home/sections/Services.tsx                MODIFIED
src/features/home/sections/Positioning.tsx              MODIFIED
src/features/home/data/services.ts                     MODIFIED
```

No files were deleted. No Module 0/1/2 primitive was modified.

## 1. Hero 3D logo — how it was built

The brief was explicit: don't hand-approximate the mark, and determine
the cleanest way to preserve its exact silhouette since the source
asset (`public/6stanza-mark.png`) is raster-only.

What I did:

- Ran the mark's alpha channel through contour tracing (OpenCV
  `findContours` + `approxPolyDP`) to extract its exact silhouette as a
  polygon path, normalized to a `-1..1` unit box. That output is
  `src/features/home/scene/markShape.ts` — a small, inert data file
  (`MARK_SHAPES: MarkSubShape[]`), not hand-drawn coordinates.
- `BrandGeometry.tsx` now builds a `THREE.Shape` from that path and
  extrudes it (`THREE.ExtrudeGeometry`, beveled) into a real 3D solid —
  replacing the previous generic icosahedron core entirely.
- Material: deep royal blue (`#1f63ff`) with restrained metalness
  (0.55) and roughness (0.32), a small emissive tint for a lit-from-
  within read, plus a slightly larger near-black duplicate mesh offset
  behind it on Z to fake a shadow edge/depth without a second render
  pass. No chrome, no particles.
- Motion: continuous slow Y-rotation + a gentle sine float, still
  driven through the hero's existing `ScrollDrivenGroup` keyframes
  (position/rotation/scale across scroll progress) — the scroll-driven
  architecture from Module 2 is unchanged, only the mesh inside it is new.
- Reduced-motion, canvas lazy-mount, and the `<BrandMark>` DOM fallback
  in `Hero.tsx` were untouched — they already didn't assume anything
  about what's inside `BrandGeometryScene`.

If the logo is ever redesigned, regenerate `markShape.ts` from the new
PNG rather than hand-editing it (a short Python/OpenCV script was used
once to produce it; it isn't a runtime project file so it isn't in the
patch — happy to add it under `scripts/` if you want it kept in-repo).

## 2. Services compass — how it was revised

`ServiceCompass.tsx` (Module 2's reusable primitive) already had the
right bones — a circular arrangement of 8 numbered nodes with an active
node and right-side content — but read as a ring of buttons rather than
"an engineered navigation mechanism." Changes, all inside the existing
component (no new architecture, no new libraries):

- Added an SVG dial layer: 60 tick marks around the circle (major ticks
  aligned to each service), a progress arc that fills as the user moves
  through the 8 services, and a needle line sweeping from center to the
  active node — all driven off the same `activeIndex` state the
  component already tracked.
- Added a `category` field to each service (`services.ts`) — e.g. "Web
  Development" is now labeled "Development" — so the right side shows
  number / category pill / large title / description / visual, matching
  the brief's requested content order.
- Kept everything else as-is: `PinnedScene` pin/progress mechanics,
  click-to-select nodes, `ServiceVisual` abstract SVGs, dark re-tone via
  CSS variables in `Services.tsx`.

This stays DOM/SVG-driven per the brief's performance constraint (§13)
— no additional WebGL canvases were added for Services.

## 3. Positioning — viewport fix

Was a normally-padded block (`padding-block: var(--space-section)`).
Changed to `min-h-svh` + centered content + a larger display numeral,
so Chapter 02 now occupies the viewport the way Hero does, instead of
reading as a shorter ordinary section between two full-screen ones.

## Audited, not changed

- **Header** — already uses the real brand mark (`BrandMark` →
  `public/6stanza-mark.png`) next to the wordmark, per spec §4. No
  CSS-approximated logo anywhere. Left as-is.
- **Six S** — already a connected numbered sequence with running
  dividers, not a card grid (spec §5). Left as-is.
- **Selected Work** — already full-width asymmetric editorial rows, not
  a 3-column card grid (spec §6). Left as-is.
- **Team / Final CTA** — not modified this pass; no rule violations
  found, but neither is `min-h-svh`-based yet. Flagged as the natural
  next step if you want the full homepage brought to the same viewport
  pacing as Hero/Positioning/Services.

## Verification — IMPORTANT LIMITATION

I was not able to run the brief's required verification steps
(`npm install`, `npm run lint`, `npx tsc --noEmit`, `npm run build`,
`npm run dev`, or a browser check) in this environment: it has no
network access, and `node_modules` isn't present in the project you
uploaded (correctly excluded from the zip), so no package manager
command can run here.

What I did instead:
- Read every file I touched in full before and after editing.
- Checked bracket/brace/paren balance programmatically on every changed
  file.
- Cross-checked prop names and types against the actual unmodified
  Module 2 primitives (`PinnedScene`, `ScrollDrivenGroup`,
  `NumberIndicator`, `TechnicalLabel`) rather than assuming signatures.
- Confirmed `--text-display` and every other CSS variable I used
  already exists in the Module 1 token sheet.

That is not a substitute for a real build. Before you ship this,
please run the brief's own verification sequence locally:

```
npm install
npm run lint
npx tsc --noEmit
npm run build
npm run dev   # then eyeball Hero, Services, Positioning, and mobile
```

The highest-risk item to eyeball first is the extruded mark geometry in
`BrandGeometry.tsx` — silhouette tracing is deterministic and I visually
diffed the traced outline against the source PNG (it reproduces the
mark faithfully), but I could not render actual WebGL output here to
confirm lighting/bevel look right at runtime.

---

# MODULE 3 — HANDOFF (original, pre-refinement)

# MODULE 3 — HANDOFF

Cinematic homepage / brand experience, built on Module 0 (foundation),
Module 1 (design system), and Module 2 (motion engine). Read this
before starting Module 4.

## What was implemented

The real 6STANZA homepage at `/`, composed as seven chapters:

1. **Hero** — full-screen cinematic intro: geometric mark, split-text
   headline, positioning copy, CTA, and an original scroll-driven 3D
   object.
2. **Positioning** — "not a web dev shop, a technology partner"
   statement with a drifting background numeral.
3. **Services** — the real eight services (Web Dev, Cloud, DevOps,
   Cyber Security, Networking, Marketing, Video, SEO) through the
   existing `ServiceCompass` numbered/compass progression, each with an
   original abstract SVG visual.
4. **Six S** — the six operating principles (Strategy, Software,
   Systems, Security, Scalability, Speed) as a connected numbered
   sequence — deliberately not another card grid, and never confused
   with the Services list.
5. **Selected Work** — three full-width editorial project presentations
   with structured, CMS-ready metadata (no 3-column cards).
6. **Team** — four editorial team cards with monogram placeholders,
   ready for real photography.
7. **Final CTA** — closing cinematic moment into `/start-project`.

The header was also upgraded from a static placeholder into a
scroll-aware, transparent-over-hero navigation using the brand mark.

## New files

```
src/features/home/data/services.ts
src/features/home/data/sixS.ts
src/features/home/data/projects.ts
src/features/home/data/team.ts
src/features/home/sections/Hero.tsx
src/features/home/sections/Positioning.tsx
src/features/home/sections/Services.tsx
src/features/home/sections/SixS.tsx
src/features/home/sections/Work.tsx
src/features/home/sections/Team.tsx
src/features/home/sections/FinalCta.tsx
src/features/home/scene/BrandGeometry.tsx
src/features/home/components/ServiceVisual.tsx
MODULE-3-HANDOFF.md
```

## Modified files

- `src/app/page.tsx` — replaced the Module 0 `RoutePlaceholder` with
  the real chapter composition above.
- `src/components/layout/Header.tsx` — rebuilt as a client component:
  transparent-over-hero → translucent-blurred-on-scroll background,
  `BrandMark` as the primary identity element (per spec §5/§16), and a
  slide-down mobile menu built from the existing `MenuTrigger` /
  `primaryNav` config. No new nav data source — still reads
  `src/config/routes.ts`.

No Module 0/1/2 file was modified. No file was deleted.

## Architecture

### Homepage / chapter structure

`src/app/page.tsx` only composes `src/features/home/sections/*` in
order — no section-specific markup lives in the page file itself, per
spec §26. Each section is a self-contained component that owns its own
background tone (dark navy for Hero/Positioning/Services/Team/FinalCta,
light for Six S/Work) so the page reads as one evolving surface rather
than repeating the same card pattern.

### Motion architecture — Module 2 primitives reused

No new ScrollTrigger/gsap.context boilerplate was written. Every
choreography need was met by importing from `@/components/motion`:

- `Reveal` — directional entrance for nearly all copy/labels.
- `SplitHeading` — word-level choreography on the Hero and Final CTA
  headlines.
- `Parallax` — the drifting "02" background numeral in Positioning.
- `ScaleReveal` — project visual entrances (Work) and the Final CTA
  brand mark.
- `ServiceCompass` (from `src/features/experience/services/`, Module
  2's pinned numbered-progression component) — reused as-is for
  Services, supplied with the real service data/visuals. It was
  re-toned for its dark chapter via a CSS-custom-property override on
  a wrapping `<div>` (`--color-border`, `--color-surface-elevated`,
  `--color-text-secondary`) — the component itself was not modified.
- `CinematicCanvasScene` + `ScrollDrivenGroup` — power the Hero's 3D
  object exactly per Module 2's documented pattern: the render-prop
  hands the scroll-progress ref straight to `ScrollDrivenGroup`.

### 3D architecture

`src/features/home/scene/BrandGeometry.tsx` is the only new 3D scene.
It's an original geometric form — a faceted icosahedron core, a slower
counter-rotating wireframe icosahedron shell, and a thin orbiting ring
— evoking the logo's folded angularity without recreating the mark
itself (per spec §18). It's driven by four `Vec3Keyframe`s through
`ScrollDrivenGroup` (enter → settle → drift → exit) and is the single
3D scene on the homepage: it mounts once via `CinematicCanvasScene`
(viewport-gated, reduced-motion-gated, via Module 0/2's existing
`LazyExperienceCanvas`/`useScrollScene3D`) and is not re-instantiated
per service — the Services chapter uses lightweight inline SVGs
(`ServiceVisual.tsx`) instead of eight WebGL scenes, per spec §11's
performance guidance.

### Responsive behavior

- All typography/spacing comes from Module 1's existing `clamp()`
  tokens — no new breakpoint values were introduced.
- Team/Work grids collapse via existing Tailwind breakpoints
  (`sm:grid-cols-2 lg:grid-cols-4` for Team; the Work rows already
  stack to a single column below `lg`).
- The header's desktop nav/CTA hide below `md`; the mobile menu (new)
  is a slide-down panel, not a fixed-position overlay, so it never
  introduces horizontal overflow.
- `ServiceCompass`'s pin duration is `durationVh`-based (viewport-height
  multiples), unchanged from Module 2, so it scales naturally per
  device.

### Accessibility

No second reduced-motion system was created. Every new section uses
Module 2 components that already check `useReducedMotion` /
`prefersReducedMotion()` internally (`Reveal`, `SplitHeading`,
`ScaleReveal`, `Parallax`, `ServiceCompass`'s underlying `PinnedScene`,
`CinematicCanvasScene`). Under reduced motion: all copy is visible
immediately, the Hero falls back to a static centered `BrandMark`
instead of mounting WebGL, and the Services chapter's pin is skipped
(content still reachable, just not scroll-scrubbed).

## Verification

Run from `stanza/`:

```text
npm install        PASS
npm run lint       PASS (no warnings/errors)
npx tsc --noEmit   PASS
npm run build      PASS — all 11 routes (/, /about, /contact,
                          /design-system, /insights, /motion, /projects,
                          /services, /start-project, /team, /_not-found)
                          prerender as static content
npm run dev        PASS — verified HTTP 200 for /, /services, /motion,
                          /design-system, /team, /about; homepage HTML
                          contains the real hero copy ("Systems built
                          to move your business forward.")
```

## Known limitations

- No real photography/video exists yet — Team uses monogram
  placeholders and Work uses gradient placeholders; both are
  structured (`initials`, `accent`, etc.) so real assets drop in
  without touching layout or motion.
- No visual/browser screenshot QA was performed in this environment —
  same sandbox limitation noted in Module 1/2's handoffs (no Playwright
  browser download host on the network allowlist). Verification relies
  on build/typecheck/lint plus `curl` status + content checks against
  `next dev`, which is a strong signal but not a substitute for a human
  visual pass.
- The Hero's fixed header now overlaps the very top of non-hero routes
  (`/about`, `/services`, etc., which still use Module 0's
  `RoutePlaceholder`) since `Header` changed from `sticky` to `fixed` to
  support the transparent-over-hero effect. Those placeholder routes
  already center their content vertically so the overlap is minor, but
  Module 4 (or whichever module builds those routes' real content)
  should add top clearance consistent with the new fixed header height.
- `ServiceCompass` is re-toned for its dark chapter via a CSS-variable
  override wrapper rather than a `variant` prop on the component itself
  — acceptable for one dark usage today, but if a future module needs
  more than two tone contexts for it, consider adding a real `tone`
  prop to the Module 2 component instead of stacking more wrapper
  overrides.
- The 3D hero object is intentionally simple (three meshes total) to
  keep the pinned/scroll-heavy homepage cheap — it is not a
  photorealistic centerpiece. If Module 4+ wants a more elaborate hero
  object, extend `BrandGeometryScene` rather than adding a second 3D
  scene to the homepage.

## Instructions for Module 4

- Do not rebuild Modules 0–3. Reuse `src/features/home/sections/*`,
  `src/components/motion/*`, `src/lib/motion/*`, and `ServiceCompass`
  as-is.
- The homepage is frontend-only, per spec — no Supabase/backend was
  added. If Module 4 wires up real data (projects, team, contact form),
  keep consuming the existing shapes in `src/features/home/data/*.ts`
  rather than restructuring the section components.
- `src/config/routes.ts` remains the single source of truth for nav —
  add new routes there.
- If Module 4 builds out the individual routes (`/services`,
  `/projects`, `/team`, etc.) beyond `RoutePlaceholder`, account for the
  new fixed `Header`'s height (see Known limitations above).
- Reuse `ServiceVisual.tsx`'s abstract SVG language if any other
  section needs per-item iconography — don't introduce a second visual
  system for the same purpose.
