/**
 * Shared content shape for the Privacy Policy and Terms of Service
 * pages. Kept as plain typed data (consistent with the rest of the
 * codebase's data/section split) so both documents render through the
 * same `LegalDocument` component instead of two hand-built pages.
 */

/** One section's body: plain paragraphs, or a `string[]` for a bullet list rendered in place. */
export type LegalBlock = string | string[];

export interface LegalSection {
  id: string;
  heading: string;
  blocks: LegalBlock[];
}

export interface LegalDocument {
  title: string;
  /** Human-readable date shown as "Last updated" — kept as a display string rather than a computed one so it only changes when the content actually changes. */
  effectiveDate: string;
  intro: string;
  sections: LegalSection[];
}
