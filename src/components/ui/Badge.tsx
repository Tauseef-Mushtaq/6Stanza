import { cn } from "@/lib/utils/cn";

type BadgeVariant = "outline" | "solid" | "soft" | "status";
type BadgeTone = "brand" | "neutral" | "success" | "warning" | "error";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  tone?: BadgeTone;
}

const TONE_COLOR: Record<BadgeTone, string> = {
  brand: "var(--color-brand)",
  neutral: "var(--color-text-secondary)",
  success: "var(--color-success)",
  warning: "var(--color-warning)",
  error: "var(--color-error)",
};

/**
 * Category/status badge — distinct from TechnicalLabel (which is for
 * eyebrow/section labels). Use Badge for tags on cards (e.g. project
 * category, insight topic, availability status).
 */
export function Badge({ variant = "outline", tone = "brand", className, style, children, ...props }: BadgeProps) {
  const color = TONE_COLOR[tone];

  const variantStyle: React.CSSProperties =
    variant === "solid"
      ? { background: color, color: "var(--stz-white)", border: "1px solid transparent" }
      : variant === "soft"
        ? { background: `color-mix(in srgb, ${color} 14%, transparent)`, color, border: "1px solid transparent" }
        : variant === "status"
          ? { background: "transparent", color, border: `1px solid ${color}` }
          : { background: "transparent", color, border: `1px solid var(--color-border)` };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-[var(--radius-pill)] px-3 py-1 font-[var(--font-mono)] uppercase",
        className
      )}
      style={{
        fontSize: "var(--text-label)",
        letterSpacing: "var(--tracking-label)",
        ...variantStyle,
        ...style,
      }}
      {...props}
    >
      {variant === "status" ? (
        <span aria-hidden className="h-1.5 w-1.5 rounded-full" style={{ background: color }} />
      ) : null}
      {children}
    </span>
  );
}
