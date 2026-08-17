"use client";

import { type ReactNode } from "react";
import { useGsapContext } from "@/hooks/useGsapContext";
import { createHorizontalScroll } from "@/lib/motion/horizontal";
import { cn } from "@/lib/utils/cn";

interface HorizontalScrollerProps {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  onProgress?: (progress: number) => void;
  markers?: boolean;
}

/**
 * Vertical scroll drives horizontal movement of `children` — the
 * infrastructure for service cards / visual chapters (spec §8). The
 * wrapper pins; the inner track (rendered as a flex row) translates.
 * Falls back to native horizontal overflow-x scroll under reduced motion
 * so the content is never locked to a scroll gesture that doesn't run.
 */
export function HorizontalScroller({ children, className, trackClassName, onProgress, markers = false }: HorizontalScrollerProps) {
  const scopeRef = useGsapContext<HTMLDivElement>(({ scope, isReducedMotion }) => {
    if (isReducedMotion) return;
    const track = scope.querySelector<HTMLElement>("[data-horizontal-track]");
    if (!track) return;
    const tween = createHorizontalScroll({
      container: scope,
      track,
      markers,
      onProgress: (progress) => onProgress?.(progress),
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [markers]);

  return (
    <div
      ref={scopeRef}
      className={cn("relative w-full overflow-x-auto md:overflow-hidden", className)}
    >
      <div data-horizontal-track className={cn("flex w-max flex-nowrap gap-8", trackClassName)}>
        {children}
      </div>
    </div>
  );
}
