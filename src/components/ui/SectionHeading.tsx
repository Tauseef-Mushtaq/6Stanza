import { cn } from "@/lib/utils/cn";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  className?: string;
}

/**
 * Generic section header: optional technical-label eyebrow, an H2, and
 * an optional supporting line. Not a finished "editorial" composition
 * — later modules layer in the numbering/compass motifs on top of
 * this for the Services experience.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className,
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex max-w-3xl flex-col gap-4",
        align === "center" && "mx-auto items-center text-center",
        className
      )}
    >
      {eyebrow ? <TechnicalLabel>{eyebrow}</TechnicalLabel> : null}
      <h2
        className="text-balance font-[var(--font-display)] tracking-tight"
        style={{ fontSize: "var(--text-h2)", lineHeight: "var(--leading-tight)" }}
      >
        {title}
      </h2>
      {description ? (
        <p
          className="text-pretty"
          style={{ color: "var(--color-muted)", fontSize: "var(--text-body)" }}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
