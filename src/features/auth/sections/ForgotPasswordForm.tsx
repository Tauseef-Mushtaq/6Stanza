"use client";

import { useState } from "react";
import Link from "next/link";
import { AuthField } from "@/features/auth/components/AuthField";
import { AuthShell, authLinkStyle, authSubmitButtonClassName, authSubmitButtonStyle } from "@/features/auth/components/AuthShell";
import { forgotPasswordAction } from "@/features/auth/actions";

type Status = "idle" | "submitting" | "sent";

/** Spec §12: always resolves to the same safe "if an account exists…" message — the service layer already never distinguishes "no such user" from "email sent," and this component doesn't add a second place that could leak that distinction either. */
export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [fieldError, setFieldError] = useState<string | undefined>();
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status === "submitting") return;
    setStatus("submitting");
    setFieldError(undefined);

    const result = await forgotPasswordAction({ email });

    if (!result.ok && result.fieldErrors) {
      setFieldError(result.fieldErrors.email);
      setStatus("idle");
      return;
    }
    // Success and any non-field failure both land here on purpose —
    // see the file-level comment.
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <AuthShell title="Check your email" subtitle="If an account exists for this email, we've sent password reset instructions.">
        <Link href="/login" style={authLinkStyle}>
          Back to log in
        </Link>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link href="/login" style={authLinkStyle}>
          Back to log in
        </Link>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
        <AuthField label="Email" name="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={fieldError} required />
        <button type="submit" disabled={status === "submitting"} className={authSubmitButtonClassName} style={authSubmitButtonStyle}>
          {status === "submitting" ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </AuthShell>
  );
}
