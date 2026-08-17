import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";

interface ServiceArchitectureProps {
  stages: string[];
}

/**
 * CHAPTER 04 — the technical approach as a lightweight flow diagram
 * (spec §12 Ch.04): a connecting line with a labeled node per stage.
 * Same abstract-line-and-node technique as About's "Direction" chapter
 * (reused deliberately rather than a new diagram mechanism) but read
 * left-to-right as a pipeline instead of a route. Pure SVG/CSS — no
 * WebGL, per spec §9/§24.
 */
export function ServiceArchitecture({ stages }: ServiceArchitectureProps) {
  return (
    <section className="relative w-full overflow-hidden" style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>04 — Approach</TechnicalLabel>
        </Reveal>

        <div className="relative mt-20 h-[220px] w-full lg:h-[260px]">
          <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            <line x1="4" y1="15" x2="96" y2="15" stroke="var(--color-border-inverse)" strokeWidth="0.15" opacity={0.7} />
            <line
              x1="4"
              y1="15"
              x2="96"
              y2="15"
              stroke="var(--color-brand)"
              strokeWidth="0.2"
              strokeDasharray="0.6 2.2"
              opacity={0.6}
            />
          </svg>

          <div className="absolute inset-0 flex items-center justify-between">
            {stages.map((stage, i) => (
              <Reveal
                key={stage}
                direction="up"
                delay={0.05 * i}
                className="flex flex-1 flex-col items-center gap-3 text-center"
              >
                <span
                  className="rounded-full"
                  style={{
                    width: i === 0 || i === stages.length - 1 ? 10 : 7,
                    height: i === 0 || i === stages.length - 1 ? 10 : 7,
                    background: "var(--color-brand)",
                    boxShadow: "0 0 14px var(--color-brand)",
                    opacity: i === 0 || i === stages.length - 1 ? 1 : 0.7,
                  }}
                />
                <span
                  className="font-[var(--font-mono)] uppercase"
                  style={{ fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-label)", color: "var(--color-muted-inverse)" }}
                >
                  {stage}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
