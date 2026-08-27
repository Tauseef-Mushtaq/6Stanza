"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Container } from "@/components/ui/Container";
import { BrandMark } from "@/components/ui/BrandMark";
import { MenuTrigger } from "@/components/ui/nav/NavPrimitives";
import { primaryNav, ctaRoute } from "@/config/routes";
import { siteConfig, whatsappLink } from "@/config/site";
import { cn } from "@/lib/utils/cn";
import { syncHeaderHeightVar } from "@/lib/motion/headerHeight";
import { logoutAction } from "@/features/auth/actions";

/**
 * Module 6 — session-aware auth state (spec §7). `authState` is
 * resolved server-side once, in the root layout
 * (`getCurrentProfile()` via `src/app/layout.tsx`), and passed down as
 * a plain prop — `Header` itself stays a client component (it already
 * needs client state for scroll/mobile-menu) but never fetches or
 * subscribes to auth state on its own. This means the header's
 * authenticated/anonymous state is only ever as fresh as the last full
 * navigation: correct here because every auth action that changes it
 * (`loginAction`, `logoutAction`) redirects on success, which is a
 * real navigation and re-runs the root layout server-side — there's no
 * case in this app where the session changes without one.
 *
 * Deliberately minimal per spec §7: display name (if any) + logout
 * when authenticated, log in when not — no account dropdown, no role
 * badge, no dashboard link (none exists yet).
 */
export interface HeaderAuthState {
  displayName: string | null;
  isAdmin?: boolean;
}

/**
 * Active-route check for nav highlighting. Home ("/") only matches
 * the exact path — every other route also matches its own detail
 * pages (e.g. `/services/[slug]` keeps "Services" highlighted), same
 * logic used for both the desktop and mobile nav lists below.
 */
function isRouteActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header({ authState }: { authState: HeaderAuthState | null }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Close the account dropdown on outside click.
  useEffect(() => {
    if (!accountOpen) return;
    const onClick = (e: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) setAccountOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [accountOpen]);

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
        <Link
          href="/"
          className="flex items-center gap-3"
          aria-label={siteConfig.name}
          aria-current={pathname === "/" ? "page" : undefined}
        >
          <BrandMark size={30} priority className="drop-shadow-[0_0_18px_rgba(31,99,255,0.45)]" />
          <span
            className="hidden font-[var(--font-mono)] uppercase tracking-[0.2em] sm:inline"
            style={{ fontSize: "var(--text-label)", color: pathname === "/" ? "var(--color-brand-soft)" : "var(--stz-white)" }}
          >
            {siteConfig.name}
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {primaryNav.map((route) => {
            const active = isRouteActive(route.href, pathname);
            return (
              <Link
                key={route.href}
                href={route.href}
                aria-current={active ? "page" : undefined}
                className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand-soft)]"
                style={{
                  fontSize: "var(--text-label)",
                  letterSpacing: "var(--tracking-label)",
                  color: active ? "var(--color-brand-soft)" : "var(--stz-white)",
                  paddingBottom: "2px",
                  borderBottom: `1.5px solid ${active ? "var(--color-brand-soft)" : "transparent"}`,
                }}
              >
                {route.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          {authState ? (
            <div ref={accountRef} className="relative hidden sm:block">
              <button
                type="button"
                onClick={() => setAccountOpen((v) => !v)}
                aria-expanded={accountOpen}
                className="flex items-center gap-2 font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand-soft)]"
                style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--stz-white)" }}
              >
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full"
                  style={{ background: "var(--color-brand)", color: "var(--stz-white)", fontSize: "var(--text-label)" }}
                  aria-hidden
                >
                  {(authState.displayName ?? "A").charAt(0).toUpperCase()}
                </span>
                <svg
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  aria-hidden
                  className={cn("transition-transform duration-200", accountOpen && "rotate-180")}
                >
                  <path d="M1 3l4 4 4-4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>

              <div
                className={cn(
                  "absolute right-0 top-full mt-3 w-48 origin-top-right rounded-[var(--radius-md)] border py-2 transition-[opacity,transform] duration-150",
                  accountOpen ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-1 opacity-0"
                )}
                style={{
                  background: "rgba(8, 14, 26, 0.98)",
                  borderColor: "var(--color-border-inverse)",
                  backdropFilter: "blur(14px)",
                }}
              >
                <div
                  className="truncate px-4 pb-2 font-[var(--font-mono)] uppercase"
                  style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-muted-inverse)" }}
                >
                  {authState.displayName ?? "Account"}
                </div>
                {authState.isAdmin ? (
                  <Link
                    href="/admin"
                    onClick={() => setAccountOpen(false)}
                    className="block px-4 py-2 font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand-soft)]"
                    style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--stz-white)" }}
                  >
                    Admin
                  </Link>
                ) : null}
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="block w-full px-4 py-2 text-left font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand-soft)]"
                    style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--stz-white)" }}
                  >
                    Log out
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="hidden font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand-soft)] sm:inline"
              style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--stz-white)" }}
            >
              Log in
            </Link>
          )}
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

      {/*
        Mobile-auth patch: the panel previously capped at a fixed
        `max-h-96` (384px) with `overflow-hidden`. With 6 primaryNav
        links + the CTA button + this auth row, total content height
        (~400-430px including padding) already exceeds that cap on most
        phones — so Login/Logout was rendered in the DOM the whole
        time, just visually clipped off the bottom of the panel. Fixed
        by sizing the open state to the actual available viewport
        height below the header instead of a guessed fixed number, and
        switching `overflow-hidden` to `overflow-y-auto` so if content
        ever exceeds even that (a very short viewport, or more nav
        links added later), it scrolls into view instead of silently
        clipping again.
      */}
      <div
        className={cn(
          "overflow-y-auto transition-[max-height,opacity] duration-300 md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        style={{
          background: "rgba(5, 10, 20, 0.94)",
          backdropFilter: "blur(14px)",
          maxHeight: mobileOpen ? "calc(100svh - var(--header-h))" : "0px",
        }}
      >
        <Container className="flex flex-col gap-1 py-4">
          {primaryNav.map((route, i) => {
            const active = isRouteActive(route.href, pathname);
            return (
              <Link
                key={route.href}
                href={route.href}
                onClick={() => setMobileOpen(false)}
                aria-current={active ? "page" : undefined}
                className="flex items-center gap-3 py-3 font-[var(--font-mono)] uppercase"
                style={{
                  fontSize: "var(--text-nav)",
                  letterSpacing: "var(--tracking-label)",
                  color: active ? "var(--color-brand-soft)" : "var(--stz-white)",
                }}
              >
                <span style={{ color: "var(--color-brand-soft)" }}>{String(i + 1).padStart(2, "0")}</span>
                {route.label}
              </Link>
            );
          })}
          <Link
            href={ctaRoute.href}
            onClick={() => setMobileOpen(false)}
            className="mt-3 inline-flex items-center justify-center rounded-[var(--radius-pill)] px-5 py-3 font-[var(--font-sans)] font-medium"
            style={{ background: "var(--color-brand)", color: "var(--stz-white)" }}
          >
            {ctaRoute.label}
          </Link>
          <Link
            href={whatsappLink("Hi 6STANZA, I'd like to get in touch.")}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMobileOpen(false)}
            className="mt-2 inline-flex items-center justify-center rounded-[var(--radius-pill)] px-5 py-3 font-[var(--font-sans)] font-medium"
            style={{ background: "#25D366", color: "#ffffff" }}
          >
            Chat on WhatsApp
          </Link>
          {authState?.isAdmin ? (
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="mt-3 flex items-center border-t py-3 font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand-soft)]"
              style={{ fontSize: "var(--text-nav)", letterSpacing: "var(--tracking-label)", color: "var(--stz-white)", borderColor: "var(--color-border-inverse)" }}
            >
              Admin
            </Link>
          ) : null}
          {authState ? (
            <form action={logoutAction} className={cn("border-t", authState.isAdmin && "border-t-0")} style={{ borderColor: "var(--color-border-inverse)" }}>
              <button
                type="submit"
                className="flex w-full items-center py-3 font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand-soft)]"
                style={{ fontSize: "var(--text-nav)", letterSpacing: "var(--tracking-label)", color: "var(--stz-white)" }}
              >
                Log out{authState.displayName ? ` — ${authState.displayName}` : ""}
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              onClick={() => setMobileOpen(false)}
              className="mt-3 flex items-center border-t py-3 font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand-soft)]"
              style={{ fontSize: "var(--text-nav)", letterSpacing: "var(--tracking-label)", color: "var(--stz-white)", borderColor: "var(--color-border-inverse)" }}
            >
              Log in
            </Link>
          )}
        </Container>
      </div>
    </header>
  );
}
