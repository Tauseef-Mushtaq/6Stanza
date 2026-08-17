"use client";

import { Suspense, type ReactNode } from "react";
import { Canvas, type CanvasProps } from "@react-three/fiber";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface ExperienceCanvasProps {
  /** The replaceable scene content — lights, camera rig, and the
   * object/model for whatever module is using the canvas. Keeping
   * this a `children` slot is what lets later modules swap the 3D
   * scene without touching the Canvas infrastructure itself. */
  children: ReactNode;
  /** Rendered instead of `children` when the user prefers reduced
   * motion, so a 3D scene is never forced on someone who opted out
   * of motion. Optional — omit for scenes that are already static. */
  reducedMotionFallback?: ReactNode;
  className?: string;
  dpr?: CanvasProps["dpr"];
}

/**
 * Shared Three.js / React Three Fiber canvas shell.
 *
 * This is intentionally empty of any actual 3D content — it exists so
 * that later modules only ever need to provide a `<Scene>` /
 * `<Object>` subtree, per the architecture:
 *
 *   ExperienceCanvas
 *         -> Scene
 *               -> Object / Model
 *
 * Responsibilities kept here so every future 3D module gets them for
 * free: responsive sizing, a capped device-pixel-ratio (perf), and a
 * reduced-motion escape hatch. This component should be imported via
 * `next/dynamic` with `ssr: false` at the call site so Three.js never
 * ships to routes/pages that don't render a 3D scene.
 */
export function ExperienceCanvas({
  children,
  reducedMotionFallback = null,
  className,
  dpr = [1, 2],
}: ExperienceCanvasProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <>{reducedMotionFallback}</>;
  }

  return (
    <Canvas
      className={className}
      dpr={dpr}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>{children}</Suspense>
    </Canvas>
  );
}
