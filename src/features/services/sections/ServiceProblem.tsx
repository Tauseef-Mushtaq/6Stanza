import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";

interface ServiceProblemProps {
  problem: string;
}

/**
 * CHAPTER 02 — the problem/opportunity this service exists to solve
 * (spec §12 Ch.02). Plain editorial statement, light surface — no
 * generic marketing filler, just the paragraph itself at size.
 */
export function ServiceProblem({ problem }: ServiceProblemProps) {
  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>02 — The Problem</TechnicalLabel>
        </Reveal>
        <Reveal direction="up" delay={0.1}>
          <p
            className="mt-8 max-w-3xl font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "var(--text-h2)", lineHeight: "var(--leading-tight)" }}
          >
            {problem}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
