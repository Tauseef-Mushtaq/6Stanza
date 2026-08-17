"use client";

export function OptionPills({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: readonly string[];
  value?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3" role="radiogroup" aria-label={label}>
      <span
        className="font-[var(--font-mono)] uppercase"
        style={{ fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-muted)" }}
      >
        {label} <span style={{ opacity: 0.6 }}>(optional)</span>
      </span>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = value === option;
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(active ? "" : option)}
              className="rounded-[var(--radius-pill)] px-4 py-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
              style={{
                fontSize: "var(--text-caption)",
                border: `1px solid ${active ? "var(--color-brand)" : "var(--color-border)"}`,
                background: active ? "var(--color-brand)" : "transparent",
                color: active ? "var(--stz-white)" : "inherit",
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}
