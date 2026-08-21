import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

/**
 * Module 10G — Next.js file-based `robots.txt` convention. Blocks
 * crawling of `/admin` (already `noindex, nofollow` at the route
 * level via `src/app/admin/layout.tsx`'s metadata, but excluding it
 * here too keeps crawlers from even requesting those URLs) and the
 * auth routes, which have no SEO value and shouldn't accumulate
 * crawl budget or show up in search results/history.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/account", "/login", "/signup", "/forgot-password", "/reset-password", "/auth/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
