"use client";

import { type ReactNode } from "react";
import { useGsapContext } from "@/hooks/useGsapContext";
import { createImageEntrance, createPinnedImageCrop } from "@/lib/motion/image";
import { cn } from "@/lib/utils/cn";

interface ImageEntranceProps {
  children: ReactNode;
  className?: string;
  scaleFrom?: number;
  rotateFrom?: number;
}

/** "Image enters → slight scale → subtle rotation → settles" (spec §12). Wrap a single image/media element. */
export function ImageEntrance({ children, className, scaleFrom, rotateFrom }: ImageEntranceProps) {
  const scopeRef = useGsapContext<HTMLDivElement>(({ scope, isReducedMotion }) => {
    if (isReducedMotion) return;
    createImageEntrance({ targets: scope.firstElementChild ?? scope, trigger: scope, scaleFrom, rotateFrom });
  }, [scaleFrom, rotateFrom]);

  return (
    <div ref={scopeRef} className={cn("overflow-hidden", className)}>
      {children}
    </div>
  );
}

interface PinnedImageCropProps {
  children: ReactNode;
  className?: string;
  scaleFrom?: number;
  scaleTo?: number;
  durationVh?: number;
}

/** "Image remains pinned → scroll drives crop/scale → next scene takes over" (spec §12). */
export function PinnedImageCrop({ children, className, scaleFrom, scaleTo, durationVh }: PinnedImageCropProps) {
  const scopeRef = useGsapContext<HTMLDivElement>(({ scope, isReducedMotion }) => {
    if (isReducedMotion) return;
    const image = scope.firstElementChild;
    if (!image) return;
    const tween = createPinnedImageCrop({ container: scope, image, scaleFrom, scaleTo, durationVh });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [scaleFrom, scaleTo, durationVh]);

  return (
    <div ref={scopeRef} className={cn("relative min-h-svh w-full overflow-hidden", className)}>
      {children}
    </div>
  );
}
