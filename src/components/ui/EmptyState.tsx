import { cn } from "@/lib/utils/cn";

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * Module 10A — shared empty-state primitive (spec §8). Generalizes
 * the local `EmptyState` each admin table currently defines for
 * itself (e.g. `features/admin/components/TeamMemberTable.tsx`) into
 * one reusable, non-CMS-specific component. Visually quiet — no error
 * styling — since an empty result is not a failure. Feature call
 * sites are not migrated to this in 10A (deferred to 10B/10C); this
 * only establishes the primitive for those modules to adopt.
 */
export function EmptyState({ title, description, action, className, ...props }: EmptyStateProps) {
  return (
    <div
      className={cn("flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border p-10 text-center", className)}
      style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
      {...props}
    >
      <p style={{ fontSize: "var(--text-small)" }}>{title}</p>
      {description ? (
        <p style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)" }}>{description}</p>
      ) : null}
      {action ? <div>{action}</div> : null}
    </div>
  );
}
