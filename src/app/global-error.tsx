"use client";

import { useEffect } from "react";
import { getSafeErrorMessage } from "@/lib/utils/getSafeErrorMessage";

/**
 * Module 10A — global error boundary (spec §10/§11). Only fires when
 * the root layout itself throws, so it must render its own
 * `<html>/<body>` and deliberately avoids importing any component
 * that depends on that layout having rendered successfully. Kept
 * minimal and dependency-free on purpose — this is the last resort
 * boundary and must not itself be a source of failure.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ display: "flex", minHeight: "100svh", alignItems: "center", justifyContent: "center", fontFamily: "sans-serif" }}>
        <div style={{ textAlign: "center", padding: "2rem" }}>
          <p style={{ fontSize: "1.0625rem", fontWeight: 500, marginBottom: "0.75rem" }}>Something went wrong</p>
          <p style={{ fontSize: "0.9375rem", color: "#8189a0", marginBottom: "1rem" }}>{getSafeErrorMessage(error)}</p>
          <button
            type="button"
            onClick={reset}
            style={{ borderRadius: 999, border: "1px solid #d0d3da", padding: "0.5rem 1.25rem", fontSize: "0.9375rem", background: "transparent", cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
