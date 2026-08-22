import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { BrandMark } from "@/components/ui/BrandMark";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { LogoutButton } from "@/features/auth/components/LogoutButton";

/**
 * Module 7A — minimal admin shell (spec §3). Deliberately its own
 * component, not a reused/extended `Header` (spec §3/§18 — "clear
 * separation from the public marketing navigation" / "do not redesign
 * the public website Header"). Reuses `LogoutButton`
 * (`features/auth/components/LogoutButton.tsx`) rather than a second
 * sign-out implementation.
 */
export function AdminNav({ displayName }: { displayName: string | null }) {
  return (
    <header className="w-full border-b" style={{ borderColor: "var(--color-border)", background: "var(--color-surface)" }}>
      <Container className="flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-3" aria-label="Back to homepage">
          <BrandMark size={22} />
          <TechnicalLabel>Admin</TechnicalLabel>
        </Link>

        <nav aria-label="Admin" className="flex items-center gap-6">
          <Link
            href="/"
            className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)]"
            style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
          >
            ← Homepage
          </Link>
          <Link
            href="/admin"
            className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)]"
            style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
          >
            Dashboard
          </Link>
          <Link
            href="/admin/inquiries"
            className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)]"
            style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
          >
            Inquiries
          </Link>
          <Link
            href="/admin/services"
            className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)]"
            style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
          >
            Services
          </Link>
          <Link
            href="/admin/projects"
            className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)]"
            style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
          >
            Projects
          </Link>
          <Link
            href="/admin/team"
            className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)]"
            style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
          >
            Team
          </Link>
          <Link
            href="/admin/insights"
            className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)]"
            style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
          >
            Insights
          </Link>
          <Link
            href="/admin/users"
            className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)]"
            style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
          >
            Users
          </Link>
          {displayName ? (
            <span
              className="hidden font-[var(--font-mono)] uppercase sm:inline"
              style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-muted)" }}
            >
              {displayName}
            </span>
          ) : null}
          <LogoutButton />
        </nav>
      </Container>
    </header>
  );
}
