/**
 * MODULE-TESTIMONIAL-1 — the public `Testimonial` shape, mirroring the
 * pattern of `features/home/data/team.ts` (`TeamMember`): a plain type
 * contract every public component imports, kept separate from the CMS
 * row shape (`TestimonialRow`) so nothing below the adapter boundary
 * knows a database row exists.
 */
export interface Testimonial {
  id: string;
  name: string;
  role?: string;
  company?: string;
  quote: string;
  image?: string;
  projectId?: string;
}
