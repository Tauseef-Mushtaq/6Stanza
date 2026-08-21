"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label, HelperText, ErrorText, FieldGroup, Input, Textarea, Select } from "@/components/ui/form/Field";
import { createInsightAction, updateInsightAction } from "@/features/admin/actions";
import { contentStatusValues, insightCategoryOptions, slugify } from "@/features/admin/lib/services";
import { InsightContentEditor, type InsightBlockState } from "@/features/admin/components/InsightContentEditor";
import { MediaUploadField } from "@/features/admin/components/MediaUploadField";
import type { InsightRow } from "@/lib/repositories/insights";
import type { Json } from "@/lib/supabase/database.types";

interface FormState {
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  content: InsightBlockState[];
  readingTime: string;
  mediaPath: string;
  status: string;
}

/** `InsightBlock` (persisted) → `InsightBlockState` (edited) — expands `list.items` to one-line-per-item text and always gives `quote` an editable `attribution` field. */
function toBlockState(block: unknown): InsightBlockState | null {
  if (typeof block !== "object" || block === null || !("type" in block)) return null;
  const b = block as Record<string, unknown>;
  switch (b.type) {
    case "paragraph":
    case "heading":
      return { type: b.type, text: typeof b.text === "string" ? b.text : "" };
    case "quote":
      return {
        type: "quote",
        text: typeof b.text === "string" ? b.text : "",
        attribution: typeof b.attribution === "string" ? b.attribution : "",
      };
    case "list":
      return { type: "list", items: Array.isArray(b.items) ? (b.items as string[]).join("\n") : "" };
    case "code":
      return {
        type: "code",
        language: typeof b.language === "string" ? b.language : "",
        code: typeof b.code === "string" ? b.code : "",
      };
    case "callout":
      return {
        type: "callout",
        label: typeof b.label === "string" ? b.label : "",
        text: typeof b.text === "string" ? b.text : "",
      };
    default:
      return null;
  }
}

function toFormState(insight?: InsightRow): FormState {
  if (!insight) {
    return { slug: "", title: "", category: "", excerpt: "", content: [], readingTime: "", mediaPath: "", status: "draft" };
  }

  const rawContent = Array.isArray(insight.content) ? insight.content : [];
  const content = rawContent.map(toBlockState).filter((block): block is InsightBlockState => block !== null);

  return {
    slug: insight.slug,
    title: insight.title,
    category: insight.category,
    excerpt: insight.excerpt,
    content,
    readingTime: insight.reading_time,
    mediaPath: insight.media_path ?? "",
    status: insight.status,
  };
}

/** `InsightBlockState` (edited) → `InsightBlock` (submitted), dropping empty stray blocks and collapsing `list.items` back to a string array. Matches `insightBlockSchema` (`src/lib/validation/cmsContent.ts`) exactly — no extra block shapes invented. */
function cleanContent(blocks: InsightBlockState[]): Json[] {
  const cleaned: Json[] = [];
  for (const block of blocks) {
    switch (block.type) {
      case "paragraph":
      case "heading": {
        const text = block.text.trim();
        if (text) cleaned.push({ type: block.type, text });
        break;
      }
      case "quote": {
        const text = block.text.trim();
        const attribution = block.attribution.trim();
        if (text) cleaned.push(attribution ? { type: "quote", text, attribution } : { type: "quote", text });
        break;
      }
      case "list": {
        const items = block.items
          .split("\n")
          .map((item) => item.trim())
          .filter((item) => item.length > 0);
        if (items.length > 0) cleaned.push({ type: "list", items });
        break;
      }
      case "code": {
        const language = block.language.trim();
        const code = block.code;
        if (language && code.trim()) cleaned.push({ type: "code", language, code });
        break;
      }
      case "callout": {
        const label = block.label.trim();
        const text = block.text.trim();
        if (label && text) cleaned.push({ type: "callout", label, text });
        break;
      }
    }
  }
  return cleaned;
}

/**
 * Module 9E — the Insights create/edit form (spec §8/§20). One
 * component handles both modes, same pattern as `TeamMemberForm`/
 * `ServiceForm`/`ProjectForm`. Organized required-before-optional-
 * before-publishing, per spec §8: content identity (title/slug/
 * category) → summary (excerpt) → body (content blocks) → publishing
 * metadata (reading time/media path/status). No `sortOrder` field —
 * the real `insights` schema has none (spec §16/§4).
 */
export function InsightForm({ insight }: { insight?: InsightRow }) {
  const router = useRouter();
  const isEdit = Boolean(insight);

  const [form, setForm] = useState<FormState>(() => toFormState(insight));
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
      excerpt: form.excerpt,
      content: cleanContent(form.content),
      readingTime: form.readingTime,
      mediaPath: form.mediaPath,
      status: form.status,
    };

    startTransition(async () => {
      const result = isEdit ? await updateInsightAction(insight!.id, raw) : await createInsightAction(raw);

      if (!result.ok) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        else setFormError(result.message);
        return;
      }

      if (isEdit) {
        setSaved(true);
        setForm(toFormState(result.data));
      } else {
        router.push(`/admin/insights/${result.data.id}`);
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
            <Input
              id="category"
              list="insight-category-options"
              value={form.category}
              onChange={(e) => field("category", e.target.value)}
              placeholder="DevOps"
              aria-invalid={Boolean(fieldErrors.category)}
              required
            />
            <datalist id="insight-category-options">
              {insightCategoryOptions.map((option) => (
                <option key={option.value} value={option.value} />
              ))}
            </datalist>
            {fieldErrors.category ? <ErrorText>{fieldErrors.category}</ErrorText> : null}
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="readingTime">Reading time</Label>
            <Input id="readingTime" value={form.readingTime} onChange={(e) => field("readingTime", e.target.value)} placeholder="6 min" aria-invalid={Boolean(fieldErrors.readingTime)} required />
            {fieldErrors.readingTime ? <ErrorText>{fieldErrors.readingTime}</ErrorText> : null}
          </FieldGroup>
        </div>
      </Card>

      <Card variant="bordered" className="gap-6">
        <FieldGroup>
          <Label htmlFor="excerpt">Excerpt</Label>
          <Textarea id="excerpt" rows={3} value={form.excerpt} onChange={(e) => field("excerpt", e.target.value)} aria-invalid={Boolean(fieldErrors.excerpt)} required />
          {fieldErrors.excerpt ? <ErrorText>{fieldErrors.excerpt}</ErrorText> : null}
        </FieldGroup>
      </Card>

      <Card variant="bordered" className="gap-6">
        <InsightContentEditor blocks={form.content} onChange={(content) => field("content", content)} error={fieldErrors.content} />
      </Card>

      <Card variant="bordered" className="gap-6">
        <MediaUploadField
          id="mediaPath"
          label="Cover image"
          bucket="insights"
          value={form.mediaPath}
          onChange={(path) => field("mediaPath", path)}
          helperText="Optional — not yet rendered on the public article page."
        />
        {fieldErrors.mediaPath ? <ErrorText>{fieldErrors.mediaPath}</ErrorText> : null}

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
      </Card>

      {formError ? <ErrorText>{formError}</ErrorText> : null}

      <div className="flex items-center gap-4">
        <Button type="submit" variant="primary" disabled={pending}>
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create insight"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/insights")} disabled={pending}>
          Cancel
        </Button>
        {saved && !pending ? <span style={{ fontSize: "var(--text-caption)", color: "var(--color-success)" }}>Saved.</span> : null}
      </div>
    </form>
  );
}
