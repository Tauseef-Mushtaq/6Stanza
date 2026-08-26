"use client";

import { Divider } from "@/components/ui/Divider";

interface Option<Id extends string> {
  id: Id;
  label: string;
}

/**
 * Single-select question rows, modeled directly on
 * `@/features/start-project/components/ServiceSelector`'s numbered-row
 * pattern (real `<button>` elements, `role="radiogroup"`/`"radio"`,
 * visible focus ring) rather than introducing a second selection
 * widget — this is the same interaction, just single-select instead of
 * multi-select.
 */
export function DiscoverySingleSelect<Id extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option<Id>[];
  value?: Id;
  onChange: (id: Id) => void;
}) {
  return (
    <div className="flex flex-col gap-3" role="radiogroup" aria-label={label}>
      <Divider />
      {options.map((option) => {
        const active = value === option.id;
        return (
          <div key={option.id}>
            <button
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(option.id)}
              className="group flex w-full items-center justify-between gap-6 py-5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand)]"
            >
              <span className="font-[var(--font-display)] tracking-tight" style={{ fontSize: "var(--text-body-lg)", opacity: active ? 1 : 0.85 }}>
                {option.label}
              </span>
              <span
                aria-hidden
                className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-colors"
                style={{
                  border: `1.5px solid ${active ? "var(--color-brand)" : "var(--color-border)"}`,
                  background: active ? "var(--color-brand)" : "transparent",
                }}
              >
                {active ? (
                  <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
                    <path d="M2 6.5 L5 9.5 L10 3" stroke="var(--stz-white)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : null}
              </span>
            </button>
            <Divider />
          </div>
        );
      })}
    </div>
  );
}
