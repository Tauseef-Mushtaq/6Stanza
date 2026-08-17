import { createElement } from "react";
import { cn } from "@/lib/utils/cn";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  as?: React.ElementType;
}

/**
 * Horizontal content container — caps width at the design token max
 * and applies responsive edge padding. Generic on purpose; sections
 * decide their own vertical rhythm.
 */
export function Container({ as = "div", className, children, style, ...props }: ContainerProps) {
  return createElement(
    as,
    {
      className: cn("mx-auto w-full", className),
      style: {
        maxWidth: "var(--container-max)",
        paddingInline: "var(--container-padding)",
        ...style,
      },
      ...props,
    },
    children
  );
}
