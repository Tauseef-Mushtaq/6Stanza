import { timelines } from "@/features/start-project/data/inquiry";

/**
 * Smart Project Discovery — typed question/answer model.
 *
 * This is a self-contained, deterministic quiz layer that sits in
 * front of the existing `/start-project` form. It does not define a
 * second notion of "service" — Q5's options are sourced from the same
 * canonical `services` list `ServiceSelector`/`ProjectForm` already
 * use (see `DiscoveryFlow.tsx`), and every other question's options
 * are discovery-specific classification answers, not services.
 */

export type Q1Id = "new-site" | "web-app-saas" | "mobile-app" | "internal-system" | "not-sure";
export type Q2Id = "online-presence" | "custom-software" | "integration" | "infra-reliability" | "visibility-growth" | "not-sure";
export type Q3Id = "starting-fresh" | "needs-rebuild" | "mostly-works" | "not-sure";
/** Q4 reuses the exact same timeline strings as the real Start Project form (`OptionPills` + `inquiry.ts`) so the answer can be passed straight through as a prefill with no re-mapping. */
export type Q4Timeline = (typeof timelines)[number];

export interface DiscoveryAnswers {
  q1?: Q1Id;
  q2?: Q2Id;
  q3?: Q3Id;
  q4?: Q4Timeline;
  /** Service slugs the visitor picked themselves — optional, additive to the engine's own inference. Canonical slugs only (see `DiscoveryFlow.tsx`). */
  q5: string[];
}

export const emptyDiscoveryAnswers: DiscoveryAnswers = { q5: [] };

interface Option<Id extends string> {
  id: Id;
  label: string;
}

export const q1Options: Option<Q1Id>[] = [
  { id: "new-site", label: "A new website" },
  { id: "web-app-saas", label: "A web app or SaaS product" },
  { id: "mobile-app", label: "A mobile-facing product" },
  { id: "internal-system", label: "An internal system or dashboard" },
  { id: "not-sure", label: "Not sure yet" },
];

export const q2Options: Option<Q2Id>[] = [
  { id: "online-presence", label: "We don't have an online presence yet" },
  { id: "custom-software", label: "We need custom software built" },
  { id: "integration", label: "Our systems don't talk to each other" },
  { id: "infra-reliability", label: "Our infrastructure is unreliable, slow, or insecure" },
  { id: "visibility-growth", label: "We need more visibility or customers" },
  { id: "not-sure", label: "Not sure yet" },
];

export const q3Options: Option<Q3Id>[] = [
  { id: "starting-fresh", label: "Nothing yet — starting fresh" },
  { id: "needs-rebuild", label: "Yes, but it needs rebuilding" },
  { id: "mostly-works", label: "Yes, and it mostly works — needs additions" },
  { id: "not-sure", label: "Not sure" },
];
