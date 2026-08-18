"use client";

import { type ReactNode } from "react";
import { useGsapContext } from "@/hooks/useGsapContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { createPinnedScene } from "@/lib/motion/pin";
import { cn } from "@/lib/utils/cn";

interface PinnedSceneProps {
  children: ReactNode;
  className?: string;
  /** How many viewport-heights the pin lasts. */
  durationVh?: number;
  /** Called with 0 → 1 progress through the pin — drive child visuals imperatively from this (e.g. via a ref/CSS var) rather than React state. */
  onProgress?: (progress: number) => void;
  markers?: boolean;
}

/**
 * "User scrolls → section pins → internal scene progresses → visual
 * changes → section releases → next section" (spec §8). This component
 * only owns the pin lifecycle; visual choreography lives in `children`
 * and reads progress via `onProgress`.
 *
 * Under `prefers-reduced-motion`, no pin is created and `onProgress`
 * never fires — so the fixed `min-h-svh`/`overflow-hidden` staging this
 * component normally provides (sized for a scroll-driven scene) would
 * clip any child content that relies on scroll progress to become
 * visible. This drops that clipping in reduced motion and lets children
 * take their natural height instead — callers whose children are
 * themselves progress-gated (e.g. `ServiceRail`, `SixSJourney`) still
 * need their own static reduced-motion fallback (spec §22); this is the
 * shared, minimal part of that fix.
 */
export function PinnedScene({ children, className, durationVh = 1.5, onProgress, markers = false }: PinnedSceneProps) {
  const reducedMotion = useReducedMotion();
  const scopeRef = useGsapContext<HTMLDivElement>(({ scope, isReducedMotion }) => {
    if (isReducedMotion) return;
    const trigger = createPinnedScene({
      pinTarget: scope,
      durationVh,
      markers,
      onProgress: (progress) => onProgress?.(progress),
    });
    return () => trigger.kill();
  }, [durationVh, markers]);

  return (
    <div
      ref={scopeRef}
      className={cn(
        "relative w-full",
        reducedMotion ? "min-h-0 overflow-visible" : "min-h-svh overflow-hidden",
        className
      )}
      style={{ paddingTop: "var(--header-h)" }}
    >
      {children}
    </div>
  );
}
