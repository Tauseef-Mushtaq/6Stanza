import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/session";
import { AdminNav } from "@/features/admin/components/AdminNav";
import { Container } from "@/components/ui/Container";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s — Admin",
  },
  robots: { index: false, follow: false },
};

/**
 * Module 7A — every route under `/admin` shares this layout, and this
 * layout is the server-side authorization boundary (spec §2). Reads
 * the profile directly (rather than `requireAdmin()`, which throws)
 * so an anonymous or non-admin visitor gets a real redirect instead of
 * falling into the generic error boundary — same shape as
 * `requireProfileOrRedirect()` (Module 6, `lib/auth/session.ts`), just
 * with an extra role check: anonymous goes to `/login`, authenticated
 * non-admin goes back to `/`, and neither case ever renders any admin
 * page or fetches any admin data.
 *
 * `middleware.ts` also redirects an anonymous visitor away from
 * `/admin` before this ever runs — same defense-in-depth relationship
 * `/account` already has with its own page-level check (spec §5).
 * Middleware can't check the `admin` role itself (it would need a
 * database round trip per request), so this server-side check is the
 * one place role is actually enforced.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getCurrentProfile();
  if (!profile) redirect("/login?redirect=/admin");
  if (profile.role !== "admin") redirect("/");

  return (
    <div className="flex min-h-svh flex-col" style={{ background: "var(--color-background)" }}>
      <AdminNav displayName={profile.display_name} />
      <main id="main-content" className="flex-1">
        <Container className="flex flex-col gap-8 py-10">{children}</Container>
      </main>
    </div>
  );
}
