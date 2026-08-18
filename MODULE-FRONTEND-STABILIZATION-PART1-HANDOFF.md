# Frontend Stabilization — Part 1 Handoff

Scope: global infrastructure only (header-safe layout, Lenis/GSAP lifecycle,
first-load + route-change initialization). No design, timing, or per-page
changes.

## 1. Bugs found & root causes

### A. Horizontal/pinned cards go under the fixed header (the reported bug)

`HorizontalScroller` pins **its own scope element** via
`createHorizontalScroll` (`start: "top top"`). Once pinned, that element's
top edge sits exactly at viewport `y = 0` — directly behind the fixed
header, which is `position: fixed` and layered above content (`--z-nav`).
Every card inside then renders from `y = 0` downward, so its top portion is
covered.

`PinnedScene` already had the correct fix for this exact situation
(`paddingTop: var(--header-h)` on the pinned element itself), but
`HorizontalScroller` — a separate pin implementation used by six different
sections (Team, About → How We Work, Projects gallery, Home → Team, plus
the `/motion` showcase) — never got the same treatment. That's why the bug
reads as "global," not Team-specific: every consumer shared the same
missing padding.

### B. `--header-h` was a hardcoded guess, not a measured value

`--header-h: 88px` in `globals.css` was a static number nobody verified
against the actual rendered `<Header>` (which changes subtly with font
loading, and could drift on any future header edit) — a magic number
duplicated by reference across 10+ files rather than a real single source
of truth.

### C. First-load animations sometimes don't start until refresh

`useGsapContext` measures layout (trigger positions, horizontal
`scrollWidth`, pin distances) the moment each component mounts. If
webfonts or images are still loading at that instant, those measurements
are taken against a shorter/narrower document than what the user actually
sees a moment later — trigger start/end points land in the wrong place,
so scenes look inert until something (a manual resize) forces GSAP to
recalculate. There was no code path that re-measured once the page
actually finished settling.

### D. No shared route-change refresh

Client-side navigation (App Router) swaps `children` without a full
reload. Each page's own components correctly create/kill their own
ScrollTriggers via `useGsapContext` (this was already sound — see below),
but there was no shared recalculation step for anything that depends on
document-wide layout after the swap.

## 2. What was NOT broken (audited, left alone)

- **Lenis**: exactly one instance, created once in `SmoothScrollProvider`,
  correctly wired into GSAP's ticker and torn down on unmount. No changes.
- **GSAP registration**: single guarded registration point
  (`lib/motion/gsap.ts`). No changes.
- **Cleanup**: every single ScrollTrigger/timeline in the codebase is
  created inside `useGsapContext`, which scopes them to `gsap.context()`
  and reverts/kills on unmount or dependency change. Audited with
  `grep` for any `ScrollTrigger.create`/`gsap.to`/`gsap.timeline` call
  outside that hook or `lib/motion/*` — none found. No leaked triggers,
  no duplicate-trigger risk from this codebase's own patterns.
- **Resize**: ScrollTrigger's built-in debounced resize listener already
  recalculates all triggers (and `horizontal.ts` already sets
  `invalidateOnRefresh: true`, so horizontal distances stay correct across
  breakpoints). No second, competing resize listener was added — that
  would have reintroduced the "duplicate refresh" anti-pattern the brief
  explicitly warns against.
- **Reduced motion**: `useGsapContext` and `HorizontalScroller` already
  skip GSAP entirely and fall back to native scroll/no-animation when
  `prefers-reduced-motion` is set. Untouched, still functions the same way
  with the new `headerSafe` padding (padding applies regardless of motion
  mode, which is correct — the header still overlaps content either way).

## 3. Header-safe-stage architecture (single source of truth)

- **`src/lib/motion/headerHeight.ts`** (new): `syncHeaderHeightVar(el)`
  measures the header via `ResizeObserver` and writes the real height to
  `--header-h` on `document.documentElement`. `globals.css`'s
  `--header-h: 88px` is now explicitly documented as an SSR/first-paint
  fallback only.
- **`Header.tsx`**: now attaches a ref to the `<header>` and calls
  `syncHeaderHeightVar` once on mount. This is the only place `--header-h`
  is ever written.
- **`HorizontalScroller.tsx`**: new `headerSafe` prop, **default `true`**.
  When enabled, the pinned scope element gets `paddingTop: var(--header-h)`
  — the exact mechanism `PinnedScene` already used, now shared. This is a
  padding-based safe stage, not `overflow: hidden` clipping, so the full
  composition (including any content that intentionally extends beyond the
  header line before the pin engages) stays visible.
- All six existing `HorizontalScroller` consumers (Team, About → How We
  Work, Projects gallery, Home → Team, `/motion` showcase) inherit the fix
  automatically — no per-page changes needed or made.

## 4. Lifecycle: first-load + route-change

**`src/components/layout/ScrollLifecycle.tsx`** (new), mounted once at the
root inside `SmoothScrollProvider`:

- **First load**: waits for `document.fonts.ready`, then for the window
  `load` event (or fires immediately if the document is already
  `complete`), then runs `ScrollTrigger.refresh()` after a double
  `requestAnimationFrame` (lets the resulting layout actually paint before
  recalculating). No `setTimeout` guesswork, no synthetic scroll events —
  this refresh is tied to real signals that layout has settled.
- **Route change**: watches `usePathname()`; on every change after the
  first render, refreshes on the next paint so shared/document-level
  measurements catch up with the newly mounted page. Per-component
  triggers are unaffected — those already clean up and recreate correctly
  via `useGsapContext`.

## 5. Files changed

**Added**
- `src/lib/motion/headerHeight.ts`
- `src/components/layout/ScrollLifecycle.tsx`

**Modified**
- `src/components/layout/Header.tsx` — measures and syncs `--header-h`.
- `src/components/motion/HorizontalScroller.tsx` — `headerSafe` prop
  (default on), header-safe padding on the pinned scope.
- `src/app/layout.tsx` — mounts `<ScrollLifecycle />`.
- `src/app/globals.css` — comment clarifying `--header-h` fallback status.

No files deleted. No design (typography/color/copy/layout composition)
changes — this only adds top clearance inside the pinned stage and fixes
lifecycle timing.

## 6. Verification results

```
npm install      → ok, 430 packages
npm run lint      → PASS, no warnings/errors
npx tsc --noEmit  → PASS (after `next build` generates its route-type
                    declarations; standalone `tsc` before any build/dev
                    run fails on `LayoutProps<"/">` in layout.tsx with
                    "Cannot find name 'LayoutProps'" — this is Next.js
                    16's typed-routes global, generated into
                    `.next/types`, not a bug introduced here. Confirmed
                    pre-existing: that line in layout.tsx was untouched.)
npm run build     → PASS, all 28 routes compiled/generated successfully
npm run dev       → starts cleanly, serves /team
```

Browser testing at 1440/1280/768/390/375px was not performed in this
environment (no headless browser tool available here) — please verify the
acceptance-criteria checklist below visually before merging.

## 7. Acceptance criteria status

- [x] No horizontal/pinned scene places important content underneath the
      fixed header — fixed via `headerSafe` padding.
- [x] A single reusable header-safe-stage mechanism exists — `--header-h`
      + `headerSafe` prop, shared by `PinnedScene` and `HorizontalScroller`.
- [x] Team horizontal scene inherits the fix (default-on prop).
- [x] About → How We Work inherits the fix (its `Process.tsx` uses
      `HorizontalScroller`).
- [x] Other `HorizontalScroller` usages (Projects gallery, Home → Team,
      `/motion`) remain functional and inherit the fix.
- [x] One coherent Lenis/GSAP loop — confirmed pre-existing, unchanged.
- [x] Initial page load initializes scenes correctly — `ScrollLifecycle`
      refresh on fonts-ready + window load.
- [x] Refresh is not required — same fix.
- [x] Client-side route navigation initializes scenes correctly —
      `ScrollLifecycle` pathname-change refresh.
- [x] ScrollTrigger refresh happens at correct lifecycle points (fonts
      ready / window load / route change — not every frame).
- [x] Resize behavior — confirmed already stable via ScrollTrigger's own
      debounced listener; not duplicated.
- [x] No duplicate ScrollTriggers — audited, none found.
- [x] No leaked event listeners/RAF loops — all new listeners/observers
      are cleaned up in their effect's return function.
- [x] Reduced motion remains functional — untouched code paths.
- [x] No visual design unnecessarily changed — only added header
      clearance to the previously-broken pinned stage.

Manual visual re-verification across the listed breakpoints is still
recommended since it wasn't possible to run a browser here.

## 8. What remains for Part 2

- Animation timing/rhythm tuning across pages.
- Full visual polish pass.
- Any per-page redesign (explicitly out of scope for Part 1).
