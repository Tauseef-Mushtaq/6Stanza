import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SubtleGrid } from "@/components/ui/Divider";
import { Reveal, SplitHeading } from "@/components/motion";
import type { ProjectItem } from "@/features/home/data/projects";

interface ProjectNextCtaProps {
  prev: ProjectItem;
  next: ProjectItem;
}

/**
 * CHAPTER 08 — next project (spec §10 Ch.08). Closes the case study
 * by moving straight into the next one, so the visitor keeps moving
 * through a continuous portfolio (spec §16) instead of hitting a dead
 * end — same dark/glow closing family as the other final chapters
 * across the site, but the CTA points forward into `/projects/[slug]`
 * rather than `/start-project`.
 */
export function ProjectNextCta({ prev, next }: ProjectNextCtaProps) {
  return (
    <section
      className="relative flex min-h-[70svh] w-full flex-col justify-center overflow-hidden"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}
    >
      <SubtleGrid className="opacity-30" />
      <div className="pointer-events-none absolute inset-0" style={{ background: "var(--surface-glow)" }} aria-hidden />

      <Container className="relative z-10 flex flex-col gap-6 py-24">
        <Reveal direction="up">
          <span
            className="font-[var(--font-mono)] uppercase"
            style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-brand-soft)" }}
          >
            Next Project
          </span>
        </Reveal>

        <Link
          href={`/projects/${next.slug}`}
          className="group focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[var(--color-brand)]"
        >
          <SplitHeading
            as="h2"
            unit="words"
            className="max-w-4xl font-[var(--font-display)] tracking-tight transition-colors group-hover:text-[var(--color-brand-soft)]"
            style={{ fontSize: "var(--text-display)", lineHeight: "var(--leading-tight)" }}
          >
            {next.title}
          </SplitHeading>
          <Reveal direction="up" delay={0.15} className="mt-6 inline-flex items-center gap-2">
            <span
              className="font-[var(--font-mono)] uppercase"
              style={{ fontSize: "var(--text-nav)", letterSpacing: "var(--tracking-label)", color: "var(--color-muted-inverse)" }}
            >
              View case study
            </span>
            <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
          </Reveal>
        </Link>

        <Reveal direction="up" delay={0.2} className="flex flex-wrap items-center gap-6 pt-6">
          <Link
            href={`/projects/${prev.slug}`}
            className="inline-flex w-fit items-center gap-2 font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand)]"
            style={{ fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-muted)" }}
          >
            ← {prev.title}
          </Link>
          <Link
            href="/projects"
            className="inline-flex w-fit items-center gap-2 font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand)]"
            style={{ fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-muted)" }}
          >
            All projects
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
