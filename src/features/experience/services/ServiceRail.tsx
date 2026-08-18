'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PinnedScene } from '@/components/motion/PinnedScene';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { DAMPING } from '@/lib/motion/tokens';

export interface ServiceRailItem {
  index: number;
  category: string;
  label: string;
  description: string;
  tags: string[];
  visual: ReactNode;
}

interface ServiceRailProps {
  items: ServiceRailItem[];
  className?: string;
  durationVhPerItem?: number;
}

/**
 * Services — a large, clearly visible arc (a bowed semicircle segment,
 * per the reference) runs down the left side. A glowing marker travels
 * *along the actual curve* (via SVG getPointAtLength, not an approximated
 * straight translate), with the current number riding beside it and the
 * next number sitting further down the same arc, fading in as it nears.
 *
 * Motion is smoothed with a lerp loop (rAF) independent of raw scroll
 * events, so it stays buttery even on fast/short scroll bursts — the
 * shared `PinnedScene`/ScrollTrigger primitive is untouched; smoothing
 * lives locally here, using the shared `DAMPING.section` token (Part 2)
 * so this scene's scrub weight matches the rest of the app rather than
 * a one-off local constant.
 *
 * Under `prefers-reduced-motion`, this renders every item as a plain
 * static stacked list instead of the single-"active"-item scroll
 * choreography — the radial/rAF version only ever puts one item's
 * content in the DOM at a time, driven entirely by scroll progress
 * that never advances when motion is reduced (`PinnedScene` skips
 * pinning), so without this fallback every service after the first
 * would be permanently inaccessible (spec §22).
 */
export function ServiceRail({
  items,
  className,
  durationVhPerItem = 0.9,
}: ServiceRailProps) {
  const total = items.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const reducedMotion = useReducedMotion();

  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const currentNumRef = useRef<HTMLDivElement>(null);
  const nextNumRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const shapeRef = useRef<HTMLDivElement>(null);

  const rawProgressRef = useRef(0);
  const smoothProgressRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const pathLengthRef = useRef(0);
  const activeIndexRef = useRef(0);

  // Arc geometry lives in a 0–100 (x) by 0–100*(steps) (y) space so a
  // single quadratic curve reads clearly as a bowed semicircle segment,
  // not a near-invisible hairline.
  const steps = Math.max(total - 1, 1);

  useEffect(() => {
    if (pathRef.current)
      pathLengthRef.current = pathRef.current.getTotalLength();
  }, []);

  const render = () => {
    const el = pathRef.current;
    if (!el || !pathLengthRef.current) {
      rafRef.current = requestAnimationFrame(render);
      return;
    }

    // Ease the rendered progress toward the raw scroll progress every
    // frame — this is what makes the whole scene feel damped/cinematic
    // instead of snapping 1:1 with the scrollbar.
    smoothProgressRef.current +=
      (rawProgressRef.current - smoothProgressRef.current) * DAMPING.section;
    const progress = smoothProgressRef.current;
    const continuous = progress * steps;
    const nextIdx = Math.max(0, Math.min(total - 1, Math.round(continuous)));

    const point = el.getPointAtLength(progress * pathLengthRef.current);
    const nextStepProgress = Math.min(1, (Math.floor(continuous) + 1) / steps);
    const nextPoint = el.getPointAtLength(
      nextStepProgress * pathLengthRef.current,
    );

    // Map SVG-unit coordinates (100-wide viewBox) to the rendered box.
    const box = el.ownerSVGElement?.getBoundingClientRect();
    const scaleX = box ? box.width / 100 : 1;
    const scaleY = box ? box.height / (steps * 100) : 1;

    if (dotRef.current) {
      dotRef.current.style.transform = `translate(${point.x * scaleX}px, ${point.y * scaleY}px)`;
    }
    if (currentNumRef.current) {
      currentNumRef.current.style.transform = `translate(${point.x * scaleX + 22}px, ${point.y * scaleY}px)`;
    }
    if (nextNumRef.current) {
      const withinStep = continuous - Math.floor(continuous);
      nextNumRef.current.style.transform = `translate(${nextPoint.x * scaleX + 22}px, ${nextPoint.y * scaleY}px)`;
      nextNumRef.current.style.opacity = String(0.2 + withinStep * 0.5);
    }
    if (contentRef.current) {
      // Content should read as a crossfade centered on the switch
      // point, not a bump in opacity at the switch itself. `withinStep`
      // is 0/1 when the dot sits exactly on an item's point (settled)
      // and 0.5 exactly when `activeIndex` flips (Math.round below).
      // Previously `proximity` peaked at the switch (opacity ~1, fully
      // visible) and dipped while settled — the opposite of what you
      // want, so the new item's text/description/tags popped in at
      // full opacity the instant they swapped. Inverting it so the
      // dip sits at the switch, plus a smoothstep ease so the dip is
      // wide rather than a thin spike, makes the swap itself happen
      // while content is nearly invisible, then fades the new content
      // in gradually as scroll continues past the switch point.
      const withinStep = continuous - Math.floor(continuous);
      const distFromSwitch = Math.abs(withinStep - 0.5) * 2;
      const eased = distFromSwitch * distFromSwitch * (3 - 2 * distFromSwitch);
      contentRef.current.style.opacity = String(0.12 + eased * 0.88);
      contentRef.current.style.transform = `translateY(${(1 - eased) * 14}px)`;
    }
    if (shapeRef.current) {
      shapeRef.current.style.transform = `rotate(${progress * 40}deg) scale(${1 + Math.sin(progress * Math.PI) * 0.06})`;
    }

    if (activeIndexRef.current !== nextIdx) {
      activeIndexRef.current = nextIdx;
      setActiveIndex(nextIdx);
    }

    rafRef.current = requestAnimationFrame(render);
  };

  useEffect(() => {
    if (reducedMotion) return;
    rafRef.current = requestAnimationFrame(render);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total, reducedMotion]);

  const active = items[activeIndex] ?? items[0];
  const next = items[Math.min(total - 1, activeIndex + 1)] ?? active;

  if (reducedMotion) {
    return (
      <div className={className}>
        <ul className='flex flex-col gap-10 px-[var(--container-padding)] py-[var(--space-section)]'>
          {items.map((item) => (
            <li key={item.label} className='flex flex-col gap-3'>
              <span
                className='font-[var(--font-mono)] uppercase'
                style={{
                  fontSize: 'var(--text-caption)',
                  letterSpacing: 'var(--tracking-label)',
                  color: 'var(--color-brand-soft)',
                }}
              >
                {String(item.index).padStart(2, '0')} — {item.category}
              </span>
              <h3
                className='font-[var(--font-display)] tracking-tight'
                style={{
                  fontSize: 'var(--text-h2)',
                  lineHeight: 'var(--leading-tight)',
                }}
              >
                {item.label}
              </h3>
              <p
                className='max-w-md'
                style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--text-body)',
                }}
              >
                {item.description}
              </p>
              <div className='flex flex-wrap gap-2 pt-1'>
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className='rounded-[var(--radius-pill)] px-4 py-1.5'
                    style={{
                      fontSize: 'var(--text-caption)',
                      background: 'var(--color-border)',
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <PinnedScene
      className={className}
      durationVh={Math.max(total, 1) * durationVhPerItem}
      onProgress={(progress) => {
        rawProgressRef.current = progress;
      }}
    >
      <div className='relative h-full w-full overflow-hidden'>
        {/* The arc — a clearly visible bowed curve, not a hairline. */}
        <div className='pointer-events-none absolute inset-y-[6%] left-[4%] hidden w-[140px] lg:block'>
          <svg
            viewBox={`0 0 100 ${steps * 100}`}
            preserveAspectRatio='none'
            className='h-full w-full overflow-visible'
            aria-hidden
          >
            <path
              ref={pathRef}
              d={`M 10 0 Q 100 ${(steps * 100) / 2} 10 ${steps * 100}`}
              fill='none'
              stroke='var(--color-border)'
              strokeWidth='1.4'
              opacity={0.55}
            />
          </svg>
          <div
            ref={dotRef}
            className='absolute left-0 top-0'
            style={{ willChange: 'transform' }}
          >
            <span
              className='block h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full'
              style={{
                background: 'var(--color-brand)',
                boxShadow: '0 0 14px var(--color-brand)',
              }}
            />
          </div>
          <div
            ref={currentNumRef}
            className='absolute left-0 top-0 font-[var(--font-display)] tabular-nums'
            style={{
              fontSize: 'var(--text-h2)',
              color: 'var(--stz-white)',
              willChange: 'transform',
            }}
          >
            {String(active.index).padStart(2, '0')}
          </div>
          <div
            ref={nextNumRef}
            className='absolute left-0 top-0 font-[var(--font-display)] italic tabular-nums'
            style={{
              fontSize: 'var(--text-body-lg)',
              color: 'var(--color-text-muted)',
              willChange: 'transform, opacity',
            }}
          >
            {String(next.index).padStart(2, '0')}
          </div>
        </div>

        {/* Content — large two-line title, description, pills */}
        <div
          ref={contentRef}
          className='flex h-full w-full flex-col justify-center gap-5 px-[var(--container-padding)] lg:max-w-[640px] lg:pl-[16%]'
          style={{ willChange: 'transform, opacity' }}
        >
          <span
            className='font-[var(--font-mono)] uppercase'
            style={{
              fontSize: 'var(--text-caption)',
              letterSpacing: 'var(--tracking-label)',
              color: 'var(--color-brand-soft)',
            }}
          >
            {active.category}
          </span>
          <h3
            className='font-[var(--font-display)] tracking-tight'
            style={{
              fontSize: 'var(--text-hero)',
              lineHeight: 1.02,
              maxWidth: '10ch',
            }}
          >
            {active.label}
          </h3>
          <p
            className='max-w-md'
            style={{
              color: 'var(--color-text-secondary)',
              fontSize: 'var(--text-body)',
            }}
          >
            {active.description}
          </p>
          <div className='flex flex-wrap gap-2 pt-2'>
            {active.tags.map((tag) => (
              <span
                key={tag}
                className='rounded-[var(--radius-pill)] px-4 py-1.5'
                style={{
                  fontSize: 'var(--text-caption)',
                  background: 'var(--stz-white)',
                  color: 'var(--stz-navy-950)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.25)',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Soft abstract shape bleeding off the right edge */}
        <div
          ref={shapeRef}
          className='pointer-events-none absolute -right-[10%] top-1/2 hidden aspect-square w-[46vw] max-w-[620px] -translate-y-1/2 lg:block'
          style={{ willChange: 'transform' }}
          aria-hidden
        >
          <div
            className='absolute inset-0 rounded-full opacity-90'
            style={{
              background:
                'radial-gradient(circle at 32% 30%, rgba(143,176,255,0.55), rgba(31,99,255,0.22) 45%, rgba(11,23,48,0) 72%)',
              filter: 'blur(2px)',
            }}
          />
          <div className='absolute inset-[8%]'>{active.visual}</div>
        </div>
      </div>
    </PinnedScene>
  );
}
