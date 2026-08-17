import Link, { type LinkProps } from "next/link";
import { cn } from "@/lib/utils/cn";

interface NavItemProps
  extends LinkProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> {
  active?: boolean;
  index?: number | string;
}

/**
 * Single navigation entry. Optional `index` renders a small numeral
 * prefix (for the numbered-nav treatment future modules may want on
 * the global/cinematic navigation). Structural only — no scroll-aware
 * behavior here, that belongs to Module 3.
 */
export function NavItem({ active, index, className, children, ...props }: NavItemProps) {
  return (
    <Link
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative inline-flex items-center gap-2 font-[var(--font-mono)] uppercase",
        "transition-colors duration-[var(--duration-fast)]",
        active ? "text-[var(--color-brand)]" : "hover:text-[var(--color-brand)]",
        className
      )}
      style={{ fontSize: "var(--text-nav)", letterSpacing: "var(--tracking-label)" }}
      {...props}
    >
      {index !== undefined ? (
        <span aria-hidden style={{ color: "var(--color-brand-soft)" }}>
          {typeof index === "number" ? String(index).padStart(2, "0") : index}
        </span>
      ) : null}
      {children}
      <NavIndicator active={active} />
    </Link>
  );
}

/** Underline indicator shared by NavItem's active/hover state. */
export function NavIndicator({ active }: { active?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[var(--color-brand)]",
        "transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)]",
        "group-hover:scale-x-100",
        active && "scale-x-100"
      )}
    />
  );
}

/** Groups a set of NavItems with consistent gap; used by header/footer/mobile menu. */
export function NavGroup({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav className={cn("flex items-center gap-8", className)} {...props}>
      {children}
    </nav>
  );
}

/** Small dot/segment used to show current section in a scroll-aware nav (later modules drive state). */
export function SectionIndicator({
  count,
  activeIndex = 0,
  className,
}: {
  count: number;
  activeIndex?: number;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2", className)} aria-hidden>
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className="h-1.5 w-1.5 rounded-full transition-[transform,background-color] duration-[var(--duration-fast)]"
          style={{
            background: i === activeIndex ? "var(--color-brand)" : "var(--color-border)",
            transform: i === activeIndex ? "scale(1.4)" : "scale(1)",
          }}
        />
      ))}
    </div>
  );
}

/** Hamburger-style menu trigger. Purely presentational — later modules wire up open/close state + animation. */
export function MenuTrigger({
  open = false,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { open?: boolean }) {
  return (
    <button
      type="button"
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      className={cn(
        "inline-flex h-10 w-10 flex-col items-center justify-center gap-[5px] rounded-[var(--radius-sm)]",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]",
        className
      )}
      {...props}
    >
      <span
        className="h-px w-5 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)]"
        style={{
          background: "var(--color-foreground)",
          transform: open ? "translateY(3px) rotate(45deg)" : "none",
        }}
      />
      <span
        className="h-px w-5 transition-transform duration-[var(--duration-fast)] ease-[var(--ease-standard)]"
        style={{
          background: "var(--color-foreground)",
          transform: open ? "translateY(-3px) rotate(-45deg)" : "none",
        }}
      />
    </button>
  );
}
