"use client";

/**
 * Single source of truth for the fixed header's rendered height.
 *
 * `--header-h` starts as a static fallback (see globals.css) so SSR/
 * first-paint layout is correct before JS runs. Once the header
 * mounts, `syncHeaderHeightVar` keeps the CSS var in sync with the
 * header's *actual* rendered box (via ResizeObserver), so every
 * consumer — hero top-padding, PinnedScene, HorizontalScroller's
 * header-safe stage — reads one real, always-current value instead of
 * a hardcoded magic number duplicated per component.
 *
 * Import `ScrollTrigger` and call `.refresh()` after the var changes
 * if a consumer's layout depends on it and isn't already covered by
 * ScrollTrigger's own resize handling.
 */
export const HEADER_HEIGHT_VAR = "--header-h";

export function syncHeaderHeightVar(el: HTMLElement): () => void {
  if (typeof window === "undefined" || typeof ResizeObserver === "undefined") {
    return () => {};
  }

  const root = document.documentElement;

  const apply = () => {
    const height = Math.round(el.getBoundingClientRect().height);
    if (height > 0) {
      root.style.setProperty(HEADER_HEIGHT_VAR, `${height}px`);
    }
  };

  apply();

  const observer = new ResizeObserver(apply);
  observer.observe(el);

  return () => observer.disconnect();
}
