import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine, Divider } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";
import type { Insight } from "@/features/insights/data/insights";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

/**
 * CHAPTER 03 — the remaining articles as a numbered editorial list
 * (§20): large row typography, dividers, hover movement — a technology
 * publication's index, not `[card] [card] [card]`.
 */
export function InsightsList({ insights }: { insights: Insight[] }) {
  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>More Insights</TechnicalLabel>
        </Reveal>

        <div className="mt-10 flex flex-col">
          <Divider />
          {insights.map((insight, i) => (
            <Reveal key={insight.slug} direction="up" delay={i * 0.04}>
              <Link
                href={`/insights/${insight.slug}`}
                className="group flex flex-col gap-3 py-8 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand)] sm:flex-row sm:items-center sm:justify-between sm:gap-6"
              >
                <div className="flex items-start gap-5 sm:items-center">
                  <span
                    className="font-[var(--font-display)] tabular-nums"
                    style={{ fontSize: "var(--text-h3)", color: "var(--color-brand)", opacity: 0.8, lineHeight: 1 }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex flex-col gap-2">
                    <h3
                      className="font-[var(--font-display)] tracking-tight transition-transform duration-300 group-hover:translate-x-1"
                      style={{ fontSize: "var(--text-h3)", lineHeight: "var(--leading-tight)" }}
                    >
                      {insight.title}
                    </h3>
                    <span
                      className="font-[var(--font-mono)] uppercase"
                      style={{ fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-muted)" }}
                    >
                      {insight.category} · {formatDate(insight.date)}
                    </span>
                  </div>
                </div>
                <span
                  className="ml-auto shrink-0 font-[var(--font-mono)] text-2xl transition-transform duration-300 group-hover:translate-x-1.5 sm:ml-0"
                  style={{ color: "var(--color-brand)" }}
                  aria-hidden
                >
                  →
                </span>
              </Link>
              <Divider />
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
