"use client";

import Link from "next/link";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import { BrandMark } from "@/components/ui/BrandMark";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { MenuTrigger } from "@/components/ui/nav/NavPrimitives";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { cn } from "@/lib/utils/cn";

/**
 * Module 7A — minimal admin shell (spec §3). Deliberately its own
 * component, not a reused/extended `Header` (spec §3/§18 — "clear
 * separation from the public marketing navigation" / "do not redesign
 * the public website Header"). Reuses `LogoutButton`
 * (`features/auth/components/LogoutButton.tsx`) rather than a second
 * sign-out implementation.
 *
 * FIX-2 (admin header mobile responsiveness) — root cause: all 7 nav
 * links + the display name + LogoutButton rendered in a single
 * `flex items-center gap-6` row with no wrap and no responsive
 * collapse, so anywhere below roughly 900px the row simply ran out of
 * space — links got crushed together or pushed past the viewport
 * edge, colliding with the brand mark on the left. This mirrors the
 * exact collapse pattern the public `Header.tsx` already uses
 * (`MenuTrigger` + a slide-down panel gated by `mobileOpen`), reusing
 * the same primitive and breakpoint (`md:`) rather than inventing a
 * second mobile-nav pattern, per spec §7 ("reuse existing responsive
 * conventions") and §18 ("prefer an admin-specific adjustment" over
 * changing the shared component itself — `MenuTrigger` needed no
 * changes, only new usage here).
 */

const adminLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/insights", label: "Insights" },
  { href: "/admin/users", label: "Users" },
];

const navLinkClass =
  "font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)]";
const navLinkStyle: React.CSSProperties = {
  fontSize: "var(--text-label)",
  letterSpacing: "var(--tracking-label)",
  color: "var(--color-text-secondary)",
};

export function AdminNav({ displayName }: { displayName: string | null }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className="w-full border-b"
      style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
    >
      <Container className="flex items-center justify-between gap-3 py-4">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-3"
          aria-label="Back to homepage"
          onClick={() => setMobileOpen(false)}
        >
          <BrandMark size={22} />
          <TechnicalLabel className="truncate">Admin</TechnicalLabel>
        </Link>

        {/* Desktop/tablet nav — unchanged from pre-FIX-2 markup, just gated behind `md:flex` */}
        <nav aria-label="Admin" className="hidden items-center gap-6 md:flex">
          <Link href="/" className={navLinkClass} style={navLinkStyle}>
            ← Homepage
          </Link>
          {adminLinks.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClass} style={navLinkStyle}>
              {link.label}
            </Link>
          ))}
          {displayName ? (
            <span
              className="font-[var(--font-mono)] uppercase"
              style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-muted)" }}
            >
              {displayName}
            </span>
          ) : null}
          <LogoutButton />
        </nav>

        {/* Mobile trigger — same primitive/breakpoint the public Header uses */}
        <div className="md:hidden">
          <MenuTrigger open={mobileOpen} onClick={() => setMobileOpen((v) => !v)} />
        </div>
      </Container>

      {/* Mobile collapse panel */}
      <div
        className={cn(
          "overflow-y-auto border-t transition-[max-height,opacity] duration-300 md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        style={{
          borderColor: "var(--color-border)",
          background: "var(--color-surface)",
          maxHeight: mobileOpen ? "calc(100svh - var(--header-h))" : "0px",
        }}
      >
        <Container className="flex flex-col gap-1 py-3">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="flex min-h-[44px] items-center py-2 font-[var(--font-mono)] uppercase"
            style={navLinkStyle}
          >
            ← Homepage
          </Link>
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="flex min-h-[44px] items-center py-2 font-[var(--font-mono)] uppercase"
              style={navLinkStyle}
            >
              {link.label}
            </Link>
          ))}
          <div
            className="mt-2 flex items-center justify-between border-t pt-3"
            style={{ borderColor: "var(--color-border)" }}
          >
            {displayName ? (
              <span
                className="truncate font-[var(--font-mono)] uppercase"
                style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-muted)" }}
              >
                {displayName}
              </span>
            ) : (
              <span />
            )}
            <LogoutButton />
          </div>
        </Container>
      </div>
    </header>
  );
}
