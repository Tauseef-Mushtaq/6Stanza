import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { primaryNav, ctaRoute } from "@/config/routes";
import { getPublicServices } from "@/features/services/data/publicServices";
import { getPublicProjects } from "@/features/projects/data/publicProjects";
import { getPublicInsights } from "@/features/insights/data/publicInsights";

/**
 * Module 10G / SEO-1 — Next.js file-based `sitemap.xml` convention.
 *
 * SEO-1 closes the gap the Module 10G handoff explicitly flagged:
 * static top-level routes were listed, but CMS-backed detail pages
 * (`/services/[slug]`, `/projects/[slug]`, `/insights/[slug]`) were
 * not, because a build-time slug list goes stale the moment a record
 * is published/archived afterward. This now reads the live,
 * request-time CMS data (the same `getPublicServices`/
 * `getPublicProjects`/`getPublicInsights` reads the actual pages use,
 * `react.cache()`-memoized) instead of a hardcoded list, so the
 * sitemap always reflects exactly what's currently published — no
 * stale/404 entries, nothing missing.
 *
 * `lastModified` is deliberately omitted everywhere (SEO-1 §14):
 * none of `ServiceItem`/`ProjectItem`/`Insight` currently expose a
 * real `updated_at` value to the public data layer, and setting every
 * URL to `new Date()` on every request would be a fabricated,
 * misleading update signal rather than an absent one. Add real
 * `lastModified` values here once the CMS repositories surface actual
 * `updated_at` timestamps through the public data functions.
 *
 * A CMS read failure (`ok: false`) degrades to an empty list for that
 * content type rather than throwing — a sitemap that's temporarily
 * missing new services/projects/articles is far less harmful than a
 * sitemap request that 500s and drops every URL, including the static
 * ones, from Google's crawl.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["/", ...primaryNav.map((r) => r.href), ctaRoute.href];

  const [services, projects, insights] = await Promise.all([
    getPublicServices(),
    getPublicProjects(),
    getPublicInsights(),
  ]);

  const dynamicRoutes = [
    ...(services.ok ? services.data.map((s) => `/services/${s.slug}`) : []),
    ...(projects.ok ? projects.data.map((p) => `/projects/${p.slug}`) : []),
    ...(insights.ok ? insights.data.map((i) => `/insights/${i.slug}`) : []),
  ];

  return [...staticRoutes, ...dynamicRoutes].map((route) => ({
    url: `${siteConfig.url}${route}`,
  }));
}
