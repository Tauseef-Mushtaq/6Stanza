import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ContentStatus, Database } from "@/lib/supabase/database.types";
import type { TestimonialInput } from "@/lib/validation/cmsContent";

export type TestimonialRow = Database["public"]["Tables"]["testimonials"]["Row"];

/**
 * MODULE-TESTIMONIAL-1 — data access for `testimonials`. Same shape as
 * `repositories/services.ts`: repositories own table/column names,
 * callers (the service layer) own validation and error mapping. RLS
 * (`supabase/migrations/0009_testimonials.sql`) enforces published-vs-
 * draft visibility; these functions don't re-check `status` in code.
 */

// ---- public reads (published only, enforced by RLS) ----

export async function listPublishedTestimonials(): Promise<TestimonialRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("testimonials")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

// ---- admin reads/writes (all statuses; RLS restricts to admins) ----

export async function listAllTestimonials(status?: ContentStatus): Promise<TestimonialRow[]> {
  const supabase = await createSupabaseServerClient();
  let query = supabase.from("testimonials").select("*").order("sort_order", { ascending: true });
  if (status) query = query.eq("status", status);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function getTestimonialById(id: string): Promise<TestimonialRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("testimonials").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data ?? null;
}

function toRow(input: TestimonialInput) {
  return {
    name: input.name,
    role: input.role || null,
    company: input.company || null,
    quote: input.quote,
    image_path: input.imagePath || null,
    project_id: input.projectId || null,
    sort_order: input.sortOrder,
    status: input.status,
  };
}

export async function insertTestimonial(input: TestimonialInput): Promise<TestimonialRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("testimonials")
    .insert({ ...toRow(input), published_at: input.status === "published" ? new Date().toISOString() : null })
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/** Same `published_at` semantics as `updateService` — first transition into `published` stamps it; later edits preserve the original timestamp. */
export async function updateTestimonial(id: string, input: TestimonialInput): Promise<TestimonialRow> {
  const supabase = await createSupabaseServerClient();

  const existing = await getTestimonialById(id);
  const publishedAt =
    input.status === "published" ? (existing?.published_at ?? new Date().toISOString()) : (existing?.published_at ?? null);

  const { data, error } = await supabase
    .from("testimonials")
    .update({ ...toRow(input), published_at: publishedAt })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

export async function archiveTestimonial(id: string): Promise<TestimonialRow> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("testimonials")
    .update({ status: "archived" })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/** Permanent deletion, distinct from `archiveTestimonial` — mirrors `deleteService`. */
export async function deleteTestimonial(id: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) throw error;
}
