import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine, Divider } from "@/components/ui/Divider";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { Reveal } from "@/components/motion";
import { whatsappLink } from "@/config/site";

/**
 * CHAPTER 02 — Contact Details. Email/phone/address are still
 * intentionally absent from `src/config/site.ts` (per §12/§24,
 * fabricating one is forbidden), but WhatsApp Business is now a real,
 * configured channel (`whatsappLink()` in site config) — so that row
 * links out to it directly instead of being a placeholder.
 */
export function ContactDetails() {
  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>02 — Direct Contact</TechnicalLabel>
        </Reveal>

        <div className="mt-10 flex flex-col">
          <Divider />
          <div className="flex flex-col gap-2 py-8 sm:flex-row sm:items-baseline sm:justify-between" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <h3
              className="font-[var(--font-display)] tracking-tight"
              style={{ fontSize: "var(--text-h3)", lineHeight: "var(--leading-tight)" }}
            >
              Project inquiries
            </h3>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-body)" }}>
              Use the project intake form — it&apos;s the fastest way to
              reach the team with the right context.
            </p>
          </div>
          <div className="flex flex-col gap-2 py-8 sm:flex-row sm:items-baseline sm:justify-between" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <h3
              className="font-[var(--font-display)] tracking-tight"
              style={{ fontSize: "var(--text-h3)", lineHeight: "var(--leading-tight)" }}
            >
              WhatsApp Business
            </h3>
            <a
              href={whatsappLink("Hi 6STANZA, I'd like to get in touch.")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)]"
              style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
            >
              Chat with us →
            </a>
          </div>
          <div className="flex flex-col gap-4 py-8 sm:flex-row sm:items-baseline sm:justify-between">
            <h3
              className="font-[var(--font-display)] tracking-tight"
              style={{ fontSize: "var(--text-h3)", lineHeight: "var(--leading-tight)" }}
            >
              Follow along
            </h3>
            <SocialLinks size={20} />
          </div>
        </div>
      </Container>
    </section>
  );
}
