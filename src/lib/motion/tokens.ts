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
