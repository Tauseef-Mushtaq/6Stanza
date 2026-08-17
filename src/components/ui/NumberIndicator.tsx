import { cn } from "@/lib/utils/cn";

interface NumberIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: number | string;
  /** Total count, used only to decide left-padding width (e.g. "06" vs "01"). */
  total?: number;
}

/**
 * Zero-padded numeral used for service/step/team indices — the "01",
 * "02" markers from the Orionix reference. Purely presentational and
 * static here; later modules drive it from scroll position.
 */
export function NumberIndicator({ value, total = 9, className, ...props }: NumberIndicatorProps) {
  const padded =
    typeof value === "number" ? String(value).padStart(String(total).length + 1, "0") : value;

  return (
    <span
      className={cn("font-[var(--font-display)] tabular-nums", className)}
      style={{ fontSize: "var(--text-numeral)", color: "var(--color-brand)" }}
      {...props}
    >
      {padded}
    </span>
  );
}
