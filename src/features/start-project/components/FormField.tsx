"use client";

import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";

/**
 * Editorial form primitives for the project-intake flow. No Module 1
 * form components exist yet in the design system (`src/components/ui/`
 * has no Input/Textarea) — these are feature-scoped rather than
 * promoted to shared UI, since this module isn't the right place to
 * make that call for the rest of the site. If a later module needs
 * the same pattern elsewhere, promoting this to `components/ui/` would
 * be the right move then.
 *
 * Style: large label, thin bottom border instead of a boxed input,
 * brand-blue focus/active state, inline error text — matches the
 * site's "editorial, not dashboard" direction (§17).
 */

interface FieldWrapperProps {
  label: string;
  htmlFor: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}

function FieldWrapper({ label, htmlFor, optional, error, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="font-[var(--font-mono)] uppercase"
        style={{ fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-muted)" }}
      >
        {label} {optional ? <span style={{ opacity: 0.6 }}>(optional)</span> : null}
      </label>
      {children}
      {error ? (
        <p role="alert" style={{ color: "#ff6b6b", fontSize: "var(--text-caption)" }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

const fieldBaseStyle: React.CSSProperties = {
  background: "transparent",
  borderBottom: "1px solid var(--color-border)",
  color: "inherit",
  fontSize: "var(--text-body-lg)",
  paddingBlock: "0.6em",
};

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
  optional?: boolean;
};

export function TextField({ label, error, optional, id, className, style, ...props }: TextFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldWrapper label={label} htmlFor={fieldId} optional={optional} error={error}>
      <input
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={`w-full transition-colors focus:outline-none focus:border-[var(--color-brand)] ${className ?? ""}`}
        style={{ ...fieldBaseStyle, ...style }}
        {...props}
      />
    </FieldWrapper>
  );
}

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label: string;
  error?: string;
  optional?: boolean;
};

export function TextAreaField({ label, error, optional, id, className, style, ...props }: TextAreaFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldWrapper label={label} htmlFor={fieldId} optional={optional} error={error}>
      <textarea
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        rows={6}
        className={`w-full resize-y transition-colors focus:outline-none focus:border-[var(--color-brand)] ${className ?? ""}`}
        style={{ ...fieldBaseStyle, ...style }}
        {...props}
      />
    </FieldWrapper>
  );
}
