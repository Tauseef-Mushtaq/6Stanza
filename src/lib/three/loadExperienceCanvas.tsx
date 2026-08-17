import dynamic from "next/dynamic";

/**
 * Dynamic-import wrapper for <ExperienceCanvas>.
 *
 * Import THIS from pages/sections that need a 3D scene, not
 * ExperienceCanvas directly — that keeps Three.js / R3F out of the
 * client bundle for every route that doesn't render 3D content.
 * `ssr: false` because WebGL has no meaningful server render.
 */
export const LazyExperienceCanvas = dynamic(
  () => import("./ExperienceCanvas").then((mod) => mod.ExperienceCanvas),
  { ssr: false }
);
