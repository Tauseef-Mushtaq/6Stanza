import { createElement } from "react";
import { cn } from "@/lib/utils/cn";

type CardVariant = "standard" | "dark" | "light" | "bordered" | "elevated" | "editorial";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
  variant?: CardVariant;
}

const VARIANT_STYLES: Record<CardVariant, React.CSSProperties> = {
  standard: {
    background: "var(--color-surface-elevated)",
    border: "1px solid var(--color-border-subtle)",
    boxShadow: "var(--shadow-sm)",
  },
  bordered: {
    background: "transparent",
    border: "1px solid var(--color-border)",
  },
  elevated: {
    background: "var(--color-surface-elevated)",
    border: "1px solid var(--color-border-subtle)",
    boxShadow: "var(--shadow-lg)",
  },
  dark: {
    background: "var(--stz-navy-950)",
    color: "var(--stz-white)",
    border: "1px solid var(--color-border-inverse)",
  },
  light: {
    background: "var(--stz-white)",
    border: "1px solid var(--color-border-subtle)",
  },
  editorial: {
    background: "transparent",
    border: "none",
    borderTop: "1px solid var(--color-border)",
  },
};

/**
 * Flexible card primitive consumed by every future card-shaped
 * composition (team, project, service, testimonial, insight). Only
 * provides the surface/border/radius/padding language — later
 * modules compose real content inside.
 */
export function Card({ as = "div", variant = "standard", className, style, children, ...props }: CardProps) {
  return createElement(
    as,
    {
      className: cn(
        "flex flex-col gap-4 rounded-[var(--radius-lg)] p-6 md:p-8",
        "transition-[transform,box-shadow,border-color] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
        variant === "editorial" && "rounded-none p-0 pt-6",
        className
      ),
      style: { ...VARIANT_STYLES[variant], ...style },
      ...props,
    },
    children
  );
}

export function CardEyebrow({ className, children, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("font-[var(--font-mono)] uppercase", className)}
      style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-brand)" }}
      {...props}
    >
      {children}
    </span>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-[var(--font-display)] tracking-tight", className)}
      style={{ fontSize: "var(--text-h3)", lineHeight: "var(--leading-snug)" }}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(className)}
      style={{ color: "var(--color-text-secondary)", fontSize: "var(--text-body)", lineHeight: "var(--leading-normal)" }}
      {...props}
    >
      {children}
    </p>
  );
}

export function CardFooter({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("mt-auto flex items-center gap-3 pt-2", className)} {...props}>
      {children}
    </div>
  );
}
