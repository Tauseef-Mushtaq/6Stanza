"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label, HelperText, ErrorText, FieldGroup, Input, Textarea, Select, Checkbox } from "@/components/ui/form/Field";
import { createServiceAction, updateServiceAction } from "@/features/admin/actions";
import { sixSOptions, iconKeyOptions, contentStatusValues, slugify } from "@/features/admin/lib/services";
import { MediaUploadField } from "@/features/admin/components/MediaUploadField";
import type { ServiceRow } from "@/lib/repositories/services";

interface FormState {
  slug: string;
  name: string;
  category: string;
  shortDescription: string;
  tags: string;
  iconKey: string;
  problem: string;
  capabilities: string;
  architecture: string;
  principles: number[];
  mediaPath: string;
  sortOrder: string;
  status: string;
}

function toFormState(service?: ServiceRow): FormState {
  if (!service) {
    return {
      slug: "",
      name: "",
      category: "",
      shortDescription: "",
      tags: "",
      iconKey: iconKeyOptions[0].value,
      problem: "",
      capabilities: "",
      architecture: "",
      principles: [],
      mediaPath: "",
      sortOrder: "0",
      status: "draft",
    };
  }

  return {
    slug: service.slug,
    name: service.name,
    category: service.category,
    shortDescription: service.short_description,
    tags: service.tags.join(", "),
    iconKey: service.icon_key,
    problem: service.problem ?? "",
    capabilities: service.capabilities.join(", "),
    architecture: service.architecture.join(", "),
    principles: service.principles,
    mediaPath: service.media_path ?? "",
    sortOrder: String(service.sort_order),
    status: service.status,
  };
}

/** Splits a comma-separated field into a trimmed, non-empty array — the "simplest approach that works with the design system" for tags/capabilities/architecture (spec §8). */
function splitList(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Module 9B — the Services create/edit form (spec §7/§12). One
 * component handles both modes, same as how the rest of the codebase
 * avoids near-duplicate create/edit forms. Array fields
 * (tags/capabilities/architecture) are plain comma-separated text
 * inputs; Six S `principles` is a controlled checkbox group over the
 * fixed six values (spec §9) — never a free-text numeric field.
 */
export function ServiceForm({ service }: { service?: ServiceRow }) {
  const router = useRouter();
  const isEdit = Boolean(service);

  const [form, setForm] = useState<FormState>(() => toFormState(service));
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  function field<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  function handleNameChange(value: string) {
    field("name", value);
    if (!slugTouched) {
      setForm((prev) => ({ ...prev, slug: slugify(value) }));
    }
  }

  function togglePrinciple(index: number) {
    setForm((prev) => ({
      ...prev,
      principles: prev.principles.includes(index)
        ? prev.principles.filter((p) => p !== index)
        : [...prev.principles, index].sort((a, b) => a - b),
    }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);
    setSaved(false);

    const raw = {
      slug: form.slug,
      name: form.name,
      category: form.category,
      shortDescription: form.shortDescription,
      tags: splitList(form.tags),
      iconKey: form.iconKey,
      problem: form.problem,
      capabilities: splitList(form.capabilities),
      architecture: splitList(form.architecture),
      principles: form.principles,
      mediaPath: form.mediaPath,
      sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
      status: form.status,
    };

    startTransition(async () => {
      const result = isEdit ? await updateServiceAction(service!.id, raw) : await createServiceAction(raw);

      if (!result.ok) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        else setFormError(result.message);
        return;
      }

      if (isEdit) {
        setSaved(true);
        setForm(toFormState(result.data));
      } else {
        router.push(`/admin/services/${result.data.id}`);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-8">
      <Card variant="bordered" className="gap-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FieldGroup>
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={form.name} onChange={(e) => handleNameChange(e.target.value)} aria-invalid={Boolean(fieldErrors.name)} required />
            {fieldErrors.name ? <ErrorText>{fieldErrors.name}</ErrorText> : null}
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
            <HelperText>Lowercase letters, numbers, and hyphens only. Generated from the name until edited.</HelperText>
            {fieldErrors.slug ? <ErrorText>{fieldErrors.slug}</ErrorText> : null}
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="category">Category</Label>
            <Input id="category" value={form.category} onChange={(e) => field("category", e.target.value)} aria-invalid={Boolean(fieldErrors.category)} required />
            {fieldErrors.category ? <ErrorText>{fieldErrors.category}</ErrorText> : null}
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="iconKey">Icon</Label>
            <Select id="iconKey" value={form.iconKey} onChange={(e) => field("iconKey", e.target.value)}>
              {iconKeyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            {fieldErrors.iconKey ? <ErrorText>{fieldErrors.iconKey}</ErrorText> : null}
          </FieldGroup>
        </div>

        <FieldGroup>
          <Label htmlFor="shortDescription">Short description</Label>
          <Textarea
            id="shortDescription"
            rows={3}
            value={form.shortDescription}
            onChange={(e) => field("shortDescription", e.target.value)}
            aria-invalid={Boolean(fieldErrors.shortDescription)}
            required
          />
          {fieldErrors.shortDescription ? <ErrorText>{fieldErrors.shortDescription}</ErrorText> : null}
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="tags">Tags</Label>
          <Input id="tags" value={form.tags} onChange={(e) => field("tags", e.target.value)} placeholder="Frontend, APIs, Performance" />
          <HelperText>Comma-separated.</HelperText>
        </FieldGroup>
      </Card>

      <Card variant="bordered" className="gap-6">
        <FieldGroup>
          <Label htmlFor="problem">Problem</Label>
          <Textarea id="problem" rows={4} value={form.problem} onChange={(e) => field("problem", e.target.value)} />
          <HelperText>Optional — the problem/opportunity this service addresses (detail page Chapter 02).</HelperText>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="capabilities">Capabilities</Label>
          <Input id="capabilities" value={form.capabilities} onChange={(e) => field("capabilities", e.target.value)} placeholder="Web Applications, APIs & Integrations" />
          <HelperText>Comma-separated capability rows.</HelperText>
        </FieldGroup>

        <FieldGroup>
          <Label htmlFor="architecture">Architecture stages</Label>
          <Input id="architecture" value={form.architecture} onChange={(e) => field("architecture", e.target.value)} placeholder="Frontend, API, Database, Infrastructure" />
          <HelperText>Comma-separated diagram stages.</HelperText>
        </FieldGroup>

        <FieldGroup>
          <Label>Six S principles</Label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {sixSOptions.map((option) => (
              <Checkbox
                key={option.value}
                id={`principle-${option.value}`}
                label={option.label}
                checked={form.principles.includes(option.value)}
                onChange={() => togglePrinciple(option.value)}
              />
            ))}
          </div>
          <HelperText>Up to 3 principles this service leans on most.</HelperText>
          {fieldErrors.principles ? <ErrorText>{fieldErrors.principles}</ErrorText> : null}
        </FieldGroup>
      </Card>

      <Card variant="bordered" className="gap-6">
        <MediaUploadField
          id="mediaPath"
          label="Media"
          bucket="general"
          value={form.mediaPath}
          onChange={(path) => field("mediaPath", path)}
        />
        {fieldErrors.mediaPath ? <ErrorText>{fieldErrors.mediaPath}</ErrorText> : null}

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
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create service"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/services")} disabled={pending}>
          Cancel
        </Button>
        {saved && !pending ? <span style={{ fontSize: "var(--text-caption)", color: "var(--color-success)" }}>Saved.</span> : null}
      </div>
    </form>
  );
}
