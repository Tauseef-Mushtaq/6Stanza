import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SubtleGrid } from "@/components/ui/Divider";
import { Reveal, SplitHeading } from "@/components/motion";
import { ctaRoute } from "@/config/routes";

interface ServiceFinalCtaProps {
  serviceLabel: string;
}

/**
 * CHAPTER 06 — closing viewport (spec §12 Ch.06). Same dark/glow
 * family as the homepage and About closing chapters, with copy that
 * references the specific service rather than reusing either
 * verbatim, so each detail page still ends on its own note.
 */
export function ServiceFinalCta({ serviceLabel }: ServiceFinalCtaProps) {
  return (
    <section
      className="relative flex min-h-[70svh] w-full flex-col justify-center overflow-hidden"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}
    >
      <SubtleGrid className="opacity-30" />
      <div className="pointer-events-none absolute inset-0" style={{ background: "var(--surface-glow)" }} aria-hidden />

      <Container className="relative z-10 flex flex-col gap-8 py-24 lg:max-w-[60%]">
        <SplitHeading
          as="h2"
          unit="words"
          className="font-[var(--font-display)] tracking-tight"
          style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
        >
          Have a system that needs to move?
        </SplitHeading>

        <Reveal direction="up" delay={0.15}>
          <p className="max-w-lg" style={{ fontSize: "var(--text-body-lg)", color: "var(--color-muted-inverse)" }}>
            Tell us where {serviceLabel.toLowerCase()} fits into what
            you&apos;re building, and we&apos;ll tell you exactly how we&apos;d
            approach it.
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.25}>
          <Link
            href={ctaRoute.href}
            className="mt-2 inline-flex w-fit items-center justify-center rounded-[var(--radius-pill)] px-9 py-4 font-[var(--font-sans)] font-medium transition-[filter] hover:brightness-110"
            style={{ background: "var(--color-brand)", color: "var(--stz-white)", fontSize: "var(--text-body-lg)" }}
          >
            {ctaRoute.label}
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
