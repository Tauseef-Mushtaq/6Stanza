import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";

interface ProjectOverviewProps {
  summary: string;
  contribution: string;
}

/**
 * CHAPTER 02 — what the project is, and what 6STANZA contributed
 * (spec §10 Ch.02). Two short editorial statements side by side on
 * desktop, stacked on mobile — never a block of dense paragraphs.
 */
export function ProjectOverview({ summary, contribution }: ProjectOverviewProps) {
  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>02 — Overview</TechnicalLabel>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal direction="up" delay={0.05}>
            <span
              className="font-[var(--font-mono)] uppercase"
              style={{ fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-label)", color: "var(--color-brand)" }}
            >
              What it is
            </span>
            <p
              className="mt-4 font-[var(--font-display)] tracking-tight"
              style={{ fontSize: "var(--text-h3)", lineHeight: "var(--leading-snug)" }}
            >
              {summary}
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.15}>
            <span
              className="font-[var(--font-mono)] uppercase"
              style={{ fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-label)", color: "var(--color-brand)" }}
            >
              What we contributed
            </span>
            <p className="mt-4" style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-body-lg)" }}>
              {contribution}
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
