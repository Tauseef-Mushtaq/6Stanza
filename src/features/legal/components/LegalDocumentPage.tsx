import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine, Divider } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";
import type { LegalDocument, LegalBlock } from "@/features/legal/data/types";

function Block({ block }: { block: LegalBlock }) {
  if (Array.isArray(block)) {
    return (
      <ul className="flex flex-col gap-3 pl-5">
        {block.map((item, i) => (
          <li key={i} className="list-disc" style={{ fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>
            {item}
          </li>
        ))}
      </ul>
    );
  }

  return (
    <p style={{ fontSize: "var(--text-body)", color: "var(--color-text-secondary)", lineHeight: "var(--leading-relaxed)" }}>
      {block}
    </p>
  );
}

/**
 * Shared renderer for the Privacy Policy and Terms of Service pages —
 * a single editorial long-form-prose layout consuming the typed
 * `LegalDocument` content, rather than two hand-built pages. Matches
 * the site's existing numbered-chapter visual language
 * (`AccentLine`/`TechnicalLabel`/`Divider`) instead of a generic
 * legal-boilerplate page.
 */
export function LegalDocumentPage({ document }: { document: LegalDocument }) {
  return (
    <section className="relative w-full" style={{ background: "var(--color-background)" }}>
      <Container className="flex flex-col gap-16" style={{ paddingBlock: "var(--space-section)" }}>
        <Reveal direction="up" className="flex flex-col gap-6">
          <div className="flex items-center gap-3">
            <AccentLine />
            <TechnicalLabel>Legal</TechnicalLabel>
          </div>
          <h1
            className="font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "clamp(2.25rem, 5vw, 4rem)", lineHeight: "var(--leading-tight)", color: "var(--color-text-primary)" }}
          >
            {document.title}
          </h1>
          <p style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)" }}>Last updated: {document.effectiveDate}</p>
          <p className="max-w-2xl" style={{ fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)" }}>
            {document.intro}
          </p>
        </Reveal>

        <div className="flex flex-col">
          {document.sections.map((section, i) => (
            <Reveal key={section.id} direction="up" delay={Math.min(i * 0.02, 0.2)} className="flex flex-col gap-4 py-10" style={{ borderBottom: "1px solid var(--color-border)" }}>
              <h2
                id={section.id}
                className="font-[var(--font-display)] tracking-tight scroll-mt-24"
                style={{ fontSize: "var(--text-h3)", lineHeight: "var(--leading-tight)", color: "var(--color-text-primary)" }}
              >
                {section.heading}
              </h2>
              <div className="flex max-w-3xl flex-col gap-4">
                {section.blocks.map((block, j) => (
                  <Block key={j} block={block} />
                ))}
              </div>
            </Reveal>
          ))}
        </div>

        <Divider />

        <p style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)" }}>
          Questions about this document? Visit our{" "}
          <Link href="/contact" className="underline-offset-4 hover:underline" style={{ color: "var(--color-brand)" }}>
            Contact page
          </Link>
          .
        </p>
      </Container>
    </section>
  );
}
