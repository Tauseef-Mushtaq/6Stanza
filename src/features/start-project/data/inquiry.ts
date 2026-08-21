/**
 * Canonical shape for a project inquiry. One model, used by the form
 * state, validation, and the submission abstraction — no duplicate
 * inquiry interfaces anywhere else in the codebase.
 */
export interface ProjectInquiry {
  name: string;
  email: string;
  company?: string;
  /** Short answer to "What are you looking to build?" — a one-line project title, not the full brief. */
  projectTitle: string;
  /** Service slugs, sourced from the canonical @/features/home/data/services list. */
  services: string[];
  stage?: string;
  timeline?: string;
  budget?: string;
  /** The open-ended brief — "What are you trying to make possible?" */
  message: string;
  /**
   * Module 10F — honeypot field. Hidden from real visitors (see
   * `ProjectForm.tsx`); `projectInquirySchema`/`submitProjectInquiry`
   * already reject/soft-accept anything that fills it in — this just
   * finally wires a value into the request so that server-side check
   * is reachable at all.
   */
  website?: string;
}

export const emptyInquiry: ProjectInquiry = {
  name: "",
  email: "",
  company: "",
  projectTitle: "",
  services: [],
  stage: undefined,
  timeline: undefined,
  budget: undefined,
  message: "",
  website: "",
};

export type InquiryErrors = Partial<Record<keyof ProjectInquiry, string>>;

export function validateInquiry(inquiry: ProjectInquiry): InquiryErrors {
  const errors: InquiryErrors = {};

  if (!inquiry.name.trim()) errors.name = "Enter your name.";

  if (!inquiry.email.trim()) {
    errors.email = "Enter your email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inquiry.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (!inquiry.projectTitle.trim()) errors.projectTitle = "Tell us what you're looking to build.";

  if (inquiry.services.length === 0) errors.services = "Select at least one service.";

  if (!inquiry.message.trim() || inquiry.message.trim().length < 20) {
    errors.message = "Give us a bit more detail — at least a couple of sentences.";
  }

  return errors;
}

export const projectStages = ["Idea stage", "In progress", "Existing system"] as const;
export const timelines = ["ASAP", "1–3 months", "3–6 months", "Flexible"] as const;
export const budgetRanges = ["Under $10k", "$10k–$50k", "$50k+", "Not sure yet"] as const;
