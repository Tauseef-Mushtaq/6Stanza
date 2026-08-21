import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContentStatus, Database } from "@/lib/supabase/database.types";
import type { TeamMemberInput } from "@/lib/validation/cmsContent";

export type TeamMemberRow = Database["public"]["Tables"]["team_members"]["Row"];

/** Data access for `team_members` — see `repositories/services.ts` header for the shared conventions this follows. */

// ---- public reads (published only, enforced by RLS) ----

export async function listPublishedTeamMembers(): Promise<TeamMemberRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("team_members").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getPublishedTeamMemberBySlug(slug: string): Promise<TeamMemberRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("team_members").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

// ---- admin reads/writes (all statuses; RLS restricts to admins) ----

export async function listAllTeamMembers(status?: ContentStatus): Promise<TeamMemberRow[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("team_members").select("*").order("sort_order", { ascending: true });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getTeamMemberById(id: string): Promise<TeamMemberRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("team_members").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

function toRow(input: TeamMemberInput) {
  return {
    slug: input.slug,
    name: input.name,
    role: input.role,
    discipline: input.discipline,
    short_bio: input.shortBio,
    initials: input.initials,
    image_path: input.imagePath || null,
    social_links: input.socialLinks,
    sort_order: input.sortOrder,
    status: input.status,
  };
}

export async function insertTeamMember(input: TeamMemberInput): Promise<TeamMemberRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("team_members")
    .insert({ ...toRow(input), published_at: input.status === "published" ? new Date().toISOString() : null })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/**
 * Module 9D — `published_at` semantics, fixed to match the corrected
 * `updateProject`/`updateService` pattern (Module 9C found the same
 * defect in `projects`): the first transition into `published`
 * stamps `published_at`; going back to `draft` afterwards preserves
 * the existing timestamp rather than clearing it. (The prior version
 * derived `published_at` from `input.status` alone, which cleared it
 * on `published → draft` and re-stamped it on every re-publish.)
 */
export async function updateTeamMember(id: string, input: TeamMemberInput): Promise<TeamMemberRow> {
  const supabase = await createSupabaseServerClient();

  const existing = await getTeamMemberById(id);
  const publishedAt =
    input.status === "published" ? (existing?.published_at ?? new Date().toISOString()) : (existing?.published_at ?? null);

  const { data, error } = await supabase
    .from("team_members")
    .update({ ...toRow(input), published_at: publishedAt })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function archiveTeamMember(id: string): Promise<TeamMemberRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("team_members")
    .update({ status: "archived" })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/**
 * Module 9M — permanent deletion (spec §17/§21). The caller
 * (`teamContentService.ts`) reads the row's `image_path` before
 * calling this, so it can attempt Storage cleanup after the database
 * delete succeeds — this function only removes the `team_members` row.
 */
export async function deleteTeamMember(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) throw error;
}
