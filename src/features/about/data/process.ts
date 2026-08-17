export interface ProcessStep {
  index: number;
  label: string;
  description: string;
}

/**
 * How 6STANZA moves an engagement from idea to a running system —
 * distinct from the Six S philosophy (which is *how we think*, not
 * *what we do in order*) and from the services list. Chapter 04 only.
 */
export const processSteps: ProcessStep[] = [
  {
    index: 1,
    label: "Discover",
    description: "We start by understanding the actual problem — the business, the constraints, the people who'll live with the system day to day.",
  },
  {
    index: 2,
    label: "Design",
    description: "Architecture and interface decisions get made deliberately, on paper and in prototypes, before a line of production code exists.",
  },
  {
    index: 3,
    label: "Build",
    description: "Engineering with discipline — version-controlled, reviewed, and built the way we'd want to inherit it ourselves.",
  },
  {
    index: 4,
    label: "Validate",
    description: "Testing, load, and security checks happen before launch, not after something breaks in production.",
  },
  {
    index: 5,
    label: "Deploy",
    description: "Shipped on infrastructure built for the traffic and failure modes it will actually encounter, not just the demo.",
  },
  {
    index: 6,
    label: "Evolve",
    description: "A system doesn't end at launch. We stay close to what we build and keep it healthy as it grows.",
  },
];
