"use client";

import { createElement, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { useGsapContext } from "@/hooks/useGsapContext";
import { gsap } from "@/lib/motion/gsap";
import { SCALE } from "@/lib/motion/tokens";
import { createScale } from "@/lib/motion/scale";
import { cn } from "@/lib/utils/cn";

interface ScaleRevealProps extends Omit<HTMLAttributes<HTMLElement>, "style"> {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  from?: number;
  to?: number;
  /** When true, scale is scrubbed continuously with scroll instead of playing once. */
  scrub?: boolean | number;
  start?: string;
  end?: string;
}

/**
 * Cinematic scale-in, or a continuous scroll-scrubbed zoom when `scrub`
 * is set. Under `prefers-reduced-motion`, resolves straight to the
 * target scale instead of animating (previously this component ignored
 * the preference entirely — spec §22).
 */
export function ScaleReveal({
  children,
  as = "div",
  className,
  style,
  from = SCALE.standard,
  to = 1,
  scrub = false,
  start,
  end,
  ...rest
}: ScaleRevealProps) {
  const scopeRef = useGsapContext<HTMLDivElement>(({ scope, isReducedMotion }) => {
    if (isReducedMotion) {
      gsap.set(scope, { scale: to });
      return;
    }
    createScale({ targets: scope, from, to, scrub, start, end });
  }, [from, to, scrub, start, end]);

  return createElement(
    as,
    { ref: scopeRef, className: cn("will-change-transform", className), style, ...rest },
    children
  );
}
