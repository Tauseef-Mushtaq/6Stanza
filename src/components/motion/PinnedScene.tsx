"use client";

import { type ReactNode } from "react";
import { useGsapContext } from "@/hooks/useGsapContext";
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
 */
export function PinnedScene({ children, className, durationVh = 1.5, onProgress, markers = false }: PinnedSceneProps) {
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
      className={cn("relative min-h-svh w-full overflow-hidden", className)}
      style={{ paddingTop: "var(--header-h)" }}
    >
      {children}
    </div>
  );
}
