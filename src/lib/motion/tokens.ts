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
} as const;

export type DurationToken = keyof typeof DURATION;
export type EaseToken = keyof typeof EASE;

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
 */
export const DAMPING = {
  section: 0.12,
  cinematic: 0.1,
} as const;

export type DampingToken = keyof typeof DAMPING;
