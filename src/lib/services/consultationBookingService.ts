import "server-only";

import { calBookingWebhookSchema } from "@/lib/validation/consultationBooking";
import {
  upsertConsultationBooking,
  listConsultationBookings,
  getConsultationBooking,
  type ConsultationBookingRow,
} from "@/lib/repositories/consultationBookings";
import type { InquiryStatus, Json } from "@/lib/supabase/database.types";
import type { AdminGetResult, AdminListResult } from "@/lib/services/contactInquiryService";

export type RecordConsultationBookingResult =
  | { ok: true; skipped?: undefined }
  | { ok: true; skipped: "not-a-creation-event" }
  | { ok: false; message: string };

/**
 * `Webhook → validation → service → repository → Supabase`, the same
 * shape as `submitProjectInquiry` (spec: "follow the existing Supabase
 * architecture"). This is the one place that decides what a malformed
 * webhook payload vs. an event this module doesn't care about vs. a
 * real database failure looks like to the route handler.
 *
 * Only ever called after the route handler has already verified the
 * webhook's HMAC signature — this function trusts `raw` no more than
 * that verification already established.
 */
export async function recordConsultationBooking(raw: unknown): Promise<RecordConsultationBookingResult> {
  const parsed = calBookingWebhookSchema.safeParse(raw);

  if (!parsed.success) {
    return { ok: false, message: "Webhook payload did not match the expected Cal.com booking shape." };
  }

  // Cal.com's webhook endpoint fans out several trigger events
  // (BOOKING_CREATED, BOOKING_CANCELLED, BOOKING_RESCHEDULED, ...) to
  // the same URL. v1 only records genuine new bookings — cancellation/
  // reschedule handling is out of scope for this module (see handoff
  // "known limitations"), so anything else is acknowledged (200, so
  // Cal.com doesn't retry it forever) but not written.
  if (parsed.data.triggerEvent !== "BOOKING_CREATED") {
    return { ok: true, skipped: "not-a-creation-event" };
  }

  const { payload } = parsed.data;
  const attendee = payload.attendees[0];

  try {
    await upsertConsultationBooking({
      cal_booking_uid: payload.uid,
      event_type_slug: payload.type,
      attendee_name: attendee.name,
      attendee_email: attendee.email,
      project_inquiry_id: payload.metadata?.projectInquiryId ?? null,
      starts_at: payload.startTime,
      ends_at: payload.endTime,
      raw_payload: parsed.data as unknown as Json,
    });
    return { ok: true };
  } catch (error) {
    console.error("recordConsultationBooking: upsert failed", error);
    return { ok: false, message: "Unable to record this booking." };
  }
}

/**
 * Module Consultation Booking 2 — admin read path. Same discriminated
 * result shape as `contactInquiryService.ts`'s admin reads: never
 * rethrows a raw Supabase/Postgres error to a Server Component, logs
 * server-side and returns a message the page renders as its error
 * state instead.
 */
export async function listConsultationBookingsForAdmin(
  status?: InquiryStatus
): Promise<AdminListResult<ConsultationBookingRow>> {
  try {
    const data = await listConsultationBookings(status);
    return { ok: true, data };
  } catch (error) {
    console.error("listConsultationBookingsForAdmin: query failed", error);
    return { ok: false, message: "Unable to load consultation bookings. Please try again." };
  }
}

export async function getConsultationBookingForAdmin(id: string): Promise<AdminGetResult<ConsultationBookingRow>> {
  try {
    const data = await getConsultationBooking(id);
    return { ok: true, data };
  } catch (error) {
    console.error("getConsultationBookingForAdmin: query failed", error);
    return { ok: false, message: "Unable to load this booking. Please try again." };
  }
}
