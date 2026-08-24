import { siteConfig } from "@/config/site";

/**
 * SEO-1 — single source of truth for absolute/canonical URLs.
 *
 * `siteConfig.url` is the only origin this ever resolves against.
 * Domain-alignment task — this currently points at the live Vercel
 * deployment (https://6stanza.vercel.app), since that's the only
 * publicly reachable URL for the site right now. The intended custom
 * domain (https://6stanza.com) becomes the target again once it's
 * actually live — change `siteConfig.url` at that point, not this
 * file, and re-verify. Whatever `siteConfig.url` is set to becomes
 * the canonical identity in metadata, canonicals, the sitemap, and
 * Open Graph URLs, regardless of which environment the app is
 * actually running/rendering in.
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
