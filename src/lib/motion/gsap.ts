"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

/**
 * Central GSAP registration point.
 *
 * Every module that needs GSAP/ScrollTrigger must import `gsap` and
 * `ScrollTrigger` from this file — never import "gsap" directly
 * elsewhere. That keeps plugin registration in exactly one place and
 * prevents the "duplicate plugin registration" warnings/bugs that show
 * up when several components each call gsap.registerPlugin().
 *
 * Registration is guarded so this module is safe to import from both
 * client components and, transitively, during SSR (where it simply
 * does nothing since `window` is unavailable).
 */
let registered = false;

export function ensureGsapRegistered() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(ScrollTrigger);
  registered = true;
}

ensureGsapRegistered();

export { gsap, ScrollTrigger };
