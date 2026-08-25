import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { Divider } from "@/components/ui/Divider";
import { Reveal, ScaleReveal } from "@/components/motion";
import { getPublicProjects } from "@/features/projects/data/publicProjects";
import { PublicRetryState } from "@/components/ui/PublicRetryState";

/**
 * Deterministic technical visual per project — three distinct rendering
 * modes cycled by index so consecutive projects don't share an identity
 * (spec §6's "each project should have its own visual identity"), while
 * staying in the same restrained line/node/grid visual language as the
 * rest of the site (no photography exists yet, so this is the ready-
 * to-swap placeholder architecture called for in spec §7).
 */
function ProjectVisual({ seed, accent, mode }: { seed: number; accent: number; mode: 0 | 1 | 2 }) {
  const rand = (n: number) => {
    const x = Math.sin(seed * 999 + n * 37.13) * 10000;
    return x - Math.floor(x);
  };

  if (mode === 0) {
    // Node graph — infrastructure diagram.
    const nodes = Array.from({ length: 9 }, (_, i) => ({ x: 8 + rand(i) * 84, y: 8 + rand(i + 10) * 84 }));
    const edges: [number, number][] = [[0, 1], [1, 2], [2, 3], [1, 4], [4, 5], [3, 5], [4, 6], [6, 7], [7, 8], [2, 8]];
    return (
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden preserveAspectRatio="none">
        {edges.map(([a, b], i) => (
          <line
            key={i}
            x1={nodes[a].x}
            y1={nodes[a].y}
            x2={nodes[b].x}
            y2={nodes[b].y}
            stroke={`hsl(${accent} 70% 75%)`}
            strokeWidth="0.3"
            opacity={0.5}
          />
        ))}
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r={i === 0 ? 2.4 : 1.5} fill={`hsl(${accent} 75% 78%)`} opacity={0.9} />
        ))}
      </svg>
    );
  }

  if (mode === 1) {
    // Layered horizon — stacked translucent bands, evoking cloud/infra depth.
    const bands = Array.from({ length: 6 }, (_, i) => ({
      y: 10 + i * 14 + rand(i) * 4,
      opacity: 0.12 + i * 0.08,
    }));
    return (
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden preserveAspectRatio="none">
        {bands.map((b, i) => (
          <rect key={i} x="0" y={b.y} width="100" height="2" fill={`hsl(${accent} 70% 80%)`} opacity={b.opacity} />
        ))}
        <circle cx={20 + rand(1) * 60} cy={30 + rand(2) * 40} r="14" fill="none" stroke={`hsl(${accent} 70% 80%)`} strokeWidth="0.4" opacity={0.5} />
        <circle cx={20 + rand(1) * 60} cy={30 + rand(2) * 40} r="22" fill="none" stroke={`hsl(${accent} 70% 80%)`} strokeWidth="0.2" opacity={0.3} />
      </svg>
    );
  }

  // mode 2 — concentric growth rings, evoking analytics/organic reach.
  const rings = Array.from({ length: 5 }, (_, i) => 10 + i * 9);
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden preserveAspectRatio="none">
      {rings.map((r, i) => (
        <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={`hsl(${accent} 70% 80%)`} strokeWidth="0.3" opacity={0.15 + i * 0.08} />
      ))}
      <line x1="50" y1="10" x2="50" y2="90" stroke={`hsl(${accent} 70% 80%)`} strokeWidth="0.2" opacity={0.3} />
      <line x1="10" y1="50" x2="90" y2="50" stroke={`hsl(${accent} 70% 80%)`} strokeWidth="0.2" opacity={0.3} />
    </svg>
  );
}

/**
 * CHAPTER 03+ — the actual project list, as large full-width editorial
 * chapters (spec §6), never a card grid. Each project alternates visual
 * placement and gets its own `ProjectVisual` rendering mode so no two
 * entries look identical.
 */
export async function FeaturedProjects() {
  const { ok, data: projects } = await getPublicProjects();

  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-4xl)" }}>
        <div className="flex flex-col">
          <Divider />
          {!ok ? (
            // Module 10B (spec §12) — query failure, not zero rows.
            <div className="py-16">
              <PublicRetryState
                title="We couldn't load our projects right now"
                description="Please try again."
              />
            </div>
          ) : projects.length === 0 ? (
            // Module 9G — empty state (spec §20): no fabricated
            // project content, no reintroduced static fallback.
            <p
              className="py-16 text-center"
              style={{ fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)" }}
            >
              Projects are being updated — check back shortly.
            </p>
          ) : (
            projects.map((project, i) => {
            const mode = (i % 3) as 0 | 1 | 2;
            const flip = i % 2 === 1;
            return (
              <article key={project.slug} className="flex min-h-[92svh] flex-col justify-center py-10">
                <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
                  <div className={`lg:col-span-7 ${flip ? "lg:order-1" : "lg:order-2"}`}>
                    <ScaleReveal className="mx-auto block w-full max-w-[560px] lg:max-w-none">
                      <div
                        className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-lg)]"
                        style={{
                          maxHeight: "60vh",
                          background: `linear-gradient(135deg, hsl(${project.accent} 85% 12%), hsl(${project.accent} 70% 28%))`,
                          border: "1px solid var(--color-border)",
                        }}
                      >
                        {/*
                         * Fix: same gap as Work.tsx (home) — this
                         * always rendered ProjectVisual even when a
                         * real cover image existed. Falls back to the
                         * original placeholder when none has been
                         * uploaded.
                         */}
                        {project.coverImage ? (
                          <Image
                            src={project.coverImage}
                            alt={project.title}
                            fill
                            sizes="(min-width: 1024px) 58vw, 100vw"
                            className="object-cover"
                          />
                        ) : (
                          <ProjectVisual seed={i} accent={project.accent} mode={mode} />
                        )}
                      </div>
                    </ScaleReveal>
                  </div>

                  <div className={`flex flex-col justify-center gap-4 lg:col-span-5 ${flip ? "lg:order-2" : "lg:order-1"}`}>
                    <Reveal direction="up" className="flex items-center gap-4">
                      <span
                        className="font-[var(--font-display)] tabular-nums"
                        style={{ fontSize: "var(--text-h2)", color: "var(--color-brand)", opacity: 0.85, lineHeight: 1 }}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <TechnicalLabel>{project.category}</TechnicalLabel>
                    </Reveal>

                    <Reveal direction="up" delay={0.05}>
                      <h3
                        className="font-[var(--font-display)] tracking-tight"
                        style={{ fontSize: "var(--text-h2)", lineHeight: "var(--leading-tight)" }}
                      >
                        {project.title}
                      </h3>
                    </Reveal>

                    <Reveal direction="up" delay={0.1}>
                      <p className="max-w-xl" style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-body)" }}>
                        {project.description}
                      </p>
                    </Reveal>

                    <Reveal direction="up" delay={0.15} className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
                      <span style={{ fontSize: "var(--text-small)", color: "var(--color-text-muted)" }}>
                        {project.technologies.join(" · ")}
                      </span>
                    </Reveal>

                    <Reveal direction="up" delay={0.2} className="pt-3">
                      <Link
                        href={`/projects/${project.slug}`}
                        className="inline-flex items-center gap-2 font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand)]"
                        style={{ fontSize: "var(--text-nav)", letterSpacing: "var(--tracking-label)" }}
                      >
                        View case study
                        <span aria-hidden>→</span>
                      </Link>
                    </Reveal>
                  </div>
                </div>
              </article>
            );
            })
          )}
          <Divider />
        </div>
      </Container>
    </section>
  );
}
