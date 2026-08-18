"use client";

import { type ReactNode } from "react";
import { useGsapContext } from "@/hooks/useGsapContext";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { createHorizontalScroll } from "@/lib/motion/horizontal";
import { cn } from "@/lib/utils/cn";

interface HorizontalScrollerProps {
  children: ReactNode;
  className?: string;
  trackClassName?: string;
  onProgress?: (progress: number) => void;
  markers?: boolean;
  /**
   * Whether the pinned stage clears the fixed header. Defaults to
   * `true`: `createHorizontalScroll` pins this component's own scope
   * at `start: "top top"`, which — without this — puts the scope's
   * top edge, and therefore its content, at viewport y=0, directly
   * underneath the fixed header. Setting this to `false` opts out for
   * a caller that already provides its own top clearance.
   */
  headerSafe?: boolean;
}

/**
 * Vertical scroll drives horizontal movement of `children` — the
 * infrastructure for service cards / visual chapters (spec §8). The
 * wrapper pins; the inner track (rendered as a flex row) translates.
 * Falls back to native horizontal overflow-x scroll under reduced motion
 * so the content is never locked to a scroll gesture that doesn't run.
 *
 * That fallback previously only applied below the `md` breakpoint
 * (`overflow-x-auto md:overflow-hidden`) — at desktop widths with
 * reduced motion on, no ScrollTrigger runs to drive the track, and
 * `overflow-hidden` left every card after the first permanently
 * clipped with no way to reach it (spec §22). Reduced motion now keeps
 * `overflow-x-auto` at every breakpoint so the track stays reachable by
 * trackpad/shift-scroll/drag regardless of viewport width.
 *
 * Header-safe stage: while pinned, this component's own scope sits at
 * the top of the viewport (see `headerSafe` above), so the safe area
 * is carved out *inside* the pinned box via `--header-h` padding-top —
 * the single reusable mechanism every HorizontalScroller/PinnedScene
 * consumer shares (see lib/motion/headerHeight.ts), rather than a
 * per-page magic-number hack.
 */
export function HorizontalScroller({
  children,
  className,
  trackClassName,
  onProgress,
  markers = false,
  headerSafe = true,
}: HorizontalScrollerProps) {
  const reducedMotion = useReducedMotion();
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
      className={cn("relative w-full", reducedMotion ? "overflow-x-auto" : "overflow-x-auto md:overflow-hidden", className)}
      style={headerSafe ? { paddingTop: "var(--header-h)" } : undefined}
    >
      <div data-horizontal-track className={cn("flex w-max flex-nowrap gap-8", trackClassName)}>
        {children}
      </div>
    </div>
  );
}
