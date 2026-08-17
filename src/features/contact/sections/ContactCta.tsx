import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SubtleGrid } from "@/components/ui/Divider";
import { Reveal, SplitHeading } from "@/components/motion";
import { ctaRoute } from "@/config/routes";

/**
 * CHAPTER 03 — Start a Project CTA. This page functions as the general
 * doorway; the actual structured intake happens at /start-project.
 */
export function ContactCta() {
  return (
    <section
      className="relative flex min-h-[60svh] w-full flex-col justify-center overflow-hidden"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}
    >
      <SubtleGrid className="opacity-25" />
      <Container className="relative z-10 flex flex-col gap-8 py-20 lg:max-w-[60%]">
        <SplitHeading
          as="h2"
          unit="words"
          className="font-[var(--font-display)] tracking-tight"
          style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
        >
          Have a project in mind?
        </SplitHeading>
        <Reveal direction="up" delay={0.15}>
          <Link
            href={ctaRoute.href}
            className="inline-flex w-fit items-center justify-center rounded-[var(--radius-pill)] px-9 py-4 font-[var(--font-sans)] font-medium transition-[filter] hover:brightness-110"
            style={{ background: "var(--color-brand)", color: "var(--stz-white)", fontSize: "var(--text-body-lg)" }}
          >
            {ctaRoute.label}
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
