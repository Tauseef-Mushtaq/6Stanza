import { cn } from "@/lib/utils/cn";

interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  orientation?: "horizontal" | "vertical";
}

export function Divider({ orientation = "horizontal", className, ...props }: DividerProps) {
  return (
    <hr
      className={cn(
        "border-0",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className
      )}
      style={{ background: "var(--color-border)" }}
      {...props}
    />
  );
}

/** Single small dot — list markers, status indicators, decorative punctuation. */
export function Dot({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden
      className={cn("inline-block h-1.5 w-1.5 rounded-full", className)}
      style={{ background: "var(--color-brand)" }}
      {...props}
    />
  );
}

/** Short accent line — used beside eyebrows/labels to add a brand-colored punctuation mark. */
export function AccentLine({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      aria-hidden
      className={cn("inline-block h-px w-8", className)}
      style={{ background: "var(--color-brand)" }}
      {...props}
    />
  );
}

/** L-shaped corner marker — frames images/cards with a technical, blueprint-like accent. */
export function CornerMarker({
  corner = "top-left",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & {
  corner?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
}) {
  const position: Record<string, string> = {
    "top-left": "top-0 left-0 border-t border-l",
    "top-right": "top-0 right-0 border-t border-r",
    "bottom-left": "bottom-0 left-0 border-b border-l",
    "bottom-right": "bottom-0 right-0 border-b border-r",
  };
  return (
    <span
      aria-hidden
      className={cn("absolute h-4 w-4", position[corner], className)}
      style={{ borderColor: "var(--color-brand)" }}
      {...props}
    />
  );
}

/** Faint background grid — a subtle technical texture for hero/section backdrops. Decorative only. */
export function SubtleGrid({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage:
          "linear-gradient(var(--surface-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--surface-grid-line) 1px, transparent 1px)",
        backgroundSize: "56px 56px",
      }}
      {...props}
    />
  );
}

/** Zero-padded section numeral for editorial headers, e.g. "01 —". Pairs with TechnicalLabel. */
export function SectionNumber({
  value,
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { value: number | string }) {
  const padded = typeof value === "number" ? String(value).padStart(2, "0") : value;
  return (
    <span
      className={cn("font-[var(--font-mono)] tabular-nums", className)}
      style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-brand)" }}
      {...props}
    >
      {padded}
    </span>
  );
}
