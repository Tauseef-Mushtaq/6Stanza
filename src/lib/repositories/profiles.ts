import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database, ProfileRole } from "@/lib/supabase/database.types";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

/**
 * Data access for `profiles` — same conventions as
 * `repositories/teamMembers.ts` etc: uses the RLS-respecting server
 * client (`createSupabaseServerClient()`), never the service-role
 * client. `profiles_select_own_or_admin` / `profiles_update_own_or_admin`
 * (`supabase/migrations/0001_profiles.sql`) already let an admin
 * session see and update every row, so no admin-client bypass is
 * needed here — RLS alone is sufficient for "list all users" /
 * "change a role."
 *
 * `email` deliberately isn't on this table (see `0001_profiles.sql`)
 * — it lives on `auth.users`, which only the service-role client can
 * read. `lib/services/userManagementService.ts` is what joins this
 * table's rows against `auth.admin.listUsers()` for the combined
 * admin-facing view; this file only ever touches `profiles`.
 */

export async function listAllProfiles(): Promise<ProfileRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

/**
 * Updates a profile's role. Relies on `profiles_enforce_role_immutable`
 * (`0001_profiles.sql`) as the database-level backstop — that trigger
 * raises if the calling session isn't `is_admin()`, so even a bug in
 * the caller above this (missing/bypassed `requireAdmin()`) can't
 * actually change a role. This function itself doesn't re-check
 * admin-ness; the Server Action layer already has (spec-consistent
 * with every other admin write in this codebase).
 */
export async function updateProfileRole(id: string, role: ProfileRole): Promise<ProfileRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("profiles").update({ role }).eq("id", id).select("*").single();
  if (error) throw error;
  return data;
}
