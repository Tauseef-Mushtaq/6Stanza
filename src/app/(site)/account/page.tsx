import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Badge } from "@/components/ui/Badge";
import { LogoutButton } from "@/features/auth/components/LogoutButton";
import { getCurrentUser, getCurrentProfile } from "@/lib/auth/session";

export const metadata: Metadata = {
  title: "Account",
};

/**
 * The one protected route this module defines — a minimal foundation
 * future backend modules (admin dashboard, project management, etc.)
 * follow the same shape for: call `getCurrentUser()`/`getCurrentProfile()`
 * (Module 5A, `src/lib/auth/session.ts`) at the top of a Server
 * Component and redirect if there's no session, rather than trusting
 * any client-side auth state (spec §5 — "server-side authentication
 * checks do not rely solely on client-side state").
 *
 * `middleware.ts` also redirects unauthenticated requests away from
 * `/account` before this component ever runs — this check is the
 * defense-in-depth backstop, not the only gate (middleware can be
 * bypassed by direct data fetches in some edge cases; the page-level
 * check cannot).
 */
export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/account");

  const profile = await getCurrentProfile();

  return (
    <Section as="div" className="min-h-svh" style={{ paddingBlockStart: "calc(var(--space-section) + 4rem)" }}>
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <AccentLine />
            <TechnicalLabel>Account</TechnicalLabel>
          </div>
          <h1 className="font-[var(--font-sans)]" style={{ fontSize: "var(--text-h2)", color: "var(--color-text-primary)" }}>
            {profile?.display_name || user.email}
          </h1>
        </div>

        <dl className="flex flex-col gap-4 max-w-md">
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--color-border)" }}>
            <dt style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-small)" }}>Email</dt>
            <dd style={{ fontSize: "var(--text-small)" }}>{user.email}</dd>
          </div>
          <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: "var(--color-border)" }}>
            <dt style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-small)" }}>Role</dt>
            <dd>
              <Badge variant="soft" tone={profile?.role === "admin" ? "brand" : "neutral"}>
                {profile?.role ?? "user"}
              </Badge>
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap items-center gap-4">
          {profile?.role === "admin" ? (
            <Link
              href="/admin"
              className="inline-flex items-center justify-center rounded-[var(--radius-pill)] px-7 py-3.5 font-[var(--font-sans)] font-medium transition-[filter] hover:brightness-110"
              style={{ background: "var(--color-brand)", color: "var(--stz-white)", fontSize: "var(--text-body)" }}
            >
              Go to Admin Dashboard
            </Link>
          ) : null}
          <LogoutButton />
        </div>
      </Container>
    </Section>
  );
}
