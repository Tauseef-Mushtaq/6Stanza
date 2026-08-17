import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine, SubtleGrid } from "@/components/ui/Divider";
import { Reveal, SplitHeading, Parallax } from "@/components/motion";
import { projects } from "@/features/home/data/projects";

/**
 * CHAPTER 01 — Projects hero. Same dark/glow, `--header-h`-cleared,
 * full-viewport family as Services' and About's heroes (spec §4) —
 * left-anchored like Services, with a project-count indicator instead
 * of a service count, so the three secondary-page openers read as one
 * connected family without being copies of each other.
 */
export function ProjectsHero() {
  return (
    <section
      className="relative flex min-h-svh w-full flex-col justify-center overflow-hidden"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)", paddingTop: "var(--header-h)" }}
    >
      <SubtleGrid className="opacity-30" />
      <Parallax speed={0.25} className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0" style={{ background: "var(--surface-glow)" }} />
      </Parallax>

      <Container className="relative z-10 flex flex-col gap-8">
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>Projects</TechnicalLabel>
          <span
            className="font-[var(--font-mono)] tabular-nums"
            style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-muted)" }}
          >
            01 – {String(projects.length).padStart(2, "0")}
          </span>
        </Reveal>

        <SplitHeading
          as="h1"
          unit="words"
          className="max-w-4xl font-[var(--font-display)] tracking-tight"
          style={{ fontSize: "clamp(2.75rem, 6.5vw, 6.5rem)", lineHeight: 1.05 }}
        >
          Selected work.
        </SplitHeading>

        <Reveal direction="up" delay={0.3}>
          <p className="max-w-xl" style={{ fontSize: "var(--text-body-lg)", color: "var(--color-muted-inverse)" }}>
            Systems we&apos;ve designed, built, and shipped for businesses
            that needed more than a website — scroll through the work below,
            or open any case study for the full story.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
