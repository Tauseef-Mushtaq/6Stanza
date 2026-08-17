import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";

const markets = [
  { label: "Pakistan", note: "Where we build today" },
  { label: "Saudi Arabia", note: "Next" },
  { label: "UAE", note: "Next" },
  { label: "International", note: "Ahead" },
];

/**
 * CHAPTER 06 — Our Direction. Forward-looking, not a claim of current
 * presence: Pakistan is where 6STANZA operates now; the others are
 * stated as ambition/direction, not existing offices or clients
 * (per §10's content rules).
 */
export function Direction() {
  return (
    <section className="relative w-full overflow-hidden" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>06 — Our Direction</TechnicalLabel>
        </Reveal>
        <Reveal direction="up" delay={0.05}>
          <h2
            className="mt-6 max-w-2xl font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
          >
            Building from Pakistan. Aiming further.
          </h2>
        </Reveal>
        <Reveal direction="up" delay={0.1}>
          <p className="mt-4 max-w-xl" style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-body-lg)" }}>
            We&apos;re based in Pakistan, and that&apos;s where our work is
            grounded. The direction we&apos;re building toward extends
            further — the Gulf, and international clients beyond it.
          </p>
        </Reveal>

        {/* Abstract expanding-route visual — coordinates/points, not a
            literal map, per §10's "sophisticated and subtle" note. */}
        <div className="relative mt-20 h-[260px] w-full lg:h-[320px]">
          <svg viewBox="0 0 100 30" preserveAspectRatio="none" className="absolute inset-0 h-full w-full" aria-hidden>
            <line x1="4" y1="15" x2="96" y2="15" stroke="var(--color-border)" strokeWidth="0.15" opacity={0.6} />
            {markets.map((_, i) => (
              <line
                key={i}
                x1={4 + (i * 92) / (markets.length - 1)}
                y1="15"
                x2={4 + (i * 92) / (markets.length - 1)}
                y2={i === 0 ? "15" : "6"}
                stroke="var(--color-brand)"
                strokeWidth="0.15"
                opacity={i === 0 ? 0 : 0.5}
              />
            ))}
          </svg>

          <div className="absolute inset-0 flex items-end justify-between">
            {markets.map((market, i) => (
              <Reveal key={market.label} direction="up" delay={0.05 * i} className="flex flex-col items-center gap-3" style={{ width: `${100 / markets.length}%` }}>
                <span
                  className="rounded-full"
                  style={{
                    width: i === 0 ? 10 : 7,
                    height: i === 0 ? 10 : 7,
                    background: i === 0 ? "var(--color-brand)" : "transparent",
                    border: i === 0 ? "none" : "1.5px solid var(--color-brand)",
                    boxShadow: i === 0 ? "0 0 14px var(--color-brand)" : "none",
                    opacity: i === 0 ? 1 : 0.7,
                  }}
                />
                <div className="flex flex-col items-center gap-1 text-center">
                  <span
                    className="font-[var(--font-display)] tracking-tight"
                    style={{ fontSize: "var(--text-body-lg)" }}
                  >
                    {market.label}
                  </span>
                  <span
                    className="font-[var(--font-mono)] uppercase"
                    style={{ fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-muted)" }}
                  >
                    {market.note}
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
