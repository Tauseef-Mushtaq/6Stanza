import type { ReactNode } from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { BrandMark } from "@/components/ui/BrandMark";

/**
 * Shared chrome for every auth page — restrained relative to the
 * marketing homepage per spec §8 ("clean + premium + technical +
 * cinematic... more restrained than the marketing homepage"): no
 * pinned scenes, no 3D, no scroll-driven motion. Just the existing
 * design tokens (color/type/spacing) and header-safe top clearance
 * (`--header-h`, same pattern every hero section already uses — see
 * e.g. `features/about/sections/AboutHero.tsx`), so these pages read
 * as unmistakably 6STANZA without competing with the header for the
 * user's attention while they're filling in a form.
 */
export function AuthShell({ title, subtitle, children, footer }: { title: string; subtitle?: string; children: ReactNode; footer?: ReactNode }) {
  return (
    <section
      className="relative flex min-h-svh w-full flex-col justify-center"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)", paddingTop: "var(--header-h)" }}
    >
      <Container className="flex w-full flex-col gap-10 py-16 sm:mx-auto sm:max-w-[420px]">
        <Link href="/" aria-label="6STANZA" className="flex items-center gap-3">
          <BrandMark size={28} className="drop-shadow-[0_0_18px_rgba(31,99,255,0.45)]" />
        </Link>

        <div className="flex flex-col gap-2">
          <h1
            className="font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "var(--text-h2)", lineHeight: "var(--leading-tight)" }}
          >
            {title}
          </h1>
          {subtitle ? (
            <p style={{ color: "var(--color-muted-inverse)", fontSize: "var(--text-body)" }}>{subtitle}</p>
          ) : null}
        </div>

        {children}

        {footer ? <div style={{ fontSize: "var(--text-body)", color: "var(--color-muted-inverse)" }}>{footer}</div> : null}
      </Container>
    </section>
  );
}

export const authLinkStyle: React.CSSProperties = { color: "var(--color-brand-soft)", textDecoration: "underline", textUnderlineOffset: "3px" };

export const authSubmitButtonClassName =
  "inline-flex w-full items-center justify-center rounded-[var(--radius-pill)] px-6 py-3.5 font-[var(--font-sans)] font-medium transition-[filter] hover:brightness-110 disabled:opacity-50 disabled:pointer-events-none";
export const authSubmitButtonStyle: React.CSSProperties = { background: "var(--color-brand)", color: "var(--stz-white)", fontSize: "var(--text-body-lg)" };
