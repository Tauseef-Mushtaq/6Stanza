"use client";

import { useRef, type ReactNode, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { DAMPING } from "@/lib/motion/tokens";
import { isMobileViewport, MOBILE_INTENSITY } from "@/lib/motion/mobile";

export interface Vec3Keyframe {
  /** Scroll progress (0 → 1) this keyframe applies at. */
  at: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number | [number, number, number];
}

interface ScrollDrivenGroupProps {
  children: ReactNode;
  /** Progress ref from `useScrollScene3D` — read every frame, never via props/state. */
  progressRef: RefObject<number>;
  /** Sorted (or unsorted — sorted internally) keyframes describing the object's journey across the scroll range, per spec §14 (e.g. 0 → enters, 0.5 → rotates, 1 → exits). */
  keyframes: Vec3Keyframe[];
  /**
   * Smoothing factor for lerping toward the target transform each frame
   * (0 = laggier/smoother, closer to 1 = instant snap — inverse of the
   * doc comment this replaces, which had it backwards; see the lerp
   * call below: `lerp(current, target, damping)`). Defaults to the
   * shared `DAMPING.cinematic` token (spec §8/§14) so the hero's scrub
   * feel matches every other damped scene in the app instead of using
   * a one-off local constant.
   */
  damping?: number;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpVec3(
  a: [number, number, number],
  b: [number, number, number],
  t: number
): [number, number, number] {
  return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
}

function resolveScale(scale: number | [number, number, number] | undefined): [number, number, number] {
  if (scale === undefined) return [1, 1, 1];
  return typeof scale === "number" ? [scale, scale, scale] : scale;
}

function sampleAt(keyframes: Vec3Keyframe[], progress: number) {
  const sorted = [...keyframes].sort((a, b) => a.at - b.at);
  if (sorted.length === 0) {
    return { position: [0, 0, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number] };
  }

  let lower = sorted[0];
  let upper = sorted[sorted.length - 1];
  for (let i = 0; i < sorted.length - 1; i += 1) {
    if (progress >= sorted[i].at && progress <= sorted[i + 1].at) {
      lower = sorted[i];
      upper = sorted[i + 1];
      break;
    }
  }

  const span = upper.at - lower.at;
  const t = span === 0 ? 0 : Math.min(Math.max((progress - lower.at) / span, 0), 1);

  return {
    position: lerpVec3(lower.position ?? [0, 0, 0], upper.position ?? [0, 0, 0], t),
    rotation: lerpVec3(lower.rotation ?? [0, 0, 0], upper.rotation ?? [0, 0, 0], t),
    scale: lerpVec3(resolveScale(lower.scale), resolveScale(upper.scale), t),
  };
}

/**
 * Wraps R3F children in a `<group>` whose position/rotation/scale are
 * driven by scroll progress via keyframes, reading `progressRef.current`
 * every frame inside `useFrame` — never causing a React re-render. This
 * is the reusable "scroll progress → camera / object transforms"
 * infrastructure from spec §14; Module 3 supplies the actual object and
 * keyframes.
 */
export function ScrollDrivenGroup({
  children,
  progressRef,
  keyframes,
  damping = DAMPING.cinematic,
}: ScrollDrivenGroupProps) {
  const groupRef = useRef<THREE.Group>(null);
  const current = useRef({ position: new THREE.Vector3(), rotation: new THREE.Euler(), scale: new THREE.Vector3(1, 1, 1) });

  useFrame(() => {
    const group = groupRef.current;
    if (!group) return;

    const target = sampleAt(keyframes, progressRef.current ?? 0);
    const c = current.current;

    // Mobile motion profile (spec §21 — "reduce 3D intensity"): scale the
    // travel distance from its rest position down on small viewports, so
    // the mark drifts through a shorter path instead of sweeping the same
    // distance across a much narrower screen. Rotation/scale keyframes
    // (the object's actual geometry/character) are left untouched.
    const positionScale = isMobileViewport() ? MOBILE_INTENSITY : 1;
    const scaledPosition: [number, number, number] = [
      target.position[0] * positionScale,
      target.position[1] * positionScale,
      target.position[2] * positionScale,
    ];

    c.position.set(
      lerp(c.position.x, scaledPosition[0], damping),
      lerp(c.position.y, scaledPosition[1], damping),
      lerp(c.position.z, scaledPosition[2], damping)
    );
    c.rotation.set(
      lerp(c.rotation.x, target.rotation[0], damping),
      lerp(c.rotation.y, target.rotation[1], damping),
      lerp(c.rotation.z, target.rotation[2], damping)
    );
    c.scale.set(
      lerp(c.scale.x, target.scale[0], damping),
      lerp(c.scale.y, target.scale[1], damping),
      lerp(c.scale.z, target.scale[2], damping)
    );

    group.position.copy(c.position);
    group.rotation.copy(c.rotation);
    group.scale.copy(c.scale);
  });

  return <group ref={groupRef}>{children}</group>;
}
