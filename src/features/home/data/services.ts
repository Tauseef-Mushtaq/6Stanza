export interface ServiceItem {
  index: number;
  slug: string;
  /** Short category/discipline label shown above the title (spec §2 Ch.03). */
  category: string;
  label: string;
  description: string;
  /** 2–3 short capability tags shown as pills under the description. */
  tags: string[];
  /** Which visual pattern ServiceVisual should render for this item. */
  visual: "web" | "cloud" | "devops" | "security" | "network" | "marketing" | "video" | "seo";
}

/**
 * 6STANZA's actual service offerings. Structured so the list can be
 * extended later without touching the Services section's animation
 * architecture — components only ever consume this array.
 */
export const services: ServiceItem[] = [
  {
    index: 1,
    slug: "web-development",
    category: "Development",
    label: "Web Development",
    description:
      "Engineered interfaces and applications — built for performance, structured for growth, and shipped on infrastructure that holds up under real traffic.",
    tags: ["Frontend", "APIs", "Performance"],
    visual: "web",
  },
  {
    index: 2,
    slug: "cloud-computing",
    category: "Infrastructure",
    label: "Cloud Computing",
    description:
      "Architecture that scales with intention. We design cloud environments around cost, resilience, and the way your systems actually grow.",
    tags: ["AWS / GCP", "Cost Control", "Resilience"],
    visual: "cloud",
  },
  {
    index: 3,
    slug: "devops",
    category: "Delivery",
    label: "DevOps",
    description:
      "Continuous delivery pipelines, infrastructure as code, and observability — the discipline that turns shipping software into a repeatable system.",
    tags: ["CI/CD", "IaC", "Observability"],
    visual: "devops",
  },
  {
    index: 4,
    slug: "cyber-security",
    category: "Security",
    label: "Cyber Security",
    description:
      "Threat modeling, hardened infrastructure, and audited access — security treated as architecture, not an afterthought bolted on at the end.",
    tags: ["Threat Modeling", "Hardening", "Audits"],
    visual: "security",
  },
  {
    index: 5,
    slug: "networking",
    category: "Infrastructure",
    label: "Networking",
    description:
      "The connective tissue behind every system we build — reliable, monitored, and designed to keep your infrastructure talking to itself correctly.",
    tags: ["Monitoring", "Topology", "Uptime"],
    visual: "network",
  },
  {
    index: 6,
    slug: "marketing",
    category: "Growth",
    label: "Marketing & Advertising",
    description:
      "Positioning and campaigns built on the same rigor as our engineering — data-informed, measured, and built to compound over time.",
    tags: ["Positioning", "Campaigns", "Analytics"],
    visual: "marketing",
  },
  {
    index: 7,
    slug: "video-editing",
    category: "Production",
    label: "Video Editing",
    description:
      "Production-grade edits for product, brand, and campaign — motion and pacing crafted to hold attention and communicate with precision.",
    tags: ["Motion", "Pacing", "Post-Production"],
    visual: "video",
  },
  {
    index: 8,
    slug: "seo",
    category: "Growth",
    label: "SEO",
    description:
      "Technical and editorial SEO grounded in how systems actually get discovered — structure first, content second, tactics last.",
    tags: ["Technical SEO", "Content", "Structure"],
    visual: "seo",
  },
];
