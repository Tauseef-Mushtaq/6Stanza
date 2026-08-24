import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { Reveal } from "@/components/motion";
import { getPublicInsightRows } from "@/features/insights/data/publicInsights";

/** How many related articles to show — enough to be useful, not a wall of links. */
const MAX_RELATED_INSIGHTS = 3;

/**
 * SEO-5 §23 — the reverse of SEO-4's Insight → Service link
 * (`RelatedServiceCTA`). Reuses the exact same real relationship
 * (`insights.related_service_slug`, already CMS-backed since SEO-4)
 * rather than introducing a second linking mechanism — no new schema,
 * no new admin field, no new "companion" data model (spec §23: "do
 * not allow it to expand into a new CMS architecture").
 *
 * Renders nothing when zero published insights currently point at
 * this service — a graceful empty state (spec §23), not a "coming
 * soon" placeholder or an invented article.
 */
export async function RelatedInsights({ serviceSlug }: { serviceSlug: string }) {
  const rows = await getPublicInsightRows();
  if (!rows.ok) return null;

  const related = rows.data.filter((row) => row.related_service_slug === serviceSlug).slice(0, MAX_RELATED_INSIGHTS);
  if (related.length === 0) return null;

  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex flex-col gap-8">
          <TechnicalLabel>Related Insights</TechnicalLabel>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((insight) => (
              <Link
                key={insight.slug}
                href={`/insights/${insight.slug}`}
                className="group flex flex-col gap-3 rounded-[var(--radius-md)] border p-6 transition-colors hover:border-[var(--color-brand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand)]"
                style={{ borderColor: "var(--color-border)" }}
              >
                <span
                  className="font-[var(--font-mono)] uppercase"
                  style={{ fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-label)", color: "var(--color-brand)" }}
                >
                  {insight.category}
                </span>
                <span
                  className="font-[var(--font-display)] tracking-tight transition-transform duration-300 group-hover:translate-x-1"
                  style={{ fontSize: "var(--text-h4, var(--text-body-lg))", lineHeight: "var(--leading-snug)" }}
                >
                  {insight.title}
                </span>
              </Link>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
