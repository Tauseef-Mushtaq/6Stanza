import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { primaryNav, ctaRoute } from "@/config/routes";

/**
 * Module 10G — Next.js file-based `sitemap.xml` convention.
 *
 * Deliberately lists only the static top-level routes (home + every
 * `primaryNav`/`ctaRoute` entry), not CMS-backed detail pages
 * (`/services/[slug]`, `/projects/[slug]`, `/insights/[slug]`). Every
 * dynamic route in this codebase already avoids enumerating CMS slugs
 * at build time on purpose (see `generateStaticParams` in each
 * `[slug]/page.tsx` — a build-time list goes stale the moment a
 * record is published/archived afterward, per the Module 9F/9G/9I
 * handoffs). A sitemap has the identical staleness problem: entries
 * for archived slugs would 404, and slugs published after the last
 * deploy would be missing. Enumerating them here would need a live
 * CMS read at request time, which is a real improvement but a bigger
 * change than this module's audit scope — flagged in the handoff.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = ["/", ...primaryNav.map((r) => r.href), ctaRoute.href];

  return staticRoutes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date(),
  }));
}
