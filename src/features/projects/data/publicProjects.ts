import "server-only";

import { cache } from "react";
import { getPublishedProjects } from "@/lib/services/projectContentService";
import { getPublishedProjectGallery } from "@/lib/services/projectMediaService";
import { getPublicMediaUrl } from "@/lib/cms/media";
import type { ProjectRow } from "@/lib/repositories/projects";
import type { ProjectItem } from "@/features/home/data/projects";
import type { ArchitectureGroup, ProjectDetail, ProjectGalleryImage } from "./projectDetails";

/**
 * Module 9G — public data boundary for Projects (spec §6/§30), same
 * pattern as `src/features/services/data/publicServices.ts` from
 * Module 9F. Maps the CMS `projects` row onto the two existing,
 * unchanged frontend types those components already expect —
 * `ProjectItem` (home Work section / Projects index / detail hero /
 * next-project CTA) and `ProjectDetail` (the case-study template).
 * Nothing below this file knows a CMS row exists.
 */

function toProjectItem(row: ProjectRow): ProjectItem {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    description: row.description,
    technologies: row.technologies,
    outcome: row.outcome,
    accent: row.accent,
  };
}

/**
 * `architecture` is stored as `jsonb` (spec §13) — the database type
 * (`ProjectArchitectureGroup[]`) documents the intended shape but
 * doesn't runtime-validate it the way a real column type would.
 * Malformed groups/items are dropped rather than crashing the page or
 * inventing placeholder content (spec §14); a dropped group only
 * ever shrinks the rendered architecture chapter, it never breaks it.
 */
function normalizeArchitecture(raw: unknown): ArchitectureGroup[] {
  if (!Array.isArray(raw)) return [];

  const groups: ArchitectureGroup[] = [];
  for (const entry of raw) {
    if (typeof entry !== "object" || entry === null) continue;
    const { label, items } = entry as { label?: unknown; items?: unknown };
    if (typeof label !== "string" || label.trim().length === 0) continue;
    if (!Array.isArray(items)) continue;

    const cleanItems = items.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
    if (cleanItems.length === 0) continue;

    groups.push({ label, items: cleanItems });
  }
  return groups;
}

function toProjectDetail(row: ProjectRow, gallery: ProjectGalleryImage[]): ProjectDetail {
  return {
    slug: row.slug,
    positioning: row.positioning ?? "",
    overview: {
      summary: row.overview_summary ?? "",
      contribution: row.overview_contribution ?? "",
    },
    challenge: row.challenge ?? "",
    solution: row.solution ?? "",
    architecture: normalizeArchitecture(row.architecture),
    outcomeStatement: row.outcome_statement ?? "",
    gallery,
  };
}

/**
 * Module 9K — real uploaded gallery images for one project, mapped to
 * the typed `{ src, alt }` shape `ProjectGallery` actually consumes
 * (spec §22 — "do not leak database media rows directly to
 * components"). `alt_text` falls back to the project's own `title`
 * when an admin hasn't set one, so `next/image`'s `alt` is never
 * empty. Returns `[]` on failure (same degrade-gracefully rule as
 * `getPublicProjectRows`) — a broken gallery query never breaks the
 * whole project page, it just falls back to `ProjectGallery`'s
 * existing procedural panels.
 */
async function getProjectGalleryImages(row: ProjectRow): Promise<ProjectGalleryImage[]> {
  const result = await getPublishedProjectGallery(row.id);
  if (!result.ok) {
    console.error("getProjectGalleryImages: query failed:", result.message);
    return [];
  }

  const images: ProjectGalleryImage[] = [];
  for (const media of result.data) {
    const src = getPublicMediaUrl("projects", media.storage_path);
    if (!src) continue;
    images.push({ src, alt: media.alt_text?.trim() || row.title });
  }
  return images;
}

/**
 * Request-memoized (`react.cache`) published-projects read — same
 * rationale as `getPublicServiceRows` in Module 9F: `/projects`
 * (hero + featured list), `/projects/[slug]` (metadata + page), and
 * the Home Work section all end up calling this within the same
 * request, so memoizing here keeps it to one Supabase query per
 * request regardless of how many server components consume it
 * (spec §11/§26).
 *
 * Returns `[]` on failure rather than throwing, so a transient CMS
 * error degrades to the public empty state instead of a hard crash
 * (spec §24).
 */
export const getPublicProjectRows = cache(async (): Promise<ProjectRow[]> => {
  const result = await getPublishedProjects();
  if (!result.ok) {
    console.error("getPublicProjectRows: query failed:", result.message);
    return [];
  }
  return result.data;
});

/** List shape for the Projects index hero/featured list and the Home Work section. Order follows CMS `sort_order` (already applied by the repository query). */
export async function getPublicProjects(): Promise<ProjectItem[]> {
  const rows = await getPublicProjectRows();
  return rows.map(toProjectItem);
}

export interface PublicProjectDetailBundle {
  project: ProjectItem;
  detail: ProjectDetail;
  index: number;
  total: number;
  prev: ProjectItem;
  next: ProjectItem;
}

/** Everything `/projects/[slug]` needs for one published project, or `null` if the slug has no published match (caller should `notFound()`). */
export async function getPublicProjectDetail(slug: string): Promise<PublicProjectDetailBundle | null> {
  const rows = await getPublicProjectRows();
  const rowIndex = rows.findIndex((row) => row.slug === slug);
  if (rowIndex === -1) return null;

  const items = rows.map(toProjectItem);
  const total = items.length;
  const row = rows[rowIndex];

  const gallery = await getProjectGalleryImages(row);

  return {
    project: items[rowIndex],
    detail: toProjectDetail(row, gallery),
    index: rowIndex + 1,
    total,
    prev: items[(rowIndex - 1 + total) % total],
    next: items[(rowIndex + 1) % total],
  };
}
