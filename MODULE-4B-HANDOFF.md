# MODULE 4B — HANDOFF (Services Experience)

Scope: build `/services` and its eight detail routes only. **Modules
0–3 and 4A were not touched** — no homepage section, motion primitive,
design token, or About file was modified. This module only adds new
files under `src/features/services/`, `src/app/services/[slug]/`, and
replaces the Module 0 `RoutePlaceholder` stub at `src/app/services/page.tsx`
(the same pattern Module 4A used for `/about`).

## Before writing code — what I found reading the actual source

Per §1's instruction not to trust the handoffs over the real code, I
read the actual current implementation rather than assuming the brief's
description of it:

- **`ServiceCompass.tsx` is dead code.** It exists at
  `src/features/experience/services/ServiceCompass.tsx` but nothing in
  the app imports it anymore. At some point after Module 3's original
  handoff was written, the homepage Services section (`src/features/home/sections/Services.tsx`)
  was switched to a different, newer primitive: **`ServiceRail.tsx`**
  (`src/features/experience/services/ServiceRail.tsx`) — a curved-rail
  mechanism with a marker that travels along an actual SVG path
  (`getPointAtLength`), rAF-smoothed/lerped progress (not raw scroll
  ticks), and a large soft shape bleeding off the right edge. This is
  the primitive that actually matches the brief's description in §5/§20
  (half-visible dial, continuous smooth progression, no snapping) —
  `ServiceCompass` (my own earlier work, now superseded) is the older,
  more literal "clock" dial the brief in §7 explicitly says to move
  away from.
- Given that, **Module 4B reuses `ServiceRail`, not `ServiceCompass`**,
  for the `/services` index page's scroll-driven progression. I did not
  delete or modify `ServiceCompass.tsx` — removing dead code wasn't this
  module's job — but flagging it here since the brief assumed it was
  still the active component.
- `services.ts` already has real content for all 8 services (`category`,
  `tags`, `description`) — Module 3 had already built this out further
  than the brief expected. I extended it with a new, separate file
  (`serviceDetails.ts`) rather than editing `services.ts`, per §27's
  instruction not to redesign existing data structures unnecessarily.
- The brief's example route list uses `/services/cloud`; the existing
  canonical slug in `services.ts` is `cloud-computing`. I kept the
  existing slug (routes resolve to `/services/cloud-computing`) rather
  than introduce a second, inconsistent slug just for routing — see
  "Known limitations" if you'd prefer the shorter slug instead.

## Architecture

```
src/features/services/
  data/
    serviceDetails.ts        NEW — per-service detail content
  sections/
    ServicesHero.tsx          NEW — /services Chapter 01
    ServiceProgression.tsx    NEW — /services Chapter 02
    ServiceDetailHero.tsx     NEW — detail page Chapter 01
    ServiceProblem.tsx        NEW — detail page Chapter 02
    ServiceCapabilities.tsx   NEW — detail page Chapter 03
    ServiceArchitecture.tsx   NEW — detail page Chapter 04
    ServiceWhy6Stanza.tsx     NEW — detail page Chapter 05
    ServiceFinalCta.tsx       NEW — detail page Chapter 06

src/app/services/
  page.tsx                    MODIFIED (was RoutePlaceholder stub)
  [slug]/page.tsx              NEW — one dynamic route for all 8 services
```

One reusable detail template, not eight page files, per §11/§21.
`generateStaticParams` in `[slug]/page.tsx` derives the 8 params
directly from `services.ts`, so adding a ninth service later only
means editing that one array plus adding one `serviceDetails.ts` entry
— no new route file.

## Files created

```
src/features/services/data/serviceDetails.ts
src/features/services/sections/ServicesHero.tsx
src/features/services/sections/ServiceProgression.tsx
src/features/services/sections/ServiceDetailHero.tsx
src/features/services/sections/ServiceProblem.tsx
src/features/services/sections/ServiceCapabilities.tsx
src/features/services/sections/ServiceArchitecture.tsx
src/features/services/sections/ServiceWhy6Stanza.tsx
src/features/services/sections/ServiceFinalCta.tsx
src/app/services/[slug]/page.tsx
MODULE-4B-HANDOFF.md
```

## Files modified

- `src/app/services/page.tsx` — replaced the `RoutePlaceholder` stub
  with `<ServicesHero /><ServiceProgression />`.

## Files deleted

None.

## Routes created

```
/services                          index — hero + scroll progression + full list
/services/web-development
/services/cloud-computing          (canonical slug — see note above)
/services/devops
/services/cyber-security
/services/networking
/services/marketing
/services/video-editing
/services/seo
```

`src/config/routes.ts` was not touched — `/services` was already in
`primaryNav`, and the detail routes are reached from links inside the
page itself (the index list, and prev/next links on each detail hero),
not from primary nav.

## `/services` index page

1. **`ServicesHero`** — full-viewport (`min-h-svh`) dark opener: eyebrow
   + "01–08" count, a `SplitHeading` statement, supporting line.
   `paddingTop: var(--header-h)` clears the fixed header, same fix
   Module 4A applied to `/about`.
2. **`ServiceProgression`** — `ServiceRail` reused exactly as the
   homepage uses it (same re-tone-via-CSS-variables wrapper, same data
   mapping), so the cinematic half-off-screen curved marker experience
   is identical in spirit to the homepage. Directly below it: a plain,
   always-rendered list of all 8 services as real `<Link>` rows (number,
   title, category, hover arrow) — see "Accessibility" for why this
   exists and what it's for.

## Service detail page (six chapters)

Composed in `src/app/services/[slug]/page.tsx`, reading `service` from
`services.ts` and `detail` from the new `serviceDetails.ts`:

1. **Hero** — split layout (statement left, `ServiceVisual` right, both
   already-existing pieces), number/category eyebrow, prev/next service
   links so the 8 pages read as one connected sequence.
2. **Problem** — single large editorial statement, no card, no filler.
3. **Capabilities** — numbered rows + dividers (the same visual pattern
   as About's "Values" chapter — reused per its own handoff's
   instruction, not reinvented). Explicitly not a card grid.
4. **Architecture** — a labeled-node flow diagram (SVG line + `Reveal`-
   staggered nodes), the same abstract line-and-node technique as
   About's "Direction" chapter, re-read left-to-right as a pipeline.
   Content differs per service (e.g. Web Development: Frontend → API →
   Database → Infrastructure; Cyber Security: Identity → Application →
   Network → Data → Monitoring).
5. **Why 6STANZA** — 2–3 relevant Six S principles, looked up by index
   from the existing `sixS` data (nothing duplicated), shown as a
   compact inline row — deliberately not a restaging of the homepage's
   full pinned Six S journey, per the brief's explicit warning.
6. **Final CTA** — same dark/glow family as the homepage/About closing
   chapters, service-specific copy, links to `/start-project`.

## Shared primitives reused (nothing new was built)

`Reveal`, `SplitHeading`, `Parallax`, `ServiceRail`, `ServiceVisual`,
`Container`, `TechnicalLabel`, `AccentLine`, `SubtleGrid`, `Divider`,
`NumberIndicator`, `Button`/`ctaRoute` link pattern, `Header`/`Footer`
(untouched, rendered by the root layout). No new GSAP/ScrollTrigger
setup, no new scroll library, no new WebGL scene — the only 3D/WebGL
scene anywhere in the app remains the homepage Hero's, per §9/§24.

## Animation approach

Entirely declarative via existing components — every chapter's motion
is `Reveal`/`SplitHeading`/`Parallax` doing what they already do
elsewhere in the app. The one genuinely dynamic piece, `ServiceRail`'s
scrubbed curve, is Module 3's existing code, untouched. No component in
this module calls `gsap.to()` or `ScrollTrigger.create()` directly.

## Responsive behavior

- All typography uses existing `clamp()` tokens — no new breakpoints.
- `ServiceDetailHero`'s split grid collapses to a single column below
  `lg` (statement, then visual, then prev/next links).
- `ServiceArchitecture`'s flow diagram uses percentage-based flex
  distribution (same technique as About's Direction chapter), so it
  never overflows horizontally at any width; node labels wrap instead.
- `ServiceProgression`'s always-visible list is a plain block list at
  every width — nothing about it needs a mobile-specific treatment.
- `ServiceRail` itself is unmodified, so its existing mobile behavior
  (documented in the Module 3 handoff) carries over unchanged.

## Accessibility

- Every chapter uses real semantic headings (`h1` on both heroes, `h2`
  elsewhere via the existing components) in document order.
- **`ServiceRail` has no click/keyboard interaction and, under reduced
  motion, only ever renders its first item's content** (confirmed by
  reading `ServiceRail.tsx` directly — its `PinnedScene` progress driver
  is the only thing that ever changes `activeIndex`). Rather than adding
  interactive state to a Module 3 primitive another page depends on, I
  addressed this at the page level: `ServiceProgression` always renders
  a complete, keyboard-focusable list of all 8 services as real links
  immediately below the rail, regardless of motion preference or JS
  scroll state. This is also how a keyboard/reduced-motion user
  actually reaches the detail pages, satisfying §17's requirement
  directly rather than papering over it.
- All decorative SVG (`SubtleGrid`, the architecture flow line,
  `ServiceVisual`'s icons) is `aria-hidden`.
- Focus states use the existing `focus-visible:outline` pattern already
  established elsewhere in the app (e.g. `Button`).

## Verification — IMPORTANT LIMITATION (same as prior modules)

This environment has no network access and no `node_modules` in the
uploaded project, so `npm install`, `npm run lint`, `npx tsc --noEmit`,
`npm run build`, and `npm run dev` could not be run here — the same
constraint noted in the Module 3 and 4A handoffs.

What I did instead:
- Read every existing file I depended on in full (not just its handoff
  description) before writing against its actual props/exports —
  `ServiceRail`, `ServiceVisual`, `NumberIndicator`, `Divider`,
  `SectionHeading`-adjacent primitives, `Reveal`, `SplitHeading`,
  `Parallax`, `routes.ts` — rather than assuming signatures.
- Verified every `slug` in the new `serviceDetails.ts` matches
  `services.ts` exactly (programmatic diff, not eyeballed).
- Checked bracket/brace/paren balance on every new/modified file.
- Confirmed the project's Next.js version (16.3.1) uses async `params`
  in dynamic routes and wrote `[slug]/page.tsx` accordingly
  (`params: Promise<{ slug: string }>`).

Please run the brief's own verification sequence locally before
merging:

```
npm install
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

Then visually check `/services` and at least two detail pages
(desktop + mobile) — specifically the `ServiceRail` half-off-screen
effect and the always-visible list beneath it, and the architecture
diagram's node spacing at narrow widths.

## Known limitations

- **`/services/cloud-computing`, not `/services/cloud`.** The brief's
  §11 example list uses the shorter slug; the project's existing
  `services.ts` (source of truth since Module 3) uses
  `cloud-computing`. I kept the existing data rather than fork it. If
  you want the shorter URL, that's a one-line change to `services.ts`'s
  `slug` field — I didn't make it unilaterally since it's a
  content/data decision, not a Services-module implementation detail.
- `ServiceCompass.tsx` remains in the codebase, unused. Not deleted —
  out of scope for this module — but worth a deliberate decision (keep
  as an alternate primitive, or remove) in a later cleanup pass.
- No real photography/video/case-study assets exist yet; `ServiceVisual`
  (abstract SVG per service, from Module 3) is reused as the only
  per-service visual across both the index rail and every detail hero.
  If richer per-service imagery becomes available, `ServiceDetailHero`
  is the one place to swap it in.
- Capability/architecture/problem copy in `serviceDetails.ts` is
  original but has not been reviewed by anyone at 6STANZA — treat it as
  a structurally-correct first draft, not final marketing copy.
- No visual/browser screenshot QA was performed, for the same sandbox
  reason noted above and in every prior module's handoff.

## Instructions for Module 4C

- Do not rebuild Modules 0–3, 4A, or this module. Everything under
  `src/features/services/` and `src/app/services/` is considered final
  for this pass.
- If 4C needs the same "always-visible accessible list beneath a
  scroll-driven primitive" pattern elsewhere (e.g. for Projects/Team
  detail pages), reuse `ServiceProgression`'s approach rather than
  inventing a second one.
- If a future module finally decides `ServiceCompass.tsx`'s fate
  (reuse it elsewhere, or delete it), update this note.
