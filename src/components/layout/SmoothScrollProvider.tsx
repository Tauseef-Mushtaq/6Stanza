"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, ensureGsapRegistered } from "@/lib/motion/gsap";
import { LENIS_DEFAULTS, setLenisInstance } from "@/lib/motion/lenis";
import { prefersReducedMotion } from "@/hooks/useReducedMotion";

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

/**
 * Owns the single global Lenis instance and wires it into GSAP's
 * ScrollTrigger, per the architecture later modules depend on:
 *
 *   Lenis -> scroll position -> ScrollTrigger -> GSAP timelines
 *
 * This component intentionally does not create any scroll-driven
 * *scenes* — that is the job of later modules. It only guarantees the
 * plumbing exists, exactly once, app-wide.
 *
 * When the user prefers reduced motion, Lenis is skipped entirely and
 * the browser's native scrolling is left in place.
 */
export function SmoothScrollProvider({ children }: SmoothScrollProviderProps) {
  useEffect(() => {
    ensureGsapRegistered();

    if (prefersReducedMotion()) {
      return;
    }

    const lenis = new Lenis(LENIS_DEFAULTS);
    setLenisInstance(lenis);

    lenis.on("scroll", ScrollTrigger.update);

    const update = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(update);
      lenis.destroy();
      setLenisInstance(null);
    };
  }, []);

  return <>{children}</>;
}
