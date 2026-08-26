import "server-only";

import { getSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, InquiryStatus } from "@/lib/supabase/database.types";

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

/**
 * Module Consultation Booking 2 — admin read path.
 *
 * Uses `createSupabaseServerClient()`, not the admin/service-role
 * client the webhook upsert above uses: the
 * `consultation_bookings_select_admin_only` RLS policy
 * (`supabase/migrations/0010_consultation_bookings.sql`) is what
 * actually lets this succeed for an admin session and return nothing
 * for anyone else — same relationship `contactInquiries.ts`'s admin
 * reads have with their own `_select_admin_only` policy. The admin
 * layout's `requireAdmin()`-equivalent check
 * (`src/app/admin/layout.tsx`) is defense-in-depth on top of that, not
 * a substitute for it.
 *
 * Optional `status` filters server/database-side, matching
 * `listContactInquiries`'s pattern, so the browser never has to load
 * every booking just to narrow it client-side.
 */
export async function listConsultationBookings(status?: InquiryStatus): Promise<ConsultationBookingRow[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase.from("consultation_bookings").select("*").order("starts_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getConsultationBooking(id: string): Promise<ConsultationBookingRow | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.from("consultation_bookings").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}
