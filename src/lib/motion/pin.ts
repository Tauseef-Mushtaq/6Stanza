"use client";

import { gsap, ScrollTrigger } from "./gsap";
import { isMobileViewport, MOBILE_INTENSITY } from "./mobile";

export interface PinnedSceneOptions {
  /** The element that gets pinned (usually the scene container). */
  pinTarget: Element | string;
  /** Distance the scene stays pinned for, in viewport-height multiples (e.g. 2 = "+=200%"). Ignored if `end` is given. */
  durationVh?: number;
  end?: string;
  start?: string;
  pinSpacing?: boolean | string;
  anticipatePin?: number;
  markers?: boolean;
  /** Called with 0 → 1 progress through the pinned duration — drive the internal scene from this. */
  onProgress?: (progress: number, self: ScrollTrigger) => void;
  onEnter?: (self: ScrollTrigger) => void;
  onLeave?: (self: ScrollTrigger) => void;
  onEnterBack?: (self: ScrollTrigger) => void;
  onLeaveBack?: (self: ScrollTrigger) => void;
}

/**
 * Reusable pinned-scene ScrollTrigger: the section pins in place while an
 * internal scene progresses from scroll, then releases. This is the
 * infrastructure behind "user scrolls → section pins → internal scene
 * progresses → visual changes → section releases → next section" from
 * spec §8 — callers supply the visual response via `onProgress`.
 *
 * Mobile motion profile (spec §21 — "reduce excessive pinning"):
 * `durationVh` is shortened by `MOBILE_INTENSITY` under the shared
 * mobile breakpoint, when the caller hasn't supplied an explicit `end`.
 * Still fully driven by real scroll distance, just a shorter one — the
 * pin itself, and everything `onProgress` drives, is untouched.
 */
export function createPinnedScene(options: PinnedSceneOptions): ScrollTrigger {
  const {
    pinTarget,
    durationVh = 1.5,
    end,
    start = "top top",
    pinSpacing = true,
    anticipatePin = 1,
    markers = false,
    onProgress,
    onEnter,
    onLeave,
    onEnterBack,
    onLeaveBack,
  } = options;

  return ScrollTrigger.create({
    trigger: pinTarget,
    start,
    end: end ?? (() => `+=${(isMobileViewport() ? durationVh * MOBILE_INTENSITY : durationVh) * 100}%`),
    pin: true,
    pinSpacing,
    anticipatePin,
    scrub: true,
    markers,
    invalidateOnRefresh: true,
    onUpdate: (self) => onProgress?.(self.progress, self),
    onEnter,
    onLeave,
    onEnterBack,
    onLeaveBack,
  });
}

/**
 * Convenience: pin a scene and drive a GSAP timeline's playhead directly
 * from scroll progress, for choreographed multi-step pinned sequences
 * (e.g. typography moves → object scales → background changes, all
 * within one pin).
 */
export function createPinnedTimeline(
  options: Omit<PinnedSceneOptions, "onProgress">
): { trigger: ScrollTrigger; timeline: gsap.core.Timeline } {
  const timeline = gsap.timeline({ paused: true });
  const trigger = createPinnedScene({
    ...options,
    onProgress: (progress) => timeline.progress(progress),
  });
  return { trigger, timeline };
}
