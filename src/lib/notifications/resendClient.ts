import "server-only";

/**
 * Inquiry-email module — Resend client accessor.
 *
 * Deliberately lazy and tolerant of missing configuration: `RESEND_API_KEY`
 * is optional at the type level (unlike `SUPABASE_SERVICE_ROLE_KEY`, which
 * the app cannot run without). A missing key means "notifications are not
 * configured yet" — the inquiry-save flow this backs must keep working
 * either way (see `sendProjectInquiryNotifications` in
 * `inquiryNotifications.ts`), so this module never throws for a missing
 * key; it returns `null` and lets the caller log + skip.
 *
 * The API key never reaches the client: this file has `server-only` at the
 * top and is only ever imported from other server-only modules
 * (`inquiryNotifications.ts`, itself only imported from
 * `projectInquiryService.ts`).
 */
import { Resend } from "resend";

let cached: Resend | null | undefined;

export function getResendClient(): Resend | null {
  if (cached !== undefined) return cached;

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    cached = null;
    return cached;
  }

  cached = new Resend(apiKey);
  return cached;
}

/** The verified "from" address/domain configured in Resend for this project. */
export function getEmailFromAddress(): string | null {
  return process.env.RESEND_FROM_EMAIL || null;
}

/** The 6STANZA business inbox that should receive inquiry notifications. */
export function getInquiryNotificationEmail(): string | null {
  return process.env.INQUIRY_NOTIFICATION_EMAIL || null;
}
