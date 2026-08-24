import { z } from "zod";

/**
 * Module 9A — shared CMS validation building blocks (spec §22).
 *
 * These validate the shape the future admin write paths (Module 9B+)
 * will submit. Nothing calls these yet — same "foundation without a
 * caller" situation as `contactInquiry.ts`/`projectInquiry.ts` from
 * Module 5, until the admin CRUD UI exists. Database-level constraints
 * (`supabase/migrations/0005_cms_content.sql`) are the actual source of
 * truth for uniqueness/format — these schemas exist to fail fast and
 * give field-level errors before a request ever reaches Postgres.
 */

/** Matches the `_slug_format` check constraint on every CMS table. */
export const slugSchema = z
  .string()
  .trim()
  .min(1, "Enter a slug.")
  .max(200)
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only (e.g. web-development).");

export const contentStatusSchema = z.enum(["draft", "published", "archived"]);

export const sortOrderSchema = z.number().int().min(0).max(100000);

/** Storage-relative path, not a full URL — matches `media_path`/`image_path` columns (spec §17). No scheme, no leading slash. */
export const mediaPathSchema = z
  .string()
  .trim()
  .max(500)
  .regex(/^(?!https?:\/\/)[^\s]+$/, "Enter a storage path, not a full URL.")
  .optional()
  .or(z.literal(""));

// ---------------------------------------------------------------------
// services
// ---------------------------------------------------------------------

export const serviceSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1, "Enter a name.").max(200),
  category: z.string().trim().min(1, "Enter a category.").max(100),
  shortDescription: z.string().trim().min(1, "Enter a short description.").max(1000),
  tags: z.array(z.string().trim().min(1).max(50)).max(10).default([]),
  iconKey: z.string().trim().min(1, "Select an icon.").max(50),
  problem: z.string().trim().max(4000).optional().or(z.literal("")),
  capabilities: z.array(z.string().trim().min(1).max(200)).max(20).default([]),
  architecture: z.array(z.string().trim().min(1).max(100)).max(20).default([]),
  principles: z.array(z.number().int().min(1).max(6)).max(6).default([]),
  mediaPath: mediaPathSchema,
  sortOrder: sortOrderSchema.default(0),
  status: contentStatusSchema.default("draft"),
});

export type ServiceInput = z.infer<typeof serviceSchema>;

// ---------------------------------------------------------------------
// projects
// ---------------------------------------------------------------------

export const projectArchitectureGroupSchema = z.object({
  label: z.string().trim().min(1).max(100),
  items: z.array(z.string().trim().min(1).max(100)).min(1).max(20),
});

export const projectSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1, "Enter a title.").max(200),
  category: z.string().trim().min(1, "Enter a category.").max(150),
  description: z.string().trim().min(1, "Enter a description.").max(2000),
  technologies: z.array(z.string().trim().min(1).max(50)).max(20).default([]),
  outcome: z.string().trim().min(1, "Enter an outcome.").max(200),
  accent: z.number().int().min(0).max(360).default(200),
  positioning: z.string().trim().max(300).optional().or(z.literal("")),
  overviewSummary: z.string().trim().max(2000).optional().or(z.literal("")),
  overviewContribution: z.string().trim().max(2000).optional().or(z.literal("")),
  challenge: z.string().trim().max(2000).optional().or(z.literal("")),
  solution: z.string().trim().max(2000).optional().or(z.literal("")),
  architecture: z.array(projectArchitectureGroupSchema).max(10).default([]),
  outcomeStatement: z.string().trim().max(500).optional().or(z.literal("")),
  mediaPath: mediaPathSchema,
  sortOrder: sortOrderSchema.default(0),
  status: contentStatusSchema.default("draft"),
});

export type ProjectInput = z.infer<typeof projectSchema>;

// ---------------------------------------------------------------------
// team members
// ---------------------------------------------------------------------

export const teamMemberSocialLinkSchema = z.object({
  label: z.string().trim().min(1).max(50),
  href: z.string().trim().min(1).max(500),
});

export const teamMemberSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1, "Enter a name.").max(200),
  role: z.string().trim().min(1, "Enter a role.").max(200),
  discipline: z.string().trim().min(1, "Enter a discipline.").max(100),
  shortBio: z.string().trim().min(1, "Enter a short bio.").max(1000),
  initials: z.string().trim().min(1, "Enter initials.").max(4),
  imagePath: mediaPathSchema,
  socialLinks: z.array(teamMemberSocialLinkSchema).max(10).default([]),
  sortOrder: sortOrderSchema.default(0),
  status: contentStatusSchema.default("draft"),
});

export type TeamMemberInput = z.infer<typeof teamMemberSchema>;

// ---------------------------------------------------------------------
// insights
// ---------------------------------------------------------------------

/** Matches `InsightBlock` (src/features/insights/data/insights.ts) exactly — no extra block types invented. */
export const insightBlockSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), text: z.string().trim().min(1).max(5000) }),
  z.object({ type: z.literal("heading"), text: z.string().trim().min(1).max(200) }),
  z.object({ type: z.literal("quote"), text: z.string().trim().min(1).max(1000), attribution: z.string().trim().max(200).optional() }),
  z.object({ type: z.literal("list"), items: z.array(z.string().trim().min(1).max(500)).min(1).max(30) }),
  z.object({ type: z.literal("code"), language: z.string().trim().min(1).max(30), code: z.string().min(1).max(10000) }),
  z.object({ type: z.literal("callout"), label: z.string().trim().min(1).max(100), text: z.string().trim().min(1).max(1000) }),
]);

export const insightSchema = z.object({
  slug: slugSchema,
  title: z.string().trim().min(1, "Enter a title.").max(200),
  category: z.string().trim().min(1, "Enter a category.").max(100),
  excerpt: z.string().trim().min(1, "Enter an excerpt.").max(500),
  content: z.array(insightBlockSchema).max(100).default([]),
  readingTime: z.string().trim().min(1, "Enter a reading time.").max(20),
  mediaPath: mediaPathSchema,
  /** Optional FK to `services.slug` (SEO-4 spec §17) — powers the "Related Service" CTA. Empty string clears it. */
  relatedServiceSlug: slugSchema.optional().or(z.literal("")),
  status: contentStatusSchema.default("draft"),
});

export type InsightInput = z.infer<typeof insightSchema>;
