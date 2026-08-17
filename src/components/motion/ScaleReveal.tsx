"use client";

import { createElement, type CSSProperties, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { useGsapContext } from "@/hooks/useGsapContext";
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

/** Cinematic scale-in, or a continuous scroll-scrubbed zoom when `scrub` is set. */
export function ScaleReveal({
  children,
  as = "div",
  className,
  style,
  from = 0.92,
  to = 1,
  scrub = false,
  start,
  end,
  ...rest
}: ScaleRevealProps) {
  const scopeRef = useGsapContext<HTMLDivElement>(({ scope }) => {
    createScale({ targets: scope, from, to, scrub, start, end });
  }, [from, to, scrub, start, end]);

  return createElement(
    as,
    { ref: scopeRef, className: cn("will-change-transform", className), style, ...rest },
    children
  );
}
