import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine, Divider } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";

/**
 * CHAPTER 02 — Contact Details. No email, phone, or address exists
 * anywhere in the project's config (`src/config/site.ts` has only
 * name/legalName/tagline/url) — per §12/§24, fabricating one is
 * explicitly forbidden. Rather than either inventing details or
 * leaving a hole, this is an honest, clearly-labeled placeholder row
 * that points to the real channel that *does* exist: the intake form.
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
          <div className="flex flex-col gap-2 py-8" style={{ borderBottom: "1px solid var(--color-border)" }}>
            <h3
              className="font-[var(--font-display)] tracking-tight"
              style={{ fontSize: "var(--text-h3)", lineHeight: "var(--leading-tight)" }}
            >
              Direct email &amp; phone
            </h3>
            <p style={{ color: "var(--color-text-muted)", fontSize: "var(--text-body)" }}>
              Published here soon — for now, the fastest path to us is
              the form below.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
