"use client";

import { gsap } from "./gsap";
import { DURATION, EASE } from "./tokens";

export interface ScaleOptions {
  targets: gsap.TweenTarget;
  trigger?: Element | string;
  from?: number;
  to?: number;
  duration?: number;
  ease?: string;
  start?: string;
  end?: string;
  /** Scrub ties scale directly to scroll (cinematic zoom); false plays once on enter. */
  scrub?: boolean | number;
  transformOrigin?: string;
}

/**
 * Controlled scale-in / scale-out / scroll-scrubbed zoom for imagery,
 * 3D-adjacent hero objects, and emphasis moments. One primitive covers
 * both a discrete "scale in on enter" reveal and a continuous
 * scroll-scrubbed zoom depending on whether `scrub` is set.
 */
export function createScale(options: ScaleOptions) {
  const {
    targets,
    trigger,
    from = 0.92,
    to = 1,
    duration = DURATION.slow,
    ease = EASE.cinematic,
    start = "top 80%",
    end = "bottom top",
    scrub = false,
    transformOrigin = "center center",
  } = options;

  return gsap.fromTo(
    targets,
    { scale: from, transformOrigin },
    {
      scale: to,
      duration: scrub ? undefined : duration,
      ease: scrub ? "none" : ease,
      scrollTrigger: {
        trigger: trigger ?? (targets as Element | string),
        start,
        end: scrub ? end : undefined,
        scrub,
        toggleActions: scrub ? undefined : "play none none reverse",
      },
    }
  );
}
