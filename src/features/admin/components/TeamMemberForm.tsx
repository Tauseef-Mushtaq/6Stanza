"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Label, HelperText, ErrorText, FieldGroup, Input, Textarea, Select } from "@/components/ui/form/Field";
import { createTeamMemberAction, updateTeamMemberAction } from "@/features/admin/actions";
import { contentStatusValues, slugify } from "@/features/admin/lib/services";
import { MediaUploadField } from "@/features/admin/components/MediaUploadField";
import { TeamSocialLinksEditor, type SocialLinkState } from "@/features/admin/components/TeamSocialLinksEditor";
import type { TeamMemberRow } from "@/lib/repositories/teamMembers";

interface FormState {
  slug: string;
  name: string;
  role: string;
  discipline: string;
  shortBio: string;
  initials: string;
  imagePath: string;
  socialLinks: SocialLinkState[];
  sortOrder: string;
  status: string;
}

function toFormState(member?: TeamMemberRow): FormState {
  if (!member) {
    return {
      slug: "",
      name: "",
      role: "",
      discipline: "",
      shortBio: "",
      initials: "",
      imagePath: "",
      socialLinks: [],
      sortOrder: "0",
      status: "draft",
    };
  }

  return {
    slug: member.slug,
    name: member.name,
    role: member.role,
    discipline: member.discipline,
    shortBio: member.short_bio,
    initials: member.initials,
    imagePath: member.image_path ?? "",
    socialLinks: member.social_links,
    sortOrder: String(member.sort_order),
    status: member.status,
  };
}

/** Drops empty rows before submit, same as `cleanArchitecture` in `ProjectForm` — a stray "+ Add Social Link" click shouldn't fail validation. */
function cleanSocialLinks(links: SocialLinkState[]) {
  return links
    .map((link) => ({ label: link.label.trim(), href: link.href.trim() }))
    .filter((link) => link.label.length > 0 && link.href.length > 0);
}

/**
 * Module 9D — the Team create/edit form (spec §7/§16). One component
 * handles both modes, same pattern as `ServiceForm`/`ProjectForm`.
 * `initials` is a plain text field (placeholder monogram until real
 * photography exists, per `TeamMember.initials`) — not derived
 * automatically, since the admin may want e.g. "AR" for "A. Rahman"
 * rather than a naive first-letter split.
 */
export function TeamMemberForm({ member }: { member?: TeamMemberRow }) {
  const router = useRouter();
  const isEdit = Boolean(member);

  const [form, setForm] = useState<FormState>(() => toFormState(member));
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFieldErrors({});
    setFormError(null);
    setSaved(false);

    const raw = {
      slug: form.slug,
      name: form.name,
      role: form.role,
      discipline: form.discipline,
      shortBio: form.shortBio,
      initials: form.initials,
      imagePath: form.imagePath,
      socialLinks: cleanSocialLinks(form.socialLinks),
      sortOrder: Number.parseInt(form.sortOrder, 10) || 0,
      status: form.status,
    };

    startTransition(async () => {
      const result = isEdit ? await updateTeamMemberAction(member!.id, raw) : await createTeamMemberAction(raw);

      if (!result.ok) {
        if (result.fieldErrors) setFieldErrors(result.fieldErrors);
        else setFormError(result.message);
        return;
      }

      if (isEdit) {
        setSaved(true);
        setForm(toFormState(result.data));
      } else {
        router.push(`/admin/team/${result.data.id}`);
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
            <Label htmlFor="role">Role</Label>
            <Input id="role" value={form.role} onChange={(e) => field("role", e.target.value)} placeholder="Founder & Strategy Lead" aria-invalid={Boolean(fieldErrors.role)} required />
            {fieldErrors.role ? <ErrorText>{fieldErrors.role}</ErrorText> : null}
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="discipline">Discipline</Label>
            <Input id="discipline" value={form.discipline} onChange={(e) => field("discipline", e.target.value)} placeholder="Strategy" aria-invalid={Boolean(fieldErrors.discipline)} required />
            <HelperText>One-word label used as the eyebrow on the individual-focus chapter.</HelperText>
            {fieldErrors.discipline ? <ErrorText>{fieldErrors.discipline}</ErrorText> : null}
          </FieldGroup>
        </div>
      </Card>

      <Card variant="bordered" className="gap-6">
        <FieldGroup>
          <Label htmlFor="shortBio">Short bio</Label>
          <Textarea id="shortBio" rows={4} value={form.shortBio} onChange={(e) => field("shortBio", e.target.value)} aria-invalid={Boolean(fieldErrors.shortBio)} required />
          {fieldErrors.shortBio ? <ErrorText>{fieldErrors.shortBio}</ErrorText> : null}
        </FieldGroup>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <FieldGroup>
            <Label htmlFor="initials">Initials</Label>
            <Input id="initials" value={form.initials} onChange={(e) => field("initials", e.target.value)} placeholder="AR" maxLength={4} aria-invalid={Boolean(fieldErrors.initials)} required />
            <HelperText>Placeholder monogram shown until a real portrait is set.</HelperText>
            {fieldErrors.initials ? <ErrorText>{fieldErrors.initials}</ErrorText> : null}
          </FieldGroup>
        </div>

        <div className="flex flex-col gap-2">
          <MediaUploadField
            id="imagePath"
            label="Portrait"
            bucket="team"
            value={form.imagePath}
            onChange={(path) => field("imagePath", path)}
            helperText="Optional — falls back to initials when empty."
          />
          {fieldErrors.imagePath ? <ErrorText>{fieldErrors.imagePath}</ErrorText> : null}
        </div>

        <TeamSocialLinksEditor
          links={form.socialLinks}
          onChange={(socialLinks) => field("socialLinks", socialLinks)}
          error={fieldErrors.socialLinks}
        />
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
          {isEdit ? "Save changes" : "Create team member"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.push("/admin/team")} disabled={pending}>
          Cancel
        </Button>
        {saved && !pending ? <span style={{ fontSize: "var(--text-caption)", color: "var(--color-success)" }}>Saved.</span> : null}
      </div>
    </form>
  );
}
