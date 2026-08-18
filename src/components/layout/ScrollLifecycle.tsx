"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { ScrollTrigger } from "@/lib/motion/gsap";

/**
 * Owns the two lifecycle gaps that caused real, user-visible bugs:
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
 *
 * The fix in both cases is the same primitive — `ScrollTrigger.refresh()`
 * — run at the right moments, not a `setTimeout`/synthetic-scroll-event
 * hack. This component owns that scheduling exactly once, app-wide.
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
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => ScrollTrigger.refresh()));
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  return null;
}
