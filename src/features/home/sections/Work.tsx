import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine, Divider } from "@/components/ui/Divider";
import { Reveal, ScaleReveal } from "@/components/motion";
import { getPublicProjects } from "@/features/projects/data/publicProjects";

/**
 * CHAPTER 05 — large editorial project presentations (spec §13), not a
 * three-column card grid. Each project gets full-width real estate,
 * a scale-revealed visual placeholder, and structured metadata that
 * will map directly onto real project imagery/CMS data later.
 */
/**
 * Deterministic abstract "infrastructure diagram" — nodes + connecting
 * lines + a fine grid — standing in for real project photography until
 * it's available (spec §10: never an empty rectangle).
 */
function ProjectDiagram({ seed, accent }: { seed: number; accent: number }) {
  const rand = (n: number) => {
    const x = Math.sin(seed * 999 + n * 37.13) * 10000;
    return x - Math.floor(x);
  };
  const nodes = Array.from({ length: 9 }, (_, i) => ({
    x: 8 + rand(i) * 84,
    y: 8 + rand(i + 10) * 84,
  }));
  const edges = [
    [0, 1],
    [1, 2],
    [2, 3],
    [1, 4],
    [4, 5],
    [3, 5],
    [4, 6],
    [6, 7],
    [7, 8],
    [2, 8],
    [0, 6],
  ];

  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden preserveAspectRatio="none">
      <defs>
        <pattern id={`grid-${seed}`} width="6" height="6" patternUnits="userSpaceOnUse">
          <path d="M 6 0 L 0 0 0 6" fill="none" stroke={`hsl(${accent} 60% 70%)`} strokeWidth="0.15" opacity={0.22} />
        </pattern>
      </defs>
      <rect width="100" height="100" fill={`url(#grid-${seed})`} />
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].x}
          y1={nodes[a].y}
          x2={nodes[b].x}
          y2={nodes[b].y}
          stroke={`hsl(${accent} 70% 75%)`}
          strokeWidth="0.3"
          opacity={0.55}
        >
          <animate attributeName="opacity" values="0.3;0.65;0.3" dur={`${4 + (i % 3)}s`} repeatCount="indefinite" />
        </line>
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={i === 0 ? 2.4 : 1.5} fill={`hsl(${accent} 75% 78%)`} opacity={0.9}>
          <animate
            attributeName="r"
            values={`${i === 0 ? 2.4 : 1.5};${i === 0 ? 2.9 : 1.9};${i === 0 ? 2.4 : 1.5}`}
            dur={`${3 + (i % 4)}s`}
            repeatCount="indefinite"
          />
        </circle>
      ))}
    </svg>
  );
}

export async function Work() {
  const projects = await getPublicProjects();

  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>05 — Selected Work</TechnicalLabel>
        </Reveal>

        <Reveal direction="up" delay={0.1}>
          <h2
            className="mt-6 max-w-2xl font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
          >
            Systems we&apos;ve shipped
          </h2>
        </Reveal>

        <div className="mt-10 flex flex-col">
          <Divider />
          {projects.length === 0 ? (
            // Module 9G — empty state (spec §17): preserve the section
            // composition, no fabricated content, no static fallback.
            <p
              className="py-16 text-center"
              style={{ fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)" }}
            >
              Selected work is being updated — check back shortly.
            </p>
          ) : (
            projects.map((project, i) => (
            <article key={project.slug} className="flex min-h-[86vh] flex-col justify-center py-8">
              <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-12 lg:gap-10">
                <div className="lg:col-span-7 lg:order-2">
                  <ScaleReveal className="mx-auto block w-full max-w-[560px] lg:max-w-none">
                    <div
                      className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-lg)]"
                      style={{
                        maxHeight: "58vh",
                        background: `linear-gradient(135deg, hsl(${project.accent} 85% 12%), hsl(${project.accent} 70% 28%))`,
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <ProjectDiagram seed={i} accent={project.accent} />
                    </div>
                  </ScaleReveal>
                </div>

                <div className="flex flex-col justify-center gap-4 lg:col-span-5 lg:order-1">
                  <Reveal direction="up">
                    <span
                      className="font-[var(--font-mono)] uppercase"
                      style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-brand)" }}
                    >
                      {String(i + 1).padStart(2, "0")} — {project.category}
                    </span>
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
                    <span
                      className="rounded-[var(--radius-pill)] px-3 py-1 font-[var(--font-mono)]"
                      style={{ fontSize: "var(--text-caption)", background: "var(--color-accent)", color: "var(--stz-white)" }}
                    >
                      {project.outcome}
                    </span>
                  </Reveal>
                </div>
              </div>
            </article>
            ))
          )}
          <Divider />
        </div>

        <Reveal direction="up" delay={0.1} className="mt-12">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)]"
            style={{ fontSize: "var(--text-nav)", letterSpacing: "var(--tracking-label)" }}
          >
            View all work
            <span aria-hidden>→</span>
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
