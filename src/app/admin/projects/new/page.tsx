import type { Metadata } from "next";
import Link from "next/link";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { ProjectForm } from "@/features/admin/components/ProjectForm";

export const metadata: Metadata = { title: "New Project" };

/** Module 9C — `/admin/projects/new` (spec §7). Renders `ProjectForm` with no `project` prop, i.e. create mode. */
export default function NewProjectPage() {
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
          <TechnicalLabel>New Project</TechnicalLabel>
        </div>
        <h1 className="font-[var(--font-display)]" style={{ fontSize: "var(--text-h2)", color: "var(--color-text-primary)" }}>
          Create Project
        </h1>
      </div>

      <ProjectForm />
    </div>
  );
}
