import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine, SubtleGrid } from "@/components/ui/Divider";
import { Reveal, SplitHeading, Parallax } from "@/components/motion";
import { getPublicServices } from "@/features/services/data/publicServices";

/**
 * CHAPTER 01 — Services index hero. Same visual family as About's
 * hero (dark, centered, mark-adjacent label, `SplitHeading` statement,
 * `--header-h` top clearance for the fixed header) so the two
 * secondary-page openers read as siblings — but left-anchored instead
 * of centered, and carries a service-count indicator instead of the
 * brand mark, so it doesn't read as a copy.
 */
export async function ServicesHero() {
  const services = await getPublicServices();

  return (
    <section
      className="relative flex min-h-svh w-full flex-col justify-center overflow-hidden"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)", paddingTop: "var(--safe-top)" }}
    >
      <SubtleGrid className="opacity-30" />
      <Parallax speed={0.25} className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute inset-0" style={{ background: "var(--surface-glow)" }} />
      </Parallax>

      <Container className="relative z-10 flex flex-col gap-8">
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>Services</TechnicalLabel>
          <span
            className="font-[var(--font-mono)] tabular-nums"
            style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-muted)" }}
          >
            01 – {String(services.length).padStart(2, "0")}
          </span>
        </Reveal>

        <SplitHeading
          as="h1"
          unit="words"
          className="max-w-4xl font-[var(--font-display)] tracking-tight"
          style={{ fontSize: "clamp(2.75rem, 6.5vw, 6.5rem)", lineHeight: 1.05 }}
        >
          Technology engineered around how your business needs to move.
        </SplitHeading>

        <Reveal direction="up" delay={0.3}>
          <p className="max-w-xl" style={{ fontSize: "var(--text-body-lg)", color: "var(--color-muted-inverse)" }}>
            Eight disciplines, one system. Scroll to move through them, or
            jump straight to the one you need below.
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
