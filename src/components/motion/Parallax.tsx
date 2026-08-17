"use client";

import { createElement, type ElementType, type ReactNode } from "react";
import { useGsapContext } from "@/hooks/useGsapContext";
import { createParallax } from "@/lib/motion/parallax";
import { cn } from "@/lib/utils/cn";

interface ParallaxProps {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** <1 drifts slower than scroll (background), >1 drifts faster (foreground), 1 = static. */
  speed?: number;
  axis?: "x" | "y";
  /** Optional separate trigger — defaults to this element's own container. */
  triggerSelector?: string;
}

/**
 * A single parallax depth layer. Composing several `<Parallax speed={..}>`
 * elements at different speeds inside the same scene is what produces
 * depth — a single layer moving is just "motion", not parallax.
 */
export function Parallax({ children, as = "div", className, speed = 0.4, axis = "y", triggerSelector }: ParallaxProps) {
  const scopeRef = useGsapContext<HTMLDivElement>(({ scope }) => {
    const trigger = triggerSelector ? (scope.closest(triggerSelector) ?? scope) : scope.parentElement ?? scope;
    createParallax({ targets: scope, trigger, speed, axis });
  }, [speed, axis, triggerSelector]);

  return createElement(
    as,
    { ref: scopeRef, className: cn("will-change-transform", className) },
    children
  );
}
