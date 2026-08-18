"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import { useReducedMotion } from "@/hooks/useReducedMotion";

/**
 * Small flat (non-3D) 6STANZA marks that drift around the hero section
 * like balloons, bouncing off the edges of their container. Purely
 * decorative background layer — sits behind the hero copy.
 */

interface Balloon {
  el: HTMLDivElement;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
}

const BALLOON_COUNT = 6;
const SIZES = [34, 46, 28, 40, 52, 30];
const SPEED = 0.35; // px per ms-normalized tick, kept gentle

export function BouncingLogos() {
  const containerRef = useRef<HTMLDivElement>(null);
  const balloonsRef = useRef<Balloon[]>([]);
  const rafRef = useRef<number | null>(null);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    const container = containerRef.current;
    if (!container) return;

    const { width, height } = container.getBoundingClientRect();
    const els = Array.from(container.children) as HTMLDivElement[];

    balloonsRef.current = els.map((el, i) => {
      const size = SIZES[i % SIZES.length];
      const x = Math.random() * Math.max(width - size, 1);
      const y = Math.random() * Math.max(height - size, 1);
      const angle = Math.random() * Math.PI * 2;
      return {
        el,
        x,
        y,
        vx: Math.cos(angle) * SPEED,
        vy: Math.sin(angle) * SPEED,
        size,
      };
    });

    let lastTime = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - lastTime, 48);
      lastTime = now;

      const bounds = container.getBoundingClientRect();

      for (const b of balloonsRef.current) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        if (b.x <= 0) {
          b.x = 0;
          b.vx = Math.abs(b.vx);
        } else if (b.x >= bounds.width - b.size) {
          b.x = bounds.width - b.size;
          b.vx = -Math.abs(b.vx);
        }

        if (b.y <= 0) {
          b.y = 0;
          b.vy = Math.abs(b.vy);
        } else if (b.y >= bounds.height - b.size) {
          b.y = bounds.height - b.size;
          b.vy = -Math.abs(b.vy);
        }

        b.el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0)`;
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      for (const b of balloonsRef.current) {
        b.x = Math.min(b.x, Math.max(rect.width - b.size, 0));
        b.y = Math.min(b.y, Math.max(rect.height - b.size, 0));
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      aria-hidden
    >
      {Array.from({ length: BALLOON_COUNT }).map((_, i) => (
        <div
          key={i}
          className="absolute left-0 top-0 opacity-25"
          style={{ willChange: "transform" }}
        >
          <Image
            src="/6stanza-mark.png"
            alt=""
            width={SIZES[i % SIZES.length]}
            height={SIZES[i % SIZES.length]}
            className="h-auto object-contain"
            style={{ width: SIZES[i % SIZES.length], height: "auto" }}
          />
        </div>
      ))}
    </div>
  );
}
