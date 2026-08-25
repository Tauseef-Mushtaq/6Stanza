import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal, ScaleReveal } from "@/components/motion";
import type { Insight } from "@/features/insights/data/insights";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

/**
 * CHAPTER 02 — one dominant featured article (§19). Full-width
 * editorial layout, not a card — the visual and the title both get
 * meaningful screen space, matching the weight given to a single
 * project in `FeaturedProjects`.
 */
export function FeaturedInsight({ insight }: { insight: Insight }) {
  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>Featured</TechnicalLabel>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-6">
            <ScaleReveal>
              <div
                className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-lg)]"
                style={{ background: "linear-gradient(135deg, var(--stz-navy-950), var(--stz-blue-600))", border: "1px solid var(--color-border)" }}
              >
                {/*
                 * Fix: FeaturedInsight always rendered this procedural
                 * gradient/SVG placeholder, even when an admin had
                 * uploaded a real cover image — the image was simply
                 * never consumed here. Renders the real image on top
                 * when `coverImage` exists; falls back to the original
                 * placeholder (unchanged below) otherwise, matching
                 * `ProjectGallery`'s existing "real image if present,
                 * else placeholder" pattern.
                 */}
                {insight.coverImage ? (
                  <Image
                    src={insight.coverImage}
                    alt={insight.title}
                    fill
                    sizes="(min-width: 1024px) 50vw, 100vw"
                    className="object-cover"
                  />
                ) : (
                  <>
                    <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden preserveAspectRatio="none">
                      <line x1="10" y1="80" x2="90" y2="20" stroke="rgba(247,249,252,0.25)" strokeWidth="0.4" />
                      <line x1="10" y1="60" x2="90" y2="40" stroke="rgba(247,249,252,0.15)" strokeWidth="0.4" />
                      <circle cx="90" cy="20" r="2" fill="rgba(247,249,252,0.6)" />
                      <circle cx="10" cy="80" r="2" fill="rgba(247,249,252,0.6)" />
                    </svg>
                    <span
                      className="absolute bottom-5 left-5 font-[var(--font-mono)] uppercase"
                      style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "rgba(247,249,252,0.7)" }}
                    >
                      {insight.category}
                    </span>
                  </>
                )}
              </div>
            </ScaleReveal>
          </div>

          <div className="flex flex-col gap-5 lg:col-span-6">
            <Reveal direction="up" delay={0.05} className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <TechnicalLabel style={{ color: "var(--color-brand)" }}>{insight.category}</TechnicalLabel>
              <span style={{ fontSize: "var(--text-small)", color: "var(--color-text-muted)" }}>
                {formatDate(insight.date)} · {insight.readingTime} read
              </span>
            </Reveal>

            <Reveal direction="up" delay={0.1}>
              <h2
                className="font-[var(--font-display)] tracking-tight"
                style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
              >
                {insight.title}
              </h2>
            </Reveal>

            <Reveal direction="up" delay={0.15}>
              <p className="max-w-lg" style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-body-lg)" }}>
                {insight.excerpt}
              </p>
            </Reveal>

            <Reveal direction="up" delay={0.2} className="pt-2">
              <Link
                href={`/insights/${insight.slug}`}
                className="inline-flex items-center gap-2 font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand)]"
                style={{ fontSize: "var(--text-nav)", letterSpacing: "var(--tracking-label)" }}
              >
                Read article
                <span aria-hidden>→</span>
              </Link>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
