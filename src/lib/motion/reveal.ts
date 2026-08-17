"use client";

import { gsap } from "./gsap";
import { DURATION, EASE } from "./tokens";

export type RevealDirection = "up" | "down" | "left" | "right" | "none";

export interface RevealOptions {
  /** Element(s) to animate — selector text scoped to a gsap.context, a node, or a list. */
  targets: gsap.TweenTarget;
  /** Element that drives the ScrollTrigger. Defaults to `targets`. */
  trigger?: Element | string;
  direction?: RevealDirection;
  /** Travel distance in px. Defaults to a sensible value per direction. */
  distance?: number;
  duration?: number;
  ease?: string;
  stagger?: number;
  delay?: number;
  /** ScrollTrigger start position. Default "top 85%". */
  start?: string;
  /** Play once and hold, vs. reverse when scrolling back past start. */
  once?: boolean;
  /** Use a clip-path mask reveal instead of (or with) a translate. */
  clip?: boolean;
  scrub?: boolean | number;
}

const AXIS_DISTANCE: Record<RevealDirection, number> = {
  up: 56,
  down: 56,
  left: 56,
  right: 56,
  none: 0,
};

const CLIP_FROM: Record<RevealDirection, string> = {
  up: "inset(100% 0% 0% 0%)",
  down: "inset(0% 0% 100% 0%)",
  left: "inset(0% 100% 0% 0%)",
  right: "inset(0% 0% 0% 100%)",
  none: "inset(0% 0% 0% 0%)",
};

/**
 * Directional / masked reveal — the single primitive behind every heading,
 * paragraph, card, and image "enters the viewport" moment in the app.
 * Deliberately not identical for every use: vary `direction`, `clip`, and
 * `stagger` per call so the site doesn't read as one repeated fade-up.
 *
 * Must be called from inside a `useGsapContext` scope so ScrollTrigger
 * cleanup is automatic.
 */
export function createReveal(options: RevealOptions) {
  const {
    targets,
    trigger,
    direction = "up",
    distance,
    duration = DURATION.slow,
    ease = EASE.smooth,
    stagger = 0.08,
    delay = 0,
    start = "top 85%",
    once = true,
    clip = false,
    scrub = false,
  } = options;

  const dist = distance ?? AXIS_DISTANCE[direction];
  const move: gsap.TweenVars = {};
  if (direction === "up") move.y = dist;
  if (direction === "down") move.y = -dist;
  if (direction === "left") move.x = dist;
  if (direction === "right") move.x = -dist;

  const fromVars: gsap.TweenVars = {
    autoAlpha: 0,
    ...move,
    ...(clip ? { clipPath: CLIP_FROM[direction] } : {}),
  };

  const toVars: gsap.TweenVars = {
    autoAlpha: 1,
    x: 0,
    y: 0,
    ...(clip ? { clipPath: "inset(0% 0% 0% 0%)" } : {}),
    duration,
    ease,
    stagger,
    delay,
    scrollTrigger: {
      trigger: trigger ?? (targets as Element | string),
      start,
      scrub,
      toggleActions: scrub ? undefined : once ? "play none none none" : "play reverse play reverse",
    },
  };

  return gsap.fromTo(targets, fromVars, toVars);
}
