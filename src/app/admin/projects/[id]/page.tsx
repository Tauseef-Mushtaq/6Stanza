import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { getProjectForAdmin } from "@/lib/services/projectContentService";
import { listProjectGalleryForAdmin } from "@/lib/services/projectMediaService";
import { ProjectForm } from "@/features/admin/components/ProjectForm";
import { ProjectGalleryManager } from "@/features/admin/components/ProjectGalleryManager";
import { ArchiveProjectButton } from "@/features/admin/components/ArchiveProjectButton";
import { DeleteProjectButton } from "@/features/admin/components/DeleteProjectButton";
import { ContentStatusBadge } from "@/features/admin/components/ContentStatusBadge";
import { AdminErrorState } from "@/features/admin/components/AdminErrorState";

export const metadata: Metadata = { title: "Edit Project" };

/**
 * Module 9C — `/admin/projects/[id]` (spec §13). Fetches through
 * `getProjectForAdmin` (`lib/services/projectContentService.ts`),
 * itself `requireAdmin()`-gated and RLS-backed — same shape as the
 * existing `EditServicePage`. Handles a genuinely missing or invalid
 * id with `notFound()` rather than crashing into the generic error
 * boundary.
 */
export default async function EditProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getProjectForAdmin(id);

  if (!result.ok) {
    return <AdminErrorState title="Unable to load this project." message={result.message} />;
  }

  const project = result.data;
  if (!project) notFound();

  const galleryResult = await listProjectGalleryForAdmin(project.id);
  const galleryMedia = galleryResult.ok ? galleryResult.data : [];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Link
          href="/admin/projects"
          className="font-[var(--font-mono)] uppercase transition-colors hover:text-[var(--color-brand)]"
          style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
        >
          ← Projects
        </Link>
        <div className="flex items-center gap-3">
          <AccentLine />
          <TechnicalLabel>Edit Project</TechnicalLabel>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="font-[var(--font-display)]" style={{ fontSize: "var(--text-h2)", color: "var(--color-text-primary)" }}>
            {project.title}
          </h1>
          <div className="flex items-center gap-3">
            <ContentStatusBadge status={project.status} />
            <ArchiveProjectButton id={project.id} alreadyArchived={project.status === "archived"} />
            <DeleteProjectButton id={project.id} />
          </div>
        </div>
      </div>

      <ProjectForm project={project} />

      <ProjectGalleryManager projectId={project.id} initialMedia={galleryMedia} />
    </div>
  );
}
