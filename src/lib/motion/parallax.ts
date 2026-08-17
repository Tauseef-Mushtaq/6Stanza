"use client";

import { gsap } from "./gsap";

export interface ParallaxOptions {
  targets: gsap.TweenTarget;
  trigger?: Element | string;
  /**
   * Speed relative to scroll. 0 = pinned to viewport, 1 = moves with
   * content (no parallax), <1 = drifts slower (background), >1 = drifts
   * faster (foreground). Negative values move opposite to scroll.
   */
  speed?: number;
  axis?: "x" | "y";
  /** ScrollTrigger start/end window. Defaults cover the trigger entering/leaving viewport. */
  start?: string;
  end?: string;
  scrub?: boolean | number;
}

/**
 * Scroll-linked parallax for background layers, images, decorative
 * elements, typography, and cards. Layer depth comes from calling this
 * multiple times with different `speed` values on different elements —
 * not from a single global multiplier.
 */
export function createParallax(options: ParallaxOptions) {
  const {
    targets,
    trigger,
    speed = 0.3,
    axis = "y",
    start = "top bottom",
    end = "bottom top",
    scrub = true,
  } = options;

  // Displacement is expressed as a percentage of the trigger's travel
  // through the viewport, scaled by (1 - speed), so speed=1 is static
  // relative to normal scroll and speed=0 stays visually anchored.
  const distance = (1 - speed) * 100;

  const vars: gsap.TweenVars = {
    ease: "none",
    scrollTrigger: {
      trigger: trigger ?? (targets as Element | string),
      start,
      end,
      scrub,
    },
  };
  vars[axis] = `${distance}%`;

  return gsap.fromTo(targets, { [axis]: `${-distance}%` }, vars);
}

/**
 * Convenience for background-image / large-media layers: subtle scale-up
 * paired with parallax drift so images never show hard edges while moving.
 */
export function createImageParallax(options: ParallaxOptions & { scaleFrom?: number }) {
  const { scaleFrom = 1.15, ...rest } = options;
  gsap.set(rest.targets, { scale: scaleFrom, transformOrigin: "center center" });
  return createParallax(rest);
}
