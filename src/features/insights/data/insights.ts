export type InsightBlock =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string; attribution?: string }
  | { type: "list"; items: string[] }
  | { type: "code"; language: string; code: string }
  | { type: "callout"; label: string; text: string };

export interface Insight {
  slug: string;
  title: string;
  category: string;
  date: string;
  readingTime: string;
  excerpt: string;
  content: InsightBlock[];
}

/**
 * 6STANZA's technical categories — grounded in the actual service list
 * (`@/features/home/data/services`), not an arbitrary blog taxonomy.
 */
export const insightCategories = [
  "Engineering",
  "Cloud",
  "DevOps",
  "Cyber Security",
  "Strategy",
] as const;

/**
 * Structured placeholder editorial content. These are original pieces
 * written to establish the Insights architecture and reading
 * experience — general technical thinking consistent with 6STANZA's
 * services, not claims about specific client work or company
 * achievements. Treat as first-draft structure, not published,
 * reviewed articles — see MODULE-4D-HANDOFF.md.
 */
export const insights: Insight[] = [
  {
    slug: "boring-infrastructure-is-a-feature",
    title: "Boring infrastructure is a feature, not a compromise",
    category: "DevOps",
    date: "2026-06-02",
    readingTime: "6 min",
    excerpt:
      "The most reliable systems we've worked on are also the least exciting to operate. That's not an accident — it's the goal.",
    content: [
      {
        type: "paragraph",
        text: "Every infrastructure decision eventually gets tested at 3am. The question worth asking upfront isn't whether a system is impressive — it's whether it's boring in the way that matters: predictable failure modes, obvious rollback paths, and dashboards that tell the truth before a customer does.",
      },
      { type: "heading", text: "Predictability beats cleverness" },
      {
        type: "paragraph",
        text: "Clever infrastructure — bespoke orchestration, hand-rolled deployment scripts, tightly coupled services that only one engineer fully understands — tends to look impressive in a demo and expensive in an incident. We optimize for the opposite: infrastructure that a new engineer can reason about from the diagram alone.",
      },
      {
        type: "callout",
        label: "Key takeaway",
        text: "If an on-call engineer needs a Slack thread to understand what a service does, the architecture — not the documentation — is the problem.",
      },
      { type: "heading", text: "What this looks like in practice" },
      {
        type: "list",
        items: [
          "Infrastructure as code, reviewed the same way application code is reviewed",
          "One deployment path — no manual steps that only exist in someone's memory",
          "Alerts tied to user-facing symptoms, not internal metrics nobody's calibrated",
          "Rollback that's a single command, tested before it's needed, not during an incident",
        ],
      },
      {
        type: "paragraph",
        text: "None of this is exotic. It's also not the default — most systems accumulate complexity gradually, one reasonable-seeming exception at a time. Keeping infrastructure boring is a continuous decision, not a one-time setup.",
      },
    ],
  },
  {
    slug: "security-as-architecture-not-checklist",
    title: "Security as architecture, not a pre-launch checklist",
    category: "Cyber Security",
    date: "2026-05-14",
    readingTime: "7 min",
    excerpt:
      "Bolting security controls on before launch treats security as a gate. Treating it as architecture changes what gets built in the first place.",
    content: [
      {
        type: "paragraph",
        text: "A checklist run the week before launch can catch missing headers and open ports. It can't catch a data model that made least-privilege access impossible from the start, or a service boundary that turned one compromised credential into full account takeover.",
      },
      { type: "heading", text: "Threat modeling before the first line of code" },
      {
        type: "paragraph",
        text: "The highest-leverage security work happens during architecture, not during audit. Asking \"what does an attacker with this specific access actually gain\" while a system is still a diagram is cheap. Asking it after launch means re-architecting around production traffic.",
      },
      {
        type: "quote",
        text: "The cheapest vulnerability to fix is the one that never gets designed into the system.",
      },
      { type: "heading", text: "Where this shows up" },
      {
        type: "list",
        items: [
          "Identity and access scoped per-service, not one shared credential set",
          "Secrets management treated as infrastructure, not an environment variable",
          "Network segmentation that assumes a compromised service, not just a compromised perimeter",
          "Audit logging designed in from day one — added later, it's usually incomplete",
        ],
      },
      {
        type: "paragraph",
        text: "None of this replaces a pre-launch review. It just changes what that review is checking for — confirmation, not discovery.",
      },
    ],
  },
  {
    slug: "designing-for-the-load-you-will-actually-have",
    title: "Designing for the load you'll actually have",
    category: "Cloud",
    date: "2026-04-22",
    readingTime: "5 min",
    excerpt:
      "Scalability isn't about building for hypothetical scale. It's about correctly estimating the scale that's actually coming, and building for that.",
    content: [
      {
        type: "paragraph",
        text: "Over-engineering for scale that never arrives is as costly as under-engineering for scale that does. Both come from the same root cause: designing around a guess instead of a model.",
      },
      { type: "heading", text: "Start with the actual constraint" },
      {
        type: "paragraph",
        text: "Most systems aren't limited by raw request volume — they're limited by one specific bottleneck: a database write pattern, a synchronous call to a slow third party, a queue that backs up under bursty traffic. Finding that constraint before scaling anything else is usually more valuable than horizontal scaling the whole stack.",
      },
      {
        type: "callout",
        label: "Key takeaway",
        text: "Scale the bottleneck, not the architecture diagram. Most services don't need to be distributed systems on day one.",
      },
      { type: "heading", text: "A practical sequence" },
      {
        type: "list",
        items: [
          "Instrument first — you can't scale what you haven't measured",
          "Fix the single largest bottleneck, then re-measure",
          "Add horizontal scaling only where the data shows it's needed",
          "Revisit the model every time real traffic patterns diverge from the estimate",
        ],
      },
    ],
  },
  {
    slug: "the-real-cost-of-a-missing-cicd-pipeline",
    title: "The real cost of a missing CI/CD pipeline",
    category: "Engineering",
    date: "2026-03-30",
    readingTime: "5 min",
    excerpt:
      "Manual deployment doesn't feel expensive until you count every hour spent babysitting releases and every incident caused by a step someone forgot.",
    content: [
      {
        type: "paragraph",
        text: "Teams without CI/CD rarely decide against it — they just never get around to it, because manual deployment technically works. The cost shows up gradually: slower releases, inconsistent environments, and incidents traceable to a manual step someone forgot under pressure.",
      },
      { type: "heading", text: "What a pipeline actually buys you" },
      {
        type: "list",
        items: [
          "The same tested process every time, regardless of who's deploying",
          "A fast, safe rollback instead of a stressful manual one",
          "Confidence to ship smaller, more frequent changes",
          "A build history that answers \"what changed\" without a Slack archaeology session",
        ],
      },
      {
        type: "code",
        language: "yaml",
        code: "name: deploy\non:\n  push:\n    branches: [main]\njobs:\n  build:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - run: npm ci\n      - run: npm run build\n      - run: npm test",
      },
      {
        type: "paragraph",
        text: "A pipeline this simple is often enough to eliminate most manual-deployment risk. It doesn't need to be sophisticated to be worth building — it needs to run every time, without anyone remembering to run it.",
      },
    ],
  },
  {
    slug: "strategy-before-stack",
    title: "Strategy before stack",
    category: "Strategy",
    date: "2026-02-18",
    readingTime: "4 min",
    excerpt:
      "\"What should we build this in\" is usually the second question. The first is what the system actually needs to be true in a year.",
    content: [
      {
        type: "paragraph",
        text: "Framework and stack decisions get made early because they're concrete and fun to debate. But a stack choice made before the underlying strategy is settled tends to lock in assumptions that outlive their usefulness.",
      },
      { type: "heading", text: "Questions that come first" },
      {
        type: "list",
        items: [
          "Who maintains this system in eighteen months, and what do they already know?",
          "What's the actual failure cost if this breaks — minutes of downtime, or a compliance incident?",
          "Which parts of this are genuinely novel, and which are solved problems we shouldn't re-solve?",
        ],
      },
      {
        type: "paragraph",
        text: "None of this is anti-technology — it's the opposite. Getting the strategy right first is what makes a stack choice defensible instead of arbitrary.",
      },
    ],
  },
];

export function getInsight(slug: string): Insight | undefined {
  return insights.find((item) => item.slug === slug);
}
