"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Loader } from "@/components/ui/Loader";
import { ErrorState } from "@/components/ui/ErrorState";
import { EmptyState } from "@/components/ui/EmptyState";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { loadCalApi } from "@/features/consultation-booking/lib/loadCalEmbed";
import { getCalComLink } from "@/features/consultation-booking/config";

export interface CalBookingSuccessPayload {
  uid?: string;
  startTime?: string;
  endTime?: string;
}

interface CalEmbedProps {
  /** Prefill data passed through to Cal.com's booking form — never used to fabricate a booking, only to pre-populate provider-side fields the visitor can still edit. */
  prefill?: { name?: string; email?: string; notes?: string };
  /** Custom metadata carried through to the booking and back out on the webhook payload (see `lib/validation/consultationBooking.ts`). */
  metadata?: Record<string, string>;
  onBookingSuccessful: (payload: CalBookingSuccessPayload) => void;
}

type Status = "loading" | "ready" | "error";

/**
 * Renders Cal.com's real, live availability inline — this component
 * never invents or hardcodes time slots (spec: "Do not show fake or
 * hardcoded availability"). If the provider isn't configured for this
 * environment, it shows an explicit empty state instead of silently
 * rendering nothing or faking a calendar.
 */
export function CalEmbed({ prefill, metadata, onBookingSuccessful }: CalEmbedProps) {
  const calLink = getCalComLink();
  const containerId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [attempt, setAttempt] = useState(0);
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (!calLink) return; // Empty state below handles the unconfigured case — nothing to load.

    let cancelled = false;

    loadCalApi()
      .then((cal) => {
        if (cancelled || !containerRef.current) return;

        cal("init", { origin: "https://app.cal.com" });

        cal("inline", {
          elementOrSelector: `#${containerId}`,
          calLink,
          config: {
            theme: "auto",
            layout: "month_view",
            ...(prefill?.name ? { name: prefill.name } : {}),
            ...(prefill?.email ? { email: prefill.email } : {}),
            ...(prefill?.notes ? { notes: prefill.notes } : {}),
            ...(metadata ? { metadata } : {}),
          },
        });

        // Reduced-motion preference: Cal.com's embed controls its own
        // internal transitions, but its UI config exposes a couple of
        // knobs this app can still respect rather than layering its
        // own motion on top of an iframe it doesn't own.
        cal("ui", {
          theme: "auto",
          hideEventTypeDetails: false,
          layout: "month_view",
        });

        cal("on", {
          action: "linkReady",
          callback: () => {
            if (!cancelled) setStatus("ready");
          },
        });

        cal("on", {
          action: "bookingSuccessful",
          callback: (event: { detail?: { data?: CalBookingSuccessPayload } }) => {
            if (cancelled) return;
            onBookingSuccessful(event.detail?.data ?? {});
          },
        });
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calLink, attempt, containerId]);

  if (!calLink) {
    return (
      <EmptyState
        title="Consultation booking isn't configured yet."
        description="This environment is missing NEXT_PUBLIC_CAL_COM_LINK. See MODULE-CONSULTATION-BOOKING-1-HANDOFF.md for required setup."
      />
    );
  }

  if (status === "error") {
    return (
      <ErrorState
        title="We couldn't load the booking calendar"
        description="Please try again, or reach us directly via the Start a Project form."
        onRetry={() => {
          // Setting `status` here directly (a user-event handler, not
          // an effect body) is what actually resets the visible state
          // before the effect below re-runs for the new `attempt`.
          setStatus("loading");
          setAttempt((n) => n + 1);
        }}
      />
    );
  }

  return (
    <div className="relative w-full">
      {status === "loading" ? (
        <div className="flex min-h-[420px] w-full items-center justify-center">
          <Loader label="Loading available times…" showLabel size="lg" />
        </div>
      ) : null}
      {/*
        Cal.com's inline embed renders its own <iframe>, which is
        natively keyboard-focusable/tabbable and contains its own
        internal accessible controls — this wrapper only needs an
        accessible label for the region as a whole, not to reimplement
        keyboard handling itself.
      */}
      <div
        id={containerId}
        ref={containerRef}
        role="region"
        aria-label="Book a consultation"
        aria-busy={status === "loading"}
        style={{
          width: "100%",
          minHeight: status === "ready" ? 700 : 0,
          overflow: "hidden",
          transition: reducedMotion ? "none" : "min-height var(--duration-normal, 300ms) var(--ease-standard, ease)",
        }}
      />
    </div>
  );
}
