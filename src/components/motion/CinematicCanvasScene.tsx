"use client";

import { type ReactNode, type RefObject } from "react";
import { useScrollScene3D, type ScrollScene3DOptions } from "@/lib/three/useScrollScene3D";
import { LazyExperienceCanvas } from "@/lib/three/loadExperienceCanvas";
import { cn } from "@/lib/utils/cn";

interface CinematicCanvasSceneProps extends ScrollScene3DOptions {
  /** Render-prop receiving the live scroll-progress ref — pass straight into `<ScrollDrivenGroup progressRef={...}>`. */
  children: (progressRef: RefObject<number>) => ReactNode;
  /** Rendered under reduced motion / before viewport mount, instead of the WebGL canvas. */
  fallback?: ReactNode;
  className?: string;
}

/**
 * The reusable container for any cinematic 3D moment: gates the WebGL
 * canvas behind viewport-aware mounting (spec §13/§15), skips it entirely
 * under `prefers-reduced-motion`, and hands the scene a scroll-progress
 * ref via render-prop so `<ScrollDrivenGroup>` (or custom scene code) can
 * read it inside `useFrame`.
 */
export function CinematicCanvasScene({ children, fallback = null, className, ...scrollOptions }: CinematicCanvasSceneProps) {
  const { containerRef, progressRef, shouldMount, reducedMotion } = useScrollScene3D<HTMLDivElement>(scrollOptions);

  return (
    <div ref={containerRef} className={cn("relative h-full w-full", className)}>
      {reducedMotion || !shouldMount ? (
        fallback
      ) : (
        <LazyExperienceCanvas reducedMotionFallback={fallback}>{children(progressRef)}</LazyExperienceCanvas>
      )}
    </div>
  );
}
