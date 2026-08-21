"use client";

import { useId, type InputHTMLAttributes } from "react";

/**
 * Same editorial pattern as `features/start-project/components/FormField.tsx`
 * (large label, thin bottom border, brand-blue focus, inline error) —
 * that file's own comment already flagged it as feature-scoped rather
 * than promoted to `components/ui/`, suggesting promotion "if a later
 * module needs the same pattern elsewhere." This is that module, but
 * promoting the existing file (and updating its one current caller,
 * `ProjectForm.tsx`) is deferred rather than done here: this sandbox
 * can't run a build to confirm that refactor doesn't break Module 5's
 * already-working form, so a second, small, near-identical copy is the
 * lower-risk choice this time — see MODULE-6-HANDOFF.md for the
 * follow-up recommendation.
 */

interface FieldWrapperProps {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}

function FieldWrapper({ label, htmlFor, error, children }: FieldWrapperProps) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={htmlFor}
        className="font-[var(--font-mono)] uppercase"
        style={{ fontSize: "var(--text-caption)", letterSpacing: "var(--tracking-label)", color: "var(--color-text-muted)" }}
      >
        {label}
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

type AuthFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function AuthField({ label, error, id, className, style, ...props }: AuthFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <FieldWrapper label={label} htmlFor={fieldId} error={error}>
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
