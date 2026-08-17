import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine, Divider } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";
import { processSteps } from "@/features/about/data/process";

/**
 * CHAPTER 05 — How We Work. Reuses the existing `processSteps` data
 * (About's single source of truth for the delivery sequence — not
 * duplicated) but in a different visual mechanism than About's
 * `HorizontalScroller` card gallery: a single connected inline row of
 * steps with arrow glyphs, so it reads as "how this specific team
 * moves together" rather than a re-skinned Process chapter.
 */
export function HowWeWork() {
  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>05 — How We Work</TechnicalLabel>
        </Reveal>

        <Reveal direction="up" delay={0.1}>
          <h2
            className="mt-6 max-w-xl font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
          >
            One team, one sequence, every engagement.
          </h2>
        </Reveal>

        <div className="mt-14">
          <Divider />
          <div className="flex flex-col md:flex-row md:flex-wrap">
            {processSteps.map((step, i) => (
              <Reveal
                key={step.label}
                direction="up"
                delay={i * 0.05}
                className="flex flex-1 basis-full flex-col gap-2 border-b border-[var(--color-border)] py-6 md:basis-1/3 md:border-b-0 md:border-r md:px-6 md:py-8 lg:basis-1/6"
              >
                <div className="flex items-center gap-2">
                  <span
                    className="font-[var(--font-display)] tabular-nums"
                    style={{ fontSize: "var(--text-caption)", color: "var(--color-brand)" }}
                  >
                    {String(step.index).padStart(2, "0")}
                  </span>
                  {i < processSteps.length - 1 && (
                    <span className="hidden md:inline" style={{ color: "var(--color-text-muted)" }} aria-hidden>
                      →
                    </span>
                  )}
                </div>
                <h3 className="font-[var(--font-display)] tracking-tight" style={{ fontSize: "var(--text-body-lg)" }}>
                  {step.label}
                </h3>
                <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-caption)" }}>
                  {step.description}
                </p>
              </Reveal>
            ))}
          </div>
          <Divider />
        </div>
      </Container>
    </section>
  );
}
