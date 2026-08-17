"use client";

import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { HorizontalScroller } from "@/components/motion";
import { processSteps } from "@/features/about/data/process";

/**
 * CHAPTER 04 — How We Work. Reuses the same vertical-scroll-drives-
 * horizontal-movement primitive built for the homepage Team section
 * (`HorizontalScroller` / Lenis + GSAP ScrollTrigger) rather than a
 * new mechanism — but a different visual treatment (connected steps
 * with arrows, light surface) so it doesn't read as a copy of Team.
 */
export function Process() {
  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <div className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>04 — How We Work</TechnicalLabel>
        </div>
        <h2
          className="mt-6 max-w-2xl font-[var(--font-display)] tracking-tight"
          style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
        >
          A system, not a checklist.
        </h2>
      </Container>

      <div className="mt-14">
        <HorizontalScroller trackClassName="items-center px-[var(--container-padding)] gap-6 lg:gap-8">
          {processSteps.map((step, i) => (
            <div key={step.label} className="flex shrink-0 items-center gap-6 lg:gap-8">
              <article className="flex w-[68vw] flex-col gap-4 sm:w-[38vw] lg:w-[24vw]">
                <span
                  className="font-[var(--font-display)] tabular-nums"
                  style={{ fontSize: "var(--text-h1)", color: "var(--color-brand)", lineHeight: 1, opacity: 0.85 }}
                >
                  {String(step.index).padStart(2, "0")}
                </span>
                <h3
                  className="font-[var(--font-display)] tracking-tight"
                  style={{ fontSize: "var(--text-h2)", lineHeight: "var(--leading-tight)" }}
                >
                  {step.label}
                </h3>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-body)" }}>
                  {step.description}
                </p>
              </article>
              {i < processSteps.length - 1 ? (
                <span
                  aria-hidden
                  className="hidden shrink-0 text-2xl lg:block"
                  style={{ color: "var(--color-border)" }}
                >
                  →
                </span>
              ) : null}
            </div>
          ))}
        </HorizontalScroller>
      </div>
    </section>
  );
}
