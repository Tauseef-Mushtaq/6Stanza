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
 * Module 9G — the runtime `projects` collection that used to live
 * here has moved to the CMS (`public.projects`, published rows only —
 * see `src/features/projects/data/publicProjects.ts`). This file now
 * only keeps the `ProjectItem` type contract that the public Project
 * components (`ProjectDetailHero`, `ProjectNextCta`, the CMS adapter
 * itself, etc.) still import — removing the type just because the
 * data moved would be an unrelated, unnecessary refactor (spec §18).
 */
