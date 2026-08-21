"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/ui/ErrorState";
import { Container } from "@/components/ui/Container";
import { getSafeErrorMessage } from "@/lib/utils/getSafeErrorMessage";

/**
 * Module 10A — app-level error boundary (spec §10/§11). Catches any
 * unhandled error thrown while rendering a route (public or admin;
 * both share the root layout, so one boundary here covers both
 * segments — no route-specific boundary is warranted yet). Logs the
 * real error server/console-side only; the UI only ever shows
 * `getSafeErrorMessage`'s generic copy, never `error.message`.
 */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60svh] items-center justify-center py-24">
      <ErrorState
        title="Something went wrong"
        description={getSafeErrorMessage(error)}
        onRetry={reset}
      />
    </Container>
  );
}
