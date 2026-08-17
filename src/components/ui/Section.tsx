import { createElement } from "react";
import { cn } from "@/lib/utils/cn";

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  as?: React.ElementType;
}

/**
 * Standard vertical section rhythm. Later modules compose their real
 * content inside this — it deliberately carries no visual identity of
 * its own beyond spacing.
 */
export function Section({ as = "section", className, children, style, ...props }: SectionProps) {
  return createElement(
    as,
    {
      className: cn("w-full", className),
      style: { paddingBlock: "var(--space-section)", ...style },
      ...props,
    },
    children
  );
}

/**
 * Full-viewport section used for cinematic, pinned, or hero-style
 * moments. Provides the sizing contract only — later modules add the
 * actual pinning/scroll behavior via ScrollTrigger.
 */
export function FullScreenSection({ as = "section", className, children, ...props }: SectionProps) {
  return createElement(
    as,
    { className: cn("relative flex min-h-svh w-full flex-col", className), ...props },
    children
  );
}

interface SurfaceSectionProps extends SectionProps {
  split?: "left" | "right" | "center";
}

/** Section pre-toned to the dark/navy surface (inverse text colors). */
export function DarkSection({ as = "section", className, children, style, ...props }: SectionProps) {
  return createElement(
    as,
    {
      className: cn("w-full", className),
      style: {
        paddingBlock: "var(--space-section)",
        background: "var(--stz-navy-950)",
        color: "var(--stz-white)",
        ...style,
      },
      ...props,
    },
    children
  );
}

/** Section pre-toned to the light/white surface — the default, made explicit for design-system symmetry. */
export function LightSection({ as = "section", className, children, style, ...props }: SectionProps) {
  return createElement(
    as,
    {
      className: cn("w-full", className),
      style: {
        paddingBlock: "var(--space-section)",
        background: "var(--stz-white)",
        color: "var(--stz-navy-950)",
        ...style,
      },
      ...props,
    },
    children
  );
}

/** Two-zone editorial section — asymmetric content/visual composition, per §10's layout patterns. */
export function SplitSection({ as = "section", split = "left", className, children, ...props }: SurfaceSectionProps) {
  return createElement(
    as,
    {
      className: cn(
        "grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-16",
        split === "center" && "lg:grid-cols-1 justify-items-center text-center",
        className
      ),
      style: { paddingBlock: "var(--space-section)" },
      ...props,
    },
    children
  );
}

/** Centered, narrow-measure section — statements, quotes, single-column editorial copy. */
export function CenteredSection({ as = "section", className, children, ...props }: SectionProps) {
  return createElement(
    as,
    {
      className: cn("mx-auto flex w-full max-w-[var(--container-max-narrow)] flex-col items-center text-center", className),
      style: { paddingBlock: "var(--space-section)" },
      ...props,
    },
    children
  );
}

/** Editorial section — asymmetric top border + generous top offset, matching the Orionix reference rhythm. */
export function EditorialSection({ as = "section", className, children, ...props }: SectionProps) {
  return createElement(
    as,
    {
      className: cn("w-full border-t border-[var(--color-border)]", className),
      style: { paddingBlock: "var(--space-section)" },
      ...props,
    },
    children
  );
}
