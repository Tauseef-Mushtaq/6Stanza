import { sixS } from "@/features/home/data/sixS";
import { insightCategories } from "@/features/insights/data/insights";

/**
 * Module 9B — admin-only presentation constants for the Services CMS
 * (spec §9). Six S itself stays a static, non-CMS list (Module 9A
 * decision — see MODULE-9A-HANDOFF.md §B); this just reads that same
 * fixed list to render a controlled selection of valid `principles`
 * values, instead of letting the admin type arbitrary numbers.
 */
export const sixSOptions = sixS.map((principle) => ({
  value: principle.index,
  label: `${principle.index} — ${principle.label}`,
}));

/** Matches `ServiceItem["visual"]` (`src/features/home/data/services.ts`) — the fixed set of visual patterns `ServiceVisual` knows how to render. Kept as a plain array here (not re-exported from the frontend data file) since `cmsContent.ts`'s `iconKey` field is intentionally a free string at the schema level; this is presentation-only guidance for the admin form. */
export const iconKeyOptions = [
  { value: "web", label: "Web" },
  { value: "cloud", label: "Cloud" },
  { value: "devops", label: "DevOps" },
  { value: "security", label: "Security" },
  { value: "network", label: "Network" },
  { value: "marketing", label: "Marketing" },
  { value: "video", label: "Video" },
  { value: "seo", label: "SEO" },
] as const;

/**
 * Module 9E — presentation-only guidance for the Insight form's
 * category field, same rationale as `iconKeyOptions` above: the
 * `insightCategories` list already exists in the real public frontend
 * (`src/features/insights/data/insights.ts`), and `cmsContent.ts`'s
 * `category` field is intentionally a free string at the schema level,
 * so this just offers the existing values rather than letting the
 * admin retype them from scratch.
 */
export const insightCategoryOptions = insightCategories.map((category) => ({ value: category, label: category }));

/** `content_status` enum values (`0005_cms_content.sql`), spelled out for `z.enum`/`<select>` the same way `inquiryStatusValues` already does for inquiries. */
export const contentStatusValues = ["draft", "published", "archived"] as const;

/** Simple, dependency-free slugifier for the "generate a slug from the name, but let the admin edit it" convenience (spec §10) — not a separate library, just a small pure function next to the other admin-only constants it's used alongside. */
export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
