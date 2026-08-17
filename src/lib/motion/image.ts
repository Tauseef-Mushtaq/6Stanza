"use client";

import { gsap } from "./gsap";
import { DURATION, EASE } from "./tokens";

export interface ImageEntranceOptions {
  targets: gsap.TweenTarget;
  trigger?: Element | string;
  scaleFrom?: number;
  rotateFrom?: number;
  duration?: number;
  ease?: string;
  start?: string;
}

/**
 * "Image enters → slight scale → subtle rotation → settles" pattern from
 * spec §12. A single considered entrance, not a generic fade.
 */
export function createImageEntrance(options: ImageEntranceOptions) {
  const {
    targets,
    trigger,
    scaleFrom = 1.12,
    rotateFrom = 1.5,
    duration = DURATION.cinematic,
    ease = EASE.cinematic,
    start = "top 80%",
  } = options;

  return gsap.fromTo(
    targets,
    { scale: scaleFrom, rotate: rotateFrom, autoAlpha: 0, transformOrigin: "center center" },
    {
      scale: 1,
      rotate: 0,
      autoAlpha: 1,
      duration,
      ease,
      scrollTrigger: {
        trigger: trigger ?? (targets as Element | string),
        start,
        toggleActions: "play none none reverse",
      },
    }
  );
}

export interface PinnedCropOptions {
  /** The pinned container clipping the image. */
  container: Element | string;
  /** The image element — scaled/cropped as scroll progresses. */
  image: gsap.TweenTarget;
  scaleFrom?: number;
  scaleTo?: number;
  objectPositionFrom?: string;
  objectPositionTo?: string;
  durationVh?: number;
}

/**
 * "Image remains pinned → scroll drives crop/scale → next scene takes
 * over" pattern from spec §12. Pins the container and scrubs the image's
 * scale and object-position across the pin duration.
 */
export function createPinnedImageCrop(options: PinnedCropOptions) {
  const {
    container,
    image,
    scaleFrom = 1,
    scaleTo = 1.35,
    objectPositionFrom,
    objectPositionTo,
    durationVh = 1.25,
  } = options;

  gsap.set(image, {
    scale: scaleFrom,
    ...(objectPositionFrom ? { objectPosition: objectPositionFrom } : {}),
  });

  return gsap.to(image, {
    scale: scaleTo,
    ...(objectPositionTo ? { objectPosition: objectPositionTo } : {}),
    ease: "none",
    scrollTrigger: {
      trigger: container,
      start: "top top",
      end: `+=${durationVh * 100}%`,
      pin: true,
      scrub: true,
    },
  });
}
