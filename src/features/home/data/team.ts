export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  /** One-word discipline label (e.g. "Strategy", "Engineering") used as the eyebrow in the /team individual-focus chapter. */
  discipline: string;
  shortBio: string;
  /** Placeholder initials/monogram until real photography exists. */
  initials: string;
  /**
   * Optional real portrait path (e.g. "/team/rahman.jpg"). Added in
   * Module 4D so the dedicated `/team` page can drop in real
   * photography later without a data-shape change — every current
   * consumer (`Team.tsx`, `TeamJourney.tsx`, and the new `/team`
   * sections) already falls back to `initials` when this is absent.
   */
  image?: string;
  socialLinks?: { label: string; href: string }[];
}

/**
 * Module 9H — the active public Team consumers (`/team`'s `TeamHero`/
 * `TeamSequence`/`TeamFocus` and the Home `TeamJourney`) now source
 * members from published CMS content via
 * `src/features/team/data/publicTeam.ts`, not this array.
 *
 * This runtime array is retained (not removed) only because
 * `src/features/home/sections/Team.tsx` — an orphaned legacy
 * component not imported by any active route (verified via
 * `rg "sections/Team\b" src`) — still imports it. See that file's
 * header comment and `MODULE-9H-HANDOFF.md` §K for details. The
 * `TeamMember` type above remains the live frontend contract for both
 * the CMS adapter and every presentation component.
 */
export const team: TeamMember[] = [
  {
    slug: "founder-strategy",
    name: "A. Rahman",
    role: "Founder & Strategy Lead",
    discipline: "Strategy",
    shortBio: "Sets the technical direction across every engagement — from first architecture sketch to production handoff.",
    initials: "AR",
    socialLinks: [{ label: "LinkedIn", href: "#" }],
  },
  {
    slug: "head-of-engineering",
    name: "S. Khan",
    role: "Head of Engineering",
    discipline: "Engineering",
    shortBio: "Leads the systems and DevOps practice, keeping infrastructure boring, observable, and built to last.",
    initials: "SK",
    socialLinks: [{ label: "LinkedIn", href: "#" }],
  },
  {
    slug: "design-lead",
    name: "M. Iqbal",
    role: "Design Lead",
    discipline: "Design",
    shortBio: "Shapes the visual and interaction language behind every 6STANZA product, from brand to interface.",
    initials: "MI",
    socialLinks: [{ label: "LinkedIn", href: "#" }],
  },
  {
    slug: "security-lead",
    name: "H. Bilal",
    role: "Security Lead",
    discipline: "Security",
    shortBio: "Owns threat modeling and infrastructure hardening across every client environment we ship.",
    initials: "HB",
    socialLinks: [{ label: "LinkedIn", href: "#" }],
  },
];
