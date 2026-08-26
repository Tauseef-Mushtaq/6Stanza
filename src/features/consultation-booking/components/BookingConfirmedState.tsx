import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Reveal } from "@/components/motion";
import type { CalBookingSuccessPayload } from "@/features/consultation-booking/components/CalEmbed";

/**
 * Distinct from `features/start-project/sections/SuccessState.tsx` on
 * purpose (spec: "clearly distinguish inquiry submission from
 * consultation booking") — different copy, and it renders the actual
 * time the visitor booked (from Cal.com's own `bookingSuccessful`
 * event payload) rather than a generic "we'll be in touch."
 */
export function BookingConfirmedState({ booking }: { booking: CalBookingSuccessPayload }) {
  const formattedTime = formatBookingTime(booking.startTime);

  return (
    <section
      className="relative flex min-h-svh w-full flex-col justify-center"
      style={{ background: "var(--stz-navy-950)", color: "var(--stz-white)" }}
    >
      <Container className="flex flex-col gap-6 lg:max-w-[60%]">
        <Reveal direction="up" className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel style={{ color: "var(--color-brand-soft)" }}>Consultation Booked</TechnicalLabel>
        </Reveal>

        <Reveal direction="up" delay={0.1}>
          <h2
            className="font-[var(--font-display)] tracking-tight"
            style={{ fontSize: "var(--text-h1)", lineHeight: "var(--leading-tight)" }}
          >
            You&apos;re on the calendar.
          </h2>
        </Reveal>

        <Reveal direction="up" delay={0.2}>
          <p className="max-w-lg" style={{ fontSize: "var(--text-body-lg)", color: "var(--color-muted-inverse)" }}>
            {formattedTime
              ? `Your consultation is confirmed for ${formattedTime}. A calendar invite is on its way to your inbox.`
              : "Your consultation is confirmed. A calendar invite is on its way to your inbox."}
          </p>
        </Reveal>

        <Reveal direction="up" delay={0.3} className="flex flex-wrap gap-4 pt-4">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-[var(--radius-pill)] px-6 py-3 font-[var(--font-sans)] font-medium transition-colors"
            style={{ border: "1px solid var(--color-border-inverse)", color: "var(--stz-white)", fontSize: "var(--text-small)" }}
          >
            Back to Home
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center justify-center rounded-[var(--radius-pill)] px-6 py-3 font-[var(--font-sans)] font-medium transition-colors hover:text-[var(--color-brand-soft)]"
            style={{ color: "var(--stz-white)", fontSize: "var(--text-small)" }}
          >
            View Projects
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}

function formatBookingTime(iso: string | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}
