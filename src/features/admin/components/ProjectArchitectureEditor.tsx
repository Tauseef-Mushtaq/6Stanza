"use client";

import { Button } from "@/components/ui/Button";
import { Label, HelperText, ErrorText, Input } from "@/components/ui/form/Field";

export interface ArchitectureGroupState {
  label: string;
  items: string[];
}

/**
 * Module 9C — manages `architecture jsonb` ({ label, items }[]) as a
 * repeatable group/items UI (spec §9), never raw JSON. Kept as a
 * small controlled sub-component of `ProjectForm` rather than a
 * separate form library — each group is a label input plus a
 * repeatable list of item inputs, matching the spec's ASCII mock
 * exactly. Stacks to full width on narrow screens so the item row
 * (input + remove button) never overflows (spec §18 — mobile
 * architecture editor is the one explicitly called out).
 */
export function ProjectArchitectureEditor({
  groups,
  onChange,
  error,
}: {
  groups: ArchitectureGroupState[];
  onChange: (groups: ArchitectureGroupState[]) => void;
  error?: string;
}) {
  function updateGroup(index: number, next: Partial<ArchitectureGroupState>) {
    onChange(groups.map((group, i) => (i === index ? { ...group, ...next } : group)));
  }

  function addGroup() {
    onChange([...groups, { label: "", items: [""] }]);
  }

  function removeGroup(index: number) {
    onChange(groups.filter((_, i) => i !== index));
  }

  function updateItem(groupIndex: number, itemIndex: number, value: string) {
    const group = groups[groupIndex];
    const items = group.items.map((item, i) => (i === itemIndex ? value : item));
    updateGroup(groupIndex, { items });
  }

  function addItem(groupIndex: number) {
    const group = groups[groupIndex];
    updateGroup(groupIndex, { items: [...group.items, ""] });
  }

  function removeItem(groupIndex: number, itemIndex: number) {
    const group = groups[groupIndex];
    updateGroup(groupIndex, { items: group.items.filter((_, i) => i !== itemIndex) });
  }

  return (
    <div className="flex flex-col gap-4">
      <Label>Architecture</Label>
      <HelperText>Grouped technology stages shown on the case-study page (e.g. &quot;Frontend&quot;, &quot;Infrastructure&quot;).</HelperText>

      {groups.length === 0 ? (
        <p style={{ fontSize: "var(--text-small)", color: "var(--color-text-muted)" }}>No architecture groups yet.</p>
      ) : null}

      <div className="flex flex-col gap-4">
        {groups.map((group, groupIndex) => (
          <div
            key={groupIndex}
            className="flex flex-col gap-3 rounded-[var(--radius-md)] border p-4"
            style={{ borderColor: "var(--color-border)" }}
          >
            <div className="flex items-center gap-3">
              <Input
                value={group.label}
                onChange={(e) => updateGroup(groupIndex, { label: e.target.value })}
                placeholder="Label — e.g. Frontend"
                aria-label={`Architecture group ${groupIndex + 1} label`}
              />
              <Button type="button" variant="ghost" size="sm" onClick={() => removeGroup(groupIndex)}>
                Remove group
              </Button>
            </div>

            <div className="flex flex-col gap-2 pl-0 sm:pl-4">
              {group.items.map((item, itemIndex) => (
                <div key={itemIndex} className="flex items-center gap-3">
                  <Input
                    value={item}
                    onChange={(e) => updateItem(groupIndex, itemIndex, e.target.value)}
                    placeholder="Item — e.g. Next.js"
                    aria-label={`Architecture group ${groupIndex + 1} item ${itemIndex + 1}`}
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(groupIndex, itemIndex)}>
                    Remove
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={() => addItem(groupIndex)} className="self-start">
                + Add Item
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={addGroup} className="self-start">
        + Add Architecture Group
      </Button>

      {error ? <ErrorText>{error}</ErrorText> : null}
    </div>
  );
}
