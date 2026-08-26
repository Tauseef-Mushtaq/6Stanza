import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Database } from "@/lib/supabase/database.types";

export type ConsultationBookingRow = Database["public"]["Tables"]["consultation_bookings"]["Row"];
export type ConsultationBookingInsert = Database["public"]["Tables"]["consultation_bookings"]["Insert"];

/**
 * Data access for `consultation_bookings` — the only file that knows
 * this table's column names, matching the rest of
 * `src/lib/repositories/*`'s shape.
 *
 * Uses `getSupabaseAdminClient()`, not `createSupabaseServerClient()`:
 * the caller here is the Cal.com webhook route handler
 * (`src/app/api/webhooks/cal-booking/route.ts`), which runs with no
 * incoming visitor session/cookie for RLS to evaluate against — this
 * is exactly the "genuinely privileged operation" case
 * `src/lib/supabase/admin.ts`'s doc comment reserves the admin client
 * for, not an ordinary read/write that should go through RLS.
 */
export async function upsertConsultationBooking(
  input: ConsultationBookingInsert
): Promise<{ inserted: boolean }> {
  const supabase = getSupabaseAdminClient();

  // `upsert` on the `cal_booking_uid` unique constraint (see
  // 0010_consultation_bookings.sql) — makes a redelivered/retried
  // webhook for the same booking idempotent instead of creating a
  // duplicate row (spec: "duplicate ... booking attempt").
  // `ignoreDuplicates: false` still updates `raw_payload`/timestamps
  // on a genuine redelivery, so the stored record reflects the latest
  // payload the provider sent for that booking.
  const { data, error } = await supabase
    .from("consultation_bookings")
    .upsert(input, { onConflict: "cal_booking_uid", ignoreDuplicates: false })
    .select("id")
    .single();

  if (error) throw error;
  return { inserted: Boolean(data) };
}
