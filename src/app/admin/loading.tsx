/**
 * Module 7A — loading state (spec §11). One shared `loading.tsx` for
 * the whole `/admin` segment: Next.js renders this automatically while
 * any admin page (list or detail) is fetching, so no page needs its
 * own loading branch.
 */
export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
      <div className="h-6 w-40 animate-pulse rounded-[var(--radius-sm)]" style={{ background: "var(--color-border)" }} />
      <div className="h-32 w-full animate-pulse rounded-[var(--radius-lg)]" style={{ background: "var(--color-border-subtle)" }} />
      <div className="h-32 w-full animate-pulse rounded-[var(--radius-lg)]" style={{ background: "var(--color-border-subtle)" }} />
    </div>
  );
}
