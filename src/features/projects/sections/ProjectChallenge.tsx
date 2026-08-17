import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine, SubtleGrid } from "@/components/ui/Divider";
import { Reveal, Parallax } from "@/components/motion";

interface ProjectChallengeProps {
  challenge: string;
}

/**
 * CHAPTER 03 — the problem, shown as a large dark statement with a
 * subtle technical grid (spec §10 Ch.03). Deliberately full-viewport-
 * ish (`min-h-[80svh]`) so it reads as its own cinematic beat, not a
 * paragraph tucked between two lighter sections.
 */
export function ProjectChallenge({ challenge }: ProjectChallengeProps) {
  return (
    <section
      className="relative flex min-h-[80svh] w-full flex-col justify-center overflow-hidden"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}
    >
      <SubtleGrid className="opacity-20" />
      <Parallax speed={0.15} className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0" style={{ background: "var(--surface-glow)" }} />
      </Parallax>

      <Container className="relative z-10">
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>03 — The Challenge</TechnicalLabel>
        </Reveal>

        <Reveal direction="up" delay={0.1}>
          <p
            className="mt-8 max-w-3xl font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
          >
            {challenge}
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
