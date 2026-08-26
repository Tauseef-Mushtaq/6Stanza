"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label, HelperText, ErrorText, FieldGroup, Input, Textarea, Select } from "@/components/ui/form/Field";
import { createTestimonialAction, updateTestimonialAction } from "@/features/admin/actions";
import { contentStatusValues } from "@/features/admin/lib/services";
import { MediaUploadField } from "@/features/admin/components/MediaUploadField";
import type { TestimonialRow } from "@/lib/repositories/testimonials";

interface FormState {
  name: string;
  role: string;
  company: string;
  quote: string;
  imagePath: string;
  projectId: string;
  sortOrder: string;
  status: string;
}

function toFormState(testimonial?: TestimonialRow): FormState {
  if (!testimonial) {
    return { name: "", role: "", company: "", quote: "", imagePath: "", projectId: "", sortOrder: "0", status: "draft" };
  }

  return {
    name: testimonial.name,
    role: testimonial.role ?? "",
    company: testimonial.company ?? "",
    quote: testimonial.quote,
    imagePath: testimonial.image_path ?? "",
    projectId: testimonial.project_id ?? "",
    sortOrder: String(testimonial.sort_order),
    status: testimonial.status,
  };
}

/**
 * MODULE-TESTIMONIAL-1 — the Testimonial create/edit form. Same
 * one-component-both-modes pattern as `TeamMemberForm`/`ServiceForm`.
 * No slug field (testimonials have no public detail route). The
 * optional `projectId` is a plain text field for the project's UUID
 * rather than a `<select>` — keeps this module from needing to fetch
 * the full project list just to populate a picker; the admin can copy
 * the id from `/admin/projects` when attribution is wanted.
 */
export function TestimonialForm({ testimonial }: { testimonial?: TestimonialRow }) {
  const router = useRouter();
  const isEdit = Boolean(testimonial);

  const [form, setForm] = useState<FormState>(() => toFormState(testimonial));
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function field<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);
    setSaved(false);

    const raw = {
      name: form.name,
      role: form.role,
      company: form.company,
      quote: form.quote,
      imagePath: form.imagePath,
      projectId: form.projectId,
      sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
      status: form.status,
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateTestimonialAction(testimonial!.id, raw)
        : await createTestimonialAction(raw);

      if (!result.ok) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        else setFormError(result.message);
        return;
      }

      if (isEdit) {
        setSaved(true);
        setForm(toFormState(result.data));
      } else {
        router.push(`/admin/testimonials/${result.data.id}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      <Card variant="bordered" className="gap-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FieldGroup>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => field("name", e.target.value)} aria-invalid={Boolean(fieldErrors.name)} required />
            {fieldErrors.name ? <ErrorText>{fieldErrors.name}</ErrorText> : null}
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="role">Role (optional)</Label>
            <Input id="role" value={form.role} onChange={(e) => field("role", e.target.value)} placeholder="CTO" aria-invalid={Boolean(fieldErrors.role)} />
            {fieldErrors.role ? <ErrorText>{fieldErrors.role}</ErrorText> : null}
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="company">Company (optional)</Label>
            <Input id="company" value={form.company} onChange={(e) => field("company", e.target.value)} aria-invalid={Boolean(fieldErrors.company)} />
            {fieldErrors.company ? <ErrorText>{fieldErrors.company}</ErrorText> : null}
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="projectId">Related project id (optional)</Label>
            <Input id="projectId" value={form.projectId} onChange={(e) => field("projectId", e.target.value)} placeholder="uuid from /admin/projects" aria-invalid={Boolean(fieldErrors.projectId)} />
            <HelperText>Leave empty unless this testimonial is about a specific case study.</HelperText>
            {fieldErrors.projectId ? <ErrorText>{fieldErrors.projectId}</ErrorText> : null}
          </FieldGroup>
        </div>
      </Card>

      <Card variant="bordered" className="gap-6">
        <FieldGroup>
          <Label htmlFor="quote">Quote</Label>
          <Textarea id="quote" rows={5} value={form.quote} onChange={(e) => field("quote", e.target.value)} aria-invalid={Boolean(fieldErrors.quote)} required />
          {fieldErrors.quote ? <ErrorText>{fieldErrors.quote}</ErrorText> : null}
        </FieldGroup>

        <div className="flex flex-col gap-2">
          <MediaUploadField
            id="imagePath"
            label="Portrait (optional)"
            bucket="general"
            value={form.imagePath}
            onChange={(path) => field("imagePath", path)}
            helperText="Optional — the public card reads correctly without one."
          />
          {fieldErrors.imagePath ? <ErrorText>{fieldErrors.imagePath}</ErrorText> : null}
        </div>
      </Card>

      <Card variant="bordered" className="gap-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
          {isEdit ? "Save changes" : "Create testimonial"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/testimonials")} disabled={pending}>
          Cancel
        </Button>
        {saved && !pending ? <span style={{ fontSize: "var(--text-caption)", color: "var(--color-success)" }}>Saved.</span> : null}
      </div>
    </form>
  );
}
