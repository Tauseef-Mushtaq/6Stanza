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

function MarkCore() {
  const groupRef = useRef<THREE.Group>(null);
  const geometry = useMemo(() => buildMarkGeometry(), []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // Restrained continuous rotation + a slow float — an architectural
    // emblem drifting in place, not a spinning gaming-style prop.
    groupRef.current.rotation.y += delta * 0.14;
    groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.06;
  });

  return (
    <group ref={groupRef} rotation={[0.08, 0.35, 0]}>
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
  );
}

const HERO_KEYFRAMES: Vec3Keyframe[] = [
  { at: 0, position: [1.15, -0.1, -0.4], rotation: [0.05, -0.3, 0], scale: 1.6 },
  { at: 0.35, position: [1.25, 0.05, 0], rotation: [0.08, 0.25, 0], scale: 1.95 },
  { at: 0.7, position: [1.5, -0.15, -0.6], rotation: [0.1, 0.9, 0.04], scale: 1.6 },
  { at: 1, position: [2.4, -0.35, -1.6], rotation: [0.14, 1.9, 0.08], scale: 0.9 },
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
