import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * Module 10G / SEO-1 — Next.js file-based `robots.txt` convention.
 * Blocks crawling of `/admin` (already `noindex, nofollow` at the
 * route level via `src/app/admin/layout.tsx`'s metadata, but
 * excluding it here too keeps crawlers from even requesting those
 * URLs), the auth routes, and the internal `/design-system` and
 * `/motion` showcase routes — none have SEO value and shouldn't
 * accumulate crawl budget or show up in search results/history.
 * `robots.txt` alone doesn't guarantee de-indexing (SEO-1 §10), so
 * every one of these routes also carries its own page-level
 * `noindex, nofollow` metadata as the actual enforcement mechanism.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin",
        "/account",
        "/login",
        "/signup",
        "/forgot-password",
        "/reset-password",
        "/auth/",
        "/design-system",
        "/motion",
      ],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
