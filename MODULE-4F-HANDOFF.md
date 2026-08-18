# Module 4F Handoff — Global Motion System

> Module 4F establishes the global motion language only. Viewport
> geometry, pinned-section positioning, reverse-scroll behavior,
> initialization/lifecycle, and page-specific visual refinement are
> intentionally deferred to Modules 4G–4J.

## 0. Context — this codebase is ahead of a typical Module 4F starting point

Before touching anything, this module read every existing handoff
(0, 1, 2, 3, 4A–4E) **and** the two most recent completed passes on
this project, `MODULE-FRONTEND-STABILIZATION-PART1-HANDOFF.md` and
`MODULE-FRONTEND-STABILIZATION-PART2-HANDOFF.md`, which — despite the
different naming scheme — already did substantial global-motion-system
work: Part 1 built the lifecycle/header-safe-stage infrastructure, and
Part 2 (completed immediately prior to this module, in this same
session) already unified scrub-damping consistency, fixed reduced-motion
gaps across `Reveal`/`ScaleReveal`/`Parallax`/`PinnedScene`/
`HorizontalScroller`/`SceneTransitionStage`, and added a mobile motion
intensity profile.

Per this module's own instruction ("the source code is authoritative,"
§1) this handoff reports what the source actually contains, not what a
from-scratch Module 4F would normally need to build. Concretely: a full
`DURATION`/`EASE` token system, `DAMPING` (this app's scrub-consistency
answer), and mobile-intensity handling **already existed** going into
this module. This module's real contribution is the remaining piece of
the motion contract §3 asks for — `stagger`, `distance`, `parallax`, and
`scale` semantic tiers — plus migrating the primitives that had ad hoc
numbers for those onto named tokens, and a `linear` ease alias for
scrub-tied animation. See §3 for the full before/after inventory.

## 1. Motion inconsistency inventory (spec §2)

Audited every `.ts`/`.tsx` file under `src/` for scattered `duration:`,
`ease:`, `scrub:`, `stagger`, `distance`, parallax `speed`, and scale
`from`/`to` values, outside `lib/motion` itself:

| Value class | Finding |
|---|---|
| `duration:` numeric literals | **None** bypassing `DURATION` tokens. |
| `ease:` string literals | **None** bypassing `EASE` tokens, except bare `"none"` strings for linear/scrub-tied tweens (4 call sites: `parallax.ts`, `horizontal.ts`, `image.ts`, `scale.ts`'s scrub branch) — not inconsistent with each other, just not a named token. Fixed (§3). |
| `scrub:` numeric (GSAP lag values) | **None** — every scrub call site uses boolean `true`. The "how snappy" axis lives in the app-level `DAMPING` rAF/`useFrame` smoothing layer (added in Part 2), not GSAP's own numeric scrub lag. Documented explicitly in `tokens.ts` so a future contributor doesn't add a second, competing scrub system. |
| `Reveal`'s `stagger` prop overrides | **None** — every `<Reveal>`/`<Reveal staggerChildren>` call site in the app relies on the component default; no page passes `stagger={...}`. The default itself (`0.08`, hardcoded) had no name. Named `STAGGER.loose`. |
| Typography stagger (`createTypographyReveal`) | Distinct, intentional per-unit values: chars `0.02`, words `0.05`, lines `0.12`. Not mutually inconsistent with each other, just unnamed. Named `STAGGER.tight`/`STAGGER.standard`; `lines`' `0.12` documented as an intentional exception beyond the 3-tier scale (spec §16). |
| `Reveal`'s travel `distance` | Flat `56` for every direction, no per-call overrides found. Named `DISTANCE.standard`; added unused-but-available `small`/`large` tiers for future emphasis variation. |
| `<Parallax speed={...}>` | 14 call sites app-wide. Clustered tightly: `0.15`–`0.25` for nearly every decorative background layer, one alternating `±` pair in `Philosophy.tsx` (`0.15` / `-0.1`), a wider demonstrative spread (`0.15`/`0.6`/`1.1`) only on the internal `/motion` showcase page. **Already coherent** — not the scattered-duplicate-values case spec §2 describes as the thing to look for. Named the convention (`PARALLAX.standard = 0.2`) rather than reconciling numbers that weren't actually in conflict. |
| `ScaleReveal`/`createScale` `from` | Component/primitive default `0.92`; two call sites (`FinalCta`, `/motion` showcase) explicitly pass `0.85`. Two-value spread, both intentional. Named both (`SCALE.standard` / `SCALE.dramatic`); left the two literal `0.85` call sites unmodified — see §6, "why some literals weren't migrated." |
| `createImageEntrance` `scaleFrom`/`rotateFrom` | `1.12`/`1.5°` — a >1 zoom-settle pattern, not the same family as `SCALE`'s <1 shrink-in tokens. Documented as an intentional exception rather than forced onto `SCALE` (spec §16). |
| Lenis config, RAF loops, ScrollTrigger registration | Audited, unchanged — single Lenis instance, single GSAP ticker hookup, no duplicate RAF loops or repeated `ScrollTrigger`/plugin registration found anywhere. Nothing to consolidate here (Part 1 already covered this; re-confirmed, not re-fixed). |

**Conclusion**: this codebase did not have the "one section at `power2.out`
0.4s, another at `power4.out` 1.2s" scattered-duplicate problem spec §2
describes as the thing to hunt for — `DURATION`/`EASE` were already the
only vocabulary in use everywhere. The actual gap was narrower:
`stagger`/`distance`/`parallax`/`scale` had sensible, already-consistent
default *values* with no *names* — i.e., the contract existed in
practice but not in the token layer, which is precisely the "formalize
what's already true" case spec §16 anticipates ("If a value is already
correct for the new semantic tier, migrate it").

## 2. Where the motion contract lives (spec §3, §21)

Extended the existing `src/lib/motion/tokens.ts` — no second token
system created. Barrel-exported from `src/lib/motion/index.ts`
alongside the pre-existing `DURATION`/`EASE`/`DAMPING`.

```ts
// Pre-existing (Modules 1–2, refined in Part 2)
DURATION = { instant, fast, normal, slow, cinematic }
EASE     = { standard, smooth, emphasized, cinematic }
DAMPING  = { section, cinematic }   // this app's "motion.scrub.*"

// New in Module 4F
EASE.linear      // named alias for GSAP's "none" keyword
STAGGER  = { tight: 0.02, standard: 0.05, loose: 0.08 }
DISTANCE = { small: 32, standard: 56, large: 96 }
PARALLAX = { subtle: 0.5, standard: 0.2, strong: -0.1 }
SCALE    = { subtle: 0.94, standard: 0.92, dramatic: 0.85 }
```

Every primitive under `src/lib/motion/*` and `src/components/motion/*`
imports from this one place; no component defines its own duration,
ease, stagger, distance, parallax, or scale constant.

## 3. Migration — what actually changed vs. what's a naming-only change

Consistent with spec §16 ("migrate where a value already matches the
new tier; don't mechanically rewrite pages"), every migration below is
a **rename, not a re-tune** — same rendered number, now sourced from a
token:

- `lib/motion/reveal.ts` — `AXIS_DISTANCE` (`56`) → `DISTANCE.standard`;
  default `stagger` (`0.08`) → `STAGGER.loose`.
- `components/motion/Reveal.tsx` — same `stagger` default, same swap
  (the component has its own default independent of the primitive's).
- `lib/motion/typography.ts` — char/word stagger defaults → `STAGGER.tight`/`STAGGER.standard`; `lines`' `0.12` left as a documented exception.
- `lib/motion/scale.ts` / `components/motion/ScaleReveal.tsx` — default
  `from` (`0.92`) → `SCALE.standard`; scrub-branch `ease: "none"` →
  `EASE.linear`.
- `lib/motion/parallax.ts` — default `speed` changed from an unrelated
  `0.3` to `PARALLAX.standard` (`0.2`) — **the one place a default
  numeric value actually moved**, safe because every real call site
  already passes `speed` explicitly (verified via full-app grep before
  changing it), so no rendered animation changes; `ease: "none"` →
  `EASE.linear`.
- `components/motion/Parallax.tsx` — its own independent default
  (`0.4`, never actually reached by any current page) → `PARALLAX.standard`, for the same reason.
- `lib/motion/horizontal.ts`, `lib/motion/image.ts` — `ease: "none"` →
  `EASE.linear` (scrub-tied track position / pinned-crop scale).

## 4. Files changed / new

**Modified** (all under `src/lib/motion/` and `src/components/motion/`,
per spec §21's stated priority order — shared utilities and components
first, no page/feature files touched):

- `src/lib/motion/tokens.ts`
- `src/lib/motion/index.ts`
- `src/lib/motion/reveal.ts`
- `src/lib/motion/typography.ts`
- `src/lib/motion/scale.ts`
- `src/lib/motion/parallax.ts`
- `src/lib/motion/horizontal.ts`
- `src/lib/motion/image.ts`
- `src/components/motion/Reveal.tsx`
- `src/components/motion/ScaleReveal.tsx`
- `src/components/motion/Parallax.tsx`

**New files**: none — every semantic group fit inside the existing
`tokens.ts`/`index.ts` pair rather than warranting a new file.

**Deleted files**: none.

No page or feature file under `src/app/`, `src/features/`, or
`src/components/ui/`/`layout/` was modified — per §16/§21, and because
the audit in §1 found no page-level value that was actually
inconsistent with its neighbors (only unnamed).

## 5. Accessibility (spec §19)

No changes to reduced-motion behavior in this module — `useReducedMotion`
remains the single mechanism, and every place that already checked it
(`PinnedScene`, `HorizontalScroller`, `Reveal`, `ScaleReveal`, `Parallax`,
`SceneTransitionStage`, `ServiceRail`, `SixSJourney`, `SplitHeading`,
`ImageEntrance`, `PinnedImageCrop` — all fixed in Part 2, immediately
prior to this module) is untouched. This module's token renames don't
affect the reduced-motion bail-out paths at all, since those paths skip
the animated branch entirely rather than passing through
duration/ease/stagger/distance/parallax/scale values.

## 6. Deliberately NOT done in this module

Per §17/§13/§14/§15/§20 and the explicit scope rule, none of the
following were touched, even where the audit surfaced something:

- **No viewport/pinning geometry changes** — `start`/`end`/`pin`/
  `pinSpacing`/viewport heights untouched (deferred to **Module 4G**).
- **No reverse-scroll rewrite** — everything scrub-driven already
  reverses correctly by construction (confirmed in Part 2's audit,
  re-confirmed here); nothing new to defer, but flagging per §14 that
  this module didn't attempt a broad reverse-scroll pass regardless.
- **No initialization/lifecycle changes** — `ScrollLifecycle`, first-load
  and route-change handling untouched (deferred to **Module 4I**).
- **No responsive/breakpoint-specific motion values added** beyond what
  Part 2 already established (`MOBILE_INTENSITY` in `lib/motion/mobile.ts`)
  — this module didn't introduce new breakpoint-gated tokens (deferred
  to **Module 4J** if further granularity is needed).
- **`FinalCta.tsx` and `/motion`'s `ScaleReveal from={0.85}` literals
  left unmigrated** — these are leaf page/feature-level usages; per
  §16 ("do not modify every page just to replace numbers
  mechanically") and §21 ("only modify page/feature files if genuinely
  necessary"), a cosmetic literal→token swap with zero behavior change
  wasn't judged necessary. Both values already equal `SCALE.dramatic`
  exactly, so a future contributor reaching for that tier will find it
  already named.
- **`ServiceCompass.tsx`** — flagged in Part 2's handoff as unused
  (no render site anywhere in the app) and still unused; left alone
  again rather than migrated speculatively.
- **No redesign of any kind** — no color, typography, layout, card,
  Services-rail, Team, Six S, Projects, or Hero changes.

## 7. Performance (spec §18)

No new RAF loops, no new ScrollTrigger/plugin registration, no new
event listeners, no React state introduced for animation. This module
only renamed constants consumed by existing GSAP tween/ScrollTrigger
calls — zero runtime-shape change.

## 8. Verification — NOT fully run (same limitation as Part 2)

```
$ npm install
npm error code E403
npm error 403 403 Forbidden - GET https://registry.npmjs.org/...
```

This sandbox has no network access, so `npm install` fails immediately
and **`npm run lint`, `npx tsc --noEmit`, `npm run build`, and
`npm run dev` were not run** — same limitation reported in the Part 2
handoff, unresolved. Per this module's own §23 instruction: **the
global motion contract has been implemented, but automated verification
did not run and browser visual QA has not been performed.** Do not
treat any of the above as visually confirmed.

What *was* checked by hand, in lieu of a compiler: every modified
file's brace/paren balance, every new import resolves to an existing
export (`STAGGER`/`DISTANCE`/`PARALLAX`/`SCALE`/`EASE.linear` all added
to and re-exported from `tokens.ts`/`index.ts` before any consumer
referenced them), and every changed default value was traced against
every call site that could reach it (§1's table) to confirm zero
call sites rely on the one default that numerically moved
(`Parallax`'s default `speed`).

Case-sensitive import audit: all new imports (`STAGGER`, `DISTANCE`,
`PARALLAX`, `SCALE`) match their exact export casing in `tokens.ts`;
no case mismatches introduced.

Routes potentially affected (import graph only, not visually
confirmed): every route rendering `Reveal`/`ScaleReveal`/`Parallax` —
i.e. effectively all of `/`, `/about`, `/services` (+ detail),
`/projects` (+ detail), `/team`, `/insights` (+ detail), `/contact`,
`/start-project`, and the internal `/motion` and `/design-system`
showcase routes if present.

## 9. Known issues — sorted by which module owns them

**Fixed in this module:**
- `stagger`/`distance`/`parallax`/`scale` values now named and centralized.
- Scrub-tied `ease: "none"` calls now reference `EASE.linear`.
- `Parallax`'s two independent, never-actually-reached default `speed`
  values (`0.3` in the primitive, `0.4` in the component) reconciled to
  the same named tier.

**Not issues, confirmed already correct (re-audited, not re-fixed):**
- `DURATION`/`EASE` token consistency (Modules 1–2, Part 2).
- Scrub-damping consistency across `ServiceRail`/`SixSJourney`/hero 3D
  (Part 2).
- Reduced-motion coverage across every reveal/parallax/scale/pin/
  horizontal-scroll primitive (Part 2).
- Mobile motion intensity profile (Part 2).
- Single Lenis instance, single GSAP ticker/registration point, no
  duplicate RAF loops (Part 1, re-confirmed here).

**Explicitly deferred, not evaluated as bugs in this module:**
- Viewport/pin geometry, `start`/`end` positions, header/content
  collision → **Module 4G**.
- Any remaining reverse-scroll edge cases → **Module 4H** (Part 2
  already found the app's reverse-scroll to be structurally sound via
  `scrub: true`, but this module didn't re-run that audit itself).
- Initialization/lifecycle, route-change re-init, first-load timing →
  **Module 4I**.
- Further responsive/breakpoint-specific motion granularity beyond the
  existing single mobile/desktop split → **Module 4J**.

**Environment limitation, not a code issue:**
- `npm install`/lint/`tsc`/build/dev/browser QA could not be run in
  this sandbox (no network access). Needs verification in an
  environment with registry access before merging.
