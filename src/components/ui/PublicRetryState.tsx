"use client";

import { useRouter } from "next/navigation";
import { ErrorState } from "@/components/ui/ErrorState";

interface PublicRetryStateProps {
  title?: string;
  description?: string;
  className?: string;
}

/**
 * Module 10B (spec §21/§22) — thin client wrapper around the shared
 * `ErrorState` primitive. `ErrorState.onRetry` is a function prop, so
 * it can't be supplied directly from the Server Components that fetch
 * public CMS data; this component owns the one bit of client-side
 * behavior retry needs (`router.refresh()`, spec §22 — no global retry
 * manager, no full page reload) so every public section can render an
 * error with working retry without becoming a Client Component itself.
 */
export function PublicRetryState({ title, description, className }: PublicRetryStateProps) {
  const router = useRouter();
  return (
    <ErrorState
      title={title}
      description={description}
      onRetry={() => router.refresh()}
      className={className}
    />
  );
}
