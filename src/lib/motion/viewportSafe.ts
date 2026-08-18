/**
 * Module 4G — Cinematic Viewport & Pinned Sections.
 *
 * Names the CSS custom properties that make up the site's shared
 * "safe zone" concept, for any JS consumer that needs to read one
 * (e.g. a `getComputedStyle` lookup, or a scroll calculation that
 * needs the real safe-top offset in pixels). The properties
 * themselves are defined once in `globals.css` and consumed via CSS
 * (`var(--safe-top)`, `var(--safe-bottom)`) by `PinnedScene` and
 * `HorizontalScroller` by default — most components never need to
 * import this file at all.
 *
 * `--header-h` is kept in sync with the header's real rendered height
 * by `syncHeaderHeightVar` (see ./headerHeight.ts); `--safe-top` and
 * `--safe-bottom` derive from it declaratively in CSS, so there is
 * nothing further to sync here.
 */
export const SAFE_TOP_VAR = "--safe-top";
export const SAFE_BOTTOM_VAR = "--safe-bottom";

/** Reads a safe-zone CSS var's current computed pixel value from the document root. */
export function readSafeZoneVar(name: typeof SAFE_TOP_VAR | typeof SAFE_BOTTOM_VAR): number {
  if (typeof window === "undefined") return 0;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name);
  return parseFloat(value) || 0;
}
