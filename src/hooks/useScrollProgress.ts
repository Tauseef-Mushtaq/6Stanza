"use client";

import { useEffect, useRef, type DependencyList, type RefObject } from "react";
import {
  createScrollProgressTrigger,
  type ScrollProgressOptions,
} from "@/lib/motion/scrollProgress";
import { prefersReducedMotion } from "./useReducedMotion";

/**
 * Subscribes an element to scroll progress (0 → 1) without triggering React
 * re-renders on every scroll tick. Returns a mutable ref that always holds
 * the latest progress value, plus accepts an `onUpdate` callback for
 * imperative work (driving a GSAP timeline's `.progress()`, a Three.js
 * camera, a CSS variable, etc.).
 *
 * Under `prefers-reduced-motion`, the trigger is created with scrub
 * disabled — progress still fires on enter/leave so content can settle
 * into its resolved state, but nothing scrubs continuously with scroll.
 */
export function useScrollProgress<T extends HTMLElement>(
  ref: RefObject<T | null>,
  options: ScrollProgressOptions = {},
  deps: DependencyList = []
): RefObject<number> {
  const progressRef = useRef(0);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = prefersReducedMotion();

    const trigger = createScrollProgressTrigger(node, {
      ...options,
      scrub: reduced ? false : options.scrub,
      pin: reduced ? false : options.pin,
      onUpdate: (progress, self) => {
        progressRef.current = progress;
        options.onUpdate?.(progress, self);
      },
    });

    return () => trigger.kill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return progressRef;
}
