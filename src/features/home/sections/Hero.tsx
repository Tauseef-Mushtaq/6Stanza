"use client";

import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { SubtleGrid } from "@/components/ui/Divider";
import { BrandMark } from "@/components/ui/BrandMark";
import { Reveal, SplitHeading, CinematicCanvasScene } from "@/components/motion";
import { BrandGeometryScene } from "@/features/home/scene/BrandGeometry";
import { ctaRoute } from "@/config/routes";

/**
 * CHAPTER 01 — full-screen cinematic introduction. Establishes the
 * entire brand: geometric mark, positioning statement, and the
 * scroll-driven 3D object that carries through into Chapter 02.
 */
export function Hero() {
  return (
    <section
      className="relative flex min-h-svh w-full flex-col justify-center overflow-hidden"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}
    >
      <SubtleGrid />
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "var(--surface-glow)" }}
        aria-hidden
      />

      <div className="absolute inset-0" style={{ overflow: "visible" }}>
        <CinematicCanvasScene
          className="h-full w-full"
          rootMargin="0px"
          fallback={
            <div className="flex h-full w-full items-center justify-center opacity-40">
              <BrandMark size={180} />
            </div>
          }
        >
          {(progressRef) => <BrandGeometryScene progressRef={progressRef} />}
        </CinematicCanvasScene>
      </div>

      <Container
        className="relative z-10 flex flex-col gap-6 pb-16 lg:max-w-[58%]"
        style={{ paddingTop: "calc(var(--header-h) + clamp(1rem, 4vh, 3rem))" }}
      >
        <Reveal direction="up" delay={0.1}>
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>
            6STANZA — Technology Partner
          </TechnicalLabel>
        </Reveal>

        <SplitHeading
          as="h1"
          unit="words"
          className="max-w-4xl font-[var(--font-display)] tracking-tight"
          style={{ fontSize: "clamp(2.5rem, 6vw, 6.25rem)", lineHeight: 1.06 }}
        >
          Systems built to move your business forward.
        </SplitHeading>

        <Reveal direction="up" delay={0.35}>
          <p
            className="max-w-xl"
            style={{ fontSize: "var(--text-body)", color: "var(--color-muted-inverse)" }}
          >
            6STANZA designs and builds the software, infrastructure, and
            systems that serious companies run on — from first line of
            code to production at scale.
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.5} className="flex flex-wrap items-center gap-5 pt-1">
          <Link
            href={ctaRoute.href}
            className="inline-flex items-center justify-center rounded-[var(--radius-pill)] px-7 py-3.5 font-[var(--font-sans)] font-medium transition-[filter] hover:brightness-110"
            style={{ background: "var(--color-brand)", color: "var(--stz-white)", fontSize: "var(--text-body)" }}
          >
            {ctaRoute.label}
          </Link>
          <Link
            href="/services"
            className="inline-flex items-center gap-2 font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand-soft)]"
            style={{ fontSize: "var(--text-nav)", letterSpacing: "var(--tracking-label)" }}
          >
            View Services
            <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </Container>

      <div className="absolute bottom-8 left-0 right-0 z-10 flex justify-center">
        <span
          className="font-[var(--font-mono)] uppercase"
          style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-muted-inverse)" }}
        >
          Scroll
        </span>
      </div>
    </section>
  );
}
