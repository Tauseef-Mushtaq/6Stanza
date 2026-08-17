import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";
import { sixS } from "@/features/home/data/sixS";

/**
 * CHAPTER 06 — Culture. References the existing Six S principles
 * (reused, not duplicated) as *how this team operates day to day*,
 * shown as a restrained inline strip rather than the homepage's full
 * pinned Six S journey or About's alternating-connector Philosophy
 * chapter — a third, much lighter-weight treatment of the same data,
 * appropriate for a supporting mention rather than the main subject.
 */
export function TeamCulture() {
  return (
    <section className="relative w-full" style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>06 — Culture</TechnicalLabel>
        </Reveal>

        <Reveal direction="up" delay={0.1}>
          <p
            className="mt-6 max-w-2xl font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "var(--text-h2)", lineHeight: "var(--leading-tight)" }}
          >
            The same six principles run through how the team works, not
            just what it ships.
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.2} staggerChildren className="mt-12 flex flex-wrap gap-3">
          {sixS.map((principle) => (
            <span
              key={principle.label}
              className="inline-flex items-center gap-2 rounded-[var(--radius-pill)] px-4 py-2"
              style={{ border: "1px solid var(--color-border-inverse)" }}
            >
              <span className="font-[var(--font-mono)] tabular-nums" style={{ fontSize: "var(--text-caption)", color: "var(--color-brand-soft)" }}>
                {String(principle.index).padStart(2, "0")}
              </span>
              <span className="font-[var(--font-mono)] uppercase" style={{ fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-label)" }}>
                {principle.label}
              </span>
            </span>
          ))}
        </Reveal>
      </Container>
    </section>
  );
}
