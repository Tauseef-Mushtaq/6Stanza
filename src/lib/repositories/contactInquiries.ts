import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContactInquiryInput } from "@/lib/validation/contactInquiry";
import type { Database, InquiryStatus } from "@/lib/supabase/database.types";

export type ContactInquiryRow = Database["public"]["Tables"]["contact_inquiries"]["Row"];

/** Data access for `contact_inquiries`. See `lib/validation/contactInquiry.ts` for why nothing calls this yet. */
export async function insertContactInquiry(input: ContactInquiryInput) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("contact_inquiries").insert({
    name: input.name,
    email: input.email,
    message: input.message,
  });

  if (error) throw error;
}

/**
 * Module 7A — admin reads/writes. Uses `createSupabaseServerClient()`,
 * not the admin/service-role client, same as `insertContactInquiry`
 * above: the `contact_inquiries_select_admin_only`/`_update_admin_only`
 * RLS policies (`supabase/migrations/0002_contact_inquiries.sql`) are
 * what actually let these succeed for an admin session and fail for
 * anyone else — the `requireAdmin()` call in every admin Server
 * Action/page is defense-in-depth on top of that, not a substitute for
 * it (spec §12/§13).
 *
 * Optional `status` filters server/database-side (spec §8 — "filtering
 * should happen through the server/database query rather than loading
 * all sensitive records into the browser").
 */
export async function listContactInquiries(status?: InquiryStatus, limit?: number): Promise<ContactInquiryRow[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase.from("contact_inquiries").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/**
 * Module 8 — dashboard metric counts (spec §7/§17). Uses
 * `{ count: "exact", head: true }` so Postgres returns only a row
 * count, not the rows themselves — the dashboard never needs to pull
 * inquiry records into memory just to size a metric card.
 */
export async function countContactInquiries(status?: InquiryStatus): Promise<number> {
  const supabase = await createSupabaseServerClient();

  let query = supabase.from("contact_inquiries").select("*", { count: "exact", head: true });
  if (status) query = query.eq("status", status);

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function getContactInquiry(id: string): Promise<ContactInquiryRow | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.from("contact_inquiries").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function updateContactInquiryStatus(id: string, status: InquiryStatus): Promise<ContactInquiryRow> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("contact_inquiries")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
