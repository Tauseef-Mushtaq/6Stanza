"use client";

import { useMemo, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ScrollDrivenGroup, type Vec3Keyframe } from "@/lib/three/ScrollDrivenGroup";
import { MARK_SHAPES } from "@/features/home/scene/markShape";

/**
 * 6STANZA's cinematic hero object — the ACTUAL brand mark (spec §3), not
 * a generic geometric stand-in. `markShape.ts` holds the mark's vector
 * silhouette, traced from `public/6stanza-mark.png` via alpha-channel
 * contour extraction (OpenCV `findContours` + `approxPolyDP`) rather than
 * hand-approximated, so the extruded object stays unmistakably the
 * 6STANZA symbol. Built once (`useMemo`) into a single beveled
 * `ExtrudeGeometry` — one mesh, kept cheap for hero-section performance.
 */
function buildMarkGeometry() {
  const shapes: THREE.Shape[] = MARK_SHAPES.map((sub) => {
    const shape = new THREE.Shape();
    sub.outer.forEach(([x, y], i) => {
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    });
    shape.closePath();
    sub.holes.forEach((hole) => {
      const path = new THREE.Path();
      hole.forEach(([x, y], i) => {
        if (i === 0) path.moveTo(x, y);
        else path.lineTo(x, y);
      });
      path.closePath();
      shape.holes.push(path);
    });
    return shape;
  });

  const geometry = new THREE.ExtrudeGeometry(shapes, {
    depth: 0.22,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.03,
    bevelSegments: 3,
    curveSegments: 6,
  });
  geometry.center();
  geometry.computeVertexNormals();
  return geometry;
}

const WIRE_LENGTH = 2.4;

function MarkCore() {
  const pivotRef = useRef<THREE.Group>(null);
  const markRef = useRef<THREE.Group>(null);
  const geometry = useMemo(() => buildMarkGeometry(), []);

  useFrame((state, delta) => {
    // Gentle pendulum swing about the wire's top anchor — the natural,
    // slightly-irregular motion of something physically hanging rather
    // than a mechanical loop, achieved by layering two out-of-phase sines.
    if (pivotRef.current) {
      const t = state.clock.elapsedTime;
      pivotRef.current.rotation.z = Math.sin(t * 0.55) * 0.09 + Math.sin(t * 0.23) * 0.03;
      pivotRef.current.rotation.x = Math.sin(t * 0.4 + 1.2) * 0.035;
    }
    // The mark itself keeps a slow spin on the wire, like an ornament
    // twisting as it hangs — restrained, not a gaming-style spin.
    if (markRef.current) {
      markRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group ref={pivotRef} position={[0, WIRE_LENGTH, 0]}>
      {/* The wire itself — a thin cylinder running from the anchor point
          (top, local origin of this pivot) down to the mark. */}
      <mesh position={[0, -WIRE_LENGTH / 2, 0]}>
        <cylinderGeometry args={[0.008, 0.008, WIRE_LENGTH, 8]} />
        <meshStandardMaterial color="#c7d2e8" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Small ring/eyelet where the wire meets the mark, selling the
          "hung from above" read. */}
      <mesh position={[0, -WIRE_LENGTH + 0.05, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.045, 0.012, 8, 16]} />
        <meshStandardMaterial color="#c7d2e8" metalness={0.7} roughness={0.3} />
      </mesh>

      <group ref={markRef} position={[0, -WIRE_LENGTH, 0]} rotation={[0.08, 0.35, 0]}>
        {/* Front/bevel faces — deep royal blue, restrained metalness so
            highlights read as engineered material, not chrome. */}
        <mesh geometry={geometry} castShadow>
          <meshStandardMaterial
            color="#2f6dff"
            metalness={0.45}
            roughness={0.28}
            emissive="#1f63ff"
            emissiveIntensity={0.55}
          />
        </mesh>
        {/* A slightly larger, deep-navy duplicate sitting just behind on Z
            reads as depth/shadow-edge without a second light pass. */}
        <mesh geometry={geometry} position={[0, 0, -0.06]} scale={1.02}>
          <meshStandardMaterial color="#0b1e4a" metalness={0.2} roughness={0.85} emissive="#0b1e4a" emissiveIntensity={0.15} />
        </mesh>
      </group>
    </group>
  );
}

const HERO_KEYFRAMES: Vec3Keyframe[] = [
  { at: 0, position: [2.6, -0.9, -0.4], rotation: [0.05, -0.3, 0], scale: 1.85 },
  { at: 0.35, position: [2.7, -0.75, 0], rotation: [0.08, 0.25, 0], scale: 2.2 },
  { at: 0.7, position: [2.9, -0.95, -0.6], rotation: [0.1, 0.9, 0.04], scale: 1.85 },
  { at: 1, position: [3.4, -1.2, -1.6], rotation: [0.14, 1.9, 0.08], scale: 1.1 },
];

interface BrandGeometrySceneProps {
  progressRef: RefObject<number>;
}

/** Lights + the scroll-driven group, composed for the hero's `<CinematicCanvasScene>`. */
export function BrandGeometryScene({ progressRef }: BrandGeometrySceneProps) {
  const lightPositions = useMemo(
    () => ({ key: new THREE.Vector3(3, 2, 4), fill: new THREE.Vector3(-3, -1, -2), rim: new THREE.Vector3(0, 3, -3) }),
    []
  );

  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={lightPositions.key.toArray()} intensity={2.1} color="#eaf0ff" />
      <pointLight position={lightPositions.fill.toArray()} intensity={0.9} color="#3f7bff" />
      <pointLight position={lightPositions.rim.toArray()} intensity={0.6} color="#8fb0ff" />
      <ScrollDrivenGroup progressRef={progressRef} keyframes={HERO_KEYFRAMES}>
        <MarkCore />
      </ScrollDrivenGroup>
    </>
  );
}
