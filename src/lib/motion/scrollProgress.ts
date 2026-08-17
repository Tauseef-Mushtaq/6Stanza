"use client";

import { ScrollTrigger } from "./gsap";

export interface ScrollProgressOptions {
  /** ScrollTrigger start position. Default "top bottom". */
  start?: string;
  /** ScrollTrigger end position. Default "bottom top". */
  end?: string;
  /** Scrub value — `true` ties progress directly to scroll, a number adds lag (seconds). */
  scrub?: boolean | number;
  /** Pin the trigger element while progress runs 0 → 1. */
  pin?: boolean | HTMLElement | string;
  pinSpacing?: boolean | string;
  markers?: boolean;
  invalidateOnRefresh?: boolean;
  onUpdate?: (progress: number, self: ScrollTrigger) => void;
  onEnter?: (self: ScrollTrigger) => void;
  onLeave?: (self: ScrollTrigger) => void;
  onEnterBack?: (self: ScrollTrigger) => void;
  onLeaveBack?: (self: ScrollTrigger) => void;
}

/**
 * Creates the single ScrollTrigger primitive every "scene progress" concept
 * in Module 2 is built from: a 0 → 1 value driven by scroll position over a
 * trigger element, delivered via callback rather than React state so
 * consumers (GSAP timelines, R3F frame loops, imperative transforms) never
 * pay for a React re-render per scroll tick.
 *
 * Caller owns disposal — always `.kill()` the returned instance, ideally
 * from inside a `useGsapContext` scope so it happens automatically.
 */
export function createScrollProgressTrigger(
  trigger: Element,
  options: ScrollProgressOptions = {}
): ScrollTrigger {
  const {
    start = "top bottom",
    end = "bottom top",
    scrub = true,
    pin = false,
    pinSpacing,
    markers = false,
    invalidateOnRefresh = true,
    onUpdate,
    onEnter,
    onLeave,
    onEnterBack,
    onLeaveBack,
  } = options;

  return ScrollTrigger.create({
    trigger,
    start,
    end,
    scrub,
    pin,
    pinSpacing,
    markers,
    invalidateOnRefresh,
    onUpdate: (self) => onUpdate?.(self.progress, self),
    onEnter: onEnter ? (self) => onEnter(self) : undefined,
    onLeave: onLeave ? (self) => onLeave(self) : undefined,
    onEnterBack: onEnterBack ? (self) => onEnterBack(self) : undefined,
    onLeaveBack: onLeaveBack ? (self) => onLeaveBack(self) : undefined,
  });
}
