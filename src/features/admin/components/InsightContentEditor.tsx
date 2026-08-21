"use client";

import { Button } from "@/components/ui/Button";
import { Label, HelperText, ErrorText, Input, Textarea, Select } from "@/components/ui/form/Field";

export type InsightBlockState =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string; attribution: string }
  | { type: "list"; items: string }
  | { type: "code"; language: string; code: string }
  | { type: "callout"; label: string; text: string };

const BLOCK_TYPES: Array<{ value: InsightBlockState["type"]; label: string }> = [
  { value: "paragraph", label: "Paragraph" },
  { value: "heading", label: "Heading" },
  { value: "quote", label: "Quote" },
  { value: "list", label: "List" },
  { value: "code", label: "Code" },
  { value: "callout", label: "Callout" },
];

function emptyBlock(type: InsightBlockState["type"]): InsightBlockState {
  switch (type) {
    case "paragraph":
    case "heading":
      return { type, text: "" };
    case "quote":
      return { type: "quote", text: "", attribution: "" };
    case "list":
      return { type: "list", items: "" };
    case "code":
      return { type: "code", language: "", code: "" };
    case "callout":
      return { type: "callout", label: "", text: "" };
  }
}

/**
 * Module 9E — manages `content jsonb` (`InsightBlock[]`, matching
 * `src/features/insights/data/insights.ts`'s `InsightBlock` union)
 * as a small structured block editor, never raw JSON — same
 * rationale as `TeamSocialLinksEditor`/`ProjectArchitectureEditor`
 * from Modules 9C/9D, just with a per-block type selector since
 * `InsightBlock` is a discriminated union rather than one fixed
 * shape. `list.items` is edited as one-line-per-item text (mirroring
 * the comma/line-separated array convention already used elsewhere
 * in this CMS) rather than its own repeatable row editor, since a
 * body list is usually authored as a block of lines at once.
 */
export function InsightContentEditor({
  blocks,
  onChange,
  error,
}: {
  blocks: InsightBlockState[];
  onChange: (blocks: InsightBlockState[]) => void;
  error?: string;
}) {
  function updateBlock(index: number, next: InsightBlockState) {
    onChange(blocks.map((block, i) => (i === index ? next : block)));
  }

  function changeBlockType(index: number, type: InsightBlockState["type"]) {
    updateBlock(index, emptyBlock(type));
  }

  function addBlock() {
    onChange([...blocks, emptyBlock("paragraph")]);
  }

  function removeBlock(index: number) {
    onChange(blocks.filter((_, i) => i !== index));
  }

  function moveBlock(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= blocks.length) return;
    const next = [...blocks];
    [next[index], next[target]] = [next[target], next[index]];
    onChange(next);
  }

  return (
    <div className="flex flex-col gap-4">
      <Label>Content</Label>
      <HelperText>The article body, as an ordered list of blocks.</HelperText>

      {blocks.length === 0 ? (
        <p style={{ fontSize: "var(--text-small)", color: "var(--color-text-muted)" }}>No content blocks yet.</p>
      ) : null}

      <div className="flex flex-col gap-4">
        {blocks.map((block, index) => (
          <div key={index} className="flex flex-col gap-3 rounded-[var(--radius-md)] border p-4" style={{ borderColor: "var(--color-border)" }}>
            <div className="flex items-center justify-between gap-3">
              <Select
                value={block.type}
                onChange={(e) => changeBlockType(index, e.target.value as InsightBlockState["type"])}
                aria-label={`Block ${index + 1} type`}
                className="max-w-[10rem]"
              >
                {BLOCK_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="sm" onClick={() => moveBlock(index, -1)} disabled={index === 0}>
                  Move up
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => moveBlock(index, 1)} disabled={index === blocks.length - 1}>
                  Move down
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeBlock(index)}>
                  Remove
                </Button>
              </div>
            </div>

            {block.type === "paragraph" || block.type === "heading" ? (
              <Textarea
                value={block.text}
                onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                rows={block.type === "heading" ? 1 : 3}
                placeholder={block.type === "heading" ? "Heading text" : "Paragraph text"}
                aria-label={`Block ${index + 1} text`}
              />
            ) : null}

            {block.type === "quote" ? (
              <div className="flex flex-col gap-3">
                <Textarea
                  value={block.text}
                  onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                  rows={2}
                  placeholder="Quote text"
                  aria-label={`Block ${index + 1} quote text`}
                />
                <Input
                  value={block.attribution}
                  onChange={(e) => updateBlock(index, { ...block, attribution: e.target.value })}
                  placeholder="Attribution (optional)"
                  aria-label={`Block ${index + 1} attribution`}
                />
              </div>
            ) : null}

            {block.type === "list" ? (
              <Textarea
                value={block.items}
                onChange={(e) => updateBlock(index, { ...block, items: e.target.value })}
                rows={4}
                placeholder={"One item per line"}
                aria-label={`Block ${index + 1} list items`}
              />
            ) : null}

            {block.type === "code" ? (
              <div className="flex flex-col gap-3">
                <Input
                  value={block.language}
                  onChange={(e) => updateBlock(index, { ...block, language: e.target.value })}
                  placeholder="Language — e.g. ts"
                  aria-label={`Block ${index + 1} code language`}
                  className="max-w-[10rem]"
                />
                <Textarea
                  value={block.code}
                  onChange={(e) => updateBlock(index, { ...block, code: e.target.value })}
                  rows={6}
                  placeholder="Code"
                  aria-label={`Block ${index + 1} code`}
                  className="font-[var(--font-mono)]"
                />
              </div>
            ) : null}

            {block.type === "callout" ? (
              <div className="flex flex-col gap-3">
                <Input
                  value={block.label}
                  onChange={(e) => updateBlock(index, { ...block, label: e.target.value })}
                  placeholder="Label — e.g. Key takeaway"
                  aria-label={`Block ${index + 1} callout label`}
                />
                <Textarea
                  value={block.text}
                  onChange={(e) => updateBlock(index, { ...block, text: e.target.value })}
                  rows={2}
                  placeholder="Callout text"
                  aria-label={`Block ${index + 1} callout text`}
                />
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addBlock} className="self-start">
        + Add Block
      </Button>

      {error ? <ErrorText>{error}</ErrorText> : null}
    </div>
  );
}
