import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";
import { SocialLinks } from "@/components/ui/SocialLinks";
import { primaryNav, legalNav } from "@/config/routes";
import { siteConfig, whatsappLink } from "@/config/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "var(--color-background)" }}>
      <Container className="py-16">
        <Divider className="mb-10" />
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="flex flex-col gap-3">
            <span className="font-[var(--font-display)] text-lg">{siteConfig.name}</span>
            <p className="max-w-sm" style={{ color: "var(--color-muted)", fontSize: "var(--text-small)" }}>
              {siteConfig.tagline}
            </p>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap gap-x-8 gap-y-3">
            {primaryNav.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)]"
                style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)" }}
              >
                {route.label}
              </Link>
            ))}
            <Link
              href={whatsappLink("Hi 6STANZA, I'd like to get in touch.")}
              target="_blank"
              rel="noopener noreferrer"
              className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)]"
              style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)" }}
            >
              WhatsApp
            </Link>
          </nav>
        </div>

        <SocialLinks className="mt-8" />

        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p style={{ color: "var(--color-muted)", fontSize: "var(--text-caption)" }}>
            © {year} {siteConfig.legalName}. All rights reserved.
          </p>
          <nav aria-label="Legal" className="flex flex-wrap gap-x-6 gap-y-2">
            {legalNav.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className="transition-colors hover:text-[var(--color-brand)]"
                style={{ fontSize: "var(--text-caption)", color: "var(--color-muted)" }}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>
      </Container>
    </footer>
  );
}
