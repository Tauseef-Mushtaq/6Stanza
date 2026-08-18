"use client";

/**
 * Shared mobile-motion profile (spec §21): "reduce parallax distance,
 * reduce 3D intensity, reduce excessive pinning... do not simply turn
 * all animation off — use reduced intensity." Before Part 2 there was
 * no mobile-specific handling anywhere in the motion system at all —
 * every scene ran identical intensity/duration on a 375px phone and a
 * 1440px desktop. This is the one shared source of truth for "is this
 * a small viewport" and "how much should motion intensity shrink",
 * so individual primitives (parallax, pin duration, 3D drift) scale
 * down together instead of each picking its own breakpoint/factor.
 *
 * Matches the existing `md` (768px) breakpoint already used elsewhere
 * in the motion system (see `HorizontalScroller`'s `md:overflow-hidden`
 * fallback), so "mobile" means the same viewport range everywhere.
 */
const MOBILE_QUERY = "(max-width: 767px)";

/** Multiply distances/durations by this on mobile — never fully zero (spec §21: "retain meaningful motion"). */
export const MOBILE_INTENSITY = 0.6;

export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(MOBILE_QUERY).matches;
}
