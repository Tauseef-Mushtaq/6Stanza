import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal, ScaleReveal } from "@/components/motion";
import Image from "next/image";
import type { ProjectGalleryImage } from "@/features/projects/data/projectDetails";

interface ProjectSolutionProps {
  solution: string;
  accent: number;
  /** Module 9K (display fix) — this chapter never had any image support at all; it always rendered the procedural SVG regardless of what the admin uploaded. The page now passes the first gallery image here (when one exists) so this chapter shows real project artwork like the other visual chapters do — falls back to the original placeholder when the project has no gallery images yet. */
  image?: ProjectGalleryImage;
}

/**
 * CHAPTER 04 — the solution (spec §10 Ch.04). Statement on one side,
 * a large abstract technical visual on the other — the same large-
 * visual-plus-editorial-text composition used across the site, tinted
 * with the project's own accent so it doesn't feel interchangeable
 * with the Challenge chapter above it.
 */
export function ProjectSolution({ solution, accent, image }: ProjectSolutionProps) {
  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>04 — The Solution</TechnicalLabel>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <Reveal direction="up" delay={0.1} className="lg:col-span-6">
            <p
              className="max-w-xl font-[var(--font-display)] tracking-tight"
              style={{ fontSize: "var(--text-h2)", lineHeight: "var(--leading-tight)" }}
            >
              {solution}
            </p>
          </Reveal>

          <ScaleReveal className="lg:col-span-6">
            <div
              className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-lg)]"
              style={{
                maxHeight: "48vh",
                background: image ? "var(--color-surface)" : `linear-gradient(160deg, hsl(${accent} 85% 12%), hsl(${accent} 70% 30%))`,
                border: "1px solid var(--color-border)",
              }}
            >
              {image ? (
                <Image src={image.src} alt={image.alt} fill className="object-contain" sizes="(min-width: 1024px) 40vw, 90vw" />
              ) : (
                <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
                  {[18, 32, 46].map((r, i) => (
                    <rect
                      key={r}
                      x={50 - r}
                      y={50 - r}
                      width={r * 2}
                      height={r * 2}
                      fill="none"
                      stroke={`hsl(${accent} 70% 82%)`}
                      strokeWidth="0.3"
                      opacity={0.35 + i * 0.15}
                      rx="4"
                    />
                  ))}
                  <circle cx="50" cy="50" r="3" fill={`hsl(${accent} 75% 85%)`} opacity={0.9} />
                </svg>
              )}
            </div>
          </ScaleReveal>
        </div>
      </Container>
    </section>
  );
}
