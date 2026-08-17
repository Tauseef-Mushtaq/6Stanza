"use client";

import { Divider } from "@/components/ui/Divider";
import type { ServiceItem } from "@/features/home/data/services";

/**
 * Service selection, modeled on the numbered-row pattern established by
 * `InsightsList` (§6 — "reuse established patterns... do not copy their
 * entire implementation blindly") rather than eight cards. Each row is
 * a real `<button type="button">`, so it's keyboard-reachable and
 * activatable with Space/Enter with no extra ARIA wiring needed.
 */
export function ServiceSelector({
  services,
  selected,
  onToggle,
  error,
}: {
  services: ServiceItem[];
  selected: string[];
  onToggle: (slug: string) => void;
  error?: string;
}) {
  return (
    <div className="flex flex-col gap-3" role="group" aria-label="Select the services you need">
      <Divider />
      {services.map((service) => {
        const active = selected.includes(service.slug);
        return (
          <div key={service.slug}>
            <button
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(service.slug)}
              className="group flex w-full items-center justify-between gap-6 py-5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-brand)]"
            >
              <span className="flex items-center gap-5">
                <span
                  className="font-[var(--font-display)] tabular-nums"
                  style={{
                    fontSize: "var(--text-h3)",
                    lineHeight: 1,
                    color: active ? "var(--color-brand)" : "var(--color-text-muted)",
                    opacity: active ? 1 : 0.6,
                    transition: "color 200ms ease, opacity 200ms ease",
                  }}
                >
                  {String(service.index).padStart(2, "0")}
                </span>
                <span
                  className="font-[var(--font-display)] tracking-tight"
                  style={{ fontSize: "var(--text-body-lg)", opacity: active ? 1 : 0.85 }}
                >
                  {service.label}
                </span>
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
      {error ? (
        <p role="alert" style={{ color: "#ff6b6b", fontSize: "var(--text-caption)" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
