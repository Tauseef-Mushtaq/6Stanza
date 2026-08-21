import { cn } from "@/lib/utils/cn";

type LoaderSize = "sm" | "md" | "lg";

const SIZE_PX: Record<LoaderSize, number> = {
  sm: 16,
  md: 24,
  lg: 32,
};

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visible or screen-reader-only label. Always announced via `aria-live`. */
  label?: string;
  size?: LoaderSize;
  /** Show `label` as visible text next to the spinner (default: sr-only). */
  showLabel?: boolean;
}

/**
 * Module 10A — shared loading primitive (spec §5). A small spinning
 * ring plus an `aria-live="polite"`/`role="status"` announcement, so
 * every consumer gets an accessible loading state for free instead of
 * a bespoke one per feature. No animation library: a single CSS
 * `animate-spin`, which the project's existing global
 * `prefers-reduced-motion` rule (`globals.css`) already collapses to
 * a static ring — this component does not need its own reduced-motion
 * branch.
 */
export function Loader({ label = "Loading…", size = "md", showLabel = false, className, ...props }: LoaderProps) {
  const px = SIZE_PX[size];

  return (
    <div role="status" aria-live="polite" className={cn("inline-flex items-center gap-2", className)} {...props}>
      <span
        aria-hidden="true"
        className="inline-block shrink-0 animate-spin rounded-full"
        style={{
          width: px,
          height: px,
          border: "2px solid var(--color-border)",
          borderTopColor: "var(--color-brand)",
        }}
      />
      <span className={showLabel ? undefined : "sr-only"} style={showLabel ? { fontSize: "var(--text-small)", color: "var(--color-text-secondary)" } : undefined}>
        {label}
      </span>
    </div>
  );
}
