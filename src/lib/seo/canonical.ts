import { siteConfig } from "@/config/site";

/**
 * SEO-1 — single source of truth for absolute/canonical URLs.
 *
 * `siteConfig.url` (https://6stanza.com) is the only production
 * origin this ever resolves against — never the demo Vercel deployment
 * (https://6-stanza-demo.vercel.app). That keeps the demo domain from
 * ever accidentally becoming the canonical identity in metadata,
 * canonicals, the sitemap, or Open Graph URLs, regardless of which
 * environment the app is actually running/rendering in.
 *
 * `path` must start with "/". Returns the joined absolute URL with no
 * trailing slash (except for the root "/").
 */
export function absoluteUrl(path: string): string {
  if (path === "/") return siteConfig.url;
  return `${siteConfig.url}${path}`;
}

/** Shared brand image used as the Open Graph / Twitter card fallback wherever a page/entity has no CMS-uploaded image of its own. The real 6STANZA mark, not a placeholder. */
export const defaultOgImage = absoluteUrl("/6stanza-mark.png");
