import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContentStatus, Database } from "@/lib/supabase/database.types";
import type { ProjectInput } from "@/lib/validation/cmsContent";

export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

/** Data access for `projects` — see `repositories/services.ts` header for the shared conventions this follows. */

// ---- public reads (published only, enforced by RLS) ----

export async function listPublishedProjects(): Promise<ProjectRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("projects").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getPublishedProjectBySlug(slug: string): Promise<ProjectRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("projects").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

// ---- admin reads/writes (all statuses; RLS restricts to admins) ----

/**
 * Module 9C — optional `status` filters at the database level (spec
 * §6), matching the `listAllServices(status?)` pattern from Module
 * 9B so the admin list page never fetches every project just to
 * filter it in the browser.
 */
export async function listAllProjects(status?: ContentStatus): Promise<ProjectRow[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("projects").select("*").order("sort_order", { ascending: true });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getProjectById(id: string): Promise<ProjectRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("projects").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

function toRow(input: ProjectInput) {
  return {
    slug: input.slug,
    title: input.title,
    category: input.category,
    description: input.description,
    technologies: input.technologies,
    outcome: input.outcome,
    accent: input.accent,
    positioning: input.positioning || null,
    overview_summary: input.overviewSummary || null,
    overview_contribution: input.overviewContribution || null,
    challenge: input.challenge || null,
    solution: input.solution || null,
    architecture: input.architecture,
    outcome_statement: input.outcomeStatement || null,
    media_path: input.mediaPath || null,
    sort_order: input.sortOrder,
    status: input.status,
  };
}

export async function insertProject(input: ProjectInput): Promise<ProjectRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({ ...toRow(input), published_at: input.status === "published" ? new Date().toISOString() : null })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/**
 * Module 9C — `published_at` semantics (spec §12), fixed to match the
 * `updateService` pattern established in Module 9B: the first
 * transition into `published` stamps `published_at`; going back to
 * `draft` afterwards preserves the existing timestamp rather than
 * clearing it. (The prior version of this function derived
 * `published_at` from `input.status` alone, which cleared it on
 * `published → draft` and re-stamped it on every subsequent
 * re-publish — a genuine defect caught during Module 9C inspection,
 * not a schema change.)
 */
export async function updateProject(id: string, input: ProjectInput): Promise<ProjectRow> {
  const supabase = await createSupabaseServerClient();

  const existing = await getProjectById(id);
  const publishedAt =
    input.status === "published" ? (existing?.published_at ?? new Date().toISOString()) : (existing?.published_at ?? null);

  const { data, error } = await supabase
    .from("projects")
    .update({ ...toRow(input), published_at: publishedAt })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function archiveProject(id: string): Promise<ProjectRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("projects")
    .update({ status: "archived" })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/**
 * Module 9M — permanent deletion (spec §17/§20). The `project_media`
 * FK (`0006_project_media.sql`, `on delete cascade`) removes every
 * gallery row for this project automatically at the database level —
 * this function doesn't need to touch `project_media` itself. It
 * only deletes the `projects` row; the caller
 * (`projectContentService.ts`) is responsible for reading the
 * project's own `media_path` and its gallery's `storage_path`s
 * *before* calling this, and attempting Storage cleanup for both
 * afterward, the same repository/Storage boundary every other
 * delete/cleanup path in this codebase already follows.
 */
export async function deleteProject(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
}
