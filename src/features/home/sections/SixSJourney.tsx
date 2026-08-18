"use client";

import { useEffect, useMemo, useRef } from "react";
import { PinnedScene } from "@/components/motion/PinnedScene";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { DAMPING } from "@/lib/motion/tokens";
import { sixS } from "@/features/home/data/sixS";

/**
 * CHAPTER 04 — the Six S philosophy as one continuous curved journey,
 * replacing the flat numbered-row list. A single SVG path snakes down
 * a tall internal track; principles sit alternately left/right of it
 * and come into focus as the pinned scroll carries their band through
 * the viewport center. The path draws in with scroll progress rather
 * than appearing all at once — no card grid, no boxed panels.
 *
 * Part 2: raw scroll progress is damped through a local rAF lerp loop
 * (shared `DAMPING.section` token) before driving the track/path/label
 * visuals, instead of applying `PinnedScene`'s progress 1:1 — previously
 * this was the one scrubbed scene in the app with no smoothing at all,
 * so it read as glued to the wheel next to `ServiceRail`'s damped feel
 * (spec §8). Under `prefers-reduced-motion`, renders a plain static
 * stacked list instead: the pinned/track version relies on `PinnedScene`
 * clipping to viewport height and progress-driven `transform`s to bring
 * each principle into view, none of which run when motion is reduced,
 * so without this fallback principles after the first would never
 * become visible (spec §22).
 */
export function SixSJourney() {
  const total = sixS.length;
  const BAND_VH = 100; // vertical space (in vh) each principle occupies on the track
  const trackHeightVh = total * BAND_VH;
  const reducedMotion = useReducedMotion();

  const trackRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const labelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const dotRefs = useRef<Array<SVGCircleElement | null>>([]);
  const pathLengthRef = useRef(0);
  const rawProgressRef = useRef(0);
  const smoothProgressRef = useRef(0);
  const rafRef = useRef<number | null>(null);

  // Waypoints in the track's own coordinate space: x in 0–100 (%), y in vh.
  const waypoints = useMemo(
    () =>
      sixS.map((_, i) => ({
        x: i % 2 === 0 ? 22 : 78,
        y: i * BAND_VH + BAND_VH / 2,
      })),
    []
  );

  const pathD = useMemo(() => {
    if (waypoints.length === 0) return "";
    const [first, ...rest] = waypoints;
    let d = `M ${first.x} ${first.y}`;
    let prev = first;
    for (const point of rest) {
      const midY = (prev.y + point.y) / 2;
      d += ` C ${prev.x} ${midY}, ${point.x} ${midY}, ${point.x} ${point.y}`;
      prev = point;
    }
    return d;
  }, [waypoints]);

  useEffect(() => {
    if (pathRef.current) {
      pathLengthRef.current = pathRef.current.getTotalLength();
      pathRef.current.style.strokeDasharray = String(pathLengthRef.current);
      pathRef.current.style.strokeDashoffset = String(pathLengthRef.current);
    }
  }, [pathD]);

  const applyProgress = (progress: number) => {
    // Move the tall track upward through the pinned viewport.
    if (trackRef.current) {
      const travel = Math.max(trackHeightVh - 100, 0);
      trackRef.current.style.transform = `translate3d(0, -${progress * travel}vh, 0)`;
    }

    // Draw the curve in step with scroll — organic, never a hard snap.
    if (pathRef.current && pathLengthRef.current) {
      pathRef.current.style.strokeDashoffset = String(pathLengthRef.current * (1 - progress));
    }

    // Each principle fades into focus as its band crosses the viewport
    // center, and fades back out as the next one takes over — a
    // continuous handoff rather than a discrete slide change.
    const normalized = progress * (total - 1);
    labelRefs.current.forEach((el, i) => {
      if (!el) return;
      const distance = Math.abs(normalized - i);
      const focus = Math.max(0, 1 - distance * 1.6);
      el.style.opacity = String(0.18 + focus * 0.82);
      el.style.transform = `translateY(${(1 - focus) * 18}px) scale(${0.94 + focus * 0.06})`;
    });
    dotRefs.current.forEach((el, i) => {
      if (!el) return;
      const distance = Math.abs(normalized - i);
      const focus = Math.max(0, 1 - distance * 1.6);
      el.setAttribute("r", String(1.2 + focus * 1.4));
      el.setAttribute("opacity", String(0.35 + focus * 0.65));
    });
  };

  // Damp raw ScrollTrigger progress toward a rendered value every frame
  // (shared `DAMPING.section` token) before applying it, so this scene's
  // scrub weight matches `ServiceRail` and the rest of the app instead of
  // tracking the wheel 1:1.
  const render = () => {
    smoothProgressRef.current += (rawProgressRef.current - smoothProgressRef.current) * DAMPING.section;
    applyProgress(smoothProgressRef.current);
    rafRef.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    if (reducedMotion) return;
    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion]);

  const handleProgress = (progress: number) => {
    rawProgressRef.current = progress;
  };

  if (reducedMotion) {
    return (
      <section className="relative w-full" style={{ background: "var(--color-background)" }}>
        <div className="relative w-full px-[var(--container-padding)] pt-[var(--space-section)]">
          <div className="flex items-center gap-3">
            <AccentLine />
            <TechnicalLabel>04 — How We Work</TechnicalLabel>
          </div>
          <h2
            className="mt-6 max-w-2xl font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
          >
            The Six S philosophy
          </h2>
          <p className="mt-4 max-w-xl" style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-body-lg)" }}>
            Not a service list — the discipline behind every project 6STANZA
            builds, from the first strategy call to the system running in
            production.
          </p>
        </div>
        <ul className="mt-10 flex flex-col gap-10 px-[var(--container-padding)] pb-[var(--space-section)]">
          {sixS.map((principle) => (
            <li key={principle.label} className="flex max-w-xl flex-col gap-3">
              <span
                className="font-[var(--font-display)] tabular-nums"
                style={{ fontSize: "var(--text-h1)", color: "var(--color-brand)", lineHeight: 1 }}
              >
                {String(principle.index).padStart(2, "0")}
              </span>
              <h3
                className="font-[var(--font-display)] tracking-tight"
                style={{ fontSize: "var(--text-h2)", lineHeight: "var(--leading-tight)" }}
              >
                {principle.letter}
                <span style={{ color: "var(--color-brand)" }}>.</span> {principle.label}
              </h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-body)" }}>
                {principle.description}
              </p>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <div className="relative w-full px-[var(--container-padding)] pt-[var(--space-section)]">
        <div className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>04 — How We Work</TechnicalLabel>
        </div>
        <h2
          className="mt-6 max-w-2xl font-[var(--font-display)] tracking-tight"
          style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
        >
          The Six S philosophy
        </h2>
        <p className="mt-4 max-w-xl" style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-body-lg)" }}>
          Not a service list — the discipline behind every project 6STANZA
          builds, from the first strategy call to the system running in
          production.
        </p>
      </div>

      <PinnedScene durationVh={total * 1.15} className="mt-10" onProgress={handleProgress}>
        <div className="relative h-full w-full overflow-hidden">
          <div
            ref={trackRef}
            className="absolute inset-x-0 top-0 w-full"
            style={{ height: `${trackHeightVh}vh`, willChange: "transform" }}
          >
            <svg
              viewBox={`0 0 100 ${trackHeightVh}`}
              preserveAspectRatio="none"
              className="absolute inset-0 h-full w-full"
              aria-hidden
            >
              <path
                d={pathD}
                fill="none"
                stroke="var(--color-border)"
                strokeWidth="0.15"
                opacity={0.4}
                vectorEffect="non-scaling-stroke"
              />
              <path
                ref={pathRef}
                d={pathD}
                fill="none"
                stroke="var(--color-brand)"
                strokeWidth="0.25"
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
              />
              {waypoints.map((point, i) => (
                <circle
                  key={sixS[i].label}
                  ref={(el) => {
                    dotRefs.current[i] = el;
                  }}
                  cx={point.x}
                  cy={point.y}
                  r={1.2}
                  fill="var(--color-brand)"
                />
              ))}
            </svg>

            {sixS.map((principle, i) => {
              const point = waypoints[i];
              const alignLeft = point.x < 50;
              return (
                <div
                  key={principle.label}
                  ref={(el) => {
                    labelRefs.current[i] = el;
                  }}
                  className="absolute flex max-w-md flex-col gap-3"
                  style={{
                    top: `${point.y}vh`,
                    left: alignLeft ? `${point.x}%` : undefined,
                    right: alignLeft ? undefined : `${100 - point.x}%`,
                    transform: "translateY(-50%)",
                    marginLeft: alignLeft ? "5%" : undefined,
                    marginRight: alignLeft ? undefined : "5%",
                    textAlign: alignLeft ? "left" : "right",
                    willChange: "transform, opacity",
                  }}
                >
                  <span
                    className="font-[var(--font-display)] tabular-nums"
                    style={{ fontSize: "var(--text-h1)", color: "var(--color-brand)", lineHeight: 1 }}
                  >
                    {String(principle.index).padStart(2, "0")}
                  </span>
                  <h3
                    className="font-[var(--font-display)] tracking-tight"
                    style={{ fontSize: "var(--text-h2)", lineHeight: "var(--leading-tight)" }}
                  >
                    {principle.letter}
                    <span style={{ color: "var(--color-brand)" }}>.</span> {principle.label}
                  </h3>
                  <p
                    className={alignLeft ? "" : "ml-auto"}
                    style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-body)" }}
                  >
                    {principle.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </PinnedScene>
    </section>
  );
}
