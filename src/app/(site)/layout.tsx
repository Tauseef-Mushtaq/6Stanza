import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { ScrollLifecycle } from "@/components/layout/ScrollLifecycle";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCurrentProfile } from "@/lib/auth/session";

/**
 * Module 8 fix — the public marketing chrome (Header/Footer/Lenis
 * smooth-scroll/ScrollLifecycle) used to live in the root layout
 * (`src/app/layout.tsx`), which wraps *every* route including
 * `/admin/*`. Since the root layout always renders, `/admin` pages
 * got the fixed, full-width public `Header` (spec: `position: fixed`,
 * `zIndex: var(--z-nav)`) rendered on top of `AdminNav`
 * (`features/admin/components/AdminNav.tsx`) — same top-of-viewport
 * region, both clickable, the public Header sitting above it in stack
 * order. That's the "headers are mixing / admin nav not working" bug:
 * clicks in that region were landing on the fixed public Header, not
 * the in-flow admin nav underneath it.
 *
 * Fix: move the public chrome into this route-group layout
 * (`src/app/(site)/layout.tsx`), which only wraps the routes that
 * were moved into `(site)/*` — every previously-public route
 * (`/`, `/about`, `/login`, `/account`, etc.). Route groups
 * (`(site)`) don't appear in the URL, so none of those routes'
 * public paths changed. `/admin/*` was deliberately NOT moved into
 * this group, so it only ever gets the root layout's bare
 * `<html>/<body>` plus its own `AdminLayout`/`AdminNav` — the public
 * Header, Footer, and Lenis smooth-scroll no longer render there at
 * all (matches spec §11 — "avoid excessive cinematic animation inside
 * the admin area").
 *
 * `getCurrentProfile()` moved down from the root layout to here,
 * since it exists only to feed `Header`'s `authState` prop — the
 * admin routes read the profile themselves via
 * `AdminLayout`/`getCurrentProfile()`, independently.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();

  return (
    <SmoothScrollProvider>
      <ScrollLifecycle />
      <Header authState={profile ? { displayName: profile.display_name, isAdmin: profile.role === "admin" } : null} />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </SmoothScrollProvider>
  );
}
