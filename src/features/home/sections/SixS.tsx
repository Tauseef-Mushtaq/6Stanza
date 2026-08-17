import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine, Divider } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";
import { sixS } from "@/features/home/data/sixS";

/**
 * CHAPTER 04 — the Six S operating philosophy. Deliberately NOT another
 * card grid like Services: a single connected sequence (numbered rows
 * with a running rule) to signal these are principles that run through
 * everything, not a menu of offerings.
 */
export function SixS() {
  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>04 — How We Work</TechnicalLabel>
        </Reveal>

        <Reveal direction="up" delay={0.1}>
          <h2
            className="mt-6 max-w-2xl font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
          >
            The Six S philosophy
          </h2>
          <p className="mt-4 max-w-xl" style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-body-lg)" }}>
            Not a service list — the discipline behind every project
            6STANZA builds, from the first strategy call to the system
            running in production.
          </p>
        </Reveal>

        <div className="mt-16 flex flex-col">
          <Divider />
          {sixS.map((principle, i) => (
            <Reveal key={principle.label} direction="up" delay={i * 0.05}>
              <div className="grid grid-cols-[auto_1fr] items-baseline gap-6 py-7 md:grid-cols-[6rem_1fr_1fr] md:items-center md:gap-10">
                <span
                  className="font-[var(--font-display)] tabular-nums"
                  style={{ fontSize: "var(--text-h3)", color: "var(--color-brand)" }}
                >
                  {String(principle.index).padStart(2, "0")}
                </span>
                <h3
                  className="font-[var(--font-display)] tracking-tight"
                  style={{ fontSize: "var(--text-h3)", lineHeight: "var(--leading-snug)" }}
                >
                  {principle.letter}
                  <span style={{ color: "var(--color-brand)" }}>.</span> {principle.label}
                </h3>
                <p
                  className="max-w-md md:col-start-3"
                  style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-body)" }}
                >
                  {principle.description}
                </p>
              </div>
              <Divider />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
