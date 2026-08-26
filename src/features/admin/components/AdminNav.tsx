"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
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
 * FIX-2 (admin header mobile responsiveness) — root cause: all nav
 * links + the display name + LogoutButton rendered in a single
 * `flex items-center gap-6` row with no wrap and no responsive
 * collapse, so anywhere below roughly 900px the row simply ran out of
 * space. Mirrors the public `Header.tsx`'s collapse pattern
 * (`MenuTrigger` + a slide-down panel gated by `mobileOpen`), reusing
 * the same primitive and breakpoint (`md:`) rather than inventing a
 * second mobile-nav pattern.
 *
 * FIX-3 (admin header overcrowding at md/lg) — root cause: as admin
 * sections were added one at a time, the desktop row kept growing
 * (now 9 destinations) with nothing ever removed from the flat list,
 * so even above the `md` breakpoint the row was visually packed and,
 * on narrower "desktop" widths (laptop windows, not just phones), the
 * mono/letter-spaced labels crowded into the display name and Logout
 * button. Splits `adminLinks` into `primaryLinks` (the destinations an
 * admin opens most often day-to-day: Dashboard, Inquiries, Bookings)
 * shown directly, and `moreLinks` (the CMS/content and user-management
 * pages: Services, Projects, Team, Testimonials, Insights, Users)
 * tucked behind a "More" dropdown — same underlying `<Link>` markup
 * and styling as before, just grouped, so this is a layout change,
 * not a navigation change: every existing destination is still one
 * click away, nothing was removed or renamed. The mobile collapse
 * panel is left as a single flat list (its stacked-card layout has
 * room to breathe vertically, so it never had the crowding problem
 * the desktop row did).
 */

const primaryLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/inquiries", label: "Inquiries" },
  { href: "/admin/consultation-bookings", label: "Bookings" },
];

const moreLinks = [
  { href: "/admin/services", label: "Services" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/team", label: "Team" },
  { href: "/admin/testimonials", label: "Testimonials" },
  { href: "/admin/insights", label: "Insights" },
  { href: "/admin/users", label: "Users" },
];

const adminLinks = [...primaryLinks, ...moreLinks];

const navLinkClass =
  "font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)]";
const navLinkStyle: React.CSSProperties = {
  fontSize: "var(--text-label)",
  letterSpacing: "var(--tracking-label)",
  color: "var(--color-text-secondary)",
};

/** Desktop-only "More" dropdown for the secondary admin destinations (FIX-3). Closes on outside click, Escape, or navigation. */
function MoreMenu() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const containerRef = useRef<HTMLDivElement>(null);
  const isActive = moreLinks.some((link) => pathname === link.href || pathname.startsWith(`${link.href}/`));
  const previousPathnameRef = useRef(pathname);

  // Close the dropdown when navigation actually happens, without calling
  // setState unconditionally on every render this effect runs for
  // (react-hooks/set-state-in-effect) — only when `pathname` has actually
  // changed since the last render, mirroring the guarded-effect pattern
  // elsewhere in this codebase rather than resetting state every run.
  useEffect(() => {
    if (previousPathnameRef.current !== pathname) {
      previousPathnameRef.current = pathname;
      setOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(navLinkClass, "flex items-center gap-1")}
        style={{ ...navLinkStyle, color: isActive ? "var(--color-brand)" : navLinkStyle.color }}
      >
        More
        <span aria-hidden style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms" }}>
          ▾
        </span>
      </button>

      <div
        role="menu"
        className={cn(
          "absolute right-0 top-full z-10 mt-2 flex min-w-[10rem] flex-col gap-1 rounded-[var(--radius-md)] border p-2 shadow-[var(--shadow-lg)] transition-[opacity,transform] duration-150",
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
        )}
        style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}
      >
        {moreLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            role="menuitem"
            onClick={() => setOpen(false)}
            className="rounded-[var(--radius-sm)] px-3 py-2 font-[var(--font-mono)] uppercase transition-colors hover:bg-[var(--color-background)] hover:text-[var(--color-brand)]"
            style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
          >
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

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

        {/* Desktop/tablet nav — primary destinations shown directly, everything else behind "More" (FIX-3) */}
        <nav aria-label="Admin" className="hidden items-center gap-6 md:flex">
          <Link href="/" className={navLinkClass} style={navLinkStyle}>
            ← Homepage
          </Link>
          {primaryLinks.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClass} style={navLinkStyle}>
              {link.label}
            </Link>
          ))}
          <MoreMenu />
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

      {/* Mobile collapse panel — kept as a single flat list; stacked vertically it has room for every destination without the desktop row's crowding */}
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
