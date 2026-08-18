# MODULE 4H — HANDOFF (Frontend Runtime Stabilization)

Scope: runtime animation *behavior* — initialization, Lenis/ScrollTrigger
sync, reverse-scroll correctness, route lifecycle. Not motion tokens
(4F, done), not viewport geometry (4G, done), not visual redesign.

## 0. How to read this handoff

This module's brief describes a list of symptoms (first-load breakage,
reverse-scroll not working, route-nav leaving stale state, inconsistent
rhythm). I audited the actual source against each one individually
before writing any code. **Most of them were already fixed** by work
that predates this module — a `ScrollLifecycle.tsx` component already
exists and already solves the first-load and route-refresh problem, and
every scroll-driven primitive already uses GSAP `scrub` (which is
reversible by construction, not something that needs separate "scroll
up" logic). I'm reporting that plainly rather than re-solving problems
that don't exist, per this module's own instruction not to blindly
retune things.

One genuine, previously-unaddressed gap was found and fixed: **Lenis's
internal scroll state was never resynced on route change.**

## 1. Root causes found

### Already fixed (verified via source read, not assumed from prior handoffs)

- **First-load initialization.** `ScrollLifecycle.tsx` already exists
  and already does the right thing: waits for `document.fonts.ready`
  *and* the window `load` event, then runs `ScrollTrigger.refresh()`
  inside a double-`requestAnimationFrame` (so the refresh happens after
  a real paint from that settling, not before). This is exactly the
  "wait for layout readiness, not a timer" approach this module asks
  for. No first-load bug was reproducible by reading the code — the
  measurement-before-fonts-load race this module describes is the
  documented root cause *this component already exists to fix*.
- **Duplicate GSAP/ScrollTrigger registration.** `src/lib/motion/gsap.ts`
  is the single registration point, guarded by a module-level flag.
  Confirmed via `grep` that no other file calls
  `gsap.registerPlugin(...)`.
- **Duplicate Lenis instances / duplicate RAF loops.**
  `SmoothScrollProvider` creates exactly one `Lenis` instance, wired
  into GSAP's own ticker (`gsap.ticker.add(update)`) rather than a
  second independent `requestAnimationFrame` loop, with proper
  `lenis.destroy()` / `gsap.ticker.remove(update)` cleanup. Confirmed
  via `grep` that `new Lenis(` appears exactly once in the codebase.
- **Reverse-scroll correctness for pinned/horizontal scenes.**
  `createPinnedScene` and `createHorizontalScroll` (the two primitives
  every pinned/horizontal section in the app is built on — `pin.ts`/
  `horizontal.ts`) both use `scrub: true`. A scrubbed ScrollTrigger's
  progress *is* the scroll position — there is no separate "reverse"
  code path to get right or wrong, because GSAP updates `self.progress`
  continuously in both directions by construction. Every section that
  drives React state or imperative visuals off `onProgress`
  (`ServiceRail`, `SixSJourney`, `TeamSequence`, `ProjectGallery`) reads
  that same continuously-bidirectional value, so they inherit correct
  reverse behavior automatically rather than needing their own fix.
- **3D scroll-progress reversibility.**
  `createScrollProgressTrigger` (`scrollProgress.ts`) also defaults
  `scrub: true`, and `ScrollDrivenGroup` (the R3F group driving the
  homepage 3D mark) samples purely off `progressRef.current` with no
  directional branching — reversible by the same construction.
- **`Reveal`'s one-time entrances are intentional, not a bug.**
  `createReveal` defaults to `once: true` →
  `toggleActions: "play none none none"` (plays once, never reverses).
  That's correct, deliberate behavior for a "this heading enters the
  page" moment, not a broken reverse case — per this module's own
  instruction not to destroy intentionally one-shot entrances. When a
  caller passes `once: false`, `Reveal` already uses
  `"play reverse play reverse"`, which does reverse correctly on
  scroll-up.
- **Reduced motion.** Single source of truth (`useReducedMotion.ts` /
  `prefersReducedMotion()`), live-updating on OS-level toggle mid-
  session via `matchMedia`'s `change` listener — not just read once at
  mount. Every primitive audited (`PinnedScene`, `HorizontalScroller`,
  `useScrollScene3D`) already branches on it correctly.
- **Resize handling.** `invalidateOnRefresh: true` is set on every
  ScrollTrigger this app creates; ScrollTrigger has its own built-in
  window-resize listener that triggers recalculation — no per-component
  resize listeners exist or are needed, confirmed via `grep`.

### Genuine gap found and fixed

- **Lenis was never told about route changes.** Next's App Router
  changes the native scroll position on navigation, but Lenis
  maintains its own internal target/animated scroll value and measures
  document height independently — nothing in the codebase called
  `lenis.resize()` (or anything else) after a route change. Left alone,
  this is exactly the kind of thing that produces a "stuck" or
  "snapping" feel right after navigating to a page with a different
  document height, and is a plausible concrete contributor to this
  module's "route navigation can leave ScrollTrigger/Lenis state
  incorrectly initialized" complaint. Confirmed via `grep` that
  `lenis.resize()` / `lenis.scrollTo()` did not appear anywhere in the
  codebase before this fix.

## 2. Exact fix made

`src/components/layout/ScrollLifecycle.tsx`:

1. Added `getLenisInstance()?.resize()` at the top of the route-change
   effect, so Lenis re-measures the new page's actual document height
   immediately on every navigation.
2. The route-change effect now also awaits `document.fonts.ready`
   before refreshing ScrollTrigger (previously it only did the
   double-rAF, no font wait) — a new route can introduce a
   heading/weight combination the previous page never loaded, and
   refreshing before that settles reproduces the same measure-too-early
   bug the first-load fix exists to prevent, just triggered by
   navigation instead of cold load.
3. **Deliberately did not add `lenis.scrollTo(0)`** on route change.
   Whether the correct behavior is "jump to top" (a `<Link>` push
   navigation) or "restore prior position" (browser back/forward)
   depends on distinguishing those two cases, and `usePathname()` alone
   provides no way to tell them apart. Guessing wrong in either
   direction would introduce a new bug in a module that only budgets
   for a `resize()` call, not a scroll-restoration policy — see Known
   Limitations.

## 3. Files changed

```
src/components/layout/ScrollLifecycle.tsx
```

That is the only file this module modified. No other file needed a
runtime-behavior fix — see §1 for the specific evidence behind that
claim for each symptom in the brief.

## 4. Files added

```
MODULE-4H-HANDOFF.md
```

## 5. Files deleted

None.

## 6. Runtime behavior — what changed vs. what was already correct

| Symptom in the brief | Status | Evidence |
|---|---|---|
| Animations don't init on first load | Already fixed (pre-existing `ScrollLifecycle`) | fonts.ready + window load + double-rAF refresh, read directly |
| Refresh fixes it | Already fixed, same mechanism | — |
| Scroll up doesn't reverse | Already correct by construction | `scrub: true` everywhere scroll-driven; `Reveal`'s one-shot mode is intentional, not a bug |
| Different sections feel like different rhythms | Out of scope for 4H (this is 4F's domain, already delivered) | Not re-audited here — 4F's token migration already covers duration/ease/stagger/parallax/scale |
| Route nav leaves stale ScrollTrigger/Lenis state | **Real gap, fixed** | `lenis.resize()` was never called on navigation; now is |

## 7. Verification results

```
npm install       PASS (430 packages, already satisfied)
npm run lint      PASS (0 errors, 0 warnings)
npx tsc --noEmit  PASS (this run had a prior `next build` in this same
                  environment, which generates the route types
                  standalone tsc needs — earlier modules' reports of a
                  LayoutProps error were about tsc lacking those
                  generated types outside of `next build`, not a real
                  code defect; consistent with `next build`'s own
                  internal TypeScript pass having always been clean)
npm run build     PASS — 28/28 routes generated
npm run dev       NOT RUN — no interactive environment here
```

## 8. NOT VISUALLY VERIFIED

Per this module's explicit instruction, stated plainly rather than
implied:

**I did not open a browser.** Everything in §1 and §2 is a source-code
audit and a source-code fix, not an observed behavior. Specifically not
verified:

- Whether animations actually run correctly on a genuine first load
  (closed tab → fresh URL) in a real browser.
- Whether scroll-up reversal *looks* smooth for every pinned/horizontal
  section, beyond confirming the mechanism (`scrub: true`) is
  structurally reversible.
- Whether the `lenis.resize()` fix visibly resolves a stuck/snapping
  feel after navigation — I have no way to reproduce or observe that
  symptom without a browser.
- Mobile behavior at 375px/768px/1440px.
- Whether the site "feels like one rhythm" — that's a subjective,
  visual judgment this module explicitly says shouldn't be claimed
  without testing.

## 9. Known limitations (explicitly deferred, not silently skipped)

- **Scroll-to-top vs. scroll-restoration on route change** is
  unresolved. Deliberately not fixed here (see §2.3) because doing it
  correctly requires distinguishing push navigation from browser
  back/forward, which `usePathname()` doesn't expose. If this is a real
  problem in the browser, the fix belongs in whatever module owns
  scroll-position policy — likely a `useRouter`/`popstate`-aware check
  wrapping `lenis.scrollTo`, not a blind top-jump.
- **No live reproduction of any of the described symptoms was
  possible** in this environment. Every finding in §1 is an audit
  conclusion from reading the actual implementation, not a confirmed
  observation of the bug or its absence.
- This module intentionally did not touch Module 4F (motion tokens) or
  Module 4G (viewport safe zone) — both were re-read to confirm neither
  overlaps with the one fix made here.

## 10. Patch

```
6stanza-module-4H-patch.zip
```

Contains only `src/components/layout/ScrollLifecycle.tsx` and this
handoff.
