import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { recordConsultationBooking } from "@/lib/services/consultationBookingService";

/**
 * Consultation Booking v1's persistence boundary. Cal.com (the
 * scheduling provider — see
 * `MODULE-CONSULTATION-BOOKING-1-HANDOFF.md`) POSTs here whenever a
 * booking event happens; this route verifies the request genuinely
 * came from Cal.com, then hands the payload to
 * `recordConsultationBooking` (`UI-less` version of the site's usual
 * `validation → service → repository → Supabase` chain).
 *
 * `CAL_COM_WEBHOOK_SECRET` is server-only (no `NEXT_PUBLIC_` prefix)
 * — configured once in the Cal.com webhook settings and here, never
 * sent to the browser. If it isn't configured, this route refuses
 * every request rather than accepting unverified writes — there is no
 * "trust it anyway" fallback.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.CAL_COM_WEBHOOK_SECRET;
  if (!secret) {
    console.error("cal-booking webhook: CAL_COM_WEBHOOK_SECRET is not configured");
    return NextResponse.json({ error: "Webhook not configured." }, { status: 503 });
  }

  const signature = request.headers.get("x-cal-signature-256");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature." }, { status: 401 });
  }

  // Read the raw body for HMAC verification before any JSON parsing —
  // signing is computed over exact bytes, not a re-serialized object.
  const rawBody = await request.text();
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");

  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  const signatureValid =
    signatureBuffer.length === expectedBuffer.length && timingSafeEqual(signatureBuffer, expectedBuffer);

  if (!signatureValid) {
    console.error("cal-booking webhook: signature verification failed");
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Malformed JSON." }, { status: 400 });
  }

  const result = await recordConsultationBooking(body);

  if (!result.ok) {
    // Still a 200-shaped failure path is deliberately avoided here:
    // a genuine failure should make Cal.com retry delivery, whereas
    // `skipped` (an event type this module doesn't record) is
    // acknowledged with 200 below so Cal.com stops retrying it.
    return NextResponse.json({ error: result.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
