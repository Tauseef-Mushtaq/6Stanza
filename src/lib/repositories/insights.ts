import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContentStatus, Database } from "@/lib/supabase/database.types";
import type { InsightInput } from "@/lib/validation/cmsContent";

export type InsightRow = Database["public"]["Tables"]["insights"]["Row"];

/**
 * Data access for `insights` — see `repositories/services.ts` header
 * for the shared conventions this follows. Ordered by `published_at`
 * (not `sort_order`, which this table doesn't have — see
 * `0005_cms_content.sql`), matching how `insights.ts` is already
 * ordered by `date` today.
 */

// ---- public reads (published only, enforced by RLS) ----

export async function listPublishedInsights(): Promise<InsightRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("insights")
    .select("*")
    .order("published_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPublishedInsightBySlug(slug: string): Promise<InsightRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("insights").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

// ---- admin reads/writes (all statuses; RLS restricts to admins) ----

/**
 * Module 9E — added the optional `status` filter (spec §7), matching
 * `listAllTeamMembers`/`listAllProjects`/`listAllServices`. Server-side
 * filtering via `.eq("status", status)`, not a client-side filter over
 * every row.
 */
export async function listAllInsights(status?: ContentStatus): Promise<InsightRow[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("insights").select("*").order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getInsightById(id: string): Promise<InsightRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("insights").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

function toRow(input: InsightInput) {
  return {
    slug: input.slug,
    title: input.title,
    category: input.category,
    excerpt: input.excerpt,
    content: input.content,
    reading_time: input.readingTime,
    media_path: input.mediaPath || null,
    status: input.status,
  };
}

export async function insertInsight(input: InsightInput): Promise<InsightRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("insights")
    .insert({ ...toRow(input), published_at: input.status === "published" ? new Date().toISOString() : null })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/**
 * Module 9E — `published_at` semantics fixed to match the corrected
 * `updateTeamMember`/`updateProject`/`updateService` pattern (Module 9D
 * found and fixed the same defect in `team_members`): the first
 * transition into `published` stamps `published_at`; going back to
 * `draft` afterwards preserves the existing timestamp rather than
 * clearing it. (The prior version derived `published_at` from
 * `input.status` alone, which cleared it on `published → draft` and
 * re-stamped it on every re-publish — a genuine defect per spec §4,
 * corrected here minimally rather than redesigning the table.)
 */
export async function updateInsight(id: string, input: InsightInput): Promise<InsightRow> {
  const supabase = await createSupabaseServerClient();

  const existing = await getInsightById(id);
  const publishedAt =
    input.status === "published" ? (existing?.published_at ?? new Date().toISOString()) : (existing?.published_at ?? null);

  const { data, error } = await supabase
    .from("insights")
    .update({ ...toRow(input), published_at: publishedAt })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function archiveInsight(id: string): Promise<InsightRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("insights")
    .update({ status: "archived" })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/**
 * Module 9M — permanent deletion (spec §17/§23). The caller
 * (`insightContentService.ts`) reads the row's `media_path` before
 * calling this, so it can attempt Storage cleanup after the database
 * delete succeeds — this function only removes the `insights` row.
 * After deletion, `/insights/[slug]` resolves through the existing
 * `getPublicInsightDetail`/`notFound()` path unchanged, since the row
 * simply no longer matches any slug query.
 */
export async function deleteInsight(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("insights").delete().eq("id", id);
  if (error) throw error;
}
