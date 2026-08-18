"use client";

import { createElement, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { useGsapContext } from "@/hooks/useGsapContext";
import { gsap } from "@/lib/motion/gsap";
import { createReveal, type RevealDirection } from "@/lib/motion/reveal";
import { cn } from "@/lib/utils/cn";

interface RevealProps extends Omit<HTMLAttributes<HTMLElement>, "style"> {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  direction?: RevealDirection;
  distance?: number;
  duration?: number;
  stagger?: number;
  delay?: number;
  start?: string;
  once?: boolean;
  clip?: boolean;
  /** Reveal direct children individually (stagger) instead of the wrapper as one block. */
  staggerChildren?: boolean;
}

/**
 * Drop-in reveal wrapper — the primitive most content on the site will
 * use to enter the viewport. Wraps `createReveal` in a scoped
 * `useGsapContext` so cleanup is automatic.
 *
 * Under `prefers-reduced-motion`, skips the scroll-triggered animation
 * entirely and applies the resolved visible state (`gsap.set`, no
 * transform/opacity ramp) instead — matching the bail-out pattern
 * already used by `SplitHeading`/`ImageEntrance` elsewhere in this
 * folder. Previously `Reveal` was the one outlier that always animated
 * regardless of the preference (spec §11/§22).
 */
export function Reveal({
  children,
  as = "div",
  className,
  direction = "up",
  distance,
  duration,
  stagger = 0.08,
  delay = 0,
  start = "top 85%",
  once = true,
  clip = false,
  staggerChildren = false,
  style,
  ...rest
}: RevealProps) {
  const scopeRef = useGsapContext<HTMLDivElement>(({ scope, isReducedMotion }) => {
    const targets = staggerChildren ? Array.from(scope.children) : scope;

    if (isReducedMotion) {
      gsap.set(targets, { autoAlpha: 1, x: 0, y: 0, clipPath: clip ? "inset(0% 0% 0% 0%)" : undefined });
      return;
    }

    createReveal({
      targets,
      trigger: scope,
      direction,
      distance,
      duration,
      stagger,
      delay,
      start,
      once,
      clip,
    });
  }, [direction, distance, duration, stagger, delay, start, once, clip, staggerChildren]);

  return createElement(
    as,
    { ref: scopeRef, className: cn("will-change-transform", className), style, ...rest },
    children
  );
}
