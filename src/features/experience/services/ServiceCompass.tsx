"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";
import { PinnedScene } from "@/components/motion/PinnedScene";
import { NumberIndicator } from "@/components/ui/NumberIndicator";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { cn } from "@/lib/utils/cn";

export interface ServiceCompassItem {
  index: number;
  category?: string;
  label: string;
  description?: string;
  visual?: ReactNode;
}

interface ServiceCompassProps {
  items: ServiceCompassItem[];
  className?: string;
  /** Viewport-heights of pinned scroll per item — total pin length scales with item count. */
  durationVhPerItem?: number;
}

const TICKS = 60;

/**
 * Reusable numbered/compass progression infrastructure (spec §22–23,
 * revised per Module 3.1 spec §2 Ch.03): pins while the user scrolls
 * through `items`, tracking an active index and rendering a full-circle
 * dial — degree ticks, a sweeping needle to the active node, and a thin
 * progress arc — so the left side reads as an engineered navigation
 * mechanism rather than a decorative ring of buttons. Content is
 * supplied by the caller; this component only owns the progression
 * mechanics (active number, dial, content transition).
 */
export function ServiceCompass({ items, className, durationVhPerItem = 1 }: ServiceCompassProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const total = items.length;
  const needleRef = useRef<SVGLineElement>(null);
  const arcRef = useRef<SVGCircleElement>(null);
  const dialRef = useRef<HTMLDivElement>(null);
  const rawProgressRef = useRef(0);

  const compassPositions = useMemo(
    () =>
      items.map((_, i) => {
        const angle = (i / total) * Math.PI * 2 - Math.PI / 2;
        return { x: 50 + Math.cos(angle) * 40, y: 50 + Math.sin(angle) * 40, angleDeg: (angle * 180) / Math.PI + 90 };
      }),
    [items, total]
  );

  const ticks = useMemo(
    () =>
      Array.from({ length: TICKS }, (_, i) => {
        const angle = (i / TICKS) * 360;
        const isMajor = i % (TICKS / total) === 0;
        return { angle, isMajor };
      }),
    [total]
  );

  const active = items[activeIndex] ?? items[0];
  const CIRC = 2 * Math.PI * 43;

  // Continuous angle for a fractional position (e.g. 2.35 = 35% between item 2 and 3),
  // interpolated the short way around the circle so the needle never snaps backward.
  const angleForFraction = (fraction: number) => {
    const clamped = Math.max(0, Math.min(total - 1e-6, fraction));
    const lo = Math.floor(clamped);
    const hi = Math.min(total - 1, lo + 1);
    const t = clamped - lo;
    const a0 = compassPositions[lo]?.angleDeg ?? -90;
    const a1 = compassPositions[hi]?.angleDeg ?? a0;
    let delta = a1 - a0;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    return a0 + delta * t;
  };

  return (
    <PinnedScene
      className={className}
      durationVh={Math.max(total, 1) * durationVhPerItem}
      onProgress={(progress) => {
        rawProgressRef.current = progress;
        const continuous = progress * total;
        const next = Math.min(total - 1, Math.floor(continuous));

        // Drive the dial's rotation/arc continuously via direct DOM writes —
        // no React re-render — so the mechanism sweeps smoothly between
        // discrete states instead of jumping when the active index flips.
        const angle = angleForFraction(continuous);
        if (needleRef.current) {
          const rad = ((angle - 90) * Math.PI) / 180;
          needleRef.current.setAttribute("x2", String(50 + Math.cos(rad) * 34));
          needleRef.current.setAttribute("y2", String(50 + Math.sin(rad) * 34));
        }
        if (arcRef.current) {
          const fraction = total <= 1 ? 1 : Math.min(1, continuous / (total - 1));
          arcRef.current.setAttribute("stroke-dashoffset", String(CIRC * (1 - fraction)));
        }
        if (dialRef.current) {
          // Subtle continuous scale breathing as the mechanism moves — never static.
          const wobble = 1 + Math.sin(progress * Math.PI) * 0.015;
          dialRef.current.style.transform = `scale(${wobble})`;
        }

        setActiveIndex((prev) => (prev === next ? prev : next));
      }}
    >
      <div className="grid h-full w-full grid-cols-1 items-center gap-10 px-[var(--container-padding)] lg:grid-cols-[minmax(0,460px)_1fr] lg:gap-16">
        {/* Compass / dial — the "engineered mechanism". Bleeds off the left
            edge of the viewport on large screens: an instrument, not a widget. */}
        <div
          ref={dialRef}
          className="relative mx-auto aspect-square w-full max-w-[440px] transition-transform duration-300 ease-out lg:-ml-[12%] lg:w-[130%] lg:max-w-none"
          style={{ willChange: "transform" }}
        >
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full"
            aria-hidden
            style={{ overflow: "visible" }}
          >
            <circle cx="50" cy="50" r="40" fill="none" stroke="var(--color-border)" strokeWidth="0.4" />
            <circle cx="50" cy="50" r="46" fill="none" stroke="var(--color-border)" strokeWidth="0.2" opacity={0.5} />

            {/* Degree ticks */}
            {ticks.map((tick, i) => {
              const rOuter = 40;
              const rInner = tick.isMajor ? 36.5 : 38.4;
              const rad = (tick.angle * Math.PI) / 180;
              const x1 = 50 + Math.cos(rad) * rOuter;
              const y1 = 50 + Math.sin(rad) * rOuter;
              const x2 = 50 + Math.cos(rad) * rInner;
              const y2 = 50 + Math.sin(rad) * rInner;
              return (
                <line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="var(--color-border)"
                  strokeWidth={tick.isMajor ? 0.5 : 0.25}
                  opacity={tick.isMajor ? 0.9 : 0.4}
                />
              );
            })}

            {/* Progress arc — fills continuously as the user moves through the services */}
            <circle
              ref={arcRef}
              cx="50"
              cy="50"
              r="43"
              fill="none"
              stroke="var(--color-brand)"
              strokeWidth="0.6"
              strokeLinecap="round"
              strokeDasharray={`${CIRC}`}
              strokeDashoffset={`${CIRC}`}
              transform="rotate(-90 50 50)"
            />

            {/* Needle — sweeps continuously, never snaps */}
            <line
              ref={needleRef}
              x1="50"
              y1="50"
              x2="50"
              y2="16"
              stroke="var(--color-brand)"
              strokeWidth="0.35"
              opacity={0.55}
            />
          </svg>

          {items.map((item, i) => {
            const pos = compassPositions[i];
            const isActive = i === activeIndex;
            return (
              <button
                key={item.index}
                type="button"
                aria-current={isActive}
                aria-label={item.label}
                onClick={() => setActiveIndex(i)}
                className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full transition-[transform,background-color,color,box-shadow] duration-300"
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                  width: isActive ? 60 : 40,
                  height: isActive ? 60 : 40,
                  background: isActive ? "var(--color-brand)" : "var(--color-surface-elevated)",
                  color: isActive ? "var(--color-white)" : "var(--color-text-secondary)",
                  border: `1px solid ${isActive ? "var(--color-brand)" : "var(--color-border)"}`,
                  boxShadow: isActive ? "var(--shadow-glow)" : "none",
                }}
              >
                <NumberIndicator
                  value={item.index}
                  total={total}
                  style={{ fontSize: isActive ? "var(--text-body)" : "var(--text-caption)", color: "inherit" }}
                />
              </button>
            );
          })}

          <div
            className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{ width: 6, height: 6, background: "var(--color-brand)", boxShadow: "var(--shadow-glow)" }}
            aria-hidden
          />
        </div>

        {/* Active content */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <TechnicalLabel>
              {String(activeIndex + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
            </TechnicalLabel>
            {active.category ? (
              <span
                className="rounded-[var(--radius-pill)] border px-3 py-1 font-[var(--font-mono)] uppercase"
                style={{
                  fontSize: "var(--text-label)",
                  letterSpacing: "var(--tracking-label)",
                  borderColor: "var(--color-border)",
                  color: "var(--color-brand-soft)",
                }}
              >
                {active.category}
              </span>
            ) : null}
          </div>
          <h3
            className={cn("font-[var(--font-display)] tracking-tight")}
            style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
          >
            {active.label}
          </h3>
          {active.description ? (
            <p className="max-w-xl" style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-body-lg)" }}>
              {active.description}
            </p>
          ) : null}
          {active.visual ? <div className="mt-2">{active.visual}</div> : null}
        </div>
      </div>
    </PinnedScene>
  );
}
