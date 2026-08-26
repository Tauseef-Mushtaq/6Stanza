import "server-only";

import { cache } from "react";
import { getPublishedTestimonials } from "@/lib/services/testimonialContentService";
import { getPublicMediaUrl } from "@/lib/cms/media";
import type { TestimonialRow } from "@/lib/repositories/testimonials";
import type { Testimonial } from "@/features/testimonials/data/testimonials";
import type { PublicCollectionResult } from "@/lib/utils/publicCms";

/**
 * MODULE-TESTIMONIAL-1 — public data boundary for Testimonials. Same
 * shape as `publicTeam.ts`: a request-memoized published-rows read
 * plus a pure adapter mapping the CMS row onto the plain `Testimonial`
 * type. Uses `PublicCollectionResult` from the start (rather than the
 * `[]`-on-failure shape Modules 9F–9I originally shipped and Module
 * 10B later had to retrofit) so the Home section can distinguish "no
 * published testimonials" from "the read failed" immediately.
 */

function toTestimonial(row: TestimonialRow): Testimonial {
  return {
    id: row.id,
    name: row.name,
    role: row.role ?? undefined,
    company: row.company ?? undefined,
    quote: row.quote,
    image: getPublicMediaUrl("general", row.image_path),
    projectId: row.project_id ?? undefined,
  };
}

/** Request-memoized published-testimonials read, same rationale as `getPublicTeamRows`. */
export const getPublicTestimonialRows = cache(async (): Promise<PublicCollectionResult<TestimonialRow>> => {
  const result = await getPublishedTestimonials();
  if (!result.ok) {
    console.error("getPublicTestimonialRows: query failed:", result.message);
    return { ok: false, data: [] };
  }
  return { ok: true, data: result.data };
});

/** Published testimonials, CMS-ordered (`sort_order`) and mapped onto the plain `Testimonial` type. `ok: false` means the read failed. */
export async function getPublicTestimonials(): Promise<PublicCollectionResult<Testimonial>> {
  const rows = await getPublicTestimonialRows();
  return { ok: rows.ok, data: rows.data.map(toTestimonial) };
}
