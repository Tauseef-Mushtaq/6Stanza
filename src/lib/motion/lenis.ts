"use client";

import Lenis from "lenis";

/**
 * Module-level reference to the single global Lenis instance.
 *
 * The instance is created by <SmoothScrollProvider> (see
 * src/components/layout/SmoothScrollProvider.tsx), which owns its
 * lifecycle (creation, RAF loop, ScrollTrigger sync, destruction).
 * This file only exposes a getter so that other parts of the app
 * (e.g. a future "scroll to section" nav link, or a ScrollTrigger
 * config) can reach the same instance without prop-drilling.
 *
 * Do not call `new Lenis()` anywhere else in the codebase — one
 * global instance is the contract later cinematic modules rely on:
 *
 *   Lenis -> scroll position -> ScrollTrigger -> GSAP timelines
 */
let lenisInstance: Lenis | null = null;

export function setLenisInstance(instance: Lenis | null) {
  lenisInstance = instance;
}

export function getLenisInstance(): Lenis | null {
  return lenisInstance;
}

export const LENIS_DEFAULTS = {
  duration: 1.2,
  smoothWheel: true,
  syncTouch: false,
} as const;
