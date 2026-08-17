import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";

interface ProjectOutcomeProps {
  outcomeStatement: string;
  /** Factual outcome from the project's own data (spec §10 Ch.07) — never fabricated here. */
  outcome: string;
}

/**
 * CHAPTER 07 — outcome (spec §10 Ch.07). The qualitative statement
 * carries the weight; the factual `outcome` badge is the same field
 * already defined in `projects.ts` — nothing new is measured or
 * invented at the detail-page level.
 */
export function ProjectOutcome({ outcomeStatement, outcome }: ProjectOutcomeProps) {
  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>07 — Outcome</TechnicalLabel>
        </Reveal>

        <Reveal direction="up" delay={0.1}>
          <p
            className="mt-8 max-w-2xl font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
          >
            {outcomeStatement}
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.2} className="mt-8">
          <span
            className="inline-flex rounded-[var(--radius-pill)] px-4 py-2 font-[var(--font-mono)]"
            style={{ fontSize: "var(--text-caption)", background: "var(--color-accent)", color: "var(--stz-white)" }}
          >
            {outcome}
          </span>
        </Reveal>
      </Container>
    </section>
  );
}
