import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

export type ProjectMediaRow = Database["public"]["Tables"]["project_media"]["Row"];

/**
 * Data access for `project_media` (spec §4/§18/§21) — same
 * conventions as `repositories/projects.ts`: this file owns table
 * name/columns/queries only, RLS enforces published-vs-admin
 * visibility, no validation lives here.
 */

/** Public read: RLS (`project_media_select_published`) restricts this to media whose parent project is published — no app-level status check needed here, matching every other public read function in this codebase. */
export async function listPublishedProjectMedia(projectId: string): Promise<ProjectMediaRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("project_media")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

/** Admin read: RLS (`project_media_select_admin_all`) allows every row regardless of the parent project's status. */
export async function listAllProjectMedia(projectId: string): Promise<ProjectMediaRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("project_media")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function insertProjectMedia(input: {
  projectId: string;
  storagePath: string;
  altText: string | null;
  sortOrder: number;
}): Promise<ProjectMediaRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("project_media")
    .insert({
      project_id: input.projectId,
      storage_path: input.storagePath,
      alt_text: input.altText,
      sort_order: input.sortOrder,
    })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateProjectMediaOrder(id: string, sortOrder: number): Promise<ProjectMediaRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("project_media")
    .update({ sort_order: sortOrder })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function updateProjectMediaAltText(id: string, altText: string | null): Promise<ProjectMediaRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("project_media")
    .update({ alt_text: altText })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function getProjectMediaById(id: string): Promise<ProjectMediaRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("project_media").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

/** Deletes only the database row — the caller (`projectMediaService.ts`) is responsible for also removing the Storage object, since this repository doesn't know about Storage (spec §19). */
export async function deleteProjectMediaRow(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("project_media").delete().eq("id", id);
  if (error) throw error;
}
