"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";
import { Section } from "@/components/ui/Section";
import { CalEmbed, type CalBookingSuccessPayload } from "@/features/consultation-booking/components/CalEmbed";
import { BookingConfirmedState } from "@/features/consultation-booking/components/BookingConfirmedState";

/**
 * Composition root for `/start-project/consultation` — same shape as
 * `StartProjectPageContent.tsx` (owns the one piece of cross-section
 * state: whether a booking has succeeded).
 *
 * Reads `name`/`email`/`inquiryId` from the query string when present
 * — the "Book a Consultation" link on the inquiry
 * `SuccessState.tsx` passes these along so the visitor doesn't have to
 * retype what they already gave in the Start Project form. Purely a
 * convenience prefill: nothing here is trusted as authoritative, and
 * every field stays editable in Cal.com's own booking form, exactly
 * like the Smart Discovery → Start Project prefill bridge already
 * works for the inquiry form.
 */
export function ConsultationBookingPageContent() {
  const searchParams = useSearchParams();
  const [confirmedBooking, setConfirmedBooking] = useState<CalBookingSuccessPayload | null>(null);

  if (confirmedBooking) {
    return <BookingConfirmedState booking={confirmedBooking} />;
  }

  const name = searchParams.get("name") ?? undefined;
  const email = searchParams.get("email") ?? undefined;
  const inquiryId = searchParams.get("inquiryId") ?? undefined;

  return (
    <Section style={{ paddingTop: "calc(var(--space-section) + var(--safe-top, 0px))" }}>
      <Container className="flex flex-col gap-10">
        <div className="flex flex-col gap-6">
          <Reveal direction="up" className="flex items-center gap-3">
            <AccentLine />
            <TechnicalLabel>Book a Consultation</TechnicalLabel>
          </Reveal>

          <Reveal direction="up" delay={0.05}>
            <h1
              className="font-[var(--font-display)] tracking-tight"
              style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
            >
              Pick a time that works.
            </h1>
          </Reveal>

          <Reveal direction="up" delay={0.1}>
            <p className="max-w-xl" style={{ fontSize: "var(--text-body-lg)", color: "var(--color-text-secondary)" }}>
              This is a separate step from sending an inquiry — booking a slot here schedules a real, live
              conversation. Availability below reflects our actual calendar.
            </p>
          </Reveal>
        </div>

        <Reveal direction="up" delay={0.15}>
          <CalEmbed
            prefill={{ name, email }}
            metadata={inquiryId ? { projectInquiryId: inquiryId } : undefined}
            onBookingSuccessful={setConfirmedBooking}
          />
        </Reveal>
      </Container>
    </Section>
  );
}
