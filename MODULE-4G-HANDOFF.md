# MODULE 4G — HANDOFF (Cinematic Viewport & Pinned Sections)

Scope: viewport geometry, header-safe zone, pin/scroll-track offsets,
entry/exit breathing room. **Not** motion timing (Module 4F, already
complete), reverse-scroll behavior (4H), init/lifecycle (4I), or visual
redesign (4J). No color, typography, card, illustration, hero
composition, dial appearance, Six S visual, team visual, or project
styling was touched.

## 1. Audit findings (read before the fix list — this determines what
   actually needed changing vs. what was already correct)

I read the actual source (not just handoffs) across every pinned/
horizontal consumer:

- `PinnedScene` (`src/components/motion/PinnedScene.tsx`) and
  `HorizontalScroller` (`src/components/motion/HorizontalScroller.tsx`)
  **already** applied `paddingTop: var(--header-h)` by default — this
  was fixed in an earlier stabilization pass, before this module. So
  the specific "cards pinned at `top: 0` render under the fixed header"
  failure mode the brief describes as the thing to hunt for was **not**
  present in the current pin/track infrastructure itself.
- All 9 pinned/horizontal consumers (`ServiceCompass`, `ServiceRail`,
  `SixSJourney`, `TeamJourney`, `ProjectGallery`, `HowWeWork`,
  `TeamSequence`, plus the `/motion` demo page) go through one of those
  two shared components — none bypass them with a raw
  `createPinnedScene`/`createHorizontalScroll` call missing the header
  offset.
- What genuinely *was* inconsistent, and is what this module fixes:
  1. **The header-clearance value itself had no shared name.** Every
     consumer read the bare `var(--header-h)`, several with their own
     extra ad-hoc breathing-room addition
     (`calc(var(--header-h) + clamp(1.5rem, 4vh, 3rem))` in one file,
     `calc(var(--header-h) + clamp(1rem, 4vh, 3rem))` in another,
     several with none at all). There was no single "safe top" concept
     — just `--header-h` plus whatever each author happened to add.
  2. **Exit breathing room was inconsistent and, in two chapters,
     entirely missing.** `TeamJourney` and `TeamSequence` had their own
     distinct bottom spacers (`clamp(6rem, 10vh, 9rem)` and
     `clamp(5rem, 9vh, 8rem)` respectively — two different values for
     the same concept). `Process` (About → How We Work) and
     `ProjectGallery` had **no exit spacer at all** — their
     `HorizontalScroller` handed off directly into the next section
     with a hard cut, which matches the brief's §11 complaint exactly.
  3. **One mid-page section (`TeamJourney`'s heading) was applying
     header-safe padding it didn't need**, left over from an earlier,
     less-targeted fix — it's not the first thing on the page, so it
     was adding an unnecessary ~140px gap above the "Team" heading for
     no reason tied to the header at all.
  4. `ServiceCompass.tsx` still exists in the tree but is genuinely
     dead code — confirmed via `grep` that nothing imports it anymore
     (Module 4B superseded it with `ServiceRail` on both the homepage
     and `/services`). Left untouched per §2's "do not assume the
     handoff is authoritative, but also do not perform unrelated
     cleanup" — flagging it here rather than deleting it, since
     deletion wasn't asked for and isn't a geometry fix.

## 2. The cinematic safe-zone system

Two new CSS custom properties, defined once in `globals.css` next to
the existing `--header-h`:

```css
--cinematic-gap: clamp(1.5rem, 4vh, 3rem);
--safe-top: calc(var(--header-h) + var(--cinematic-gap));
--safe-bottom: clamp(4rem, 8vh, 6rem);
```

- **`--safe-top`** — header height plus a consistent breathing gap.
  This is what "usable viewport" starts at. `--header-h` itself is
  still kept in sync with the header's real rendered box by the
  existing `syncHeaderHeightVar` (`src/lib/motion/headerHeight.ts`,
  unmodified) — `--safe-top` derives from it declaratively, so it never
  goes stale independently.
- **`--safe-bottom`** — the shared exit gap every scroll-driven chapter
  now uses before handing off to the next section.
- **`src/lib/motion/viewportSafe.ts`** (new) — names these two vars for
  any JS consumer that needs the real pixel value (e.g. a
  `getBoundingClientRect`-based calculation), and documents that most
  components never need to import it since `PinnedScene`/
  `HorizontalScroller` already consume the CSS vars directly.

`PinnedScene` and `HorizontalScroller` — the two primitives every
pinned/horizontal section in the app is built on — now read
`var(--safe-top)` instead of the bare `var(--header-h)`. This is the
single point of control: every pinned scene and every horizontal
gallery on the site inherited the fix from these two files, with no
per-page change required for the pin/track mechanism itself.

## 3. Changed files

```
src/app/globals.css                                  --safe-top / --safe-bottom tokens
src/components/motion/PinnedScene.tsx                 padding-top now reads --safe-top
src/components/motion/HorizontalScroller.tsx          padding-top now reads --safe-top (headerSafe path)
src/features/home/sections/Hero.tsx                   hero padding-top → --safe-top
src/features/about/sections/AboutHero.tsx             hero padding-top → --safe-top
src/features/about/sections/Process.tsx               added missing --safe-bottom exit spacer
src/features/services/sections/ServicesHero.tsx       hero padding-top → --safe-top
src/features/services/sections/ServiceDetailHero.tsx  hero padding-top → --safe-top
src/features/projects/sections/ProjectsHero.tsx       hero padding-top → --safe-top
src/features/projects/sections/ProjectDetailHero.tsx  hero padding-top → --safe-top
src/features/projects/sections/ProjectGallery.tsx     added missing --safe-bottom exit spacer
src/features/team/sections/TeamHero.tsx                hero padding-top → --safe-top
src/features/team/sections/TeamSequence.tsx            exit spacer unified to --safe-bottom
src/features/home/sections/TeamJourney.tsx             removed unneeded header-safe padding on
                                                         mid-page heading; exit spacer unified
                                                         to --safe-bottom
src/features/contact/sections/ContactHero.tsx          hero padding-top → --safe-top
src/features/start-project/sections/StartProjectHero.tsx  hero padding-top → --safe-top
src/features/insights/sections/InsightsHero.tsx         hero padding-top → --safe-top
src/features/insights/sections/ArticleHero.tsx          hero padding-top → --safe-top
```

## 4. New files

```
src/lib/motion/viewportSafe.ts
MODULE-4G-HANDOFF.md
```

## 5. Deleted files

None. (`ServiceCompass.tsx` is dead code, documented above, but not
deleted — out of scope for a geometry module.)

## 6. Geometry system explanation

```
--header-h    → real, ResizeObserver-synced header height (unchanged, pre-existing)
--cinematic-gap → fixed breathing constant, clamp(1.5rem, 4vh, 3rem)
--safe-top    = --header-h + --cinematic-gap
--safe-bottom → clamp(4rem, 8vh, 6rem), independent of header height
                (exit spacing isn't related to the header at all)
```

Every section that is either (a) the first thing on a page, directly
under the fixed header, or (b) a `PinnedScene`/`HorizontalScroller`
consumer, now applies `padding-top: var(--safe-top)` at exactly one of
two levels: either the shared component does it automatically, or (for
static, non-pinned hero sections) the section itself applies it once at
its own root. No component computes its own bespoke header-clearance
math anymore.

Every horizontal-scroll chapter (`TeamJourney`, `TeamSequence`,
`Process`, `ProjectGallery`) now ends with the same
`<div style={{ height: "var(--safe-bottom)" }} />` spacer before the
section closes, instead of four different ad-hoc values (or none).

Pin start/end logic itself (`start: "top top"`, `scrub: true`,
`pinSpacing`, `invalidateOnRefresh`) in `pin.ts`/`horizontal.ts` was
**not** changed — per §9/§13, only *where content renders inside* the
pinned box changed, not how or when the pin triggers.

## 7. Verification

```
npm install       PASS (430 packages, already satisfied)
npm run lint      PASS (0 errors, 0 warnings)
npx tsc --noEmit  FAIL — pre-existing, unrelated: src/app/layout.tsx
                  LayoutProps error (Next.js's generated route typing,
                  not visible to standalone tsc; predates this module —
                  confirmed present before any Module 4G change).
npm run build     PASS — 28/28 routes generated, including the
                  standalone TypeScript pass inside next build (which
                  does have the LayoutProps types and passes clean)
npm run dev       NOT RUN — no interactive browser available in this
                  environment
```

Per §23 of this module's own instructions: **I have not opened a
browser and visually confirmed that content clears the header or that
sections breathe correctly.** Lint, and a full production build with
its own internal type-check, both pass — but that verifies the code
compiles and every route generates, not that the geometry *looks*
right. The change is small and mechanical (two shared components plus
consistent var substitution across otherwise-unchanged files), so the
risk of visual regression is low, but "low risk" is not the same as
"visually confirmed" — please check the pages listed in §15 below in an
actual browser before treating this as done.

## 8. Known issues — explicitly deferred

**Deferred to 4H (reverse motion):**
- Not audited in this module. `pin.ts`/`horizontal.ts` were read but
  their `onEnterBack`/`onLeaveBack` handling wasn't touched or
  evaluated for correctness.

**Deferred to 4I (initialization/lifecycle):**
- No ScrollTrigger init-order or first-load issues were investigated
  in this pass.

**Deferred to 4J (visual polish):**
- `ServiceRail`'s dial/arc positioning was read but not modified — its
  geometry (how far the arc bleeds off-screen, exact vertical
  centering) is a visual-composition question this module was
  instructed not to touch. If it still doesn't look right in a
  browser, that's 4J's job, not a leftover 4G gap.
- `ServiceCompass.tsx` dead-code removal — flagged above, not acted on.

## 9. Instructions for Module 4H

- The safe-zone system (`--safe-top`, `--safe-bottom`,
  `src/lib/motion/viewportSafe.ts`) is now the shared vocabulary for
  "where content starts/ends" — reuse it rather than reading
  `--header-h` directly in any new section.
- Please actually load these pages in a browser and confirm nothing
  hides under the header and every horizontal chapter has visible
  breathing room before/after: `/`, `/about`, `/services`,
  `/services/web-development`, `/projects`,
  `/projects/citizen-services-platform`, `/team`, `/contact`,
  `/start-project`.
