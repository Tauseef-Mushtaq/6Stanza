export interface SixSPrinciple {
  index: number;
  letter: "S";
  label: string;
  description: string;
}

/**
 * The Six S operating philosophy — HOW 6STANZA works, not what it
 * sells. Deliberately distinct in shape/purpose from `services.ts`;
 * never merge the two lists.
 */
export const sixS: SixSPrinciple[] = [
  {
    index: 1,
    letter: "S",
    label: "Strategy",
    description: "Every engagement starts with a position, not a task list — we define the outcome before we touch a single tool.",
  },
  {
    index: 2,
    letter: "S",
    label: "Software",
    description: "Code as a long-term asset. We build for the engineers who inherit it, not just the deadline that shipped it.",
  },
  {
    index: 3,
    letter: "S",
    label: "Systems",
    description: "Individual features are easy. Systems that stay coherent as they grow are the actual craft — that's what we optimize for.",
  },
  {
    index: 4,
    letter: "S",
    label: "Security",
    description: "Access, infrastructure, and data are treated as attack surface from day one, not retrofitted after something goes wrong.",
  },
  {
    index: 5,
    letter: "S",
    label: "Scalability",
    description: "We design for the load you'll have in eighteen months, without over-engineering for the load you'll never see.",
  },
  {
    index: 6,
    letter: "S",
    label: "Speed",
    description: "Fast systems, fast pipelines, fast decisions. Speed compounds — in the product, in delivery, and in how quickly you can move next.",
  },
];
