"use client";

import { createElement, type CSSProperties, type ElementType, type HTMLAttributes } from "react";
import { useGsapContext } from "@/hooks/useGsapContext";
import { createTypographyReveal, type SplitUnit } from "@/lib/motion/typography";
import { cn } from "@/lib/utils/cn";

interface SplitHeadingProps extends Omit<HTMLAttributes<HTMLElement>, "style" | "children"> {
  children: string;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  unit?: SplitUnit;
  stagger?: number;
  start?: string;
  once?: boolean;
  blur?: boolean;
}

/**
 * Large-headline choreography: splits `children` into lines/words/chars
 * and reveals them with a stagger. `children` must be plain text (the
 * split operates on `textContent`). Restores the original text on
 * unmount so the DOM stays clean if the component is removed.
 */
export function SplitHeading({
  children,
  as = "h2",
  className,
  style,
  unit = "words",
  stagger,
  start,
  once,
  blur,
  ...rest
}: SplitHeadingProps) {
  const scopeRef = useGsapContext<HTMLElement>(({ scope, isReducedMotion }) => {
    const original = scope.innerHTML;

    if (isReducedMotion) {
      return () => {
        scope.innerHTML = original;
      };
    }

    createTypographyReveal(scope, { unit, stagger, start, once, blur });

    return () => {
      scope.innerHTML = original;
    };
  }, [children, unit, stagger, start, once, blur]);

  return createElement(
    as,
    { ref: scopeRef, className: cn("will-change-transform", className), style, ...rest },
    children
  );
}
