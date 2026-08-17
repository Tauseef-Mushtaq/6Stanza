# MODULE 4C — HANDOFF (Projects / Case Studies)

Scope: build `/projects` and its project detail routes only. **Modules
0–3, 4A, and 4B were not touched** — no homepage section, motion
primitive, design token, About file, or Services file was modified.
This module only adds new files under `src/features/projects/` and
replaces the Module 0 `RoutePlaceholder` stub at `src/app/projects/page.tsx`
(the same pattern Modules 4A/4B used for `/about` and `/services`).

## Before writing code — what I found reading the actual source

Per prior modules' convention of reading real code over trusting
handoff prose:

- `src/features/home/data/projects.ts` already has real structured
  data for all 3 projects (`title`, `category`, `description`,
  `technologies`, `outcome`, `accent`) — used as-is by the homepage's
  `Work.tsx`. Module 4C reuses this array directly rather than
  duplicating it.
- The `[slug]` dynamic-route + `generateStaticParams` + `notFound()`
  pattern Module 4B established at `src/app/services/[slug]/page.tsx`
  was reused exactly, including its async `params: Promise<{ slug }>`
  signature (confirmed against the actual file, not assumed).
- `HorizontalScroller` (used by the homepage's `Team.tsx` and About's
  `Process.tsx`) was reused for the Gallery chapter rather than
  building a new horizontal mechanism, per Module 4B's own
  instruction to reuse this pattern for Projects/Team-style galleries.
- The line-and-node "flow diagram" technique from Services'
  `ServiceArchitecture.tsx` / About's `Direction.tsx` was reused for
  the project Architecture chapter, re-oriented vertically (stack)
  instead of horizontally (pipeline) so it reads as a companion piece
  rather than a straight copy.

## Architecture

```
src/features/projects/
  data/
    projectDetails.ts          NEW — per-project case-study content
  sections/
    ProjectsHero.tsx            NEW — /projects Chapter 01
    ProjectsIntro.tsx           NEW — /projects Chapter 02
    FeaturedProjects.tsx        NEW — /projects Chapter 03+ (editorial list)
    ProjectDetailHero.tsx       NEW — detail page Chapter 01
    ProjectOverview.tsx         NEW — detail page Chapter 02
    ProjectChallenge.tsx        NEW — detail page Chapter 03
    ProjectSolution.tsx         NEW — detail page Chapter 04
    ProjectArchitecture.tsx     NEW — detail page Chapter 05
    ProjectGallery.tsx          NEW — detail page Chapter 06
    ProjectOutcome.tsx          NEW — detail page Chapter 07
    ProjectNextCta.tsx          NEW — detail page Chapter 08

src/app/projects/
  page.tsx                      MODIFIED (was RoutePlaceholder stub)
  [slug]/page.tsx                NEW — one dynamic route for all projects
```

One reusable detail template, not one page file per project. Adding a
fourth project later only means adding one entry to
`src/features/home/data/projects.ts` (existing, unchanged file) plus
one entry to the new `projectDetails.ts` — no new route file.

## Files created

```
src/features/projects/data/projectDetails.ts
src/features/projects/sections/ProjectsHero.tsx
src/features/projects/sections/ProjectsIntro.tsx
src/features/projects/sections/FeaturedProjects.tsx
src/features/projects/sections/ProjectDetailHero.tsx
src/features/projects/sections/ProjectOverview.tsx
src/features/projects/sections/ProjectChallenge.tsx
src/features/projects/sections/ProjectSolution.tsx
src/features/projects/sections/ProjectArchitecture.tsx
src/features/projects/sections/ProjectGallery.tsx
src/features/projects/sections/ProjectOutcome.tsx
src/features/projects/sections/ProjectNextCta.tsx
src/app/projects/[slug]/page.tsx
MODULE-4C-HANDOFF.md
```

## Files modified

- `src/app/projects/page.tsx` — replaced the `RoutePlaceholder` stub
  with `<ProjectsHero /><ProjectsIntro /><FeaturedProjects />`.

## Files deleted

None.

## Routes created

```
/projects
/projects/citizen-services-platform
/projects/commerce-cloud-migration
/projects/brand-systems-relaunch
```

`src/config/routes.ts` was not touched — `/projects` was already in
`primaryNav`; detail routes are reached from the `FeaturedProjects`
list, the homepage `Work.tsx` (unchanged, already linked to `/projects`
and will link to real slugs once it's revisited), and each detail
page's prev/next/back links.

## `/projects` landing page

1. **`ProjectsHero`** — full-viewport (`min-h-svh`) dark opener, same
   family as Services'/About's heroes: eyebrow + "01–0N" project
   count, `SplitHeading` statement ("Selected work."), supporting
   line, `--header-h` top clearance for the fixed header.
2. **`ProjectsIntro`** — shorter editorial transition chapter
   ("02 — Selected Systems") bridging hero into the featured work, so
   the page doesn't repeat a full-viewport beat twice in a row.
3. **`FeaturedProjects`** — the actual project list as large full-width
   editorial chapters (`min-h-[92svh]` each), never a card grid.
   Alternates left/right visual placement per project and cycles
   through three distinct abstract-SVG visual modes (node graph,
   layered horizon, concentric rings) so consecutive projects don't
   share an identity, per the brief's explicit instruction. Each
   chapter links to `/projects/[slug]` via "View case study".

## Project detail page (eight chapters)

Composed in `src/app/projects/[slug]/page.tsx`, reading `project` from
the existing `projects.ts` and `detail` from the new
`projectDetails.ts`:

1. **Hero** — number/category/year eyebrow, `SplitHeading` title,
   positioning statement, accent-tinted radial glow unique to each
   project, "← All projects" link.
2. **Overview** — two-column "what it is" / "what we contributed"
   statement, no card, no dense paragraph block.
3. **Challenge** — large dark full-viewport-ish (`min-h-[80svh]`)
   statement of the problem.
4. **Solution** — statement + accent-tinted abstract technical visual
   (nested rounded frames + center node), split layout.
5. **Architecture** — the strongest section per the brief: a vertical
   connected line with a lit node per group, each group listing only
   technologies already present in that project's own `technologies`
   array (grouped into e.g. Application / Orchestration /
   Infrastructure / Observability) — nothing invented.
6. **Gallery** — a `HorizontalScroller`-driven sequence of four
   asymmetric panels (different widths/aspect ratios), structured
   gradient + grid placeholders ready to swap for real screenshots.
7. **Outcome** — qualitative closing statement plus the project's
   existing factual `outcome` badge (e.g. "99.9% uptime
   post-migration") — no new numbers introduced at this layer.
8. **Next Project** — large `SplitHeading` link into the next project
   (wraparound), plus explicit prev-project and back-to-all-projects
   links, so the visitor is never trapped in the cinematic sequence.

## Shared primitives reused (nothing new was built)

`Reveal`, `SplitHeading`, `Parallax`, `ScaleReveal`, `HorizontalScroller`,
`Container`, `TechnicalLabel`, `AccentLine`, `SubtleGrid`, `Divider`,
`NumberIndicator`, `Header`/`Footer` (untouched, rendered by the root
layout). No new GSAP/ScrollTrigger setup, no new scroll library, no
WebGL/3D scene was added anywhere in this module — the homepage Hero's
scene remains the app's only 3D scene, per prior modules' performance
guidance and this brief's §19.

## Animation approach

Entirely declarative via existing components — every chapter's motion
is `Reveal` / `SplitHeading` / `Parallax` / `ScaleReveal` /
`HorizontalScroller` doing what they already do elsewhere in the app.
No component in this module calls `gsap.to()` or
`ScrollTrigger.create()` directly.

## Responsive behavior

- All typography/spacing uses the existing `clamp()`-based tokens — no
  new breakpoint values were introduced.
- `FeaturedProjects`' visual/text grid collapses to a single column
  below `lg` (`grid-cols-1 lg:grid-cols-12`), with the `lg:order-*`
  flip only applying at `lg` and above.
- `ProjectArchitecture`'s connecting line and node list stack
  naturally in normal document flow at any width — no fixed pixel
  positioning, just the existing `Reveal` stagger.
- `ProjectGallery` reuses `HorizontalScroller`'s existing responsive
  behavior unmodified: falls back to native `overflow-x-auto` scroll
  on mobile / under reduced motion, per Module 2's original
  implementation.
- `ProjectNextCta`'s prev/next/back links wrap via `flex-wrap` so they
  never overflow horizontally on narrow viewports.

## Accessibility

- No new reduced-motion implementation. Every animated element goes
  through `Reveal` / `SplitHeading` / `Parallax` / `ScaleReveal` /
  `HorizontalScroller`, all of which already read `isReducedMotion`
  from the existing Module 2 `useGsapContext` hook and degrade
  automatically (content stays visible; pins/scrubs are skipped;
  `HorizontalScroller` falls back to native touch/wheel scroll).
- All decorative SVG (`SubtleGrid`, the architecture connector line,
  `ProjectVisual`/gallery grid patterns) is `aria-hidden`.
- Section headings use real `<h1>`/`<h2>`/`<h3>` elements in document
  order.
- Every case-study link (`View case study`, prev/next, back-to-all) is
  a real `<Link>` with the existing site-wide `focus-visible:outline`
  pattern — no interaction is mouse/scroll-only.

## Verification results (actually run, not just described)

```text
npm install        PASS (430 packages, no errors)
npm run lint        PASS (0 errors; 1 unused-import warning found and fixed)
npx tsc --noEmit    PASS
npm run build       PASS — Route tree includes:
                            ○ /projects
                            ● /projects/citizen-services-platform
                            ● /projects/commerce-cloud-migration
                            ● /projects/brand-systems-relaunch
                            (all prerendered via generateStaticParams,
                            alongside all pre-existing routes unchanged)
npm run dev         PASS — curled and confirmed HTTP 200 for:
                            /, /projects,
                            /projects/citizen-services-platform,
                            /projects/commerce-cloud-migration,
                            /projects/brand-systems-relaunch
```

Case-sensitive import audit: every new `@/...` import introduced by
this module was checked against on-disk file casing; no mismatches.

## Known limitations

- **No visual/browser screenshot QA was performed.** This environment
  has no interactive browser/Playwright available, matching the
  limitation noted in every prior module's handoff. Verification
  above relies on build/typecheck/lint plus `curl` HTTP-status checks
  against `next dev`, which is a strong signal but not a substitute
  for a human visual pass — **please open `/projects` and at least one
  detail page in a real browser (desktop + mobile) before merging**,
  per the brief's own instruction not to stop at "build passes."
- No real photography/video/case-study assets exist yet.
  `FeaturedProjects`' `ProjectVisual` and `ProjectGallery`'s panels are
  structured SVG/gradient placeholders (deterministic per project via
  a seeded pseudo-random helper, same technique as the homepage's
  `Work.tsx`), not empty rectangles — but they are still placeholders.
  Swapping in real imagery only touches these two files.
- `ProjectDetailHero` currently hardcodes a `year="2025"` default prop
  since `projects.ts` doesn't carry a year field. This is a visible,
  easy-to-find placeholder (a single default parameter), not a
  fabricated claim — add a real `year` field to `projects.ts` and pass
  it through if/when accurate per-project years are available.
- `projectDetails.ts`'s architecture groupings (e.g. "Orchestration",
  "Observability") are my own reasonable categorization of each
  project's existing `technologies` array, not sourced from any new
  information — treat the grouping labels as a structurally-sound
  first draft, not confirmed internal terminology.
- Case-study narrative copy (challenge/solution/overview paragraphs)
  in `projectDetails.ts` is original but has not been reviewed by
  anyone at 6STANZA — same caveat Module 4B noted for
  `serviceDetails.ts`.

## Instructions for Module 4D

- Do not rebuild Modules 0–3, 4A, 4B, or this module. Everything under
  `src/features/projects/` and `src/app/projects/` is considered final
  for this pass.
- If a future module adds real project imagery, `ProjectVisual`
  (`FeaturedProjects.tsx`) and the panels in `ProjectGallery.tsx` are
  the only two places to touch — layout/motion doesn't need to change.
- If `projects.ts` ever gains a `year` field, update
  `ProjectDetailHero`'s call site in `src/app/projects/[slug]/page.tsx`
  to pass it explicitly instead of relying on the current default.
- Reuse `ProjectArchitecture`'s vertical connected-line technique as
  precedent if a future page needs a third orientation of the same
  line-and-node idea — don't invent a fourth diagram mechanism for the
  same purpose (Services: horizontal pipeline; About/Direction:
  horizontal route; Projects: vertical stack — three is enough).
