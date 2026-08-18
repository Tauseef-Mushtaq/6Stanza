import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine, SubtleGrid } from "@/components/ui/Divider";
import { NumberIndicator } from "@/components/ui/NumberIndicator";
import { Reveal, SplitHeading, Parallax } from "@/components/motion";
import type { ProjectItem } from "@/features/home/data/projects";

interface ProjectDetailHeroProps {
  project: ProjectItem;
  index: number;
  total: number;
  positioning: string;
  year?: string;
}

/**
 * CHAPTER 01 — project detail hero (spec §10 Ch.01). Same dark/glow,
 * `--header-h`-cleared family as the Services detail hero, with the
 * project's own accent hue tinting the background glow so each case
 * study still feels visually distinct within one shared template.
 */
export function ProjectDetailHero({ project, index, total, positioning, year = "2025" }: ProjectDetailHeroProps) {
  return (
    <section
      className="relative flex min-h-svh w-full flex-col justify-center overflow-hidden"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)", paddingTop: "var(--safe-top)" }}
    >
      <SubtleGrid className="opacity-30" />
      <Parallax speed={0.2} className="pointer-events-none absolute inset-0" aria-hidden>
        <div
          className="absolute inset-0"
          style={{ background: `radial-gradient(60% 60% at 78% 30%, hsl(${project.accent} 70% 22% / 0.5), transparent 70%)` }}
        />
      </Parallax>

      <Container className="relative z-10 flex flex-col gap-7">
        <Reveal direction="up" className="flex flex-wrap items-center gap-4">
          <NumberIndicator value={index} total={total} />
          <AccentLine />
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>{project.category}</TechnicalLabel>
          <span
            className="font-[var(--font-mono)] tabular-nums"
            style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-muted)" }}
          >
            {year}
          </span>
        </Reveal>

        <SplitHeading
          as="h1"
          unit="words"
          className="max-w-4xl font-[var(--font-display)] tracking-tight"
          style={{ fontSize: "clamp(2.75rem, 6.5vw, 6.5rem)", lineHeight: 1.05 }}
        >
          {project.title}
        </SplitHeading>

        <Reveal direction="up" delay={0.3}>
          <p className="max-w-xl" style={{ fontSize: "var(--text-body-lg)", color: "var(--color-muted-inverse)" }}>
            {positioning}
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.4}>
          <Link
            href="/projects"
            className="mt-2 inline-flex w-fit items-center gap-2 font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand)]"
            style={{ fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-muted)" }}
          >
            ← All projects
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
