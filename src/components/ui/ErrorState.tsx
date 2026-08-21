import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

/**
 * Module 10A — shared error-display primitive (spec §7). Renders only
 * a safe, user-facing message and an optional retry action; callers
 * must resolve any backend/Supabase error down to plain text
 * (`getSafeErrorMessage` — `lib/utils/getSafeErrorMessage.ts`) before
 * it reaches this component. `role="alert"` so assistive tech
 * announces it as soon as it mounts, matching `ErrorText`'s pattern in
 * `components/ui/form/Field.tsx`.
 */
export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this content. Please try again.",
  onRetry,
  retryLabel = "Try again",
  className,
  ...props
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn("flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border p-10 text-center", className)}
      style={{ borderColor: "var(--color-border)" }}
      {...props}
    >
      <p className="font-medium" style={{ fontSize: "var(--text-body)", color: "var(--color-text-primary)" }}>
        {title}
      </p>
      {description ? (
        <p style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>{description}</p>
      ) : null}
      {onRetry ? (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  );
}
