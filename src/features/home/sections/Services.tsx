import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";
import { ServiceRail, type ServiceRailItem } from "@/features/experience/services/ServiceRail";
import { ServiceVisual } from "@/features/home/components/ServiceVisual";
import { getPublicServices } from "@/features/services/data/publicServices";
import { PublicRetryState } from "@/components/ui/PublicRetryState";

/**
 * CHAPTER 03 — the numbered/compass service progression (spec §10),
 * built on the `ServiceRail` primitive (thin curved marker rail, per
 * reference) with 6STANZA's real service list (Module 9F — now the
 * published CMS Services, request-deduped against `/services`'s own
 * reads via `getPublicServices`'s `cache()`) and an original abstract
 * visual per service.
 */
export async function Services() {
  const { ok, data: services } = await getPublicServices();
  const compassItems: ServiceRailItem[] = services.map((service) => ({
    index: service.index,
    category: service.category,
    label: service.label,
    description: service.description,
    tags: service.tags,
    visual: <ServiceVisual kind={service.visual} image={service.image} label={service.label} />,
  }));

  return (
    <section
      id="services"
      className="relative w-full"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}
    >
      <Container className="pb-16 pt-24">
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>03 — Services</TechnicalLabel>
        </Reveal>
        <Reveal direction="up" delay={0.1}>
          <h2
            className="mt-6 max-w-3xl font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
          >
            Eight disciplines. One coherent system.
          </h2>
        </Reveal>
      </Container>

      {!ok ? (
        // Module 10B (spec §6) — a failed Services read shows a
        // controlled error in this chapter only; it does not take
        // down the rest of Home.
        <Container className="pb-24">
          <PublicRetryState
            title="We couldn't load our services right now"
            description="Please try again."
          />
        </Container>
      ) : compassItems.length > 0 ? (
        <div
          style={{
            // Re-tone the shared ServiceCompass primitive for this dark
            // chapter without modifying the Module 2 component itself.
            ["--color-border" as string]: "var(--color-border-inverse)",
            ["--color-surface-elevated" as string]: "var(--stz-navy-800)",
            ["--color-text-secondary" as string]: "var(--color-muted-inverse)",
          }}
        >
          <ServiceRail items={compassItems} durationVhPerItem={0.85} />
        </div>
      ) : (
        // Module 9F — empty state (spec §18): `ServiceRail` assumes at
        // least one item, so an empty published-services collection
        // falls back to a plain message in the same chapter tone
        // instead of rendering the rail with nothing in it.
        <Container className="pb-24">
          <p style={{ fontSize: "var(--text-body-lg)", color: "var(--color-muted-inverse)" }}>
            Services are being updated — check back shortly.
          </p>
        </Container>
      )}
    </section>
  );
}
