import type { ContactInquiryRow } from "@/lib/repositories/contactInquiries";
import type { ProjectInquiryRow } from "@/lib/repositories/projectInquiries";

/**
 * Module 7A — the admin inquiry list (spec §7) shows both inquiry
 * types in one table. Rather than teach `InquiryTable` two different
 * row shapes, each row is normalized to this common summary shape
 * here, in one place, so the table component itself stays generic.
 * The detail view (`app/admin/inquiries/[type]/[id]/page.tsx`) still
 * reads the full, untouched `ContactInquiryRow`/`ProjectInquiryRow` —
 * nothing here drops or flattens data, it's purely a list-view
 * projection (spec §7 — "the full record belongs in the detail view").
 */
export type InquiryListItem = {
  type: "contact" | "project";
  id: string;
  name: string;
  email: string;
  status: ContactInquiryRow["status"];
  createdAt: string;
  company: string | null;
  projectTitle: string | null;
};

export function toListItems(contact: ContactInquiryRow[], project: ProjectInquiryRow[]): InquiryListItem[] {
  const contactItems: InquiryListItem[] = contact.map((row) => ({
    type: "contact",
    id: row.id,
    name: row.name,
    email: row.email,
    status: row.status,
    createdAt: row.created_at,
    company: null,
    projectTitle: null,
  }));

  const projectItems: InquiryListItem[] = project.map((row) => ({
    type: "project",
    id: row.id,
    name: row.name,
    email: row.email,
    status: row.status,
    createdAt: row.created_at,
    company: row.company,
    projectTitle: row.project_title,
  }));

  return [...contactItems, ...projectItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}
