import { createElement, forwardRef } from "react";
import { cn } from "@/lib/utils/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "dark" | "blue";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "color"> {
  as?: React.ElementType;
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const SIZE_STYLES: Record<ButtonSize, string> = {
  sm: "gap-1.5 px-4 py-2",
  md: "gap-2 px-5 py-2.5",
  lg: "gap-2.5 px-7 py-3.5",
};

const SIZE_TEXT: Record<ButtonSize, string> = {
  sm: "var(--text-caption)",
  md: "var(--text-small)",
  lg: "var(--text-body)",
};

const VARIANT_STYLES: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "var(--color-brand)",
    color: "var(--stz-white)",
    border: "1px solid transparent",
  },
  blue: {
    background: "var(--stz-blue-600)",
    color: "var(--stz-white)",
    border: "1px solid transparent",
  },
  secondary: {
    background: "var(--color-foreground)",
    color: "var(--color-background)",
    border: "1px solid transparent",
  },
  dark: {
    background: "var(--stz-navy-950)",
    color: "var(--stz-white)",
    border: "1px solid transparent",
  },
  outline: {
    background: "transparent",
    color: "var(--color-foreground)",
    border: "1px solid var(--color-border)",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-foreground)",
    border: "1px solid transparent",
  },
};

const VARIANT_HOVER_CLASS: Record<ButtonVariant, string> = {
  primary: "hover:brightness-110 active:brightness-95",
  blue: "hover:brightness-110 active:brightness-95",
  secondary: "hover:opacity-85 active:opacity-75",
  dark: "hover:brightness-125 active:brightness-110",
  outline: "hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]",
  ghost: "hover:text-[var(--color-brand)]",
};

/**
 * Core reusable button primitive. Covers every variant/size the future
 * cinematic site will need — keep animation subtle here; richer
 * hover/press choreography belongs to later motion modules.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { as = "button", variant = "primary", size = "md", className, style, children, ...props },
  ref
) {
  return createElement(
    as,
    {
      ref,
      className: cn(
        "inline-flex items-center justify-center rounded-[var(--radius-pill)] font-[var(--font-sans)] font-medium",
        "transition-[filter,opacity,color,border-color,transform] duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]",
        "disabled:pointer-events-none disabled:opacity-45",
        "active:scale-[0.98]",
        SIZE_STYLES[size],
        VARIANT_HOVER_CLASS[variant],
        className
      ),
      style: {
        fontSize: SIZE_TEXT[size],
        ...VARIANT_STYLES[variant],
        ...style,
      },
      ...props,
    },
    children
  );
});
