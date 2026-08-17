"use client";

import { useEffect, useRef, type DependencyList, type RefObject } from "react";
import { gsap } from "@/lib/motion/gsap";

type ScopedSetup<T extends HTMLElement> = (ctx: {
  scope: T;
  isReducedMotion: boolean;
}) => void | (() => void);

/**
 * The single reusable animation-lifecycle pattern for Module 2.
 *
 * Wraps `gsap.context()` scoped to a DOM ref: every selector inside the
 * `setup` callback is automatically scoped to `scope`, and every tween /
 * ScrollTrigger created inside it is automatically reverted and killed on
 * unmount or dependency change. No component should call `gsap.to(...)`
 * or `ScrollTrigger.create(...)` outside of this (or the primitives built
 * on it) — that's how leaked ScrollTriggers happen.
 *
 * `setup` may return its own cleanup function for anything gsap.context()
 * doesn't cover (event listeners, RAF loops, etc.).
 */
export function useGsapContext<T extends HTMLElement = HTMLDivElement>(
  setup: ScopedSetup<T>,
  deps: DependencyList = []
): RefObject<T | null> {
  const scopeRef = useRef<T | null>(null);

  useEffect(() => {
    const node = scopeRef.current;
    if (!node) return;

    let extraCleanup: void | (() => void);
    const isReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      extraCleanup = setup({ scope: node, isReducedMotion });
    }, node);

    return () => {
      extraCleanup?.();
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return scopeRef;
}
