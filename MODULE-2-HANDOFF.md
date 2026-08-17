# MODULE 2 — HANDOFF

Cinematic Experience & Motion Engine, built on top of Module 0 (Foundation)
and Module 1 (Design System). Read this before starting Module 3.

## What Module 2 added

A reusable choreography layer on top of Module 0's Lenis/GSAP/ScrollTrigger
plumbing and R3F canvas shell: scroll-progress-driven reveal, parallax,
scale, pin, horizontal-scroll, scene-transition, typography, image, and
3D-object primitives, each available as both a low-level function (for
custom composition) and a drop-in React component. Nothing from Module 0
or Module 1 was rebuilt, redesigned, or replaced — Module 2 only imports
and extends `gsap.ts` / `lenis.ts` / `tokens.ts` / `useReducedMotion.ts` /
`ExperienceCanvas.tsx`.

## Files created

### Hooks (`src/hooks/`)
- `useGsapContext.ts` — the one reusable animation-lifecycle pattern.
  Wraps `gsap.context()` scoped to a ref; every tween/ScrollTrigger
  created inside its `setup` callback is auto-reverted/killed on unmount
  or dependency change. Every motion component in this module is built
  on this hook — no component calls `gsap.to()` / `ScrollTrigger.create()`
  outside of it.
- `useScrollProgress.ts` — subscribes an element to 0→1 scroll progress
  via a ref (not React state), for imperative consumers.

### Motion primitives (`src/lib/motion/`)
- `scrollProgress.ts` — `createScrollProgressTrigger()`, the shared
  ScrollTrigger factory every progress-driven primitive is built from.
- `reveal.ts` — `createReveal()`: directional (up/down/left/right) and/or
  clip-path masked reveals with stagger, for headings/paragraphs/cards/images.
- `parallax.ts` — `createParallax()` / `createImageParallax()`: per-layer
  scroll-linked drift at configurable speed, for depth.
- `scale.ts` — `createScale()`: scale-in-on-enter or continuous
  scroll-scrubbed zoom.
- `pin.ts` — `createPinnedScene()` / `createPinnedTimeline()`: pins a
  trigger element and reports/drives 0→1 progress through the pin.
- `horizontal.ts` — `createHorizontalScroll()`: computes real scroll
  distance from a track's overflow width and drives horizontal `x` from
  vertical scroll, recalculated on ScrollTrigger refresh.
- `transitions.ts` — `createSceneTransition()`: four scene-to-scene
  transition styles (`wipe`, `clip-scale`, `slide-blur`, `depth-push`)
  plus `cross-dissolve`, each a considered combination of clip-path,
  scale, translate, blur — not a single global fade.
- `typography.ts` — `splitText()` (dependency-free line/word/char
  splitter — GSAP's SplitText is a paid plugin, so this rolls a minimal
  equivalent) and `createTypographyReveal()`.
- `image.ts` — `createImageEntrance()` (scale/rotate/settle) and
  `createPinnedImageCrop()` (pinned scroll-scrubbed crop/scale).
- `index.ts` — barrel re-exporting all of the above plus Module 0/1's
  `gsap`, `ScrollTrigger`, `getLenisInstance`, `DURATION`, `EASE`.

### Motion components (`src/components/motion/`)
- `Reveal.tsx`, `Parallax.tsx`, `ScaleReveal.tsx` — declarative wrappers
  around the primitives above, each scoped via `useGsapContext`.
- `SplitHeading.tsx` — typography choreography component; restores the
  original `innerHTML` on unmount/prefers-reduced-motion.
- `PinnedScene.tsx` — declarative pinned-scene wrapper exposing an
  `onProgress(0→1)` callback.
- `HorizontalScroller.tsx` — vertical-scroll-drives-horizontal-content
  wrapper; falls back to native `overflow-x` scroll under reduced motion.
- `CinematicScene.tsx` — the scene/chapter architecture from spec §9:
  `<CinematicScene>` + `<SceneBackground>` / `<SceneContent>` /
  `<SceneVisual>`. Tracks enter/active/exit via a `data-scene-phase`
  attribute and exposes progress as the `--scene-progress` CSS variable —
  both set imperatively (no re-render per scroll tick).
- `ImageMotion.tsx` — `<ImageEntrance>` and `<PinnedImageCrop>` wrapping
  `image.ts`.
- `SceneTransitionStage.tsx` — two-panel demo/reusable stage driving
  `createSceneTransition()` from a pinned scroll range.
- `CinematicCanvasScene.tsx` — DOM-side wrapper composing
  `useScrollScene3D` + Module 0's `LazyExperienceCanvas`; renders a
  render-prop `children(progressRef)` so 3D scene code can read scroll
  progress inside `useFrame`.
- `index.ts` — barrel export for everything above.

### 3D scroll infrastructure (`src/lib/three/`)
- `useScrollScene3D.ts` — viewport-aware mounting (IntersectionObserver,
  configurable `rootMargin`) + scroll-progress ref, reduced-motion aware.
  Does not import/mount the Canvas itself — that stays the caller's job
  via `CinematicCanvasScene`, keeping Module 0's "only import
  `LazyExperienceCanvas`, never `ExperienceCanvas` directly" contract intact.
- `ScrollDrivenGroup.tsx` — R3F `<group>` wrapper that samples
  position/rotation/scale from a caller-supplied keyframe array (spec
  §14's `0.0 → enters, 0.25 → camera moves, ...` pattern) and lerps
  toward the target every `useFrame` tick, reading `progressRef.current`
  directly — no React state, no per-frame re-render.

### Service-progression infrastructure (`src/features/experience/services/`)
- `ServiceCompass.tsx` — reusable numbered/compass progression (spec
  §22–23): pins while scrolling through a caller-supplied `items` array,
  tracks an active index, renders a circular position indicator (an
  original 6STANZA layout, not a copy of the Orionix reference) plus the
  active item's number/label/description. Content-agnostic — Module 3
  supplies the real six services.

### Demo route (`src/app/motion/`)
- `page.tsx` — `/motion`, the required internal showcase. Client
  component (uses the motion hooks directly). Demonstrates, in order:
  reveal, typography choreography, parallax, scale/zoom, image
  choreography (entrance + pinned crop), horizontal scroll, pinned scene
  (via the scene/chapter architecture), scene transition, 3D scroll
  interaction (a torus knot driven by `ScrollDrivenGroup` keyframes), and
  a scroll-progress-driven progress bar. Marked with a visible "internal
  development route" banner; not linked from primary navigation.
- `layout.tsx` — route-level `metadata` (`noindex`) for `/motion`, kept
  in a server layout since the page itself is a client component and
  can't export `metadata` directly.

## Files modified

None. Module 2 is purely additive — no Module 0 or Module 1 file was
changed. `package.json` is unchanged (no new dependencies were needed;
everything is built from the existing GSAP/Lenis/R3F/Three foundation).

## Files deleted

None.

## Animation architecture

```
useGsapContext(setup, deps)
        │  gsap.context() scoped to a ref; auto-revert on unmount/deps change
        ▼
lib/motion/*.ts  (createReveal, createParallax, createScale, createPinnedScene,
                   createHorizontalScroll, createSceneTransition,
                   createTypographyReveal, createImageEntrance, ...)
        │  each returns a Tween / Timeline / ScrollTrigger
        ▼
components/motion/*.tsx  (Reveal, Parallax, ScaleReveal, SplitHeading,
                           PinnedScene, HorizontalScroller, CinematicScene,
                           ImageEntrance/PinnedImageCrop, SceneTransitionStage)
```

Every primitive function is independently importable for custom
composition; every component wraps a primitive in `useGsapContext` so
Module 3 rarely needs to touch the primitives directly.

## GSAP architecture

Unchanged from Module 0: `gsap` and `ScrollTrigger` are only ever
imported from `@/lib/motion/gsap`, which is the sole place
`gsap.registerPlugin(ScrollTrigger)` runs. Every Module 2 primitive
imports from that file. No component calls `gsap.to()` /
`ScrollTrigger.create()` directly — they go through `lib/motion/*.ts`
functions, called from inside a `useGsapContext` scope, so every tween
and ScrollTrigger this module creates is tied to a component's lifecycle
and cleaned up automatically (`ctx.revert()` on unmount/dep change, plus
explicit `.kill()` for ScrollTriggers/tweens created outside the
context's own tracking, e.g. in `PinnedScene`, `HorizontalScroller`,
`SceneTransitionStage`).

## Lenis architecture

Unchanged from Module 0 — Module 2 never calls `new Lenis()` and never
duplicates `SmoothScrollProvider`. All scroll-driven primitives rely on
the existing `Lenis → ScrollTrigger.update → GSAP timelines` pipeline
already wired in `SmoothScrollProvider.tsx`.

## ScrollTrigger architecture

All ScrollTrigger usage funnels through `lib/motion/scrollProgress.ts`'s
`createScrollProgressTrigger()` (used directly by reveal/parallax/scale
via their own `scrollTrigger: {...}` config, and by `pin.ts`,
`horizontal.ts`, `useScrollScene3D.ts`, `CinematicScene.tsx`). Every
ScrollTrigger created by a component is killed in that component's
`useGsapContext` cleanup (or the effect's own cleanup for triggers made
outside a gsap.context, e.g. in `PinnedScene`/`HorizontalScroller`).
`invalidateOnRefresh` defaults to `true` where recalculation matters
(scroll-progress triggers, horizontal scroll distance).

## 3D architecture

```
useScrollScene3D()  →  IntersectionObserver (viewport-aware mount)
                         + createScrollProgressTrigger (progress ref)
        ▼
CinematicCanvasScene  →  LazyExperienceCanvas (Module 0, unchanged)
                          renders children(progressRef) render-prop
        ▼
ScrollDrivenGroup  →  useFrame reads progressRef.current every tick,
                       lerps toward keyframe-sampled position/rotation/scale
                       — no React state, no re-render per frame
```

`ExperienceCanvas.tsx` and `loadExperienceCanvas.tsx` (Module 0) are
untouched; Module 2 only adds the scroll-driving layer around them.
`/motion`'s 3D example uses a plain `torusKnotGeometry` purely to prove
the engine works — per spec, this is explicitly not a final 6STANZA 3D
hero/object; Module 3+ supplies the real geometry/logo treatment.

## Reduced-motion strategy

Centralized: every primitive and component either checks
`isReducedMotion` from `useGsapContext`'s setup callback, or calls
`prefersReducedMotion()` directly (`useScrollScene3D`,
`useScrollProgress`). Behavior under reduced motion:
- `CinematicScene` skips its ScrollTrigger, sets `data-scene-phase="active"`
  and `--scene-progress: 1` immediately (content fully visible, no motion).
- `PinnedScene` / `HorizontalScroller` / `ImageEntrance` /
  `PinnedImageCrop` / `SceneTransitionStage` skip pinning/scrubbing
  entirely — `HorizontalScroller` falls back to native `overflow-x` touch/
  wheel scrolling so the content stays reachable.
- `SplitHeading` skips the split/stagger and restores plain text.
- `CinematicCanvasScene` renders its `fallback` instead of mounting the
  WebGL canvas at all.
- `useScrollProgress` / `useScrollScene3D` disable scrub/pin on their
  ScrollTrigger but still fire once so content resolves to a visible state.

This sits on top of, and does not duplicate, Module 0's CSS-level
`prefers-reduced-motion` kill-switch and the `useReducedMotion` /
`prefersReducedMotion` helpers — Module 2 only ever calls those, never
re-queries `matchMedia`.

## Responsive strategy

- `HorizontalScroller` measures actual track overflow at runtime
  (`scrollWidth - clientWidth`), so distance is always correct per
  breakpoint and recalculates via `invalidateOnRefresh`; on narrow
  viewports where the GSAP-driven pin is skipped (reduced motion) it's
  still a normal scrollable row via `overflow-x-auto`.
- `PinnedScene` / `ServiceCompass` pin durations are expressed in
  viewport-height multiples (`durationVh`), which scale naturally with
  device viewport rather than fixed pixel values.
- `useScrollScene3D`'s `rootMargin` keeps 3D canvases unmounted until
  near-viewport on any device, avoiding wasted WebGL context creation on
  mobile.
- No primitive hardcodes viewport-width breakpoints; all spacing/typography
  driven by Module 1's existing `clamp()`-based tokens (`--text-*`,
  `--space-section`, etc.), which Module 2 consumes but does not modify.

## Demo route

`/motion` — see "Files created" above. Explicitly marked as an internal
development route (banner + `noindex` metadata), not linked from
`src/config/routes.ts` / primary navigation, and not a homepage
replacement.

## How Module 3 should use the engine

- Import primitives from `@/lib/motion` (barrel) or components from
  `@/components/motion` (barrel) rather than reaching into individual files.
- Compose real sections with `<CinematicScene>` +
  `<SceneBackground>/<SceneContent>/<SceneVisual>` as the outer structure,
  then drop `<Reveal>`, `<Parallax>`, `<SplitHeading>`, etc. inside for
  the actual choreography — don't write new ScrollTrigger/gsap.context
  boilerplate per section.
- For the real Services section, compose `ServiceCompass` (or extend it)
  with the actual six services in place of the placeholder `items`.
- For a future 6STANZA 3D hero/object, replace `/motion`'s
  `torusKnotGeometry` demo mesh with the real geometry inside a
  `<CinematicCanvasScene>` + `<ScrollDrivenGroup keyframes={...}>` pair —
  the scroll-driving infrastructure doesn't need to change.
- Continue using Module 1's `DURATION` / `EASE` tokens (already the
  default values inside `lib/motion/*.ts`) instead of hardcoding numbers
  when composing new one-off tweens.

## Known limitations

- `splitText()`'s line-splitting mode measures word `offsetTop` to infer
  line breaks; it's accurate for static layouts but will misdetect line
  breaks if called before web fonts/layout have settled (e.g. immediately
  on a font swap). Acceptable given Module 0's current system-font stack;
  worth re-verifying once real typefaces are loaded via `next/font/local`.
- `HorizontalScroller`'s GSAP-driven horizontal drag is skipped entirely
  under reduced motion in favor of native scroll — this is a deliberate
  accessibility trade-off, not a bug.
- The `/motion` 3D example and image "placeholders" use CSS gradients,
  not real photography/3D assets — no real imagery or final 3D model
  exists yet; Module 3+ supplies actual assets.
- No visual/browser screenshot QA was performed in this environment (same
  sandbox limitation noted in Module 1's handoff — no Playwright browser
  download host on the network allowlist). Verification below relies on
  build/typecheck/lint plus `curl` status checks against `next dev` for
  `/`, `/motion`, and `/design-system`.
- `ServiceCompass`'s active-index state update is guarded by an equality
  check (`prev === next ? prev : next`) so it doesn't re-render every
  scroll tick, but it is still a `useState` update at each of the N
  service boundaries — acceptable for a handful of services, but if a
  future section needs many more steps, consider driving the visible
  index via a ref + imperative DOM update instead.

## Verification (run from `stanza/`)

```text
npm install        PASS
npm run lint       PASS (no warnings/errors)
npx tsc --noEmit   PASS
npm run build      PASS — all 12 routes (/, /about, /contact, /design-system,
                          /insights, /motion, /projects, /services,
                          /start-project, /team, /_not-found) prerender as
                          static content
npm run dev        PASS — verified / , /motion, /design-system all return
                          HTTP 200
```

Case-sensitive import audit: every `@/...` import in `src/` (46 unique
paths) was checked against on-disk file casing; no mismatches found.
