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
import { Label, Input, FieldGroup, ErrorText } from "@/components/ui/form/Field";
import { signInAction } from "@/features/auth/actions";

type Status = "idle" | "submitting" | "error";

interface FormState {
  email: string;
  password: string;
}

/**
 * `/login`. Mirrors `ProjectForm.tsx`'s loading/error/success state
 * shape (spec §11's states) but talks to `signInAction` instead of
 * `submitInquiry`. On success, the redirect destination comes from
 * `?redirect=` (set by `middleware.ts` when an unauthenticated visitor
 * hits a protected route) rather than a hardcoded dashboard path.
 */
export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>({ email: "", password: "" });
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

    const result = await signInAction(form);

    if (result.ok) {
      router.push(redirectTo);
      router.refresh();
      return;
    }

    if (result.fieldErrors) {
      setFieldErrors(result.fieldErrors);
    } else {
      setFormError(result.message);
    }
    setStatus("error");
  }

  return (
    <Section as="div" className="flex min-h-svh items-center" style={{ paddingBlockStart: "calc(var(--space-section) + 4rem)" }}>
      <Container className="mx-auto flex w-full max-w-md flex-col gap-10">
        <Reveal direction="up" className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <AccentLine />
            <TechnicalLabel>Sign In</TechnicalLabel>
          </div>
          <h1 className="font-[var(--font-sans)]" style={{ fontSize: "var(--text-h2)", color: "var(--color-text-primary)" }}>
            Welcome back.
          </h1>
        </Reveal>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
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
              autoComplete="current-password"
              value={form.password}
              onChange={(e) => field("password", e.target.value)}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? "password-error" : undefined}
              required
            />
            {fieldErrors.password ? <ErrorText id="password-error">{fieldErrors.password}</ErrorText> : null}
          </FieldGroup>

          {formError ? <ErrorText>{formError}</ErrorText> : null}

          <Button type="submit" variant="primary" size="lg" disabled={status === "submitting"}>
            {status === "submitting" ? "Signing in…" : "Sign In"}
          </Button>
        </form>

        <p style={{ fontSize: "var(--text-small)", color: "var(--color-text-secondary)" }}>
          Don&apos;t have an account? <TextLink href="/signup">Create one</TextLink>
        </p>
      </Container>
    </Section>
  );
}
