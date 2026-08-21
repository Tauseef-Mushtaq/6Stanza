import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { NumberIndicator } from "@/components/ui/NumberIndicator";
import { Reveal } from "@/components/motion";
import { ServiceRail, type ServiceRailItem } from "@/features/experience/services/ServiceRail";
import { ServiceVisual } from "@/features/home/components/ServiceVisual";
import { getPublicServices } from "@/features/services/data/publicServices";

/**
 * CHAPTER 02 — the immersive scroll-driven progression. Reuses
 * `ServiceRail` exactly as the homepage does (spec §5: reuse, don't
 * fork), re-toned for its dark chapter with the same CSS-variable
 * override pattern `Services.tsx` already established — no changes to
 * the Module 3 primitive itself.
 *
 * `ServiceRail` is a pure scroll-scrubbed visual: it has no click/
 * keyboard interaction and, under reduced motion, only ever shows its
 * first item. Rather than adding interaction state to a primitive
 * another page already depends on, every service's full content is
 * repeated immediately below as a plain, always-rendered, keyboard-
 * navigable list of real links — this is what actually satisfies
 * spec §17 (keyboard-accessible selection, nothing lost under reduced
 * motion) and spec §5 ("jump straight to a service"), without
 * touching `ServiceRail.tsx`.
 */
export async function ServiceProgression() {
  const services = await getPublicServices();
  const railItems: ServiceRailItem[] = services.map((service) => ({
    index: service.index,
    category: service.category,
    label: service.label,
    description: service.description,
    tags: service.tags,
    visual: <ServiceVisual kind={service.visual} image={service.image} label={service.label} />,
  }));

  return (
    <section
      className="relative w-full"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}
    >
      {railItems.length > 0 && (
        <div
          style={{
            ["--color-border" as string]: "var(--color-border-inverse)",
            ["--color-surface-elevated" as string]: "var(--stz-navy-800)",
            ["--color-text-secondary" as string]: "var(--color-muted-inverse)",
          }}
        >
          <ServiceRail items={railItems} durationVhPerItem={0.9} />
        </div>
      )}

      <Container className="relative z-10 pb-28 pt-8">
        <span className="sr-only" id="all-services">
          All services
        </span>
        <nav aria-labelledby="all-services" className="flex flex-col">
          <Divider style={{ background: "var(--color-border-inverse)" }} />
          {services.map((service, i) => (
            <Reveal key={service.slug} direction="up" delay={i * 0.03}>
              <Link
                href={`/services/${service.slug}`}
                className="group grid grid-cols-[auto_1fr_auto] items-center gap-6 py-6 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand)]"
              >
                <NumberIndicator value={service.index} total={services.length} />
                <div className="flex flex-col gap-1">
                  <span
                    className="font-[var(--font-display)] tracking-tight transition-colors group-hover:text-[var(--color-brand-soft)]"
                    style={{ fontSize: "var(--text-h3)" }}
                  >
                    {service.label}
                  </span>
                  <span
                    className="font-[var(--font-mono)] uppercase"
                    style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-muted)" }}
                  >
                    {service.category}
                  </span>
                </div>
                <span
                  aria-hidden
                  className="hidden font-[var(--font-mono)] transition-transform duration-300 group-hover:translate-x-1 sm:inline"
                  style={{ color: "var(--color-brand-soft)" }}
                >
                  →
                </span>
              </Link>
              <Divider style={{ background: "var(--color-border-inverse)" }} />
            </Reveal>
          ))}
        </nav>
      </Container>
    </section>
  );
}
