export interface ArchitectureGroup {
  /** e.g. "FRONTEND", "INFRASTRUCTURE" */
  label: string;
  /** Technologies for this group — always a subset of the project's own `technologies`. */
  items: string[];
}

/** Module 9K — a single real CMS-uploaded gallery image (spec §22's "typed public media objects"). */
export interface ProjectGalleryImage {
  src: string;
  alt: string;
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
  /** Module 9K — real uploaded gallery images (spec §13), ordered, published-project-only. Empty when the admin hasn't uploaded any — `ProjectGallery` falls back to its existing procedural panels in that case, never an empty/broken section. */
  gallery: ProjectGalleryImage[];
}

/**
 * Module 9G — the static `projectDetails` record, `getProjectDetail()`,
 * and `getAdjacentProjects()` that used to live here have been removed:
 * the public detail route now reads published CMS Projects via
 * `src/features/projects/data/publicProjects.ts` (`getPublicProjectDetail`),
 * which computes adjacency from the same CMS-ordered collection instead
 * (spec §12/§19 — legacy adjacency helpers are removed once genuinely
 * unused, not preserved as dead code). This file now only keeps the
 * `ArchitectureGroup`/`ProjectDetail` type contracts that the public
 * Project detail components and the CMS adapter still import.
 */
