"use client";

import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine, SubtleGrid } from "@/components/ui/Divider";
import { Reveal, SplitHeading } from "@/components/motion";
import { DiscoveryFlow } from "@/features/discovery/components/DiscoveryFlow";

/**
 * Client-side composition root for /discovery, mirroring
 * `StartProjectPageContent`'s shape (a dark opening section + the
 * interactive body) so the two pages feel like the same product
 * rather than a bolted-on tool.
 */
export function DiscoveryPageContent() {
  return (
    <>
      <section
        className="relative flex min-h-[60svh] w-full flex-col justify-center overflow-hidden"
        style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)", paddingTop: "var(--safe-top)" }}
      >
        <SubtleGrid className="opacity-30" />
        <div className="pointer-events-none absolute inset-0" style={{ background: "var(--surface-glow)" }} aria-hidden />

        <Container className="relative z-10 flex flex-col gap-6 lg:max-w-[65%]">
          <Reveal direction="up" className="flex items-center gap-3">
            <AccentLine />
            <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>Smart Project Discovery</TechnicalLabel>
          </Reveal>

          <SplitHeading
            as="h1"
            unit="words"
            className="font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "clamp(2.25rem, 5vw, 4.5rem)", lineHeight: 1.05 }}
          >
            Not sure where to start? Answer a few questions.
          </SplitHeading>

          <Reveal direction="up" delay={0.25}>
            <p className="max-w-xl" style={{ fontSize: "var(--text-body-lg)", color: "var(--color-muted-inverse)" }}>
              Five quick questions, a recommendation of what you likely need — then you can review and edit everything
              before starting a real conversation.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="relative w-full" style={{ background: "var(--color-background)" }}>
        <Container style={{ paddingBlock: "var(--space-section)", maxWidth: "48rem" }}>
          <DiscoveryFlow />
        </Container>
      </section>
    </>
  );
}
