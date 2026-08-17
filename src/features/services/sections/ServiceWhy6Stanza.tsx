import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";
import { sixS } from "@/features/home/data/sixS";

interface ServiceWhy6StanzaProps {
  principleIndices: number[];
}

/**
 * CHAPTER 05 — connects this service to the Six S operating philosophy
 * (spec §12 Ch.05), subtly: a short line plus the 2–3 relevant
 * principles as a compact inline row, not a restaging of the
 * homepage's full pinned/curved Six S chapter (explicitly warned
 * against in the brief). Principles are looked up from the existing
 * `sixS` data — nothing duplicated or hardcoded here.
 */
export function ServiceWhy6Stanza({ principleIndices }: ServiceWhy6StanzaProps) {
  const principles = sixS.filter((p) => principleIndices.includes(p.index));

  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>05 — Why 6STANZA</TechnicalLabel>
        </Reveal>

        <Reveal direction="up" delay={0.1}>
          <p className="mt-6 max-w-xl" style={{ fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)" }}>
            This work draws most directly on:
          </p>
        </Reveal>

        <div className="mt-8 flex flex-wrap gap-x-12 gap-y-6">
          {principles.map((principle, i) => (
            <Reveal key={principle.index} direction="up" delay={0.1 + i * 0.06} className="flex items-baseline gap-3">
              <span
                className="font-[var(--font-mono)] tabular-nums"
                style={{ fontSize: "var(--text-label)", color: "var(--color-brand)" }}
              >
                {String(principle.index).padStart(2, "0")}
              </span>
              <span className="font-[var(--font-display)] tracking-tight" style={{ fontSize: "var(--text-h3)" }}>
                {principle.label}
              </span>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
