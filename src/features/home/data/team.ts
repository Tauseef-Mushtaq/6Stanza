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
 * Structured team data — ready to be swapped for a CMS/database source
 * later without touching the Team section's layout or motion.
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
