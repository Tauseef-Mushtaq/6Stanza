import type { DiscoveryAnswers } from "@/features/discovery/data/questions";
import { q1Options, q2Options, q3Options } from "@/features/discovery/data/questions";
import type { ServiceItem } from "@/features/home/data/services";

/**
 * Smart Project Discovery — deterministic recommendation engine.
 *
 * Explicitly NOT AI: this is a plain, typed, unit-testable rule table.
 * Every rule is a pure function of the answers plus a fixed weight —
 * same input always produces the same output, and the whole mapping
 * is readable top-to-bottom in one file. Slugs referenced below must
 * match `@/features/home/data/services` (the same canonical list
 * `ServiceSelector`/`ProjectForm` already render from — see
 * `DiscoveryFlow.tsx`, which passes that list in as `catalog` rather
 * than this file importing/duplicating it).
 */

interface Rule {
  id: string;
  test: (a: DiscoveryAnswers) => boolean;
  slug: string;
  reason: string;
  weight: number;
}

const RULES: Rule[] = [
  // Q1 — what they're building
  { id: "q1-new-site", test: (a) => a.q1 === "new-site", slug: "web-development", weight: 3, reason: "A new site is core web development work." },
  { id: "q1-saas", test: (a) => a.q1 === "web-app-saas", slug: "web-development", weight: 3, reason: "SaaS products start with solid application engineering." },
  {
    id: "q1-saas-existing",
    test: (a) => a.q1 === "web-app-saas" && (a.q3 === "needs-rebuild" || a.q3 === "mostly-works"),
    slug: "cloud-computing",
    weight: 2,
    reason: "An existing product usually needs cloud infrastructure to scale properly.",
  },
  {
    id: "q1-saas-infra",
    test: (a) => a.q1 === "web-app-saas" && a.q2 === "infra-reliability",
    slug: "devops",
    weight: 2,
    reason: "A SaaS product with deployment/reliability problems needs DevOps discipline.",
  },
  { id: "q1-mobile", test: (a) => a.q1 === "mobile-app", slug: "web-development", weight: 2, reason: "Mobile-facing products still need a solid web/API foundation." },
  { id: "q1-internal", test: (a) => a.q1 === "internal-system", slug: "web-development", weight: 3, reason: "Internal dashboards and tools are a web development build." },
  {
    id: "q1-internal-existing",
    test: (a) => a.q1 === "internal-system" && a.q3 !== "starting-fresh" && a.q3 !== undefined,
    slug: "cyber-security",
    weight: 1,
    reason: "Internal systems handling company data usually need access/security hardening too.",
  },

  // Q2 — the problem they're solving
  { id: "q2-presence", test: (a) => a.q2 === "online-presence", slug: "web-development", weight: 3, reason: "An online presence starts with a website or web app." },
  { id: "q2-presence-seo", test: (a) => a.q2 === "online-presence", slug: "seo", weight: 1, reason: "A new presence only helps once people can actually find it." },
  { id: "q2-custom", test: (a) => a.q2 === "custom-software", slug: "web-development", weight: 2, reason: "Custom software is a web/application development engagement." },
  { id: "q2-integration", test: (a) => a.q2 === "integration", slug: "networking", weight: 3, reason: "Systems that don't talk to each other is a networking/integration problem." },
  { id: "q2-integration-cloud", test: (a) => a.q2 === "integration", slug: "cloud-computing", weight: 1, reason: "Integration work is far easier on well-architected cloud infrastructure." },
  { id: "q2-infra", test: (a) => a.q2 === "infra-reliability", slug: "devops", weight: 3, reason: "Reliability and deployment problems are DevOps' core discipline." },
  {
    id: "q2-infra-security",
    test: (a) => a.q2 === "infra-reliability" && a.q3 !== "starting-fresh" && a.q3 !== undefined,
    slug: "cyber-security",
    weight: 1,
    reason: "Reliability issues on an existing system are often paired with security gaps.",
  },
  { id: "q2-growth", test: (a) => a.q2 === "visibility-growth", slug: "marketing", weight: 3, reason: "Visibility and customer growth is a marketing & advertising engagement." },
  { id: "q2-growth-seo", test: (a) => a.q2 === "visibility-growth", slug: "seo", weight: 2, reason: "Growth in discovery usually pairs marketing with SEO." },

  // Q3 — existing system
  { id: "q3-rebuild-cloud", test: (a) => a.q3 === "needs-rebuild", slug: "cloud-computing", weight: 1, reason: "A rebuild is a good opportunity to fix the infrastructure underneath it too." },
];

export interface Recommendation {
  slug: string;
  label: string;
  reason: string;
}

export interface RecommendationResult {
  recommendations: Recommendation[];
  /** True when no rule matched anything and the fallback default was used — the "ambiguous answers" case. */
  isFallback: boolean;
}

const FALLBACK_SLUG = "web-development";
const FALLBACK_REASON = "Every project starts here — we'll help you scope the specifics on a short call.";
const MAX_RECOMMENDATIONS = 3;

/**
 * Pure, deterministic mapping from discovery answers to 1–3 canonical
 * service slugs with a short reason each. `catalog` is the real
 * services list (so labels/ordering always match what the site
 * actually offers — this function never invents a label).
 */
export function recommend(answers: DiscoveryAnswers, catalog: ServiceItem[]): RecommendationResult {
  const bySlug = new Map<string, { weight: number; reason: string }>();

  for (const rule of RULES) {
    if (!rule.test(answers)) continue;
    const existing = bySlug.get(rule.slug);
    const weight = (existing?.weight ?? 0) + rule.weight;
    // Multiple rules can match the same slug for different reasons;
    // weights accumulate (a slug backed by two reasons should outrank
    // one backed by a single reason), but only the single
    // highest-weight individual reason is shown to keep the UI to one
    // short sentence per recommendation.
    const reason = !existing || rule.weight > existing.weight ? rule.reason : existing.reason;
    bySlug.set(rule.slug, { weight, reason });
  }

  // Answers the visitor picked themselves (Q5) are the strongest
  // possible signal — they said it directly — so they always outrank
  // anything inferred, and get folded in even if a rule already
  // recommended the same slug for a different reason.
  for (const slug of answers.q5) {
    bySlug.set(slug, { weight: 100, reason: "You told us directly this is something you need." });
  }

  const catalogOrder = new Map(catalog.map((s, i) => [s.slug, i]));
  const knownSlugs = new Set(catalog.map((s) => s.slug));

  let ranked = Array.from(bySlug.entries())
    .filter(([slug]) => knownSlugs.has(slug)) // never surface a slug the live services catalog doesn't actually have (spec: canonical slugs only)
    .sort((a, b) => b[1].weight - a[1].weight || (catalogOrder.get(a[0]) ?? 0) - (catalogOrder.get(b[0]) ?? 0))
    .slice(0, MAX_RECOMMENDATIONS);

  let isFallback = false;
  if (ranked.length === 0) {
    // Safe fallback for ambiguous answers (e.g. "not sure" on
    // everything) — never return an empty recommendation.
    isFallback = true;
    ranked = [[FALLBACK_SLUG, { weight: 1, reason: FALLBACK_REASON }]];
  }

  const labelBySlug = new Map(catalog.map((s) => [s.slug, s.label]));

  const recommendations = ranked
    .map(([slug, { reason }]) => ({ slug, label: labelBySlug.get(slug) ?? slug, reason }))
    .filter((r) => labelBySlug.has(r.slug));

  return { recommendations, isFallback };
}

/** Human-readable option label lookups, used to build the message/project-title prefill text — kept here (next to the rules that consume the same ids) rather than duplicated in the UI component. */
export function labelForQ1(id: DiscoveryAnswers["q1"]): string | undefined {
  return q1Options.find((o) => o.id === id)?.label;
}
export function labelForQ2(id: DiscoveryAnswers["q2"]): string | undefined {
  return q2Options.find((o) => o.id === id)?.label;
}
export function labelForQ3(id: DiscoveryAnswers["q3"]): string | undefined {
  return q3Options.find((o) => o.id === id)?.label;
}
