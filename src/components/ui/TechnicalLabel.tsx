import { cn } from "@/lib/utils/cn";

type TechnicalLabelProps = React.HTMLAttributes<HTMLSpanElement>;

/**
 * Small uppercase, tracked-out label used for eyebrows, tags, and
 * technical annotations (mirrors the "INTRO / FEATURES" and
 * "CLIENT VOICES" style labels in the reference sites).
 */
export function TechnicalLabel({ className, children, ...props }: TechnicalLabelProps) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 font-[var(--font-mono)] uppercase", className)}
      style={{
        fontSize: "var(--text-label)",
        letterSpacing: "var(--tracking-label)",
        color: "var(--color-muted)",
      }}
      {...props}
    >
      {children}
    </span>
  );
}
