import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/sections/LoginForm";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your 6STANZA account.",
};

/**
 * `redirect` comes from `middleware.ts`, which appends
 * `?redirect=<original-path>` when an unauthenticated visitor is
 * bounced from a protected route (spec §3 — "do not hardcode
 * assumptions about future dashboard routes"). Falls back to `/account`,
 * the one protected route this module defines.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  const redirectTo = redirect && redirect.startsWith("/") ? redirect : "/account";

  return <LoginForm redirectTo={redirectTo} />;
}
