# MODULE 4A — HANDOFF (About + Company Story)

Scope: build the `/about` page only. **Modules 0–3 were not touched** —
no homepage section, no shared motion primitive, no design token, and
no global component was modified. This module only adds new files under
`src/features/about/` and one new page at `src/app/about/page.tsx`
(replacing its Module 0 placeholder).

## What was implemented

Seven cinematic chapters, composed in `src/app/about/page.tsx`:

1. **AboutHero** — centered, mark-anchored statement ("Technology built
   with purpose."). Deliberately not a copy of the homepage Hero: no 3D
   scene, no split layout — a different composition in the same visual
   language.
2. **WhoWeAre** — editorial two-column statement (large claim + shorter
   supporting copy), positions 6STANZA as a technology partner, not a
   web-dev shop. No card.
3. **Philosophy** — the Six S principles (imported from the existing
   `@/features/home/data/sixS`, not duplicated), presented as one
   connected line of thinking: alternating left/right rows strung along
   a static center connector with a lit node per principle, subtle
   `Parallax` drift per side. Intentionally a *different mechanism* from
   the homepage's pinned/scrubbed curved-path Six S chapter, so it reads
   as a companion piece, not a re-skin.
4. **Process** — "Discover → Design → Build → Validate → Deploy →
   Evolve", six new steps (`src/features/about/data/process.ts`,
   distinct from both the Six S philosophy and the services list, per
   §7's explicit instruction not to conflate them). Reuses the existing
   `HorizontalScroller` primitive (the same vertical-scroll-drives-
   horizontal-movement mechanism built for the homepage Team section)
   with a different visual treatment (connected steps with arrow
   glyphs, light surface) so it doesn't read as a Team clone.
5. **Values** — an editorial "manifesto" list (Reliability, Honesty,
   Clear communication, Realistic commitments, Delivery discipline,
   Long-term thinking) as numbered rows with dividers, not trust-badge
   cards. Qualitative statements only — no invented stats, awards, or
   client counts.
6. **Direction** — Pakistan as where 6STANZA operates today, Saudi
   Arabia / UAE / International framed explicitly as direction/ambition
   (labelled "Next" / "Ahead"), not current presence. Visual is an
   abstract coordinate/route line (SVG, no literal map, no fabricated
   place data).
7. **FinalCta** — closing chapter into `/start-project`, same dark/glow
   family as the homepage's closing chapter but a distinct left-anchored
   composition and About-specific copy.

## New files

```
src/app/about/page.tsx                          MODIFIED (was Module 0 placeholder)
src/features/about/sections/AboutHero.tsx        NEW
src/features/about/sections/WhoWeAre.tsx         NEW
src/features/about/sections/Philosophy.tsx       NEW
src/features/about/sections/Process.tsx          NEW
src/features/about/sections/Values.tsx           NEW
src/features/about/sections/Direction.tsx        NEW
src/features/about/sections/FinalCta.tsx         NEW
src/features/about/data/process.ts               NEW
MODULE-4A-HANDOFF.md                             NEW
```

## Modified files

- `src/app/about/page.tsx` — replaced the `RoutePlaceholder` stub with
  the real page composition. This is the only file inside an existing
  route/module boundary that changed.

## Deleted files

None.

## Architecture

No new animation architecture. Every chapter is built entirely from
existing Module 1/2 primitives:

- `Reveal`, `SplitHeading`, `ScaleReveal` (implicitly available, not all
  used), `Parallax`, `HorizontalScroller`
- `Container`, `TechnicalLabel`, `AccentLine`, `Divider`, `SubtleGrid`,
  `BrandMark`
- Existing design tokens only (`--text-*`, `--color-*`, `--stz-*`,
  `--space-section`, `--header-h`, `--radius-*`) — no new tokens added.
- `sixS` data reused as-is from `@/features/home/data/sixS` rather than
  duplicated; a new `process.ts` was added under `src/features/about/data/`
  because those steps don't exist anywhere else in the project.

No new `gsap.context()` calls, no new ScrollTrigger boilerplate, no new
scroll library. The one genuinely new *pattern* (Philosophy's alternating
connector rows) is built with plain `Reveal` + `Parallax` composition,
not a new primitive.

## Motion used

- `Reveal` (direction up/left/right) for staggered entrance across every
  chapter.
- `SplitHeading` for the Hero and Final CTA headline choreography.
- `Parallax` for the subtle hero background glow and Philosophy's
  alternating-row depth drift.
- `HorizontalScroller` (existing Lenis + GSAP ScrollTrigger pin) reused
  as-is for Process.

## Responsive behavior

- All chapters use the existing fluid type tokens (`clamp()`-based),
  so no manual breakpoint tuning was needed for typography.
- Philosophy's center connector line and alternating layout are
  `lg:`-gated; below `lg` it stacks as a single readable column with the
  connector/node hidden (no partial/broken line on narrow viewports).
- Process's `HorizontalScroller` cards scale via the same `vw`-based
  width steps used on the homepage Team section (`68vw` mobile → `24vw`
  desktop), so multiple steps are visible on desktop and one at a time
  on mobile, matching Module 3's established pattern.
- Direction's coordinate row uses percentage-based flex distribution,
  so it doesn't overflow horizontally at any width; no fixed pixel
  widths anywhere in the new code.

## Accessibility

- No new reduced-motion implementation. Every animated element goes
  through `Reveal`/`Parallax`/`SplitHeading`/`HorizontalScroller`, all of
  which already read `isReducedMotion` from the existing Module 2
  `useGsapContext` hook and degrade automatically (content stays
  visible, pins/scrubs are skipped).
- All decorative SVG/graphic elements (`SubtleGrid`, the Philosophy
  connector line and node, the Direction route SVG) are `aria-hidden`.
- Section headings use real `<h2>`/`<h3>` elements in document order —
  the page reads correctly with CSS/motion off.

## Verification results

```
npm run lint      PASS
npx tsc --noEmit  PASS
npm run build     PASS  (12/12 static routes generated, including / and /about)
```

`npm install` and `npm run dev` were not run in this environment (no
interactive browser available here) — **please run `npm run dev` and
manually check `/about` and `/` in a real browser before merging**, per
the brief's own instruction not to stop at "technically works."

## Known limitations

- I have not visually inspected `/about` in a browser — only confirmed
  it compiles, type-checks, and statically builds without errors. Spacing,
  the Philosophy connector alignment, and the Direction route SVG
  proportions are my best judgment against the spec, not a confirmed
  render. Please screenshot and flag anything that needs adjustment.
- Philosophy's connecting line is static (with parallax drift) rather
  than scroll-drawn/scrubbed, by design — see the "Architecture" note
  above on why this was a deliberate choice, not an oversight. If you'd
  prefer it to match the homepage Six S chapter's drawn-curve mechanism
  instead, that's a follow-up, not a bug.
- No 3D/WebGL element was added to this page. The brief allowed reusing
  the existing 3D infrastructure "when it adds meaningful value" but
  also warned against unnecessary WebGL scenes; given About's content is
  primarily textual/editorial, I judged a second Canvas wasn't
  justified and used `BrandMark` (the static asset) in the Hero instead.

## Instructions for Module 4B

- **Do not rebuild Modules 0–3, or this Module 4A.** Everything in
  `src/features/about/` and `src/app/about/page.tsx` is considered
  final for this pass.
- Reuse `src/features/about/data/process.ts` and the `Philosophy`
  section's pattern (Reveal + Parallax alternating rows) as precedent
  if 4B needs a similar "connected sequence" visual elsewhere — don't
  build a third variant of the same idea.
- If 4B needs new shared primitives, add them to `src/components/motion/`
  or `src/components/ui/` following the existing naming/export
  conventions in `src/components/motion/index.ts`, not inside
  `src/features/about/`.
