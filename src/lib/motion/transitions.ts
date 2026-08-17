"use client";

import { gsap } from "./gsap";
import { DURATION, EASE } from "./tokens";

export type TransitionStyle = "wipe" | "clip-scale" | "cross-dissolve" | "slide-blur" | "depth-push";

export interface SceneTransitionOptions {
  /** Element leaving. */
  outgoing?: gsap.TweenTarget;
  /** Element entering. */
  incoming: gsap.TweenTarget;
  style?: TransitionStyle;
  duration?: number;
  ease?: string;
  onComplete?: () => void;
}

/**
 * Builds a paused timeline for a scene-to-scene transition, combining
 * more than opacity: scale, clip-path, translate, and blur depending on
 * `style`. Callers drive it (`.play()`, or scrub via a pinned scene's
 * progress) — this only assembles the choreography.
 *
 * Kept intentionally restrained: each style is a considered combination,
 * not a kitchen sink of every property at once (spec §10 — "use
 * restraint").
 */
export function createSceneTransition(options: SceneTransitionOptions): gsap.core.Timeline {
  const {
    outgoing,
    incoming,
    style = "cross-dissolve",
    duration = DURATION.cinematic,
    ease = EASE.cinematic,
    onComplete,
  } = options;

  const tl = gsap.timeline({ paused: true, onComplete, defaults: { ease } });

  switch (style) {
    case "wipe": {
      gsap.set(incoming, { clipPath: "inset(0 0 100% 0)" });
      if (outgoing) tl.to(outgoing, { clipPath: "inset(100% 0 0 0)", duration: duration * 0.6 }, 0);
      tl.to(incoming, { clipPath: "inset(0% 0% 0% 0%)", duration }, outgoing ? duration * 0.25 : 0);
      break;
    }
    case "clip-scale": {
      gsap.set(incoming, { clipPath: "inset(15% 15% 15% 15%)", scale: 1.06, autoAlpha: 0 });
      if (outgoing) tl.to(outgoing, { scale: 0.94, autoAlpha: 0, duration: duration * 0.5 }, 0);
      tl.to(
        incoming,
        { clipPath: "inset(0% 0% 0% 0%)", scale: 1, autoAlpha: 1, duration },
        outgoing ? duration * 0.2 : 0
      );
      break;
    }
    case "slide-blur": {
      gsap.set(incoming, { xPercent: 6, autoAlpha: 0, filter: "blur(18px)" });
      if (outgoing) tl.to(outgoing, { xPercent: -6, autoAlpha: 0, filter: "blur(18px)", duration: duration * 0.6 }, 0);
      tl.to(
        incoming,
        { xPercent: 0, autoAlpha: 1, filter: "blur(0px)", duration },
        outgoing ? duration * 0.3 : 0
      );
      break;
    }
    case "depth-push": {
      gsap.set(incoming, { z: -400, autoAlpha: 0, transformPerspective: 1200 });
      if (outgoing) tl.to(outgoing, { z: 200, autoAlpha: 0, duration: duration * 0.6 }, 0);
      tl.to(incoming, { z: 0, autoAlpha: 1, duration }, outgoing ? duration * 0.25 : 0);
      break;
    }
    case "cross-dissolve":
    default: {
      if (outgoing) tl.to(outgoing, { autoAlpha: 0, duration: duration * 0.5 }, 0);
      tl.to(incoming, { autoAlpha: 1, duration }, outgoing ? duration * 0.3 : 0);
      break;
    }
  }

  return tl;
}
