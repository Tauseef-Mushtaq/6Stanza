export interface ProjectItem {
  slug: string;
  title: string;
  category: string;
  description: string;
  technologies: string[];
  outcome: string;
  /** Deterministic gradient angle/hue used for the placeholder visual until real imagery exists. */
  accent: number;
}

/**
 * Structured placeholder project data so the Selected Work section can
 * later be backed by a CMS/database without rebuilding the animation
 * or layout architecture — components consume this shape either way.
 */
export const projects: ProjectItem[] = [
  {
    slug: "citizen-services-platform",
    title: "Citizen Services Platform",
    category: "Full-Stack / DevOps",
    description:
      "A civic services platform rebuilt on containerized infrastructure with automated CI/CD and full observability — reducing incident response time and enabling weekly, zero-downtime releases.",
    technologies: ["Next.js", "Docker", "Kubernetes", "Terraform", "Grafana"],
    outcome: "99.9% uptime post-migration",
    accent: 212,
  },
  {
    slug: "commerce-cloud-migration",
    title: "Commerce Cloud Migration",
    category: "Cloud / Security",
    description:
      "Migrated a mid-market retailer's monolith onto a hardened, horizontally-scaled cloud architecture with automated backups and least-privilege access throughout.",
    technologies: ["AWS", "IAM", "PostgreSQL", "CloudFront"],
    outcome: "40% lower infra cost",
    accent: 220,
  },
  {
    slug: "brand-systems-relaunch",
    title: "Brand Systems Relaunch",
    category: "Web / Marketing",
    description:
      "A full brand and web relaunch pairing a new visual system with a technical SEO rebuild — restructured information architecture drove organic growth within a single quarter.",
    technologies: ["React", "SEO", "Analytics", "CMS"],
    outcome: "2.3x organic traffic",
    accent: 205,
  },
];
