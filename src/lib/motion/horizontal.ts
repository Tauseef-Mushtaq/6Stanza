"use client";

import { gsap, ScrollTrigger } from "./gsap";
import { EASE } from "./tokens";

export interface HorizontalScrollOptions {
  /** The pinned viewport/container element. */
  container: Element | string;
  /** The track that actually translates horizontally (usually container's direct child). */
  track: gsap.TweenTarget;
  start?: string;
  pinSpacing?: boolean | string;
  markers?: boolean;
  onProgress?: (progress: number, self: ScrollTrigger) => void;
}

/**
 * Vertical-scroll-driven horizontal movement — the infrastructure for
 * service cards / visual chapters that scroll sideways as the user
 * scrolls down. Computes the scroll distance from the track's actual
 * overflow width so it stays correct across breakpoints and content
 * changes (recalculated on ScrollTrigger refresh).
 */
export function createHorizontalScroll(options: HorizontalScrollOptions) {
  const { container, track, start = "top top", pinSpacing = true, markers = false, onProgress } = options;

  const getTrackEl = (): HTMLElement | null => {
    if (typeof track === "string") return document.querySelector(track);
    if (Array.isArray(track)) return (track[0] as HTMLElement) ?? null;
    return (track as HTMLElement) ?? null;
  };

  const tween = gsap.to(track, {
    x: () => {
      const el = getTrackEl();
      const containerEl =
        typeof container === "string" ? document.querySelector(container) : (container as HTMLElement);
      if (!el || !containerEl) return 0;
      return -(el.scrollWidth - containerEl.clientWidth);
    },
    ease: EASE.linear,
    scrollTrigger: {
      trigger: container,
      start,
      end: () => {
        const el = getTrackEl();
        const containerEl =
          typeof container === "string" ? document.querySelector(container) : (container as HTMLElement);
        const distance = el && containerEl ? el.scrollWidth - containerEl.clientWidth : 0;
        return `+=${Math.max(distance, 1)}`;
      },
      scrub: true,
      pin: true,
      pinSpacing,
      markers,
      invalidateOnRefresh: true,
      onUpdate: (self) => onProgress?.(self.progress, self),
    },
  });

  return tween;
}
