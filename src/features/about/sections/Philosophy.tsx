import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal, Parallax } from "@/components/motion";
import { sixS } from "@/features/home/data/sixS";

/**
 * CHAPTER 03 — Our Philosophy. The Six S principles, presented as one
 * connected line of thinking rather than six cards — alternating
 * left/right rows strung along a single vertical connector. Visually
 * distinct from the homepage's pinned curved-path Six S chapter (a
 * different mechanism: static/parallax here, not scroll-scrubbed), so
 * this doesn't read as a duplicate of that section.
 */
export function Philosophy() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}
    >
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>03 — Our Philosophy</TechnicalLabel>
        </Reveal>
        <Reveal direction="up" delay={0.05}>
          <h2
            className="mt-6 max-w-2xl font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
          >
            Six principles. One way of working.
          </h2>
        </Reveal>

        <div className="relative mt-20">
          {/* Connecting line — static geometry with a subtle parallax
              drift, distinct from the homepage's drawn/scrubbed curve. */}
          <div
            className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 lg:block"
            style={{ background: "var(--color-border-inverse)" }}
            aria-hidden
          />

          <div className="flex flex-col gap-16 lg:gap-24">
            {sixS.map((principle, i) => {
              const alignRight = i % 2 === 1;
              return (
                <div key={principle.label} className="relative grid grid-cols-1 items-center gap-6 lg:grid-cols-2 lg:gap-16">
                  <Parallax
                    speed={i % 2 === 0 ? 0.15 : -0.1}
                    className={alignRight ? "lg:order-2" : "lg:order-1"}
                  >
                    <Reveal direction={alignRight ? "left" : "right"} className={alignRight ? "lg:text-left" : "lg:text-right"}>
                      <div className="flex flex-col gap-3">
                        <span
                          className="font-[var(--font-display)] tabular-nums"
                          style={{ fontSize: "var(--text-h1)", color: "var(--color-brand-soft)", opacity: 0.6, lineHeight: 1 }}
                        >
                          {String(principle.index).padStart(2, "0")}
                        </span>
                        <h3
                          className="font-[var(--font-display)] tracking-tight"
                          style={{ fontSize: "var(--text-h2)", lineHeight: "var(--leading-tight)" }}
                        >
                          {principle.letter}. {principle.label}
                        </h3>
                        <p
                          className={alignRight ? "max-w-md" : "max-w-md lg:ml-auto"}
                          style={{ color: "var(--color-muted-inverse)", fontSize: "var(--text-body)" }}
                        >
                          {principle.description}
                        </p>
                      </div>
                    </Reveal>
                  </Parallax>
                  <div className={alignRight ? "hidden lg:order-1 lg:block" : "hidden lg:order-2 lg:block"} aria-hidden />

                  {/* Node on the center line */}
                  <span
                    className="absolute left-1/2 top-1/2 hidden h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full lg:block"
                    style={{ background: "var(--color-brand)", boxShadow: "0 0 12px var(--color-brand)" }}
                    aria-hidden
                  />
                </div>
              );
            })}
          </div>
        </div>
      </Container>
    </section>
  );
}
