import "server-only";

import { cache } from "react";
import { getPublishedTeamMembers } from "@/lib/services/teamContentService";
import { getPublicMediaUrl } from "@/lib/cms/media";
import type { TeamMemberRow } from "@/lib/repositories/teamMembers";
import type { TeamMember } from "@/features/home/data/team";

/**
 * Module 9H — public data boundary for Team (spec §6/§9H).
 *
 * Same shape as `publicServices.ts` (Module 9F) / `publicProjects.ts`
 * (Module 9G): a request-memoized published-rows read plus a small,
 * pure adapter mapping the CMS `team_members` row onto the existing,
 * unchanged `TeamMember` frontend type. Nothing below this file knows
 * a CMS row exists — every consumer keeps importing `TeamMember`
 * exactly as before.
 */

/**
 * `social_links` is typed as `TeamMemberSocialLink[]` in
 * `database.types.ts`, but that only describes intent — Postgres
 * `jsonb` doesn't enforce it at the column level. Validate defensively
 * at this boundary (spec §9): non-array input becomes no links; any
 * entry missing a non-empty string `label`/`href` is dropped rather
 * than crashing the page. Mirrors `normalizeArchitecture()` in
 * `publicProjects.ts`.
 */
/**
 * Module 9N (spec §29) — `teamMemberSocialLinkSchema` validates
 * presence/length of `href` but not its scheme. Reject
 * executable-URL schemes (`javascript:`, `data:`, `vbscript:`) here
 * at the same boundary that already defends against malformed shape,
 * rather than passing them through to a rendered anchor. Ordinary
 * `https://`, `http://`, `mailto:`, and scheme-relative/relative
 * links are left untouched — this is the smallest safe addition, not
 * a general URL validator.
 */
const UNSAFE_HREF_SCHEME = /^\s*(javascript|data|vbscript):/i;

function normalizeSocialLinks(raw: unknown): TeamMember["socialLinks"] {
  if (!Array.isArray(raw)) return undefined;

  const links = raw
    .filter((entry): entry is Record<string, unknown> => typeof entry === "object" && entry !== null)
    .map((entry) => ({
      label: typeof entry.label === "string" ? entry.label.trim() : "",
      href: typeof entry.href === "string" ? entry.href.trim() : "",
    }))
    .filter((link) => link.label.length > 0 && link.href.length > 0 && !UNSAFE_HREF_SCHEME.test(link.href));

  return links.length > 0 ? links : undefined;
}

function toTeamMember(row: TeamMemberRow): TeamMember {
  return {
    slug: row.slug,
    name: row.name,
    role: row.role,
    discipline: row.discipline,
    shortBio: row.short_bio,
    initials: row.initials,
    image: getPublicMediaUrl("team", row.image_path),
    socialLinks: normalizeSocialLinks(row.social_links),
  };
}

/**
 * Request-memoized (`react.cache`) published-team read. `/team`
 * (hero + sequence + focus) and the Home Team section both end up
 * calling this within the same request — memoizing here means only
 * one Supabase query actually runs per request no matter how many
 * server components read it (spec §13).
 *
 * Returns `[]` on failure rather than throwing, so a transient CMS
 * error degrades to the public empty state instead of a hard crash
 * (spec §16).
 */
export const getPublicTeamRows = cache(async (): Promise<TeamMemberRow[]> => {
  const result = await getPublishedTeamMembers();
  if (!result.ok) {
    console.error("getPublicTeamRows: query failed:", result.message);
    return [];
  }
  return result.data;
});

/** Published team members, CMS-ordered (`sort_order`, applied by the repository query) and mapped onto the existing `TeamMember` type. */
export async function getPublicTeam(): Promise<TeamMember[]> {
  const rows = await getPublicTeamRows();
  return rows.map(toTeamMember);
}
