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
 *
 * Under `prefers-reduced-motion`, no parallax drift is applied — purely
 * decorative scroll-linked movement is exactly what the preference asks
 * to skip, and unlike `Reveal`/`ScaleReveal` there's no "resolved end
 * state" to jump to (the drift has no fixed target), so this simply
 * leaves the layer static (previously it always drifted regardless of
 * the preference — spec §22).
 */
export function Parallax({ children, as = "div", className, speed = 0.4, axis = "y", triggerSelector }: ParallaxProps) {
  const scopeRef = useGsapContext<HTMLDivElement>(({ scope, isReducedMotion }) => {
    if (isReducedMotion) return;
    const trigger = triggerSelector ? (scope.closest(triggerSelector) ?? scope) : scope.parentElement ?? scope;
    createParallax({ targets: scope, trigger, speed, axis });
  }, [speed, axis, triggerSelector]);

  return createElement(
    as,
    { ref: scopeRef, className: cn("will-change-transform", className) },
    children
  );
}
