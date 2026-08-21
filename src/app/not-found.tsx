import { Container } from "@/components/ui/Container";
import { TextLink } from "@/components/ui/TextLink";

/**
 * Module 10A — App Router not-found boundary (spec §9). Covers both
 * unknown routes and any `notFound()` call from within a route (e.g.
 * a slug that doesn't resolve to a published record) with one generic
 * page — it never distinguishes "never existed" from "draft/archived",
 * so a not-yet-published CMS record can't be probed for by URL.
 * Links back to `/`, which resolves correctly whether the visitor was
 * on a public or an admin path.
 */
export default function NotFound() {
  return (
    <Container className="flex min-h-[60svh] flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="font-medium" style={{ fontSize: "var(--text-body)", color: "var(--color-text-primary)" }}>
        Page not found
      </p>
      <p style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
        The page you&rsquo;re looking for doesn&rsquo;t exist or is no longer available.
      </p>
      <TextLink href="/" variant="arrow">
        Back to home
      </TextLink>
    </Container>
  );
}
