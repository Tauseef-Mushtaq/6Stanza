import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProjectInquiryInput } from "@/lib/validation/projectInquiry";
import type { Database, InquiryStatus } from "@/lib/supabase/database.types";

export type ProjectInquiryRow = Database["public"]["Tables"]["project_inquiries"]["Row"];

/**
 * Data access for `project_inquiries` — the only file in the codebase
 * that knows this table's column names. Callers (the service layer)
 * work with the validated form shape, not raw Supabase rows.
 *
 * Uses `createSupabaseServerClient()`, not the admin client — inserts
 * go through RLS's `project_inquiries_insert_anyone` policy like any
 * other request would, so this repository can't accidentally bypass
 * the security model it's supposed to be respecting.
 *
 * Returns the inserted row (via `.select().single()`) rather than
 * `void` — the inquiry-email notification step
 * (`src/lib/notifications/inquiryNotifications.ts`, wired in from
 * `projectInquiryService.ts`) needs the generated `id`/`created_at`
 * and can't do a second round-trip to fetch them without weakening the
 * "insert must succeed before notifying" ordering this was built to
 * preserve.
 */
export async function insertProjectInquiry(input: ProjectInquiryInput): Promise<ProjectInquiryRow> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("project_inquiries")
    .insert({
      name: input.name,
      email: input.email,
      company: input.company || null,
      project_title: input.projectTitle,
      services: input.services,
      stage: input.stage ?? null,
      timeline: input.timeline ?? null,
      budget: input.budget ?? null,
      message: input.message,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

/**
 * Module 7A — admin reads/writes, same shape/rationale as the
 * `contact_inquiries` repository's equivalents: relies on
 * `project_inquiries_select_admin_only`/`_update_admin_only` RLS
 * (`supabase/migrations/0003_project_inquiries.sql`), still goes
 * through the normal server client, and filters by `status`
 * server-side when a filter is supplied.
 */
export async function listProjectInquiries(status?: InquiryStatus, limit?: number): Promise<ProjectInquiryRow[]> {
  const supabase = await createSupabaseServerClient();

  let query = supabase.from("project_inquiries").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** Module 8 — see `contactInquiries.ts`'s `countContactInquiries` for the rationale; same shape here. */
export async function countProjectInquiries(status?: InquiryStatus): Promise<number> {
  const supabase = await createSupabaseServerClient();

  let query = supabase.from("project_inquiries").select("*", { count: "exact", head: true });
  if (status) query = query.eq("status", status);

  const { count, error } = await query;
  if (error) throw error;
  return count ?? 0;
}

export async function getProjectInquiry(id: string): Promise<ProjectInquiryRow | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase.from("project_inquiries").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

export async function updateProjectInquiryStatus(id: string, status: InquiryStatus): Promise<ProjectInquiryRow> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("project_inquiries")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
