"use client";

import { type ReactNode } from "react";
import { useGsapContext } from "@/hooks/useGsapContext";
import { createScrollProgressTrigger } from "@/lib/motion/scrollProgress";
import { cn } from "@/lib/utils/cn";

interface CinematicSceneProps {
  children: ReactNode;
  className?: string;
  start?: string;
  end?: string;
  /** 0 → 1 progress through the scene's scroll range. */
  onProgress?: (progress: number) => void;
  onEnter?: () => void;
  onLeave?: () => void;
  onEnterBack?: () => void;
  onLeaveBack?: () => void;
  markers?: boolean;
}

/**
 * The reusable "scene / chapter" concept from spec §9. Composes
 * `<SceneBackground>`, `<SceneContent>`, `<SceneVisual>` layers and
 * exposes their lifecycle (enter / active / progress / exit) as a
 * `data-scene-phase` attribute (set imperatively, not via React state —
 * cheap for CSS to key off, no re-render per scroll tick) plus a
 * `--scene-progress` CSS custom property children can read in their own
 * transforms/opacity.
 *
 * Module 3 composes multiple `<CinematicScene>`s to build real sections
 * without re-deriving this choreography each time.
 */
export function CinematicScene({
  children,
  className,
  start = "top bottom",
  end = "bottom top",
  onProgress,
  onEnter,
  onLeave,
  onEnterBack,
  onLeaveBack,
  markers = false,
}: CinematicSceneProps) {
  const scopeRef = useGsapContext<HTMLElement>(({ scope, isReducedMotion }) => {
    scope.dataset.scenePhase = "enter";

    if (isReducedMotion) {
      scope.dataset.scenePhase = "active";
      scope.style.setProperty("--scene-progress", "1");
      return;
    }

    const trigger = createScrollProgressTrigger(scope, {
      start,
      end,
      markers,
      onUpdate: (progress) => {
        scope.style.setProperty("--scene-progress", progress.toFixed(4));
        scope.dataset.scenePhase = progress <= 0 ? "enter" : progress >= 1 ? "exit" : "active";
        onProgress?.(progress);
      },
      onEnter: () => onEnter?.(),
      onLeave: () => onLeave?.(),
      onEnterBack: () => onEnterBack?.(),
      onLeaveBack: () => onLeaveBack?.(),
    });

    return () => trigger.kill();
  }, [start, end, markers]);

  return (
    <section
      ref={scopeRef as React.RefObject<HTMLElement | null>}
      className={cn("relative w-full", className)}
      style={{ ["--scene-progress" as string]: 0 }}
    >
      {children}
    </section>
  );
}

/** Absolute-fill background layer — image/video/gradient/3D backdrop for the scene. */
export function SceneBackground({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("absolute inset-0 -z-10", className)}>{children}</div>;
}

/** Foreground text/UI layer — typography, labels, CTAs. */
export function SceneContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("relative z-10", className)}>{children}</div>;
}

/** The scene's "physical/3D character" layer — product shot, 3D object, hero image. */
export function SceneVisual({ children, className }: { children?: ReactNode; className?: string }) {
  return <div className={cn("relative z-0", className)}>{children}</div>;
}
