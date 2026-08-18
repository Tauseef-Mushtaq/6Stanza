"use client";

import { useRef, type ReactNode } from "react";
import { useGsapContext } from "@/hooks/useGsapContext";
import { createSceneTransition, type TransitionStyle } from "@/lib/motion/transitions";
import { createScrollProgressTrigger } from "@/lib/motion/scrollProgress";
import { cn } from "@/lib/utils/cn";

interface Panel {
  key: string;
  content: ReactNode;
}

interface SceneTransitionStageProps {
  panels: [Panel, Panel];
  style?: TransitionStyle;
  className?: string;
  /** Scroll distance (viewport heights) over which the transition plays. */
  durationVh?: number;
}

/**
 * Demonstrates + provides a reusable "one scene exits, the next enters"
 * stage: two stacked panels, scrubbed from one to the other as the user
 * scrolls through a pinned range, via `createSceneTransition`.
 *
 * Under `prefers-reduced-motion` no timeline/trigger is created, so
 * without an explicit resolved state both absolutely-positioned panels
 * would render stacked on top of each other. This resolves straight to
 * the transition's end state (panel B showing, panel A hidden) instead.
 */
export function SceneTransitionStage({ panels, style = "clip-scale", className, durationVh = 1.25 }: SceneTransitionStageProps) {
  const panelARef = useRef<HTMLDivElement>(null);
  const panelBRef = useRef<HTMLDivElement>(null);

  const scopeRef = useGsapContext<HTMLDivElement>(({ scope, isReducedMotion }) => {
    if (isReducedMotion) {
      if (panelARef.current) panelARef.current.style.display = "none";
      if (panelBRef.current) panelBRef.current.style.opacity = "1";
      return;
    }

    const tl = createSceneTransition({
      outgoing: panelARef.current,
      incoming: panelBRef.current,
      style,
    });
    tl.pause(0);

    const trigger = createScrollProgressTrigger(scope, {
      start: "top top",
      end: `+=${durationVh * 100}%`,
      pin: true,
      onUpdate: (progress) => tl.progress(progress),
    });

    return () => {
      trigger.kill();
      tl.kill();
    };
  }, [style, durationVh]);

  return (
    <div ref={scopeRef} className={cn("relative min-h-svh w-full overflow-hidden", className)}>
      <div ref={panelARef} className="absolute inset-0">
        {panels[0].content}
      </div>
      <div ref={panelBRef} className="absolute inset-0">
        {panels[1].content}
      </div>
    </div>
  );
}
