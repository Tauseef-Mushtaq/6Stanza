import "server-only";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ProjectInquiryInput } from "@/lib/validation/projectInquiry";

/**
 * Data access for `project_inquiries` — the only file in the codebase
 * that knows this table's column names. Callers (the service layer)
 * work with the validated form shape, not raw Supabase rows.
 *
 * Uses `createSupabaseServerClient()`, not the admin client — inserts
 * go through RLS's `project_inquiries_insert_anyone` policy like any
 * other request would, so this repository can't accidentally bypass
 * the security model it's supposed to be respecting.
 */
export async function insertProjectInquiry(input: ProjectInquiryInput) {
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("project_inquiries").insert({
    name: input.name,
    email: input.email,
    company: input.company || null,
    project_title: input.projectTitle,
    services: input.services,
    stage: input.stage ?? null,
    timeline: input.timeline ?? null,
    budget: input.budget ?? null,
    message: input.message,
  });

  if (error) throw error;
}
