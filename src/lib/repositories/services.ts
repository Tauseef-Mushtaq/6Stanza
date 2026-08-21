import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContentStatus, Database } from "@/lib/supabase/database.types";
import type { ServiceInput } from "@/lib/validation/cmsContent";

export type ServiceRow = Database["public"]["Tables"]["services"]["Row"];

/**
 * Data access for `services` (spec §10/§20). Mirrors the shape of
 * `src/lib/repositories/contactInquiries.ts`: repositories own table
 * names/columns/queries, callers (services layer) own validation and
 * error mapping. RLS (`supabase/migrations/0005_cms_content.sql`) is
 * what actually enforces published-vs-draft visibility — these
 * functions don't re-check status in application code, they rely on
 * the policy the way `listContactInquiries` relies on
 * `contact_inquiries_select_admin_only`.
 */

// ---- public reads (published only, enforced by RLS) ----

export async function listPublishedServices(): Promise<ServiceRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("services").select("*").order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function getPublishedServiceBySlug(slug: string): Promise<ServiceRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("services").select("*").eq("slug", slug).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

// ---- admin reads/writes (all statuses; RLS restricts to admins) ----

/**
 * Module 9B — optional `status` filters at the database level (spec
 * §6 — "filtering should preferably happen server-side," matching
 * `listContactInquiries`'s existing `status?` parameter from Module
 * 7A), so the admin list page never has to fetch every service just
 * to filter it in the browser.
 */
export async function listAllServices(status?: ContentStatus): Promise<ServiceRow[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("services").select("*").order("sort_order", { ascending: true });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getServiceById(id: string): Promise<ServiceRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("services").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

function toRow(input: ServiceInput) {
  return {
    slug: input.slug,
    name: input.name,
    category: input.category,
    short_description: input.shortDescription,
    tags: input.tags,
    icon_key: input.iconKey,
    problem: input.problem || null,
    capabilities: input.capabilities,
    architecture: input.architecture,
    principles: input.principles,
    media_path: input.mediaPath || null,
    sort_order: input.sortOrder,
    status: input.status,
  };
}

export async function insertService(input: ServiceInput): Promise<ServiceRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("services")
    .insert({ ...toRow(input), published_at: input.status === "published" ? new Date().toISOString() : null })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/**
 * Module 9B — `published_at` semantics (spec §11): first transition
 * into `published` stamps `published_at`; going back to `draft`
 * afterwards preserves the existing timestamp rather than clearing
 * it, so "first published" stays answerable even after an edit cycle.
 * Reads the row's current `published_at` before writing so this holds
 * regardless of what the caller's form state remembers.
 */
export async function updateService(id: string, input: ServiceInput): Promise<ServiceRow> {
  const supabase = await createSupabaseServerClient();

  const existing = await getServiceById(id);
  const publishedAt =
    input.status === "published" ? (existing?.published_at ?? new Date().toISOString()) : (existing?.published_at ?? null);

  const { data, error } = await supabase
    .from("services")
    .update({ ...toRow(input), published_at: publishedAt })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function archiveService(id: string): Promise<ServiceRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("services")
    .update({ status: "archived" })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/**
 * Module 9M — permanent deletion (spec §17/§18), distinct from
 * `archiveService` above: archiving only ever sets `status =
 * 'archived'` and keeps the row; this actually removes it. The row is
 * fetched by the caller (`serviceContentService.ts`) *before* this
 * runs, so it still has `media_path` available for Storage cleanup —
 * this function's only job is the database delete, matching the same
 * "repository doesn't know about Storage" boundary
 * `deleteProjectMediaRow` already established in Module 9K.
 */
export async function deleteService(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw error;
}
