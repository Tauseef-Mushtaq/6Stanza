"use client";

import { Button } from "@/components/ui/Button";
import { Label, HelperText, ErrorText, Input } from "@/components/ui/form/Field";

export interface SocialLinkState {
  label: string;
  href: string;
}

/**
 * Module 9D — manages `social_links jsonb` (`{ label, href }[]`, from
 * `TeamMember.socialLinks`) as a repeatable label/link UI, never raw
 * JSON — same rationale as `ProjectArchitectureEditor` in Module 9C,
 * just flat rather than grouped since `socialLinks` has no nested
 * shape to preserve.
 */
export function TeamSocialLinksEditor({
  links,
  onChange,
  error,
}: {
  links: SocialLinkState[];
  onChange: (links: SocialLinkState[]) => void;
  error?: string;
}) {
  function updateLink(index: number, next: Partial<SocialLinkState>) {
    onChange(links.map((link, i) => (i === index ? { ...link, ...next } : link)));
  }

  function addLink() {
    onChange([...links, { label: "", href: "" }]);
  }

  function removeLink(index: number) {
    onChange(links.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-col gap-4">
      <Label>Social links</Label>
      <HelperText>Optional — e.g. LinkedIn, portfolio, GitHub.</HelperText>

      {links.length === 0 ? (
        <p style={{ fontSize: "var(--text-small)", color: "var(--color-text-muted)" }}>No social links yet.</p>
      ) : null}

      <div className="flex flex-col gap-3">
        {links.map((link, index) => (
          <div key={index} className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Input
              value={link.label}
              onChange={(e) => updateLink(index, { label: e.target.value })}
              placeholder="Label — e.g. LinkedIn"
              aria-label={`Social link ${index + 1} label`}
              className="sm:max-w-[10rem]"
            />
            <Input
              value={link.href}
              onChange={(e) => updateLink(index, { href: e.target.value })}
              placeholder="https://…"
              aria-label={`Social link ${index + 1} URL`}
            />
            <Button type="button" variant="ghost" size="sm" onClick={() => removeLink(index)} className="self-start sm:self-auto">
              Remove
            </Button>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addLink} className="self-start">
        + Add Social Link
      </Button>

      {error ? <ErrorText>{error}</ErrorText> : null}
    </div>
  );
}
