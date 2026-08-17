"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { createScrollProgressTrigger } from "@/lib/motion/scrollProgress";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";

export interface ScrollScene3DOptions {
  start?: string;
  end?: string;
  /** Root margin for the viewport-mount IntersectionObserver — mount slightly before entering view. */
  rootMargin?: string;
}

export interface ScrollScene3DResult<T extends HTMLElement> {
  containerRef: RefObject<T | null>;
  /** Latest 0 → 1 scroll progress through the scene, read imperatively inside useFrame. Never triggers re-renders. */
  progressRef: RefObject<number>;
  /** True once the container has entered (or nearly entered) the viewport — gate mounting the Canvas on this. */
  shouldMount: boolean;
  reducedMotion: boolean;
}

/**
 * The DOM half of the 3D + scroll architecture (spec §13/§14): tracks
 * whether the scene's container is near the viewport (so the 3D canvas
 * only mounts when needed) and exposes scroll progress as a ref for the
 * R3F scene to read every frame via `useFrame`, never via React state.
 */
export function useScrollScene3D<T extends HTMLElement = HTMLDivElement>(
  options: ScrollScene3DOptions = {}
): ScrollScene3DResult<T> {
  const { start = "top bottom", end = "bottom top", rootMargin = "200px 0px" } = options;
  const containerRef = useRef<T | null>(null);
  const progressRef = useRef(0);
  const [shouldMount, setShouldMount] = useState(false);
  const reducedMotion = prefersReducedMotion();

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldMount(true);
        }
      },
      { rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node || reducedMotion) return;

    const trigger = createScrollProgressTrigger(node, {
      start,
      end,
      onUpdate: (progress) => {
        progressRef.current = progress;
      },
    });
    return () => trigger.kill();
  }, [start, end, reducedMotion]);

  return { containerRef, progressRef, shouldMount, reducedMotion };
}
