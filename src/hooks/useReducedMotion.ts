"use client";

import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

/**
 * Single source of truth for reduced-motion preference.
 * Later GSAP / Lenis / Three.js modules should read this hook (or the
 * plain `prefersReducedMotion()` helper below for non-component code)
 * rather than querying matchMedia themselves, so behavior stays
 * consistent across the whole motion system.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => prefersReducedMotion());

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const handler = (event: MediaQueryListEvent) => setReduced(event.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  return reduced;
}

/**
 * Non-hook helper for use inside imperative GSAP/Three.js code that
 * runs outside React's render cycle (e.g. inside a ScrollTrigger
 * callback or a Three.js frame loop).
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(QUERY).matches;
}
