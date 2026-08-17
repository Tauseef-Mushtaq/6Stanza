import { cn } from "@/lib/utils/cn";

export function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("font-[var(--font-mono)] uppercase", className)}
      style={{ fontSize: "var(--text-label)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-secondary)" }}
      {...props}
    >
      {children}
    </label>
  );
}

export function HelperText({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn(className)} style={{ fontSize: "var(--text-caption)", color: "var(--color-text-muted)" }} {...props}>
      {children}
    </p>
  );
}

export function ErrorText({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      role="alert"
      className={cn(className)}
      style={{ fontSize: "var(--text-caption)", color: "var(--color-error)" }}
      {...props}
    >
      {children}
    </p>
  );
}

/** Wraps a form control with its label + helper/error text, sharing consistent vertical rhythm. */
export function FieldGroup({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      {children}
    </div>
  );
}

const fieldBaseStyle: React.CSSProperties = {
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  borderRadius: "var(--radius-md)",
  color: "var(--color-text-primary)",
  fontSize: "var(--text-body)",
  fontFamily: "var(--font-sans)",
};

const fieldBaseClass =
  "w-full px-4 py-3 outline-none transition-colors duration-[var(--duration-fast)] " +
  "placeholder:text-[var(--color-text-muted)] " +
  "focus-visible:border-[var(--color-brand)] " +
  "disabled:cursor-not-allowed disabled:opacity-50 " +
  "aria-[invalid=true]:border-[var(--color-error)]";

export function Input({ className, style, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBaseClass, className)} style={{ ...fieldBaseStyle, ...style }} {...props} />;
}

export function Textarea({ className, style, rows = 5, ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      rows={rows}
      className={cn(fieldBaseClass, "resize-y", className)}
      style={{ ...fieldBaseStyle, ...style }}
      {...props}
    />
  );
}

export function Select({ className, style, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(fieldBaseClass, "appearance-none bg-no-repeat", className)} style={{ ...fieldBaseStyle, ...style }} {...props}>
      {children}
    </select>
  );
}

export function Checkbox({ className, id, label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-3">
      <input
        id={id}
        type="checkbox"
        className={cn(
          "h-4 w-4 shrink-0 appearance-none rounded-[0.25rem] border transition-colors duration-[var(--duration-fast)]",
          "checked:bg-[var(--color-brand)] checked:border-[var(--color-brand)]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]",
          className
        )}
        style={{ borderColor: "var(--color-border)" }}
        {...props}
      />
      {label ? (
        <span style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>{label}</span>
      ) : null}
    </label>
  );
}

export function Radio({ className, id, label, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-3">
      <input
        id={id}
        type="radio"
        className={cn(
          "h-4 w-4 shrink-0 appearance-none rounded-full border transition-colors duration-[var(--duration-fast)]",
          "checked:border-[5px] checked:border-[var(--color-brand)]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]",
          className
        )}
        style={{ borderColor: "var(--color-border)" }}
        {...props}
      />
      {label ? (
        <span style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>{label}</span>
      ) : null}
    </label>
  );
}
