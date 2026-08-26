import { z } from "zod";

/**
 * Shape we actually depend on from Cal.com's `BOOKING_CREATED` webhook
 * payload (see https://cal.com/docs/core-features/webhooks for the
 * full envelope — this only asserts the subset this module reads;
 * unknown extra fields are ignored, not rejected, so a provider-side
 * payload addition never breaks this webhook).
 *
 * `uid` is Cal.com's own booking identifier — the idempotency key the
 * repository upserts on (spec: "duplicate/invalid booking attempt"
 * must not create duplicate records).
 */
export const calBookingWebhookSchema = z.object({
  triggerEvent: z.string(),
  payload: z.object({
    uid: z.string().trim().min(1).max(200),
    type: z.string().trim().min(1).max(200), // event type slug
    startTime: z.string().trim().min(1),
    endTime: z.string().trim().min(1),
    attendees: z
      .array(
        z.object({
          name: z.string().trim().min(1).max(200),
          email: z.string().trim().email().max(320),
        })
      )
      .min(1, "Booking payload is missing attendee details."),
    // Optional bridge back to the inquiry that led here — set via the
    // booking form's prefilled metadata (see
    // `ConsultationBookingPageContent.tsx`). Cal.com passes custom
    // query params through as `metadata` on the payload.
    metadata: z
      .object({
        projectInquiryId: z.string().uuid().optional(),
      })
      .partial()
      .optional(),
  }),
});

export type CalBookingWebhookInput = z.infer<typeof calBookingWebhookSchema>;
