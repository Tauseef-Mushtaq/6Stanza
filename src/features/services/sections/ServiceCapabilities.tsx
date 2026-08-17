import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine, Divider } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";

interface ServiceCapabilitiesProps {
  capabilities: string[];
}

/**
 * CHAPTER 03 — capabilities as editorial numbered rows with dividers,
 * explicitly NOT a card grid (spec §7, §12 Ch.03). Same visual
 * language as About's "Values" chapter (numbered rows + dividers) —
 * reused as precedent rather than inventing a second version of the
 * same idea, per the Module 4A handoff's instruction.
 */
export function ServiceCapabilities({ capabilities }: ServiceCapabilitiesProps) {
  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>03 — Capabilities</TechnicalLabel>
        </Reveal>

        <div className="mt-12 flex flex-col">
          <Divider />
          {capabilities.map((capability, i) => (
            <Reveal key={capability} direction="up" delay={i * 0.05}>
              <div className="flex items-center gap-8 py-6 sm:gap-12">
                <span
                  className="font-[var(--font-mono)] tabular-nums"
                  style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-brand)" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="font-[var(--font-display)] tracking-tight"
                  style={{ fontSize: "var(--text-h3)", lineHeight: "var(--leading-tight)" }}
                >
                  {capability}
                </span>
              </div>
              <Divider />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
