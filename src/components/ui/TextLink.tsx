import Link, { type LinkProps } from "next/link";
import { cn } from "@/lib/utils/cn";

type TextLinkVariant = "standard" | "arrow" | "underline" | "nav";

interface TextLinkProps
  extends LinkProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> {
  variant?: TextLinkVariant;
}

/**
 * Reusable editorial link styles. `arrow` is the "Learn more ->" style
 * used throughout the reference sites; `nav` matches the header/footer
 * tracked-out uppercase treatment so navigation primitives can reuse it.
 */
export function TextLink({ variant = "standard", className, children, ...props }: TextLinkProps) {
  if (variant === "nav") {
    return (
      <Link
        className={cn(
          "font-[var(--font-mono)] uppercase transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-brand)]",
          className
        )}
        style={{ fontSize: "var(--text-nav)", letterSpacing: "var(--tracking-label)" }}
        {...props}
      >
        {children}
      </Link>
    );
  }

  if (variant === "arrow") {
    return (
      <Link
        className={cn(
          "group inline-flex items-center gap-2 font-[var(--font-sans)] font-medium",
          "transition-colors duration-[var(--duration-fast)] hover:text-[var(--color-brand)]",
          className
        )}
        style={{ fontSize: "var(--text-small)" }}
        {...props}
      >
        <span>{children}</span>
        <span
          aria-hidden
          className="transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)] group-hover:translate-x-1"
        >
          &rarr;
        </span>
      </Link>
    );
  }

  return (
    <Link
      className={cn(
        "font-[var(--font-sans)] transition-colors duration-[var(--duration-fast)]",
        variant === "underline"
          ? "underline decoration-[var(--color-border)] underline-offset-4 hover:decoration-[var(--color-brand)] hover:text-[var(--color-brand)]"
          : "hover:text-[var(--color-brand)]",
        className
      )}
      style={{ fontSize: "var(--text-body)" }}
      {...props}
    >
      {children}
    </Link>
  );
}
