import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { Divider } from "@/components/ui/Divider";
import { Reveal, SplitHeading } from "@/components/motion";
import type { Insight } from "@/features/insights/data/insights";

/**
 * Article detail footer (§27) — "Next Insight" as a large link (same
 * weight as the site's other closing chapters), plus an explicit
 * back-to-index link. Both are real `<Link>`s, keyboard accessible.
 */
export function ArticleFooter({ next }: { next: Insight }) {
  return (
    <section className="relative w-full" style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Divider className="mb-10" style={{ background: "var(--color-border-inverse)" }} />

        <Reveal direction="up">
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>Next Insight</TechnicalLabel>
        </Reveal>

        <Link
          href={`/insights/${next.slug}`}
          className="group mt-6 flex flex-col gap-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand)] sm:flex-row sm:items-center sm:justify-between"
        >
          <SplitHeading
            as="h2"
            unit="words"
            className="max-w-2xl font-[var(--font-display)] tracking-tight transition-transform duration-300 group-hover:translate-x-1"
            style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
          >
            {next.title}
          </SplitHeading>
          <span
            className="shrink-0 font-[var(--font-mono)] text-3xl transition-transform duration-300 group-hover:translate-x-1.5"
            style={{ color: "var(--color-brand)" }}
            aria-hidden
          >
            →
          </span>
        </Link>

        <Reveal direction="up" delay={0.1} className="mt-14">
          <Link
            href="/insights"
            className="inline-flex items-center gap-2 font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand)]"
            style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-muted-inverse)" }}
          >
            <span aria-hidden>←</span> Back to Insights
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
