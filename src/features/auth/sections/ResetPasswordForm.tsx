"use client";

import { useState } from "react";
import { AuthField } from "@/features/auth/components/AuthField";
import { AuthShell, authSubmitButtonClassName, authSubmitButtonStyle } from "@/features/auth/components/AuthShell";
import { resetPasswordAction } from "@/features/auth/actions";
import type { AuthResult } from "@/lib/services/authService";

type Status = "idle" | "submitting" | "error";

/**
 * Rendered at `/reset-password`. Relies entirely on the session
 * `/auth/callback` already established from the recovery link — this
 * form has no token/code of its own to handle (spec §13: "do not build
 * a custom token system; use Supabase Auth's supported recovery
 * mechanism"). If the recovery session is missing/expired/already
 * used, `resetPasswordAction`'s underlying `updateUser` call simply
 * fails and this form shows that as a normal auth error — no separate
 * "invalid link" code path needed.
 */
export function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setFormError(null);
    setFieldErrors({});

    let result: AuthResult;
    try {
      // On success, resetPasswordAction redirects to /login?reset=success.
      result = await resetPasswordAction({ password, confirmPassword });
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("NEXT_REDIRECT")) throw err;
      setStatus("error");
      setFormError("We couldn't complete your request. Please try again.");
      return;
    }

    if (!result.ok && result.fieldErrors) {
      setFieldErrors(result.fieldErrors);
      setStatus("error");
      return;
    }
    if (!result.ok) {
      setFormError(result.message ?? "We couldn't complete your request. Please try again.");
      setStatus("error");
    }
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose a new password for your account.">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        {formError ? (
          <p role="alert" style={{ color: "#ff6b6b", fontSize: "var(--text-body)" }}>
            {formError}
          </p>
        ) : null}

        <AuthField
          label="New password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={fieldErrors.password}
          required
        />
        <AuthField
          label="Confirm new password"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          error={fieldErrors.confirmPassword}
          required
        />

        <button type="submit" disabled={status === "submitting"} className={authSubmitButtonClassName} style={authSubmitButtonStyle}>
          {status === "submitting" ? "Updating…" : "Update password"}
        </button>
      </form>
    </AuthShell>
  );
}
