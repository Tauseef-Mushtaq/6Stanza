import type { ServiceItem } from "@/features/home/data/services";

export interface ServiceDetail {
  /** Must match a `slug` in @/features/home/data/services. */
  slug: ServiceItem["slug"];
  /** Chapter 02 — the problem/opportunity this service addresses. */
  problem: string;
  /** Chapter 03 — editorial capability rows (not a card grid). */
  capabilities: string[];
  /** Chapter 04 — the technical flow, rendered as a lightweight SVG/CSS diagram. */
  architecture: string[];
  /** Chapter 05 — which Six S principles this service leans on most (indices into sixS.ts), max 3. */
  principles: number[];
}

/**
 * Per-service detail content. Deliberately kept separate from
 * `services.ts` (the canonical list used by the homepage rail/index)
 * rather than folding this in — services.ts stays the lightweight
 * shape the homepage/index need, and this file only exists to feed
 * the six-chapter detail template. Every `slug` here must exist in
 * `services.ts`; `ServiceDetailPage` throws (via notFound()) if not.
 */
export const serviceDetails: ServiceDetail[] = [
  {
    slug: "web-development",
    problem:
      "Most business software fails the same way: it works in a demo and buckles under real usage. Slow interfaces, brittle integrations, and code nobody wants to touch a year later. We build the alternative — products engineered to hold up once real customers, real data, and real load show up.",
    capabilities: [
      "Web Applications",
      "E-commerce Platforms",
      "APIs & Integrations",
      "Internal Dashboards",
      "Performance Engineering",
    ],
    architecture: ["Frontend", "API", "Database", "Infrastructure"],
    principles: [2, 3, 6],
  },
  {
    slug: "cloud-computing",
    problem:
      "Cloud spend and cloud reliability usually move in opposite directions — teams either over-provision to stay safe or cut corners to stay cheap. We design environments around how your systems actually grow, so cost and resilience aren't a trade-off you have to keep re-litigating.",
    capabilities: [
      "Cloud Architecture",
      "Cost Optimization",
      "Migration & Modernization",
      "Multi-Region Resilience",
      "Managed Environments",
    ],
    architecture: ["Application", "Compute", "Storage", "Network", "Monitoring"],
    principles: [3, 5, 4],
  },
  {
    slug: "devops",
    problem:
      "Shipping software shouldn't be an event. When every release is a manual, high-stress process, teams ship less often and fix less quickly. We build the pipeline — code to production — into a repeatable system so deployment stops being the risky part of the job.",
    capabilities: [
      "CI/CD Pipelines",
      "Infrastructure as Code",
      "Container Orchestration",
      "Release Automation",
      "Observability & Alerting",
    ],
    architecture: ["Code", "Build", "Test", "Container", "Deploy", "Monitor"],
    principles: [2, 6, 3],
  },
  {
    slug: "cyber-security",
    problem:
      "Security is usually retrofitted — added after a breach, an audit, or a client requirement forces the issue. We treat it as architecture from day one: access modeled, infrastructure hardened, and data handled with the assumption that it will eventually be tested.",
    capabilities: [
      "Threat Modeling",
      "Infrastructure Hardening",
      "Identity & Access Management",
      "Security Audits",
      "Incident Readiness",
    ],
    architecture: ["Identity", "Application", "Network", "Data", "Monitoring"],
    principles: [4, 1, 3],
  },
  {
    slug: "networking",
    problem:
      "Every other system you run depends on the network underneath it staying correct and observable. When it isn't, the symptoms show up everywhere else first — in an app that's \"just slow\" or an outage nobody can immediately explain. We design and monitor that layer directly.",
    capabilities: [
      "Network Topology Design",
      "Uptime Monitoring",
      "Load Balancing",
      "VPN & Secure Access",
      "Performance Diagnostics",
    ],
    architecture: ["Edge", "Routing", "Load Balancing", "Internal Network", "Monitoring"],
    principles: [3, 5, 4],
  },
  {
    slug: "marketing",
    problem:
      "Most marketing spend is guesswork dressed up as strategy. We apply the same discipline to positioning and campaigns that we apply to engineering — a clear hypothesis, a measurable result, and a decision about what to do next based on the data, not the deadline.",
    capabilities: [
      "Brand Positioning",
      "Campaign Strategy",
      "Performance Marketing",
      "Content Systems",
      "Analytics & Attribution",
    ],
    architecture: ["Research", "Positioning", "Campaign", "Distribution", "Measurement"],
    principles: [1, 6, 2],
  },
  {
    slug: "video-editing",
    problem:
      "Footage isn't a finished product — pacing, structure, and sound design are what actually communicate. We handle the post-production work that turns raw material into something that holds attention and represents the brand at the same level as everything else we build.",
    capabilities: [
      "Product & Brand Video",
      "Motion Graphics",
      "Sound Design",
      "Color & Post-Production",
      "Multi-Format Delivery",
    ],
    architecture: ["Footage", "Edit", "Motion & Sound", "Color Grade", "Delivery"],
    principles: [1, 6],
  },
  {
    slug: "seo",
    problem:
      "Most SEO work chases tactics without fixing the structure underneath them. We start with how a system is actually built and discovered — architecture and technical foundations first, content second, tactical adjustments last, once the fundamentals are already sound.",
    capabilities: [
      "Technical SEO Audits",
      "Site Architecture",
      "Content Strategy",
      "Structured Data",
      "Ongoing Search Performance",
    ],
    architecture: ["Crawl", "Index", "Structure", "Content", "Ranking"],
    principles: [3, 1, 6],
  },
];

export function getServiceDetail(slug: string): ServiceDetail | undefined {
  return serviceDetails.find((detail) => detail.slug === slug);
}
