import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/sections/LoginForm";
import { safeRedirectPath } from "@/lib/utils/safeRedirect";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your 6STANZA account.",
};

/**
 * Maps known `?error=` / `?reset=` codes (set by `/auth/callback` and
 * `resetPasswordAction` — see their own doc comments) to a safe,
 * predefined message. Spec §25 — never render an arbitrary query
 * parameter directly; unrecognized codes fall back to a generic
 * message rather than leaking whatever text was in the URL.
 */
function noticeFromParams(params: { error?: string; reset?: string }): { tone: "error" | "success"; message: string } | null {
  if (params.reset === "success") {
    return { tone: "success", message: "Your password has been updated. Sign in with your new password." };
  }
  if (params.error === "confirmation_failed") {
    return {
      tone: "error",
      message: "We couldn't confirm that link. It may have expired or already been used — please sign in, or sign up again.",
    };
  }
  if (params.error === "sign_out_failed") {
    return { tone: "error", message: "We couldn't sign you out completely. Please try again." };
  }
  if (params.error) {
    return { tone: "error", message: "Something went wrong with your authentication request. Please try again." };
  }
  return null;
}

/**
 * `redirect` comes from `middleware.ts`, which appends
 * `?redirect=<original-path>` when an unauthenticated visitor is
 * bounced from a protected route (spec §3 — "do not hardcode
 * assumptions about future dashboard routes"). Falls back to `/account`,
 * the one protected route this module defines.
 *
 * `error`/`reset` come from `/auth/callback` and `resetPasswordAction`
 * respectively — resolved to a safe message via `noticeFromParams`
 * above and passed down rather than rendered directly.
 *
 * Module 10F — the previous `redirect.startsWith("/")` check here was
 * an incomplete open-redirect guard: a protocol-relative URL like
 * `//evil.com` also starts with `/` and is treated by browsers as
 * "same protocol, different host." Now uses the shared
 * `safeRedirectPath` validator (also used by `/auth/callback`) so both
 * places agree on what counts as a safe internal path.
 */
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string; error?: string; reset?: string }>;
}) {
  const { redirect, error, reset } = await searchParams;
  const redirectTo = safeRedirectPath(redirect, "/account");
  const notice = noticeFromParams({ error, reset });

  return <LoginForm redirectTo={redirectTo} notice={notice} />;
}
