import { projects, type ProjectItem } from "@/features/home/data/projects";

export interface ArchitectureGroup {
  /** e.g. "FRONTEND", "INFRASTRUCTURE" */
  label: string;
  /** Technologies for this group — always a subset of the project's own `technologies`. */
  items: string[];
}

export interface ProjectDetail {
  slug: string;
  /** Short line under the hero title (spec §10 Ch.01 "positioning statement"). */
  positioning: string;
  overview: {
    /** What the project is. */
    summary: string;
    /** What 6STANZA contributed. */
    contribution: string;
  };
  /** The problem being addressed (spec §10 Ch.03). */
  challenge: string;
  /** How it was addressed (spec §10 Ch.04). */
  solution: string;
  /** Technical architecture, grouped from the project's own `technologies` — never invented stacks (spec §10 Ch.05). */
  architecture: ArchitectureGroup[];
  /** Qualitative close-out line used alongside the factual `outcome` badge (spec §10 Ch.07). */
  outcomeStatement: string;
}

/**
 * Case-study detail content, keyed by the same slugs already defined in
 * `@/features/home/data/projects`. This file only adds narrative/structural
 * content for the detail route — it never duplicates or overrides the
 * canonical title/category/technologies/outcome fields, which stay owned
 * by `projects.ts` per the Module 4C brief (§8).
 */
const projectDetails: Record<string, ProjectDetail> = {
  "citizen-services-platform": {
    slug: "citizen-services-platform",
    positioning: "Rebuilding a civic platform for weekly, zero-downtime releases.",
    overview: {
      summary:
        "A citizen-facing services platform whose release process had become the bottleneck — deploys were rare, risky, and manual. The rebuild kept the product surface intact while replacing everything underneath it.",
      contribution:
        "6STANZA re-platformed the application onto containerized infrastructure, introduced automated CI/CD, and instrumented the full stack for observability end to end.",
    },
    challenge:
      "Every release was a manual, high-risk event. Without containerization or automated pipelines, incidents were slow to detect and slower to resolve — and the team had stopped shipping frequently to avoid the risk.",
    solution:
      "We containerized the application, moved orchestration to Kubernetes, and codified infrastructure with Terraform so environments were reproducible. Grafana dashboards gave the team real visibility into system health for the first time.",
    architecture: [
      { label: "Application", items: ["Next.js"] },
      { label: "Orchestration", items: ["Docker", "Kubernetes"] },
      { label: "Infrastructure", items: ["Terraform"] },
      { label: "Observability", items: ["Grafana"] },
    ],
    outcomeStatement:
      "A platform the team can now release from confidently, on a weekly cadence, with visibility into how it behaves in production.",
  },
  "commerce-cloud-migration": {
    slug: "commerce-cloud-migration",
    positioning: "Moving a retail monolith onto hardened, scalable cloud infrastructure.",
    overview: {
      summary:
        "A mid-market retailer running a single monolithic deployment, with infrastructure cost and access control both trailing behind the business's actual scale.",
      contribution:
        "6STANZA re-architected the environment for horizontal scale, tightened access to a least-privilege model, and moved delivery and backups onto managed cloud services.",
    },
    challenge:
      "The existing infrastructure scaled vertically only, access was broadly provisioned rather than scoped, and there was no automated backup strategy — all three compounding risk as traffic grew.",
    solution:
      "We rebuilt the environment on AWS with horizontally-scaled application tiers, IAM-scoped least-privilege access throughout, PostgreSQL for durable data storage, and CloudFront in front for delivery and edge caching.",
    architecture: [
      { label: "Delivery", items: ["CloudFront"] },
      { label: "Platform", items: ["AWS"] },
      { label: "Access", items: ["IAM"] },
      { label: "Data", items: ["PostgreSQL"] },
    ],
    outcomeStatement:
      "A cloud foundation built for the business's actual scale, with access and cost both under deliberate control.",
  },
  "brand-systems-relaunch": {
    slug: "brand-systems-relaunch",
    positioning: "Pairing a new visual system with a technical SEO rebuild.",
    overview: {
      summary:
        "A brand and website relaunch where the previous information architecture was actively working against organic discovery, despite a strong underlying offering.",
      contribution:
        "6STANZA rebuilt the front end, restructured the site's information architecture around technical SEO fundamentals, and wired up analytics to track the results.",
    },
    challenge:
      "The existing site's structure diluted topical relevance and slowed indexing, so a strong brand wasn't translating into organic visibility.",
    solution:
      "We rebuilt the front end in React, restructured content and internal linking around a clearer information architecture, and used CMS-managed content so the new structure could keep evolving without another rebuild.",
    architecture: [
      { label: "Frontend", items: ["React"] },
      { label: "Content", items: ["CMS"] },
      { label: "Discovery", items: ["SEO"] },
      { label: "Measurement", items: ["Analytics"] },
    ],
    outcomeStatement:
      "A brand and site structure built to keep compounding in organic reach, not just a one-time relaunch.",
  },
};

export function getProjectDetail(slug: string): ProjectDetail | undefined {
  return projectDetails[slug];
}

export function getAdjacentProjects(slug: string): { prev: ProjectItem; next: ProjectItem } | undefined {
  const index = projects.findIndex((project) => project.slug === slug);
  if (index === -1) return undefined;
  const total = projects.length;
  return {
    prev: projects[(index - 1 + total) % total],
    next: projects[(index + 1) % total],
  };
}
