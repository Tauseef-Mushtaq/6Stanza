import { Container } from "@/components/ui/Container";
import { FullScreenSection } from "@/components/ui/Section";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";

interface RoutePlaceholderProps {
  label: string;
  title: string;
  description: string;
}

/**
 * Intentional, minimal placeholder for routes whose final design
 * belongs to a later module. Confirms the route resolves and inherits
 * the design tokens/typography — nothing more.
 */
export function RoutePlaceholder({ label, title, description }: RoutePlaceholderProps) {
  return (
    <FullScreenSection className="items-center justify-center">
      <Container className="flex max-w-2xl flex-col items-center gap-6 py-32 text-center">
        <TechnicalLabel>{label}</TechnicalLabel>
        <h1
          className="text-balance font-[var(--font-display)] tracking-tight"
          style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
        >
          {title}
        </h1>
        <p style={{ color: "var(--color-muted)", fontSize: "var(--text-body)" }}>{description}</p>
      </Container>
    </FullScreenSection>
  );
}
