import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";

/**
 * CHAPTER 02 — an editorial company introduction, not a card. One large
 * statement column paired with a shorter supporting column — positions
 * 6STANZA as a technology partner, not a web-dev shop for hire.
 */
export function WhoWeAre() {
  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>Who we are</TechnicalLabel>
        </Reveal>

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          <Reveal direction="up" delay={0.05} className="lg:col-span-8">
            <h2
              className="max-w-3xl font-[var(--font-display)] tracking-tight text-balance"
              style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
            >
              We&apos;re not a vendor you brief once. We&apos;re the team that
              stays close to what we build.
            </h2>
          </Reveal>

          <Reveal direction="up" delay={0.15} className="flex flex-col gap-6 lg:col-span-4">
            <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-body-lg)" }}>
              6STANZA works across strategy, software, and infrastructure —
              the full stack a company actually runs on, not just the
              interface layer.
            </p>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-body)" }}>
              We take on engagements the way an internal engineering team
              would: understanding the business first, then building
              systems designed to hold up long after launch.
            </p>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
