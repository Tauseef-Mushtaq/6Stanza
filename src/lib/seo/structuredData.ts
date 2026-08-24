import { siteConfig } from "@/config/site";
import { absoluteUrl, defaultOgImage } from "@/lib/seo/canonical";

/**
 * SEO-3 — single reusable structured-data (JSON-LD / Schema.org) layer.
 *
 * Every builder here returns a plain JSON-LD object; nothing renders
 * HTML directly. Pages compose one or more of these and pass the
 * result to `<JsonLd>` (below) for safe, escaped rendering.
 *
 * Hard rule enforced throughout this file (module spec §4, §10, §26,
 * §32): every property comes from real project/CMS data or from
 * `siteConfig`/`absoluteUrl`/`defaultOgImage` (already-established
 * SEO-1 constants) — nothing here invents an address, phone number,
 * rating, review, author, founding date, or price. Where a field
 * isn't available, the builder omits it rather than fabricating a
 * placeholder.
 */

// ---------------------------------------------------------------------------
// @id strategy — stable, deterministic, built from absoluteUrl(), never a
// random UUID (module spec §16).
// ---------------------------------------------------------------------------

const ORGANIZATION_ID = `${siteConfig.url}/#organization`;
const WEBSITE_ID = `${siteConfig.url}/#website`;

// ---------------------------------------------------------------------------
// Organization — one canonical site-wide identity (module spec §4, §6).
// Only `name`, `url`, and `logo` are backed by real current project data;
// `sameAs` is intentionally omitted (no confirmed official social profile
// URLs exist in the current project) rather than guessed at.
//
// SEO-7 — `areaServed: "Pakistan"` added. This is not a new claim: the
// About page's own rendered copy already states 6STANZA is
// Pakistan-based ("We're based in Pakistan, and that's where our work
// is grounded" — src/features/about/sections/Direction.tsx), and
// SEO-2 already encoded the same country-level fact into service page
// titles ("[service] Services in Pakistan"). `areaServed` on
// `Organization` doesn't assert a street address, storefront, or
// opening hours the way `LocalBusiness` would — see
// docs/seo/local-seo-roadmap.md "Local schema decision" for the full
// reasoning on why LocalBusiness itself was NOT implemented.
// ---------------------------------------------------------------------------

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: defaultOgImage,
    areaServed: "Pakistan",
    description: siteConfig.tagline,
  };
}

// ---------------------------------------------------------------------------
// WebSite — publisher relationship points back to the same Organization
// entity via @id reference, not a duplicate inline copy (module spec §6).
// No SearchAction: the site has no on-site search endpoint (module spec §27).
// ---------------------------------------------------------------------------

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    name: siteConfig.name,
    url: siteConfig.url,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

/**
 * The two site-wide entities, graphed together. Rendered once, in the
 * root layout, so every page's `<head>` carries exactly one
 * Organization + WebSite definition rather than a fresh copy per page
 * (module spec §18 — duplicate/conflict prevention).
 */
export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationSchema(), websiteSchema()],
  };
}

// ---------------------------------------------------------------------------
// BreadcrumbList (module spec §7) — every URL is a real canonical URL via
// absoluteUrl(), every label is real page-title/content text, never invented.
// ---------------------------------------------------------------------------

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

// ---------------------------------------------------------------------------
// WebPage (module spec §14) — used selectively on important static pages.
// isPartOf points back to the WebSite entity by reference (module spec §15).
// ---------------------------------------------------------------------------

export function webPageSchema(opts: { path: string; name: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${absoluteUrl(opts.path)}#webpage`,
    url: absoluteUrl(opts.path),
    name: opts.name,
    description: opts.description,
    isPartOf: { "@id": WEBSITE_ID },
  };
}

// ---------------------------------------------------------------------------
// Service (module spec §8, §9) — one entity per CMS service record, built
// only from fields the public data layer actually exposes. No price,
// offers, serviceArea, or rating (module spec §8 — none of that data exists
// in the current project, so none of it is invented here).
// ---------------------------------------------------------------------------

export function serviceSchema(opts: {
  slug: string;
  name: string;
  description: string;
  image?: string;
}) {
  const url = absoluteUrl(`/services/${opts.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${url}#service`,
    name: opts.name,
    description: opts.description,
    url,
    image: opts.image ?? defaultOgImage,
    provider: { "@id": ORGANIZATION_ID },
  };
}

// ---------------------------------------------------------------------------
// Article (module spec §11, §12, §13) — for Insights. `datePublished` uses
// the same real `date` value (published_at, falling back to created_at)
// already computed by `getPublicInsightBySlug`/`getPublicInsights` — never a
// fabricated timestamp. No `author` property at all: the current public
// Insight data has no author field (module spec §12 — omit rather than
// invent). No `dateModified`: no `updated_at` is exposed to the public data
// layer either (same gap already documented in SEO-1/SEO-2 for sitemap
// lastModified and Service/Project images).
// ---------------------------------------------------------------------------

export function articleSchema(opts: {
  slug: string;
  headline: string;
  description: string;
  datePublished: string;
  image?: string;
}) {
  const url = absoluteUrl(`/insights/${opts.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: opts.headline,
    description: opts.description,
    url,
    datePublished: opts.datePublished,
    image: opts.image ?? defaultOgImage,
    publisher: { "@id": ORGANIZATION_ID },
  };
}

// ---------------------------------------------------------------------------
// Project detail (module spec §10) — the module explicitly warns against
// reaching for the "most lucrative-looking type" (Product/Review) when the
// content doesn't support it. A 6STANZA project write-up is editorial case
// -study content, not a purchasable product with reviews — CreativeWork is
// the accurate type: real title/description/technologies, no fabricated
// client identity, rating, award, or date.
// ---------------------------------------------------------------------------

export function projectSchema(opts: {
  slug: string;
  name: string;
  description: string;
  technologies?: string[];
}) {
  const url = absoluteUrl(`/projects/${opts.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "@id": `${url}#project`,
    name: opts.name,
    description: opts.description,
    url,
    image: defaultOgImage,
    ...(opts.technologies && opts.technologies.length > 0 ? { keywords: opts.technologies.join(", ") } : {}),
    creator: { "@id": ORGANIZATION_ID },
  };
}
