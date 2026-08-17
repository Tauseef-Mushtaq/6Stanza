import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";
import { ServiceRail, type ServiceRailItem } from "@/features/experience/services/ServiceRail";
import { ServiceVisual } from "@/features/home/components/ServiceVisual";
import { services } from "@/features/home/data/services";

const compassItems: ServiceRailItem[] = services.map((service) => ({
  index: service.index,
  category: service.category,
  label: service.label,
  description: service.description,
  tags: service.tags,
  visual: <ServiceVisual kind={service.visual} />,
}));

/**
 * CHAPTER 03 — the numbered/compass service progression (spec §10),
 * built on the `ServiceRail` primitive (thin curved marker rail, per
 * reference) with 6STANZA's
 * real service list and an original abstract visual per service.
 */
export function Services() {
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
    </section>
  );
}
