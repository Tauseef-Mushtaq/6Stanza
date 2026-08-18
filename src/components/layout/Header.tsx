"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { BrandMark } from "@/components/ui/BrandMark";
import { MenuTrigger } from "@/components/ui/nav/NavPrimitives";
import { primaryNav, ctaRoute } from "@/config/routes";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils/cn";
import { syncHeaderHeightVar } from "@/lib/motion/headerHeight";

/**
 * Premium, minimal navigation: transparent over the hero, gains a
 * translucent dark backdrop once the page scrolls past the first
 * viewport. The 6STANZA geometric mark is the primary brand element
 * (per spec §5/§16) rather than a wordmark. Mobile menu is a simple
 * slide-down panel reusing the existing nav config/primitives.
 */
export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 64);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Single source of truth for `--header-h` (see lib/motion/headerHeight):
  // every header-safe-stage consumer reads the real rendered height
  // instead of a per-component magic number.
  useEffect(() => syncHeaderHeightVar(headerRef.current!), []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header
      ref={headerRef}
      className="fixed top-0 w-full transition-[background-color,backdrop-filter,border-color] duration-300"
      style={{
        zIndex: "var(--z-nav)",
        background: scrolled ? "rgba(5, 10, 20, 0.72)" : "transparent",
        backdropFilter: scrolled ? "blur(14px)" : "none",
        borderBottom: `1px solid ${scrolled ? "var(--color-border-inverse)" : "transparent"}`,
      }}
    >
      <Container className="flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3" aria-label={siteConfig.name}>
          <BrandMark size={30} priority className="drop-shadow-[0_0_18px_rgba(31,99,255,0.45)]" />
          <span
            className="hidden font-[var(--font-mono)] uppercase tracking-[0.2em] sm:inline"
            style={{ fontSize: "var(--text-label)", color: "var(--stz-white)" }}
          >
            {siteConfig.name}
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {primaryNav.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand-soft)]"
              style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--stz-white)" }}
            >
              {route.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href={ctaRoute.href}
            className="hidden rounded-[var(--radius-pill)] px-5 py-2.5 font-[var(--font-sans)] font-medium transition-[filter] hover:brightness-110 sm:inline-flex"
            style={{ fontSize: "var(--text-small)", background: "var(--color-brand)", color: "var(--stz-white)" }}
          >
            {ctaRoute.label}
          </Link>
          <div className="md:hidden">
            <MenuTrigger
              open={mobileOpen}
              onClick={() => setMobileOpen((v) => !v)}
              className="[&_span]:!bg-[var(--stz-white)]"
            />
          </div>
        </div>
      </Container>

      <div
        className={cn(
          "overflow-hidden transition-[max-height,opacity] duration-300 md:hidden",
          mobileOpen ? "max-h-96 opacity-100" : "pointer-events-none max-h-0 opacity-0"
        )}
        style={{ background: "rgba(5, 10, 20, 0.94)", backdropFilter: "blur(14px)" }}
      >
        <Container className="flex flex-col gap-1 py-4">
          {primaryNav.map((route, i) => (
            <Link
              key={route.href}
              href={route.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 py-3 font-[var(--font-mono)] uppercase"
              style={{ fontSize: "var(--text-nav)", letterSpacing: "var(--tracking-label)", color: "var(--stz-white)" }}
            >
              <span style={{ color: "var(--color-brand-soft)" }}>{String(i + 1).padStart(2, "0")}</span>
              {route.label}
            </Link>
          ))}
          <Link
            href={ctaRoute.href}
            onClick={() => setMobileOpen(false)}
            className="mt-3 inline-flex items-center justify-center rounded-[var(--radius-pill)] px-5 py-3 font-[var(--font-sans)] font-medium"
            style={{ background: "var(--color-brand)", color: "var(--stz-white)" }}
          >
            {ctaRoute.label}
          </Link>
        </Container>
      </div>
    </header>
  );
}
