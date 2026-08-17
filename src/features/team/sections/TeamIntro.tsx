import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";

/**
 * CHAPTER 02 — a short editorial statement, not "our talented team of
 * professionals" copy. Grounded in the company's actual positioning
 * (technology partner, not a web-dev shop — see the homepage
 * Positioning chapter / About's WhoWeAre) rather than invented
 * biography or achievements.
 */
export function TeamIntro() {
  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>02 — Who Builds It</TechnicalLabel>
        </Reveal>

        <Reveal direction="up" delay={0.1}>
          <p
            className="mt-6 max-w-3xl font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "var(--text-h2)", lineHeight: "var(--leading-tight)" }}
          >
            Strategy, software, systems, and security — under one roof,
            working the same way on every engagement.
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.2}>
          <p className="mt-6 max-w-xl" style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-body-lg)" }}>
            6STANZA isn&apos;t organized around job titles for their own
            sake. Each person owns a discipline end-to-end — architecture,
            interface, infrastructure, threat modeling — and works
            directly with the others rather than through layers of
            handoff.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
