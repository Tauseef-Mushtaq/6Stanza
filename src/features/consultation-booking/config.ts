/**
 * Consultation Booking v1 — provider configuration.
 *
 * `NEXT_PUBLIC_CAL_COM_LINK` is the only thing the browser needs: the
 * Cal.com booking link/slug (e.g. "6stanza/consultation") that the
 * embed script mounts. Public and safe to bundle — it's the same
 * value that would appear in a plain `https://cal.com/<link>` URL.
 *
 * No booking can be *recorded* without also configuring
 * `CAL_COM_WEBHOOK_SECRET` server-side (see
 * `src/app/api/webhooks/cal-booking/route.ts`), but that value is
 * never read from client code and has no bearing on whether the
 * *embed itself* can render — hence two independent checks rather
 * than one.
 */
export function getCalComLink(): string | null {
  const link = process.env.NEXT_PUBLIC_CAL_COM_LINK;
  return link && link.trim() ? link.trim() : null;
}

export function isConsultationBookingConfigured(): boolean {
  return getCalComLink() !== null;
}
