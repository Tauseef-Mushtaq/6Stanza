import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine, SubtleGrid } from "@/components/ui/Divider";
import { NumberIndicator } from "@/components/ui/NumberIndicator";
import { Reveal, SplitHeading, Parallax } from "@/components/motion";
import { ServiceVisual } from "@/features/home/components/ServiceVisual";
import type { ServiceItem } from "@/features/home/data/services";

interface ServiceDetailHeroProps {
  service: ServiceItem;
  total: number;
  prev: ServiceItem;
  next: ServiceItem;
}

/**
 * CHAPTER 01 — service detail hero. A split composition (statement
 * left, `ServiceVisual` right) in the same dark/glow family as the
 * homepage and About heroes, with prev/next service links so the
 * page reads as one connected system rather than eight isolated
 * pages (spec §12 Ch.01).
 */
export function ServiceDetailHero({ service, total, prev, next }: ServiceDetailHeroProps) {
  return (
    <section
      className="relative flex min-h-svh w-full flex-col justify-center overflow-hidden"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)", paddingTop: "var(--safe-top)" }}
    >
      <SubtleGrid className="opacity-30" />
      <Parallax speed={0.2} className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0" style={{ background: "var(--surface-glow)" }} />
      </Parallax>

      <Container className="relative z-10 grid grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-10">
        <div className="flex flex-col gap-7">
          <Reveal direction="up" className="flex items-center gap-4">
            <NumberIndicator value={service.index} total={total} />
            <AccentLine />
            <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>{service.category}</TechnicalLabel>
          </Reveal>

          <SplitHeading
            as="h1"
            unit="words"
            className="max-w-xl font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "clamp(2.5rem, 5.5vw, 5rem)", lineHeight: 1.05 }}
          >
            {service.label}
          </SplitHeading>

          <Reveal direction="up" delay={0.3}>
            <p className="max-w-md" style={{ fontSize: "var(--text-body-lg)", color: "var(--color-muted-inverse)" }}>
              {service.description}
            </p>
          </Reveal>

          <Reveal direction="up" delay={0.4} className="flex items-center gap-6 pt-4">
            <Link
              href={`/services/${prev.slug}`}
              className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand)]"
              style={{ fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-muted)" }}
            >
              ← {prev.label}
            </Link>
            <Link
              href={`/services/${next.slug}`}
              className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand)]"
              style={{ fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-muted)" }}
            >
              {next.label} →
            </Link>
          </Reveal>
        </div>

        <Reveal direction="up" delay={0.15} className="mx-auto w-full max-w-md lg:max-w-none">
          <ServiceVisual kind={service.visual} />
        </Reveal>
      </Container>
    </section>
  );
}
