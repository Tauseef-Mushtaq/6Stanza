"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import { TechnicalLabel } from "@/components/ui/TechnicalLabel";
import { AccentLine } from "@/components/ui/Divider";
import { Button } from "@/components/ui/Button";
import { TextLink } from "@/components/ui/TextLink";
import { Reveal } from "@/components/motion";
import { Label, Input, FieldGroup, ErrorText, HelperText } from "@/components/ui/form/Field";
import { signUpAction } from "@/features/auth/actions";

type Status = "idle" | "submitting" | "error" | "success";

interface FormState {
  fullName: string;
  email: string;
  password: string;
}

/**
 * `/signup`. Whether the account is immediately session-authenticated
 * or needs email confirmation first depends on the Supabase project's
 * own auth settings (spec §16 — "do not invent an email provider"),
 * which this app doesn't control or know at build time. `signUpAction`
 * succeeding either way means "check your email to confirm" is the
 * one honest success message that's correct under both configurations
 * — a false "you're signed in" would be wrong for a project with email
 * confirmation enabled.
 */
export function SignupForm() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ fullName: "", email: "", password: "" });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [formError, setFormError] = useState<string | null>(null);

  function field<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setFormError(null);
    setFieldErrors({});

    const result = await signUpAction(form);

    if (result.ok) {
      setStatus("success");
      return;
    }

    if (result.fieldErrors) {
      setFieldErrors(result.fieldErrors);
    } else {
      setFormError(result.message);
    }
    setStatus("error");
  }

  if (status === "success") {
    return (
      <Section as="div" className="flex min-h-svh items-center">
        <Container className="mx-auto flex w-full max-w-md flex-col gap-4 text-center">
          <TechnicalLabel>Account Created</TechnicalLabel>
          <h1 className="font-[var(--font-sans)]" style={{ fontSize: "var(--text-h2)", color: "var(--color-text-primary)" }}>
            Almost there.
          </h1>
          <p style={{ fontSize: "var(--text-body)", color: "var(--color-text-secondary)" }}>
            If email confirmation is required, we&apos;ve sent a link to {form.email}. Otherwise, you&apos;re
            ready to sign in.
          </p>
          <Button variant="primary" size="lg" onClick={() => router.push("/login")} className="mx-auto mt-4">
            Go to Sign In
          </Button>
        </Container>
      </Section>
    );
  }

  return (
    <Section as="div" className="flex min-h-svh items-center" style={{ paddingBlockStart: "calc(var(--space-section) + 4rem)" }}>
      <Container className="mx-auto flex w-full max-w-md flex-col gap-10">
        <Reveal direction="up" className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <AccentLine />
            <TechnicalLabel>Create Account</TechnicalLabel>
          </div>
          <h1 className="font-[var(--font-sans)]" style={{ fontSize: "var(--text-h2)", color: "var(--color-text-primary)" }}>
            Join 6STANZA.
          </h1>
        </Reveal>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
          <FieldGroup>
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              autoComplete="name"
              value={form.fullName}
              onChange={(e) => field("fullName", e.target.value)}
              aria-invalid={Boolean(fieldErrors.fullName)}
              aria-describedby={fieldErrors.fullName ? "fullName-error" : undefined}
              required
            />
            {fieldErrors.fullName ? <ErrorText id="fullName-error">{fieldErrors.fullName}</ErrorText> : null}
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={form.email}
              onChange={(e) => field("email", e.target.value)}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? "email-error" : undefined}
              required
            />
            {fieldErrors.email ? <ErrorText id="email-error">{fieldErrors.email}</ErrorText> : null}
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => field("password", e.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "password-error" : "password-helper"}
              required
            />
            {fieldErrors.password ? (
              <ErrorText id="password-error">{fieldErrors.password}</ErrorText>
            ) : (
              <HelperText id="password-helper">At least 8 characters.</HelperText>
            )}
          </FieldGroup>

          {formError ? <ErrorText>{formError}</ErrorText> : null}

          <Button type="submit" variant="primary" size="lg" disabled={status === "submitting"}>
            {status === "submitting" ? "Creating account…" : "Create Account"}
          </Button>
        </form>

        <p style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
          Already have an account? <TextLink href="/login">Sign in</TextLink>
        </p>
      </Container>
    </Section>
  );
}
