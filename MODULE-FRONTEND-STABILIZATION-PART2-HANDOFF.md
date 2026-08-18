# Frontend Stabilization — Part 2 Handoff

Scope: unified motion rhythm, reversibility, and page-by-page motion QA,
built on top of Part 1's lifecycle/header-safe-stage infrastructure. No
new features, no redesign — motion behavior only (plus the smallest
amount of styling any given fix required).

## 0. Environment note — verification NOT run

This environment's network is disabled. `npm install` fails immediately:

```
npm error code E403
npm error 403 403 Forbidden - GET https://registry.npmjs.org/zustand/-/zustand-5.0.15.tgz
```

No `node_modules` could be installed, so **`npm run lint`, `npx tsc
--noEmit`, `npm run build`, and `npm run dev` were not run**, and no
browser QA was possible. Every change below was written and reviewed by
hand (import correctness, prop/type signatures, call-site tracing,
brace/paren balance) but has not been compiled or executed. Run the full
verification suite (§25 of the brief) and the browser QA pass (§26)
before merging — treat this patch as unverified until then.

## 1. What Part 1 already got right (confirmed, left alone)

Read alongside Part 1's own handoff. Re-auditing its claims against the
current source:

- **Lenis**: one instance, created once, wired into GSAP's ticker. Unchanged.
- **GSAP registration**: single guarded point (`lib/motion/gsap.ts`). Unchanged.
- **Cleanup**: every ScrollTrigger/timeline still runs inside
  `useGsapContext`'s `gsap.context()` scope; audited again for anything
  created outside it — none found.
- **Header-safe stage**: `--header-h` + `headerSafe` prop on
  `HorizontalScroller`/`PinnedScene` still the single mechanism; both
  components' reduced-motion changes below build on top of it rather
  than around it.
- **First-load / route-change refresh**: `ScrollLifecycle` untouched.

## 2. Reversibility (spec §9/§10) — audited, no bugs found

Every scroll-driven scene in the app (`createPinnedScene`,
`createHorizontalScroll`, `createScrollProgressTrigger`,
`ScrollDrivenGroup`'s `useFrame` sampling) is built on GSAP ScrollTrigger
with `scrub: true` (or a progress ref sampled continuously). Scrub ties
the tween/callback directly to scroll position in both directions — there
is no "play forward, snap back" state machine to get wrong. Audited for
`once: true`/`onEnter`/`.play()` patterns that should have been
progress-driven instead (§10's specific ask): the only real matches are
`Reveal`'s default `once=true` (correct — simple one-time content
reveals are explicitly allowed per §10 and §11) and `ScrollLifecycle`'s
unrelated `window.addEventListener("load", ..., { once: true })`. No
scene needed converting from one-way to scrub-driven.

**Conclusion**: reversibility was already structurally sound. Part 2's
real reversibility-adjacent work ended up being about *consistency of
feel* while reversing (next section), not about scenes failing to
reverse at all.

## 3. Scroll-scrub consistency — the core Part 2 bug (spec §8)

### Bug

Three scenes damp raw ScrollTrigger progress toward a rendered value
every frame (an rAF/`useFrame` lerp) before driving visuals, instead of
applying scroll position 1:1. Each had picked its own factor
independently:

| Scene | Damping factor (pre-Part 2) |
|---|---|
| `ServiceRail` (Services chapter) | `0.09` (local constant) |
| Hero 3D (`ScrollDrivenGroup`) | `0.15` (local default) |
| `SixSJourney` (Six S chapter) | **none — raw progress applied directly** |

This is precisely spec §8's warning: "avoid one scene feeling glued
directly to the mouse wheel while another lags dramatically behind it."
`SixSJourney` tracked the wheel exactly; `ServiceRail` lagged noticeably
more than the hero; the hero was the snappiest of the three despite
being the most "cinematic" element on the page — backwards from the
motion hierarchy in §4 (larger/more important events should feel
*heavier*, not snappier).

### Fix

Added `DAMPING` to `src/lib/motion/tokens.ts`:

```ts
export const DAMPING = { section: 0.12, cinematic: 0.1 } as const;
```

Chosen close together (related feel) with `cinematic` slightly heavier
than `section`, per §4. Wired in:

- `ServiceRail.tsx` — swapped its local `0.09` for `DAMPING.section`.
- `SixSJourney.tsx` — added the rAF lerp loop it didn't have (mirrors
  `ServiceRail`'s pattern: raw progress → ref → `requestAnimationFrame`
  loop → `DAMPING.section` lerp → apply to track transform / path
  dashoffset / label focus).
- `lib/three/ScrollDrivenGroup.tsx` (hero 3D) — default `damping` prop
  now reads `DAMPING.cinematic` instead of a local `0.15`. (Also fixed an
  inverted doc comment on this prop — it previously described the
  damping direction backwards relative to what the `lerp(current,
  target, damping)` call actually does.)

No other scrubbed scenes needed a lerp layer — `HorizontalScroller`,
`PinnedScene`'s other consumers, and `Parallax` all apply raw scrub
directly via GSAP's own tween interpolation, which is already smooth by
construction (GSAP + Lenis handle that smoothing, not app code), so nothing
there was inconsistent with this pair.

## 4. Reduced motion — real accessibility bugs found and fixed (spec §22)

This was the largest substantive finding. `prefers-reduced-motion`
correctly skips creating ScrollTriggers throughout the codebase (that
part was already right), but several consumers assumed the *visual
result* of that skip would still be acceptable — it wasn't.

### 4a. `PinnedScene` / `HorizontalScroller` clipping under reduced motion

Both components size their container for the pinned/scrubbed version
(`min-h-svh overflow-hidden` on `PinnedScene`; `overflow-x-auto
md:overflow-hidden` on `HorizontalScroller`). Under reduced motion no
trigger runs, so nothing ever moves content into view — but the clipping
stayed. Concretely:

- `HorizontalScroller` at desktop widths (`md:overflow-hidden`, no
  native scrollbar) permanently hid every card after the first, with no
  way to reach it — affecting **Team, Projects gallery, About → How We
  Work, Home → Team**, everywhere this component is used.
- `PinnedScene`'s `overflow-hidden` + fixed `min-h-svh` clipped any
  child taller than one viewport (i.e. any pinned scene at all).

**Fix**: `HorizontalScroller` now keeps `overflow-x-auto` at every
breakpoint under reduced motion (native scroll/trackpad/drag stays
available regardless of viewport width). `PinnedScene` drops
`min-h-svh`/`overflow-hidden` under reduced motion in favor of
`min-h-0`/`overflow-visible`, letting children take their natural
height.

### 4b. `ServiceRail` and `SixSJourney` — content past the first item was unreachable

Both go further than simple clipping: they only ever put **one active
item's content in the DOM** (`ServiceRail`) or position all items
absolutely inside a tall track that a `transform` moves into view
(`SixSJourney`), entirely driven by scroll progress that never advances
under reduced motion. The `PinnedScene` container fix (4a) isn't enough
on its own here — even with `overflow-visible`, `ServiceRail` never
renders anything but `items[0]`, and `SixSJourney`'s track never
translates so principles 2–6 sit off-screen below the fold with no
scroll mechanism reaching them (the pin never engages).

**Fix**: both components now check `useReducedMotion()` and, when true,
render a plain static stacked list of every item (all services /
all six principles, same copy, no animation, no arc/track/rAF loop)
instead of the scroll-choreographed version. Content and copy unchanged
— only the layout mechanism differs in this mode.

### 4c. `SceneTransitionStage` — two panels could render stacked/overlapping

Under reduced motion no timeline ran, so both absolutely-positioned
panels (`inset-0` each) kept whatever default CSS state they had —
neither panel is hidden by anything but the (skipped) GSAP tween, so
both could show simultaneously. Fixed to resolve directly to the
transition's end state (panel A hidden via `display: none`, panel B at
full opacity) when reduced motion is on. (This component is currently
only used on the internal `/motion` showcase page, not in a real page
flow, but fixed for consistency with everything else.)

### 4d. `Reveal`, `ScaleReveal`, `Parallax` didn't check reduced motion at all

`SplitHeading`, `ImageEntrance`, and `PinnedImageCrop` already bailed out
under `isReducedMotion` (checked via `useGsapContext`'s `isReducedMotion`
flag) and left their element in its natural DOM state. `Reveal` — the
single most-used content wrapper on the site — `ScaleReveal`, and
`Parallax` did not: they always created their ScrollTrigger regardless
of the OS preference. This wasn't a content-accessibility bug (content
does eventually reveal once scrolled to, since these aren't
progress-gated like 4b) but it did mean the site's most common animation
primitive ignored the preference entirely, which is exactly what §11
("[Reveal should] work with reduced motion") and §22 call out.

**Fix**: all three now check `isReducedMotion` and, when true, resolve
directly to the target state via `gsap.set` (`Reveal`/`ScaleReveal`) or
skip entirely (`Parallax`, which has no fixed target to jump to —
parallax drift with no fixed endpoint is exactly the kind of motion the
preference asks to remove, not resolve).

## 5. Mobile motion profile — did not exist before Part 2 (spec §21)

Audited for any existing mobile-specific intensity handling
(`matchMedia`, `innerWidth`, breakpoint-gated animation params) outside
of `prefers-reduced-motion`: found none. Every scene ran identical
parallax distance, pin duration, and 3D drift on a 375px phone and a
1440px desktop.

Added `src/lib/motion/mobile.ts`:

```ts
const MOBILE_QUERY = "(max-width: 767px)"; // matches the existing `md` breakpoint used elsewhere
export const MOBILE_INTENSITY = 0.6; // never 0 — spec §21: "retain meaningful motion"
export function isMobileViewport(): boolean { /* matchMedia check */ }
```

Applied narrowly, to the three places §21 explicitly names:

- **Parallax distance** — `createParallax` compresses its computed
  `distance` by `MOBILE_INTENSITY` under the mobile breakpoint.
- **3D intensity** — `ScrollDrivenGroup` (hero 3D) scales the sampled
  keyframe *position* (not rotation/scale — geometry/character
  untouched, per §12/§24 "do not redesign") by `MOBILE_INTENSITY` before
  lerping toward it, so the mark travels a shorter path on small screens
  instead of sweeping the same absolute distance across a much narrower
  viewport.
- **Excessive pinning** — `createPinnedScene`'s default `durationVh`
  (when the caller hasn't supplied an explicit `end`) is shortened by
  `MOBILE_INTENSITY` under the mobile breakpoint, via a function-based
  ScrollTrigger `end` (re-evaluated on `invalidateOnRefresh`, so it
  responds to resize/rotation rather than being fixed at creation time).

Not touched: `HorizontalScroller`'s horizontal distance is already
content-driven (`scrollWidth`-based, not a fixed intensity knob), and
reduced-motion's own fallbacks (§4) already govern the most extreme
mobile+accessibility overlap case.

## 6. Files changed

**Added**
- `src/lib/motion/mobile.ts`

**Modified**
- `src/lib/motion/tokens.ts` — added `DAMPING` token family.
- `src/lib/motion/index.ts` — barrel-exports `DAMPING` and the new
  `mobile.ts` exports.
- `src/lib/motion/pin.ts` — mobile-scaled `durationVh` (function-based
  `end`, `invalidateOnRefresh: true`).
- `src/lib/motion/parallax.ts` — mobile-scaled drift distance.
- `src/lib/three/ScrollDrivenGroup.tsx` — `DAMPING.cinematic` default,
  mobile-scaled position amplitude, corrected an inverted doc comment.
- `src/features/experience/services/ServiceRail.tsx` — `DAMPING.section`
  instead of a local constant; reduced-motion static list fallback.
- `src/features/home/sections/SixSJourney.tsx` — added rAF smoothing
  loop (`DAMPING.section`); reduced-motion static list fallback.
- `src/components/motion/Reveal.tsx` — reduced-motion bail via `gsap.set`.
- `src/components/motion/ScaleReveal.tsx` — reduced-motion bail via `gsap.set`.
- `src/components/motion/Parallax.tsx` — reduced-motion bail (no-op).
- `src/components/motion/PinnedScene.tsx` — drops fixed-height/clipping
  container styling under reduced motion.
- `src/components/motion/HorizontalScroller.tsx` — keeps native
  horizontal scroll at all breakpoints under reduced motion.
- `src/components/motion/SceneTransitionStage.tsx` — resolves to the
  transition's end state under reduced motion instead of leaving both
  panels in their default (overlapping) state.

No files deleted. No typography/color/copy/layout-composition changes —
every edit is either a motion-timing constant, a reduced-motion
fallback, or the minimal container styling a fallback required.

## 7. Components/pages audited with no changes needed

- **Timing/easing tokens** (`DURATION`, `EASE` in `tokens.ts`) — already
  a small, coherent family (`instant`/`fast`/`normal`/`slow`/`cinematic`
  × `standard`/`smooth`/`emphasized`/`cinematic`), already the only
  values used throughout `lib/motion/*`. Grepped the whole `src/` tree
  for numeric `duration:`/string `ease:` literals bypassing these tokens
  outside `lib/motion` — none found. No second token system existed to
  consolidate.
- **`TeamSequence`** — `activeIndex` state is driven directly from
  `HorizontalScroller`'s continuous `onProgress` callback, which fires on
  both scroll directions already (GSAP `onUpdate` isn't direction-gated);
  reverse scroll already updates the readout correctly.
- **About → How We Work (`Process.tsx`, `HowWeWork.tsx`)** — standard
  `HorizontalScroller`/`Reveal` usage, inherits every fix above, no
  page-specific timing outliers found.
- **Projects gallery, Insights list/article, Contact/StartProject form**
  — audited for timing outliers (§18/§19: reading content and form
  controls should feel calmer/quicker than cinematic scenes). Already
  correct: articles and the gallery use standard `Reveal`/
  `HorizontalScroller` defaults, and every interactive form control uses
  quick Tailwind `transition-colors`/`transition-[filter]` (no GSAP, no
  slow decorative animation) — no changes needed.
- **`durationVhPerItem` variance** between `ServiceRail` callers
  (`0.85`–`1.0` across `Services.tsx`/`ServiceCompass.tsx`) and
  `SixSJourney`'s `total * 1.15` — left as-is. These are intentional
  per-scene pacing multipliers, close enough in magnitude to read as
  "the same family, different weight" (§28: "variation is allowed,
  inconsistency is not"), not the kind of scrub-feel mismatch §8 is
  about (that was the damping-factor bug in §3 above, which these
  numbers don't affect).
- **`ServiceCompass.tsx`** — audited; not currently rendered anywhere in
  the app (no import site found outside its own file), so left
  unmodified rather than guessing at intended reduced-motion/mobile
  behavior for dead code. Flagged in §9 below.

## 8. Verification

**Not run** — see §0. Before merging, run in an environment with
registry access:

```bash
npm install
npm run lint
npx tsc --noEmit
npm run build
npm run dev
```

Then the full browser QA matrix from spec §26 (1440/1280/768/390/375px;
load → scroll forward → scroll backward → navigate away → navigate back
→ scroll again, on every major page), with particular attention to:

- Reduced motion on (OS-level `prefers-reduced-motion: reduce`) at
  desktop width: Team, Projects gallery, About → How We Work should
  still show every item via native horizontal scroll; Services and Six S
  should show their static list fallback with every item's copy visible.
- Scroll feel comparison between Services, Six S, and the hero 3D mark —
  should now read as one family rather than one snapping ahead of the
  others.
- Mobile (390/375px): hero 3D travel distance, parallax drift, and
  pinned-scene scroll length should all feel shorter/lighter than
  desktop without motion disappearing outright.

## 9. Remaining limitations / what's left for a future pass

- **Verification wasn't run** (§0/§8) — this whole patch is unverified
  against a real install/build/browser.
- **`ServiceCompass.tsx`** has no reduced-motion or mobile-intensity
  handling (same class of issue as `ServiceRail`/`SixSJourney` before
  this pass) but currently has no render site in the app — left alone
  rather than modified speculatively. If it's wired up in a future
  change, it needs the same reduced-motion static-fallback treatment as
  §4b.
- **Mobile-scaled pin duration** (`pin.ts`) recalculates on
  `ScrollTrigger.refresh()`/resize (via the function-based `end` +
  `invalidateOnRefresh: true`), but wasn't verified against an actual
  device-rotation/resize event in a real browser — flagging as
  lower-confidence than the rest of this patch until browser QA confirms
  it.
- No per-page redesign, new features, backend/CMS/database work, or
  Module 5 was started, per the brief's explicit final rule.
