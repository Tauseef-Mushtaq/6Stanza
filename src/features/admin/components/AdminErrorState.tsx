"use client";

import { useRouter } from "next/navigation";
import { ErrorState } from "@/components/ui/ErrorState";

/**
 * Module 10C — shared retry-capable error display for Admin CMS
 * list/record failures (spec §7/§28). The list and record pages that
 * need this are Server Components (they run the Supabase query
 * directly), so they can't pass a retry callback to `ErrorState`
 * themselves — this is the smallest possible client wrapper: it takes
 * the already-safe `message` a page's `result.ok === false` branch
 * produced and retries with `router.refresh()`, which simply re-runs
 * the Server Component's data fetch in place (spec §7 — "prefer
 * router.refresh() ... do NOT create a global Admin retry manager").
 */
export function AdminErrorState({ title, message }: { title: string; message: string }) {
  const router = useRouter();

  return <ErrorState title={title} description={message} onRetry={() => router.refresh()} />;
}
