/**
 * Motion language constants — the JS-side mirror of the CSS custom
 * properties in globals.css (`--duration-*`, `--ease-*`). Module 1
 * establishes these tokens only; no ScrollTrigger scenes, pins, or
 * timelines are built here. Later modules (2+) import these into GSAP
 * timelines so every animation in the app draws from one vocabulary.
 *
 * Keep this file's values in sync with globals.css by hand — CSS
 * custom properties can't be read into JS constants at build time
 * without a runtime lookup, and these are needed synchronously by
 * GSAP before paint.
 */

export const DURATION = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.45,
  slow: 0.9,
  cinematic: 1.6,
} as const;

export const EASE = {
  standard: "cubic-bezier(0.22, 1, 0.36, 1)",
  smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
  emphasized: "cubic-bezier(0.65, 0, 0.35, 1)",
  cinematic: "cubic-bezier(0.83, 0, 0.17, 1)",
  /**
   * Module 4F: named alias for GSAP's `"none"` keyword — the correct
   * ease for anything whose progress should stay directly proportional
   * to scroll (parallax, horizontal-scroll track position, pinned-crop
   * scale, scrubbed scene transitions). Kept as an explicit token
   * rather than a bare `"none"` string scattered at each call site, so
   * "this animation is intentionally linear" reads the same way
   * "this one is cinematic" does.
   */
  linear: "none",
} as const;

export type DurationToken = keyof typeof DURATION;
export type EaseToken = keyof typeof EASE;

/**
 * Module 4F — remaining semantic groups from the motion contract
 * (spec §7–10): stagger, reveal distance, parallax speed, and scale
 * presets. Added after auditing every current call site for its actual
 * value (see each primitive's inline comments for which tier maps to
 * which pre-existing default) — nothing here changes a rendered
 * animation; it names the values that were already in use so future
 * call sites reach for a tier instead of inventing a new number.
 */
export const STAGGER = {
  /** Char-by-char text reveals (`createTypographyReveal` unit="chars"). */
  tight: 0.02,
  /** Word-by-word text reveals — the typical content-stagger case. */
  standard: 0.05,
  /** Staggering whole child elements (list items, cards) via `Reveal`'s `staggerChildren`. */
  loose: 0.08,
} as const;

export const DISTANCE = {
  /** Small UI elements, icons, inline labels. */
  small: 32,
  /** Default `Reveal` travel distance — headings, paragraphs, cards. */
  standard: 56,
  /** Large editorial/cinematic reveals. */
  large: 96,
} as const;

export const PARALLAX = {
  /** Content-adjacent layers — spec §9: "primary content should generally move less." */
  subtle: 0.5,
  /** Decorative background layers behind hero/section content — the value nearly every `<Parallax>` call in the app already uses. */
  standard: 0.2,
  /** Foreground/decorative numerals moving opposite to scroll for emphasis. */
  strong: -0.1,
} as const;

export const SCALE = {
  /** Barely-there scale-in, for content that should feel almost static. */
  subtle: 0.94,
  /** Default `createScale`/`ScaleReveal` starting scale. */
  standard: 0.92,
  /** More pronounced editorial scale-in (`FinalCta`, `/motion` showcase). */
  dramatic: 0.85,
} as const;

export type StaggerToken = keyof typeof STAGGER;
export type DistanceToken = keyof typeof DISTANCE;
export type ParallaxToken = keyof typeof PARALLAX;
export type ScaleToken = keyof typeof SCALE;

/**
 * Part 2 — shared scroll-scrub smoothing (spec §8: "avoid one scene
 * feeling glued directly to the mouse wheel while another lags
 * dramatically behind it"). Several scroll-driven scenes damp raw
 * ScrollTrigger progress toward a rendered value every frame (a lerp
 * loop, in DOM/rAF or in an R3F `useFrame`) instead of applying it
 * 1:1. Before Part 2 each scene picked its own ad-hoc factor —
 * `ServiceRail` used 0.09, the hero 3D group used 0.15 — which is
 * exactly the inconsistency the spec calls out. These two tokens are
 * now the only damping factors any scene should use, chosen close
 * together so every scrubbed scene reads as one family, with
 * `cinematic` slightly heavier (more lag, more weight) than `section`
 * per the motion-hierarchy in spec §4.
 *
 * Semantics: each frame, `value += (target - value) * factor`. Smaller
 * factor = slower catch-up = heavier/laggier; larger = snappier.
 *
 * Module 4F note: this is this app's answer to "motion.scrub.*"
 * (spec §11 — fast/standard/smooth scrub tiers). GSAP ScrollTrigger's
 * own `scrub` option is a boolean everywhere in this codebase (`true`,
 * tied exactly to scroll position) rather than a numeric lag value —
 * audited for scattered `scrub: <number>` call sites and found none.
 * The "how snappy does this feel" axis lives entirely in `DAMPING`
 * instead, applied in an app-level rAF/`useFrame` loop layered on top
 * of the 1:1 ScrollTrigger progress. Keeping both would be a second,
 * competing scrub system (explicitly out of scope per §12) — `DAMPING`
 * is it.
 */
export const DAMPING = {
  section: 0.12,
  cinematic: 0.1,
} as const;

export type DampingToken = keyof typeof DAMPING;
