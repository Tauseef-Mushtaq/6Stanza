"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label, HelperText, ErrorText, FieldGroup, Input, Textarea, Select } from "@/components/ui/form/Field";
import { createProjectAction, updateProjectAction } from "@/features/admin/actions";
import { contentStatusValues, slugify } from "@/features/admin/lib/services";
import { MediaUploadField } from "@/features/admin/components/MediaUploadField";
import { ProjectArchitectureEditor, type ArchitectureGroupState } from "@/features/admin/components/ProjectArchitectureEditor";
import type { ProjectRow } from "@/lib/repositories/projects";

interface FormState {
  slug: string;
  title: string;
  category: string;
  description: string;
  technologies: string;
  outcome: string;
  accent: string;
  positioning: string;
  overviewSummary: string;
  overviewContribution: string;
  challenge: string;
  solution: string;
  architecture: ArchitectureGroupState[];
  outcomeStatement: string;
  mediaPath: string;
  sortOrder: string;
  status: string;
}

function toFormState(project?: ProjectRow): FormState {
  if (!project) {
    return {
      slug: "",
      title: "",
      category: "",
      description: "",
      technologies: "",
      outcome: "",
      accent: "200",
      positioning: "",
      overviewSummary: "",
      overviewContribution: "",
      challenge: "",
      solution: "",
      architecture: [],
      outcomeStatement: "",
      mediaPath: "",
      sortOrder: "0",
      status: "draft",
    };
  }

  return {
    slug: project.slug,
    title: project.title,
    category: project.category,
    description: project.description,
    technologies: project.technologies.join(", "),
    outcome: project.outcome,
    accent: String(project.accent),
    positioning: project.positioning ?? "",
    overviewSummary: project.overview_summary ?? "",
    overviewContribution: project.overview_contribution ?? "",
    challenge: project.challenge ?? "",
    solution: project.solution ?? "",
    architecture: project.architecture,
    outcomeStatement: project.outcome_statement ?? "",
    mediaPath: project.media_path ?? "",
    sortOrder: String(project.sort_order),
    status: project.status,
  };
}

/** Splits a comma-separated field into a trimmed, non-empty array — same approach as `ServiceForm`'s `splitList` (spec §8). */
function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/** Drops empty item rows / empty groups before submit, so a stray "+ Add Item" click doesn't fail validation. */
function cleanArchitecture(groups: ArchitectureGroupState[]) {
  return groups
    .map((group) => ({ label: group.label, items: group.items.map((item) => item.trim()).filter(Boolean) }))
    .filter((group) => group.label.trim().length > 0 && group.items.length > 0);
}

/**
 * Module 9C — the Projects create/edit form (spec §7/§13). One
 * component handles both modes, same pattern as `ServiceForm`. Array
 * fields (technologies) are a comma-separated text input; the
 * `architecture jsonb` field is handled by `ProjectArchitectureEditor`
 * rather than raw JSON (spec §9).
 */
export function ProjectForm({ project }: { project?: ProjectRow }) {
  const router = useRouter();
  const isEdit = Boolean(project);

  const [form, setForm] = useState<FormState>(() => toFormState(project));
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function field<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleTitleChange(value: string) {
    field("title", value);
    if (!slugTouched) {
      setForm((prev) => ({ ...prev, slug: slugify(value) }));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);
    setSaved(false);

    const raw = {
      slug: form.slug,
      title: form.title,
      category: form.category,
      description: form.description,
      technologies: splitList(form.technologies),
      outcome: form.outcome,
      accent: Number.parseInt(form.accent, 10) || 0,
      positioning: form.positioning,
      overviewSummary: form.overviewSummary,
      overviewContribution: form.overviewContribution,
      challenge: form.challenge,
      solution: form.solution,
      architecture: cleanArchitecture(form.architecture),
      outcomeStatement: form.outcomeStatement,
      mediaPath: form.mediaPath,
      sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
      status: form.status,
    };

    startTransition(async () => {
      const result = isEdit ? await updateProjectAction(project!.id, raw) : await createProjectAction(raw);

      if (!result.ok) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        else setFormError(result.message);
        return;
      }

      if (isEdit) {
        setSaved(true);
        setForm(toFormState(result.data));
      } else {
        router.push(`/admin/projects/${result.data.id}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      <Card variant="bordered" className="gap-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FieldGroup>
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={form.title} onChange={(e) => handleTitleChange(e.target.value)} aria-invalid={Boolean(fieldErrors.title)} required />
            {fieldErrors.title ? <ErrorText>{fieldErrors.title}</ErrorText> : null}
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={form.slug}
              onChange={(e) => {
                setSlugTouched(true);
                field("slug", e.target.value);
              }}
              aria-invalid={Boolean(fieldErrors.slug)}
              required
            />
            <HelperText>Lowercase letters, numbers, and hyphens only. Generated from the title until edited.</HelperText>
            {fieldErrors.slug ? <ErrorText>{fieldErrors.slug}</ErrorText> : null}
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={form.category} onChange={(e) => field("category", e.target.value)} aria-invalid={Boolean(fieldErrors.category)} required />
            {fieldErrors.category ? <ErrorText>{fieldErrors.category}</ErrorText> : null}
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="outcome">Outcome</Label>
            <Input id="outcome" value={form.outcome} onChange={(e) => field("outcome", e.target.value)} placeholder="99.9% uptime post-migration" aria-invalid={Boolean(fieldErrors.outcome)} required />
            {fieldErrors.outcome ? <ErrorText>{fieldErrors.outcome}</ErrorText> : null}
          </FieldGroup>
        </div>

        <FieldGroup>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" rows={3} value={form.description} onChange={(e) => field("description", e.target.value)} aria-invalid={Boolean(fieldErrors.description)} required />
          {fieldErrors.description ? <ErrorText>{fieldErrors.description}</ErrorText> : null}
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="technologies">Technologies</Label>
          <Input id="technologies" value={form.technologies} onChange={(e) => field("technologies", e.target.value)} placeholder="Next.js, Docker, Kubernetes" />
          <HelperText>Comma-separated.</HelperText>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="positioning">Positioning</Label>
          <Input id="positioning" value={form.positioning} onChange={(e) => field("positioning", e.target.value)} placeholder="Short line under the hero title" />
          <HelperText>Optional.</HelperText>
          {fieldErrors.positioning ? <ErrorText>{fieldErrors.positioning}</ErrorText> : null}
        </FieldGroup>
      </Card>

      <Card variant="bordered" className="gap-6">
        <FieldGroup>
          <Label htmlFor="overviewSummary">Overview — summary</Label>
          <Textarea id="overviewSummary" rows={3} value={form.overviewSummary} onChange={(e) => field("overviewSummary", e.target.value)} />
          <HelperText>Optional — what the project is.</HelperText>
          {fieldErrors.overviewSummary ? <ErrorText>{fieldErrors.overviewSummary}</ErrorText> : null}
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="overviewContribution">Overview — contribution</Label>
          <Textarea id="overviewContribution" rows={3} value={form.overviewContribution} onChange={(e) => field("overviewContribution", e.target.value)} />
          <HelperText>Optional — what 6STANZA contributed.</HelperText>
          {fieldErrors.overviewContribution ? <ErrorText>{fieldErrors.overviewContribution}</ErrorText> : null}
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="challenge">Challenge</Label>
          <Textarea id="challenge" rows={4} value={form.challenge} onChange={(e) => field("challenge", e.target.value)} />
          <HelperText>Optional — the problem being addressed.</HelperText>
          {fieldErrors.challenge ? <ErrorText>{fieldErrors.challenge}</ErrorText> : null}
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="solution">Solution</Label>
          <Textarea id="solution" rows={4} value={form.solution} onChange={(e) => field("solution", e.target.value)} />
          <HelperText>Optional — how it was addressed.</HelperText>
          {fieldErrors.solution ? <ErrorText>{fieldErrors.solution}</ErrorText> : null}
        </FieldGroup>

        <ProjectArchitectureEditor
          groups={form.architecture}
          onChange={(architecture) => field("architecture", architecture)}
          error={fieldErrors.architecture}
        />

        <FieldGroup>
          <Label htmlFor="outcomeStatement">Outcome statement</Label>
          <Textarea id="outcomeStatement" rows={2} value={form.outcomeStatement} onChange={(e) => field("outcomeStatement", e.target.value)} />
          <HelperText>Optional — qualitative close-out line alongside the factual outcome badge.</HelperText>
          {fieldErrors.outcomeStatement ? <ErrorText>{fieldErrors.outcomeStatement}</ErrorText> : null}
        </FieldGroup>
      </Card>

      <Card variant="bordered" className="gap-6">
        <MediaUploadField
          id="mediaPath"
          label="Media"
          bucket="projects"
          value={form.mediaPath}
          onChange={(path) => field("mediaPath", path)}
        />
        {fieldErrors.mediaPath ? <ErrorText>{fieldErrors.mediaPath}</ErrorText> : null}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FieldGroup>
            <Label htmlFor="accent">Accent (0–360)</Label>
            <Input id="accent" type="number" min={0} max={360} value={form.accent} onChange={(e) => field("accent", e.target.value)} aria-invalid={Boolean(fieldErrors.accent)} />
            <HelperText>Gradient hue used by the placeholder project visual.</HelperText>
            {fieldErrors.accent ? <ErrorText>{fieldErrors.accent}</ErrorText> : null}
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="sortOrder">Sort order</Label>
            <Input id="sortOrder" type="number" min={0} value={form.sortOrder} onChange={(e) => field("sortOrder", e.target.value)} />
            {fieldErrors.sortOrder ? <ErrorText>{fieldErrors.sortOrder}</ErrorText> : null}
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="status">Status</Label>
            <Select id="status" value={form.status} onChange={(e) => field("status", e.target.value)}>
              {contentStatusValues.map((value) => (
                <option key={value} value={value}>
                  {value[0].toUpperCase() + value.slice(1)}
                </option>
              ))}
            </Select>
          </FieldGroup>
        </div>
      </Card>

      {formError ? <ErrorText>{formError}</ErrorText> : null}

      <div className="flex items-center gap-4">
        <Button type="submit" variant="primary" loading={pending}>
          {isEdit ? "Save changes" : "Create project"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/projects")} disabled={pending}>
          Cancel
        </Button>
        {saved && !pending ? <span style={{ fontSize: "var(--text-caption)", color: "var(--color-success)" }}>Saved.</span> : null}
      </div>
    </form>
  );
}
