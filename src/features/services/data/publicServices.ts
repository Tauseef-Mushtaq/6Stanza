import "server-only";

import { cache } from "react";
import { getPublishedServices } from "@/lib/services/serviceContentService";
import { getPublicMediaUrl } from "@/lib/cms/media";
import type { ServiceRow } from "@/lib/repositories/services";
import type { ServiceItem } from "@/features/home/data/services";
import type { ServiceDetail } from "./serviceDetails";

/**
 * Module 9F — public data boundary for Services (spec §6/§25).
 *
 * Maps the merged CMS `services` row (§9A schema — one row carries
 * both the list-shape fields from the old `services.ts` and the
 * detail-shape fields from the old `serviceDetails.ts`) onto the two
 * existing, unchanged frontend types those components already expect:
 * `ServiceItem` (home rail / services index / detail hero) and
 * `ServiceDetail` (the six-chapter detail template). Nothing below
 * this file knows a CMS row exists — every consumer keeps importing
 * `ServiceItem/ServiceDetail` exactly as before.
 */

/** The fixed set `ServiceVisual` (home/components/ServiceVisual.tsx) actually knows how to render — matches `iconKeyOptions` in features/admin/lib/services.ts. `icon_key` is a free string at the schema level, so an unrecognized value falls back to "web" rather than reaching an unmapped case (spec §15 — no dynamic/arbitrary rendering from DB content). */
const KNOWN_VISUALS = ["web", "cloud", "devops", "security", "network", "marketing", "video", "seo"] as const;

function toVisual(iconKey: string): ServiceItem["visual"] {
  return (KNOWN_VISUALS as readonly string[]).includes(iconKey) ? (iconKey as ServiceItem["visual"]) : "web";
}

function toServiceItem(row: ServiceRow, index: number): ServiceItem {
  return {
    index,
    slug: row.slug,
    category: row.category,
    label: row.name,
    description: row.short_description,
    tags: row.tags,
    visual: toVisual(row.icon_key),
    image: getPublicMediaUrl("general", row.media_path),
  };
}

function toServiceDetail(row: ServiceRow): ServiceDetail {
  return {
    slug: row.slug,
    problem: row.problem ?? "",
    capabilities: row.capabilities,
    architecture: row.architecture,
    principles: row.principles,
  };
}

/**
 * Request-memoized (`react.cache`) published-services read. `/services`
 * (hero + progression), `/services/[slug]` (metadata + page), and the
 * Home Services section all end up calling this within the same
 * request — memoizing here means only one Supabase query actually
 * runs per request no matter how many of those server components
 * render (spec §11/§21 — avoid duplicate queries).
 *
 * Returns `[]` on failure rather than throwing, so a transient CMS
 * error degrades to the public empty state instead of a hard crash
 * (spec §19).
 */
export const getPublicServiceRows = cache(async (): Promise<ServiceRow[]> => {
  const result = await getPublishedServices();
  if (!result.ok) {
    console.error("getPublicServiceRows: query failed:", result.message);
    return [];
  }
  return result.data;
});

/** List shape for the home rail, services index hero/progression, and prev/next navigation. Order and `index` follow the CMS `sort_order` (already applied by the repository query). */
export async function getPublicServices(): Promise<ServiceItem[]> {
  const rows = await getPublicServiceRows();
  return rows.map((row, i) => toServiceItem(row, i + 1));
}

export interface PublicServiceDetailBundle {
  service: ServiceItem;
  detail: ServiceDetail;
  total: number;
  prev: ServiceItem;
  next: ServiceItem;
}

/** Everything `/services/[slug]` needs for one published service, or `null` if the slug has no published match (caller should `notFound()`). */
export async function getPublicServiceDetail(slug: string): Promise<PublicServiceDetailBundle | null> {
  const rows = await getPublicServiceRows();
  const index = rows.findIndex((row) => row.slug === slug);
  if (index === -1) return null;

  const items = rows.map((row, i) => toServiceItem(row, i + 1));
  const total = items.length;

  return {
    service: items[index],
    detail: toServiceDetail(rows[index]),
    total,
    prev: items[(index - 1 + total) % total],
    next: items[(index + 1) % total],
  };
}
