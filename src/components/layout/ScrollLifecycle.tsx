"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "@/lib/motion/gsap";
import { getLenisInstance } from "@/lib/motion/lenis";

/**
 * Owns the lifecycle gaps that caused real, user-visible bugs:
 *
 * 1. First-load: scenes sometimes never initialize until a manual
 *    refresh. Root cause — ScrollTrigger measures layout (trigger
 *    positions, horizontal scrollWidth, pinned distances) at the
 *    moment each component mounts via `useGsapContext`. If webfonts
 *    or images are still loading at that point, those measurements
 *    are taken against a shorter/narrower document than the one the
 *    user actually sees, so trigger start/end points land in the
 *    wrong place — the scene looks inert until *something* else
 *    (a manual resize) forces a recalculation.
 * 2. Route change: Next's App Router swaps `children` without a full
 *    reload, so the previous page's final layout can leave stale
 *    ScrollTrigger measurements around for a beat after the new
 *    page's own triggers register (each page's components create/kill
 *    their own via `useGsapContext` — this only handles the shared,
 *    cross-page recalculation, not per-component cleanup).
 * 3. Route change / Lenis desync: Next's App Router changes the native
 *    scroll position on navigation, but Lenis keeps its own internal
 *    target/animated scroll state and measures document height itself
 *    — neither is automatically told about a route change. Left alone,
 *    this can leave Lenis's virtual scroll position out of sync with
 *    the new page's actual height/position (a stuck or snapping feel
 *    right after navigating). This component calls `lenis.resize()` on
 *    every route change to force Lenis to re-measure the new page's
 *    dimensions — the part of this that's unambiguously correct
 *    regardless of navigation type. It intentionally does *not* also
 *    force `lenis.scrollTo(0)`: whether the correct behavior is
 *    "always jump to top" (push navigation) or "restore prior
 *    position" (back/forward) depends on distinguishing those two
 *    cases, which `usePathname` alone can't do — see Known
 *    Limitations in the handoff.
 *
 * The refresh fix in cases 1 and 2 is the same primitive —
 * `ScrollTrigger.refresh()` — run at the right moments, not a
 * `setTimeout`/synthetic-scroll-event hack. This component owns that
 * scheduling exactly once, app-wide.
 */
export function ScrollLifecycle() {
  const pathname = usePathname();
  const isFirstRender = useRef(true);

  // First load: wait for fonts (layout-affecting) and the window
  // `load` event (images/other assets), then refresh once the paint
  // from that settling has actually happened.
  useEffect(() => {
    let cancelled = false;

    const refresh = () => {
      if (cancelled) return;
      requestAnimationFrame(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(refresh);
    } else {
      refresh();
    }

    if (document.readyState === "complete") {
      refresh();
    } else {
      window.addEventListener("load", refresh, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener("load", refresh);
    };
  }, []);

  // Route change: give the new route's components a chance to mount
  // and register their own ScrollTriggers (useGsapContext runs in a
  // useEffect, same as this one) before recalculating shared layout.
  // Also await `document.fonts.ready` here, same as the first-load
  // path above — a route can introduce a heading/weight combination
  // that wasn't already loaded on the previous page, and refreshing
  // before that settles reproduces the exact "measured a shorter
  // document" bug the first-load fix exists for, just on navigation
  // instead of cold load.
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    getLenisInstance()?.resize();

    let cancelled = false;
    const refresh = () => {
      if (cancelled) return;
      requestAnimationFrame(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(refresh);
    } else {
      refresh();
    }

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return null;
}
