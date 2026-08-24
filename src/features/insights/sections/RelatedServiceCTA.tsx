import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { Reveal } from "@/components/motion";
import { getPublicServiceRows } from "@/features/services/data/publicServices";

/**
 * SEO-4 — real article → service internal link (spec §16/§17), not a
 * fake anchor inside a body block (the existing `InsightBlock` union
 * has no link shape — see `related_service_slug` migration comment).
 *
 * Renders nothing when the article has no `relatedServiceSlug`, or
 * when that slug doesn't resolve to a published service (deleted/
 * unpublished since the article was written) — never a broken link
 * or an invented service name (spec §18).
 */
export async function RelatedServiceCTA({ relatedServiceSlug }: { relatedServiceSlug: string | null }) {
  if (!relatedServiceSlug) return null;

  const rows = await getPublicServiceRows();
  if (!rows.ok) return null;

  const service = rows.data.find((row) => row.slug === relatedServiceSlug);
  if (!service) return null;

  return (
    <section className="relative w-full" style={{ background: "var(--color-surface-elevated)" }}>
      <Container style={{ paddingBlock: "var(--space-lg, 4rem)" }}>
        <Reveal direction="up" className="mx-auto flex max-w-[68ch] flex-col gap-3">
          <TechnicalLabel>Related Service</TechnicalLabel>
          <Link
            href={`/services/${service.slug}`}
            className="group flex items-center justify-between gap-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand)]"
          >
            <span
              className="font-[var(--font-display)] tracking-tight transition-transform duration-300 group-hover:translate-x-1"
              style={{ fontSize: "var(--text-h3)", lineHeight: "var(--leading-snug)" }}
            >
              Explore how 6STANZA approaches {service.name}
            </span>
            <span aria-hidden style={{ color: "var(--color-brand)" }} className="shrink-0 font-[var(--font-mono)] text-2xl">
              →
            </span>
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
